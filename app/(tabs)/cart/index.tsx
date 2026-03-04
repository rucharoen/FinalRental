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

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={28} color="#2C3E50" />
          </TouchableOpacity>
          <Text style={styles.editButton}>แก้ไข</Text>
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
            <View key={shopName} style={styles.shopContainer}>
              <View style={styles.shopHeader}>
                <TouchableOpacity onPress={() => toggleSelectShop(shopName)}>
                  <Ionicons 
                    name={items.every(i => i.selected) ? "radio-button-on" : "radio-button-off"} 
                    size={24} 
                    color={items.every(i => i.selected) ? "#3498DB" : "#BDC3C7"} 
                  />
                </TouchableOpacity>
                <Text style={styles.shopName}>{shopName}</Text>
              </View>

              {items.map((item) => (
                <View key={item.id}>
                  <Swipeable renderRightActions={() => renderRightActions(item.id)}>
                    <View style={styles.productRow}>
                      <TouchableOpacity onPress={() => toggleSelectItem(item.id)}>
                        <Ionicons 
                          name={item.selected ? "radio-button-on" : "radio-button-off"} 
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
                          <Text style={styles.priceText}>{item.price} ฿</Text>
                          
                          <View style={styles.quantityControl}>
                            <TouchableOpacity 
                              style={styles.quantityBtn}
                              onPress={() => updateQuantity(item.id, -1)}
                            >
                              <Text style={styles.quantityBtnText}>-</Text>
                            </TouchableOpacity>
                            <View style={styles.quantityValueBox}>
                              <Text style={styles.quantityText}>{item.quantity}</Text>
                            </View>
                            <TouchableOpacity 
                              style={styles.quantityBtn}
                              onPress={() => updateQuantity(item.id, 1)}
                            >
                              <Text style={styles.quantityBtnText}>+</Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                      </View>
                    </View>
                  </Swipeable>
                  <View style={styles.divider} />
                </View>
              ))}
            </View>
          ))}
        </ScrollView>

        {/* Bottom Footer */}
        <View style={styles.footer}>
          <View style={styles.selectAllContainer}>
            <TouchableOpacity style={styles.selectAllRow}>
              <Ionicons name="radio-button-off" size={24} color="#BDC3C7" />
              <Text style={styles.selectAllText}>ทั้งหมด</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.sumAndAction}>
             <View style={styles.totalInfo}>
                <View style={styles.totalRow}>
                   <Text style={[styles.totalAmountText, { color: '#E74C3C' }]}>{totalPrice} ฿</Text>
                </View>
                <Text style={styles.shippingText}>ค่าส่ง {shippingFee} ฿</Text>
             </View>
             <TouchableOpacity style={styles.checkoutBtn}>
                <Text style={styles.checkoutBtnText}>จอง</Text>
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
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 15,
  },
  backButton: {
    padding: 5,
  },
  editButton: {
    fontSize: 18,
    color: '#2C3E50',
    fontWeight: '500',
  },
  scrollContent: {
    flex: 1,
    paddingHorizontal: 15,
  },
  shopContainer: {
    marginBottom: 20,
  },
  shopHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  shopName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
    color: '#000',
  },
  productRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    backgroundColor: '#FFFFFF', // Required for Swipeable to look correct
  },
  productImageWrapper: {
    width: 85,
    height: 85,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    borderRadius: 8,
    marginHorizontal: 10,
    overflow: 'hidden',
  },
  productImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 5,
  },
  rentPeriodBadge: {
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  rentPeriodText: {
    fontSize: 10,
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
    borderColor: '#ECF0F1',
    borderRadius: 4,
    backgroundColor: '#F8F9F9',
  },
  quantityBtn: {
    paddingHorizontal: 10,
    paddingVertical: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityBtnText: {
    fontSize: 14,
    color: '#95A5A6',
  },
  quantityValueBox: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: '#ECF0F1',
    paddingHorizontal: 12,
    backgroundColor: '#FFFFFF',
  },
  quantityText: {
    fontSize: 12,
    color: '#2C3E50',
  },
  divider: {
    height: 1,
    backgroundColor: '#ECF0F1',
    marginTop: 5,
    marginBottom: 5,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: '#ECF0F1',
    paddingHorizontal: 20,
    paddingVertical: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
  },
  selectAllContainer: {
    flex: 1,
  },
  selectAllRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectAllText: {
    fontSize: 14,
    color: '#7F8C8D',
    marginLeft: 8,
  },
  sumAndAction: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  totalInfo: {
    alignItems: 'flex-end',
    marginRight: 15,
  },
  totalRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  totalAmountText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  shippingText: {
    fontSize: 10,
    color: '#2ECC71',
    marginTop: 2,
  },
  checkoutBtn: {
    backgroundColor: '#3498DB',
    paddingHorizontal: 25,
    paddingVertical: 10,
    borderRadius: 8,
  },
  checkoutBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    height: 400,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 50,
  },
  emptyText: {
    fontSize: 18,
    color: '#BDC3C7',
    marginTop: 20,
    marginBottom: 30,
  },
  shopNowBtn: {
    backgroundColor: '#3498DB',
    paddingHorizontal: 40,
    paddingVertical: 12,
    borderRadius: 25,
  },
  shopNowBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
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
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 5,
  }
});
