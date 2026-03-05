import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions,
  TouchableWithoutFeedback,
  ScrollView
} from 'react-native';
import { Ionicons, AntDesign } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Product } from '@/services/product.service';
import cartService from '@/services/cart.service';
import Calendar from '@/components/Calendar';

const { width, height } = Dimensions.get('window');

interface SelectionModalProps {
  visible: boolean;
  onClose: () => void;
  product: Product | null;
  type: 'cart' | 'rent';
}

const SelectionModal: React.FC<SelectionModalProps> = ({ visible, onClose, product, type }) => {
  const router = useRouter();
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);
  const [showCalendar, setShowCalendar] = useState(false);

  React.useEffect(() => {
    if (visible) {
      setStartDate(null);
      setEndDate(null);
      setShowCalendar(false);
    }
  }, [visible]);

  if (!product) return null;

  const handleConfirm = () => {
    if (!startDate || !endDate) {
      alert('กรุณาเลือกวันที่เช่า (วันแรกและวันสุดท้าย)');
      setShowCalendar(true);
      return;
    }

    onClose();
    // Navigate to checkout with product and date info
    router.push({
      pathname: '/checkout',
      params: {
        productId: product.id,
        startDate,
        endDate
      }
    } as any);
  };


  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback>
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                  <Ionicons name="close-circle-outline" size={30} color="#7F8C8D" />
                </TouchableOpacity>

                <>
                  <View style={styles.productRow}>
                    <View style={styles.imageWrapper}>
                      <Image
                        source={{ uri: product.images && product.images.length > 0 ? product.images[0] : '' }}
                        style={styles.modalProductImage}
                        resizeMode="contain"
                      />
                    </View>
                    <View style={styles.productInfo}>
                      <View style={styles.priceRow}>
                        <Text style={styles.modalPrice}>{product.price_per_day.toLocaleString()}</Text>
                        <Text style={styles.modalPriceUnit}> ฿/วัน</Text>
                      </View>
                      <Text style={styles.modalDeposit}>เงินมัดจำ {product.deposit}฿</Text>
                    </View>
                  </View>

                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>เลือก</Text>
                    <View style={styles.optionsRow}>
                      <View style={styles.optionButton}>
                        <Text style={styles.optionText}>{product.name}</Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>ระยะเวลาเช่า</Text>
                    <TouchableOpacity
                      style={styles.dateSelector}
                      onPress={() => setShowCalendar(true)}
                    >
                      <Text style={styles.dateSelectorText}>
                        {startDate && endDate ? `${startDate} - ${endDate}` : 'เลือกวันที่'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </>
              </View>

              {/* Action Button Footer */}
              <View style={styles.modalFooter}>
                <View style={styles.footerInner}>
                  <TouchableOpacity
                    style={styles.cartIconButton}
                    onPress={async () => {
                      if (!startDate || !endDate) {
                        alert('กรุณาเลือกวันที่เช่า (วันแรกและวันสุดท้าย)');
                        setShowCalendar(true);
                        return;
                      }
                      const cartItem = {
                        id: Math.random().toString(36).substr(2, 9),
                        productId: product.id,
                        shopName: 'Shop ' + product.shop_id,
                        productName: product.name,
                        image: (product.images && product.images.length > 0) ? product.images[0] : '',
                        rentPeriod: `${startDate} - ${endDate}`,
                        price: product.price_per_day,
                        quantity: 1,
                        selected: true,
                        shopSelected: false,
                        startDate,
                        endDate
                      };
                      await cartService.addToCart(cartItem as any);
                      onClose();
                      router.push('/cart' as any);
                    }}
                  >
                    <Ionicons name="cart-outline" size={30} color="#7F8C8D" />
                    <Text style={styles.cartIconLabel}>เพิ่มไปยังรถเข็น</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.confirmButton}
                    onPress={handleConfirm}
                  >
                    <Text style={styles.confirmButtonText}>เช่าเลย</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Calendar Overlay for Cart mode date selection */}
              {showCalendar && (
                <View style={styles.calendarOverlay}>
                  <Calendar
                    onSelectRange={(start: string, end: string) => {
                      setStartDate(start);
                      setEndDate(end);
                      setShowCalendar(false);
                    }}
                    onClose={() => setShowCalendar(false)}
                  />
                </View>
              )}
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 20,
    minHeight: 450,
  },
  modalContent: {
    padding: 20,
  },
  closeButton: {
    position: 'absolute',
    top: 15,
    right: 15,
    zIndex: 10,
  },
  productRow: {
    flexDirection: 'row',
    marginBottom: 20,
    marginTop: 10,
  },
  imageWrapper: {
    width: 100,
    height: 100,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    borderRadius: 10,
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  modalProductImage: {
    width: '100%',
    height: '100%',
  },
  productInfo: {
    marginLeft: 15,
    justifyContent: 'center',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  modalPrice: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#E74C3C',
  },
  modalPriceUnit: {
    fontSize: 16,
    color: '#E74C3C',
    fontWeight: '500',
  },
  modalDeposit: {
    fontSize: 14,
    color: '#7F8C8D',
    marginTop: 5,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 10,
  },
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  optionButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 5,
    backgroundColor: '#F7F8FA',
    marginRight: 10,
    marginBottom: 10,
  },
  selectedOptionButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#3498DB',
  },
  optionText: {
    fontSize: 14,
    color: '#34495E',
  },
  selectedOptionText: {
    color: '#3498DB',
  },
  dateSelector: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 5,
    backgroundColor: '#F7F8FA',
    alignSelf: 'flex-start',
  },
  dateSelectorText: {
    fontSize: 14,
    color: '#34495E',
  },
  modalFooter: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: '#ECF0F1',
    backgroundColor: '#FFFFFF',
  },
  footerInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cartIconButton: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 80,
  },
  cartIconLabel: {
    fontSize: 10,
    color: '#000000',
    marginTop: 2,
    textAlign: 'center',
    fontWeight: '500',
  },
  calendarContainer: {
    marginTop: 20,
    marginBottom: 10,
  },
  confirmButton: {
    flex: 1,
    backgroundColor: '#3498DB',
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  disabledConfirmButton: {
    backgroundColor: '#BDC3C7',
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '500',
  },
  calendarOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    zIndex: 20,
    padding: 15,
  }
});

export default SelectionModal;
