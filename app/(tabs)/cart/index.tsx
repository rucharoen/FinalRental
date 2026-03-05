import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
  Dimensions
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import cartService, { CartItem } from '@/services/cart.service';

const { width } = Dimensions.get('window');

export default function CartScreen() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    React.useCallback(() => {
      loadCart();
    }, [])
  );

  const loadCart = async () => {
    try {
      const items = await cartService.getCartItems();
      setCartItems(items);
    } catch (err) {
      console.error('Error fetching cart:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleSelectItem = (id: string) => {
    setCartItems(prev => prev.map(item =>
      item.id === id ? { ...item, selected: !item.selected } : item
    ));
  };

  const toggleSelectShop = (shopName: string) => {
    const isCurrentlySelected = cartItems
      .filter(item => item.shopName === shopName)
      .every(item => item.selected);

    setCartItems(prev => prev.map(item =>
      item.shopName === shopName ? { ...item, selected: !isCurrentlySelected, shopSelected: !isCurrentlySelected } : item
    ));
  };

  const updateQuantity = async (id: string, delta: number) => {
    const item = cartItems.find(i => i.id === id);
    if (!item) return;

    const newQty = Math.max(1, item.quantity + delta);
    await cartService.updateQuantity(id, newQty);
    setCartItems(prev => prev.map(item =>
      item.id === id ? { ...item, quantity: newQty } : item
    ));
  };

  const handleDelete = async (id: string) => {
    await cartService.removeFromCart(id);
    setCartItems(prev => prev.filter(item => item.id !== id));
  };

  const renderRightActions = (id: string) => {
    return (
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => handleDelete(id)}
      >
        <Ionicons name="trash-outline" size={28} color="#FFFFFF" />
        <Text style={styles.deleteButtonText}>ลบ</Text>
      </TouchableOpacity>
    );
  };

  const totalPrice = cartItems
    .filter(item => item.selected)
    .reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const shippingFee = totalPrice > 0 ? 50 : 0;

  // Group items by shop
  const groupedItems = cartItems.reduce((acc, item) => {
    if (!acc[item.shopName]) {
      acc[item.shopName] = [];
    }
    acc[item.shopName].push(item);
    return acc;
  }, {} as Record<string, CartItem[]>);

  const toggleSelectAll = () => {
    const isAllSelected = cartItems.length > 0 && cartItems.every(item => item.selected);
    setCartItems(prev => prev.map(item => ({ ...item, selected: !isAllSelected })));
  };

  const isAllSelected = cartItems.length > 0 && cartItems.every(item => item.selected);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={28} color="#2C3E50" />
          </TouchableOpacity>
          <TouchableOpacity>
            <Text style={styles.editButton}>แก้ไข</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Empty State */}
          {!loading && cartItems.length === 0 && (
            <View style={styles.emptyContainer}>
              <Ionicons name="cart-outline" size={80} color="#BDC3C7" />
              <Text style={styles.emptyText}>ไม่มีสินค้าในรถเข็น</Text>
              <TouchableOpacity
                style={styles.shopNowBtn}
                onPress={() => router.push('/')}
              >
                <Text style={styles.shopNowBtnText}>เริ่มช้อปเลย</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Cart Item Group by Shop */}
          {Object.entries(groupedItems).map(([shopName, items]) => (
            <View key={shopName} style={styles.shopCard}>
              <View style={styles.shopHeader}>
                <TouchableOpacity onPress={() => toggleSelectShop(shopName)}>
                  <Ionicons
                    name={items.every(i => i.selected) ? "checkmark-circle" : "ellipse-outline"}
                    size={24}
                    color={items.every(i => i.selected) ? "#3498DB" : "#BDC3C7"}
                  />
                </TouchableOpacity>
                <MaterialCommunityIcons name="store-outline" size={20} color="#333" style={{ marginLeft: 8 }} />
                <Text style={styles.shopName} numberOfLines={1}>{shopName}</Text>
                <Ionicons name="chevron-forward" size={16} color="#BDC3C7" />
              </View>

              {items.map((item, index) => (
                <View key={item.id}>
                  <Swipeable renderRightActions={() => renderRightActions(item.id)}>
                    <View style={styles.productRow}>
                      <TouchableOpacity onPress={() => toggleSelectItem(item.id)} style={styles.checkbox}>
                        <Ionicons
                          name={item.selected ? "checkmark-circle" : "ellipse-outline"}
                          size={24}
                          color={item.selected ? "#3498DB" : "#BDC3C7"}
                        />
                      </TouchableOpacity>

                      <View style={styles.productImageWrapper}>
                        <Image source={{ uri: item.image }} style={styles.productImage} />
                      </View>

                      <View style={styles.productInfo}>
                        <Text style={styles.productName} numberOfLines={2}>
                          {item.productName}
                        </Text>
                        <View style={styles.rentPeriodBadge}>
                          <Text style={styles.rentPeriodText}>{item.rentPeriod}</Text>
                        </View>

                        <View style={styles.priceAndQuantity}>
                          <Text style={styles.priceText}>{item.price.toLocaleString()} ฿</Text>

                          <View style={styles.quantityControl}>
                            <TouchableOpacity
                              style={styles.quantityBtn}
                              onPress={() => updateQuantity(item.id, -1)}
                            >
                              <Ionicons name="remove" size={16} color="#333" />
                            </TouchableOpacity>
                            <View style={styles.quantityValueBox}>
                              <Text style={styles.quantityText}>{item.quantity}</Text>
                            </View>
                            <TouchableOpacity
                              style={styles.quantityBtn}
                              onPress={() => updateQuantity(item.id, 1)}
                            >
                              <Ionicons name="add" size={16} color="#333" />
                            </TouchableOpacity>
                          </View>
                        </View>
                      </View>
                    </View>
                  </Swipeable>
                  {index < items.length - 1 && <View style={styles.divider} />}
                </View>
              ))}
            </View>
          ))}
          <View style={{ height: 20 }} />
        </ScrollView>

        {/* Bottom Footer */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.selectAllRow} onPress={toggleSelectAll}>
            <Ionicons
              name={isAllSelected ? "checkmark-circle" : "ellipse-outline"}
              size={24}
              color={isAllSelected ? "#3498DB" : "#BDC3C7"}
            />
            <Text style={styles.selectAllText}>เลือกทั้งหมด</Text>
          </TouchableOpacity>

          <View style={styles.checkoutSection}>
            <View style={styles.totalInfo}>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>รวม: </Text>
                <Text style={styles.totalAmountText}>{totalPrice.toLocaleString()} ฿</Text>
              </View>
              {shippingFee > 0 && <Text style={styles.shippingText}>ค่าส่ง {shippingFee} ฿</Text>}
            </View>
            <TouchableOpacity style={[styles.checkoutBtn, totalPrice === 0 && styles.disabledBtn]}>
              <Text style={styles.checkoutBtnText}>ชำระเงิน</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F6F7',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingTop: 10,
    paddingBottom: 15,
    backgroundColor: '#FFFFFF',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  backButton: {
    padding: 5,
  },
  editButton: {
    fontSize: 16,
    color: '#333',
  },
  scrollContent: {
    flex: 1,
  },
  shopCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 12,
    marginTop: 12,
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  shopHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  shopName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginLeft: 4,
    marginRight: 4,
    maxWidth: width * 0.6,
  },
  checkbox: {
    marginRight: 10,
  },
  productRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
  },
  productImageWrapper: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#F9F9F9',
    overflow: 'hidden',
  },
  productImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  productInfo: {
    flex: 1,
    marginLeft: 12,
  },
  productName: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
    lineHeight: 18,
  },
  rentPeriodBadge: {
    backgroundColor: '#F5F6F7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  rentPeriodText: {
    fontSize: 11,
    color: '#7F8C8D',
  },
  priceAndQuantity: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#E74C3C',
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 4,
  },
  quantityBtn: {
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9F9F9',
  },
  quantityValueBox: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: '#E0E0E0',
    paddingHorizontal: 10,
    minWidth: 35,
    alignItems: 'center',
  },
  quantityText: {
    fontSize: 13,
    color: '#333',
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginVertical: 4,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    paddingHorizontal: 15,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    paddingBottom: 25,
  },
  selectAllRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectAllText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 8,
  },
  checkoutSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  totalInfo: {
    alignItems: 'flex-end',
    marginRight: 12,
  },
  totalRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  totalLabel: {
    fontSize: 14,
    color: '#333',
  },
  totalAmountText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#E74C3C',
  },
  shippingText: {
    fontSize: 11,
    color: '#2ECC71',
  },
  checkoutBtn: {
    backgroundColor: '#3498DB',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 22,
    minWidth: 100,
    alignItems: 'center',
  },
  disabledBtn: {
    backgroundColor: '#BDC3C7',
  },
  checkoutBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    height: 500,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#BDC3C7',
    marginTop: 15,
    marginBottom: 20,
  },
  shopNowBtn: {
    borderWidth: 1,
    borderColor: '#3498DB',
    paddingHorizontal: 30,
    paddingVertical: 10,
    borderRadius: 20,
  },
  shopNowBtnText: {
    color: '#3498DB',
    fontSize: 15,
    fontWeight: '500',
  },
  deleteButton: {
    backgroundColor: '#E74C3C',
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    height: '100%',
  },
  deleteButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  }
});
