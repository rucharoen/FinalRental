import authService from '@/services/auth.service';
import cartService from '@/services/cart.service';
import productService, { Product } from '@/services/product.service';
import rentalService from '@/services/rental.service';
import shopService from '@/services/shop.service';
import { styles } from '@/styles/checkout.styles';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import chatService from '@/services/chat.service';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

const CheckoutScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { items, productId, startDate, endDate } = params;

  const [checkoutItems, setCheckoutItems] = useState<any[]>([]);
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [reserving, setReserving] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'qr' | 'card'>('qr');

  useEffect(() => {
    loadInitialData();
  }, [items, productId, startDate, endDate]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      
      let itemsToProcess: any[] = [];

      // Case 1: Direct Rent Now from Product Detail
      if (productId) {
        try {
          const detail = await productService.getProductById(productId as string);
          if (detail) {
            const productDetail = detail as any;
            itemsToProcess = [{
              id: 'direct_' + Date.now(),
              productId: productId,
              productName: productDetail.name,
              image: (productDetail.images && productDetail.images.length > 0) ? productDetail.images[0] : (productDetail.image || ''),
              price: productDetail.price_per_day || productDetail.price,
              quantity: 1,
              startDate: startDate,
              endDate: endDate,
              shopName: productDetail.shop_name || 'ร้านค้าทั่วไป',
              fullProduct: productDetail,
              owner_id: productDetail.owner_id || productDetail.user_id || productDetail.shop_owner_id,
              deposit: productDetail.deposit || 0
            }];
          }
        } catch (err) {
          console.error('Error fetching direct product:', err);
        }
      } 
      // Case 2: From Cart
      else if (items) {
        const allCartItems = await cartService.getCartItems();
        const selectedIds = (items as string || '').split(',');
        const selectedCartItems = allCartItems.filter(i => selectedIds.includes(i.id));

        if (selectedCartItems.length > 0) {
          itemsToProcess = await Promise.all(selectedCartItems.map(async (cartItem) => {
            try {
              const detail = await productService.getProductById(cartItem.productId.toString());
              const productDetail = detail as any;
              
              let shopName = productDetail.shop_name || cartItem.shopName;
              
              if (!shopName || shopName === 'ร้านค้าทั่วไป' || shopName.startsWith('Shop ')) {
                try {
                  const shopInfo = await shopService.getShopInfo(productDetail.shop_id.toString());
                  if (shopInfo && shopInfo.name) {
                    shopName = shopInfo.name;
                  }
                } catch (shopErr) {}
              }

              return {
                ...cartItem,
                fullProduct: productDetail,
                shopName: shopName || 'ร้านค้าทั่วไป',
                owner_id: productDetail.owner_id || productDetail.user_id || productDetail.shop_owner_id,
                deposit: productDetail.deposit || 0
              };
            } catch (err) {
              return {
                ...cartItem,
                fullProduct: null,
                owner_id: 0,
                deposit: 0
              };
            }
          }));
        }
      }

      if (itemsToProcess.length === 0) {
        setLoading(false);
        return;
      }

      setCheckoutItems(itemsToProcess);

      // 3. Load user profile
      const profile = await authService.getProfile();
      if (profile && !profile.error) {
        setUserData(profile);
      } else {
        const localUser = await authService.getUserData();
        setUserData(localUser);
      }

    } catch (error) {
      console.error('Error loading checkout data:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderAddress = () => {
    if (!userData?.address || userData.address === 'ไม่ระบุที่อยู่') {
      return {
        name: userData?.full_name || 'ไม่ระบุชื่อ',
        detail: 'กรุณาเพิ่มที่อยู่สำหรับการจัดส่ง'
      };
    }

    try {
      const addr = JSON.parse(userData.address);
      return {
        name: `${addr.shipping_name || userData.full_name} (${addr.shipping_phone || '-'})`,
        detail: `${addr.address_detail} ต.${addr.sub_district} อ.${addr.district} จ.${addr.province} ${addr.postal_code}`
      };
    } catch (e) {
      return {
        name: userData.full_name || 'ผู้ใช้งาน',
        detail: userData.address
      };
    }
  };

  const address = renderAddress();

  const getItemDays = (item: any) => {
    if (!item.startDate || !item.endDate) return 1;

    const parseThaiDate = (dateStr: string) => {
      const months = ["มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน", "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"];
      const parts = dateStr.trim().split(/\s+/);
      const day = parseInt(parts[0]);
      const monthIndex = months.indexOf(parts[1]);
      const currentYearThai = new Date().getFullYear() + 543;
      let year = parts[2] ? parseInt(parts[2]) : currentYearThai;
      return new Date(year - 543, monthIndex, day);
    };

    try {
      const start = parseThaiDate(item.startDate);
      const end = parseThaiDate(item.endDate);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const days = Math.round(diffTime / (1000 * 60 * 60 * 24)) + 1;
      return isNaN(days) || days < 1 ? 1 : days;
    } catch (e) {
      return 1;
    }
  };

  // Group items by shop
  const groupedByShop = checkoutItems.reduce((acc: any, item: any) => {
    const shop = item.shopName || 'ร้านค้าทั่วไป';
    if (!acc[shop]) acc[shop] = [];
    acc[shop].push(item);
    return acc;
  }, {});

  // Calculate totals
  const totalRentalFee = checkoutItems.reduce((sum, item) => sum + (item.price * item.quantity * getItemDays(item)), 0);
  const totalDeposit = checkoutItems.reduce((sum, item) => sum + (Number(item.deposit || 0) * item.quantity), 0);
  const deliveryFee = 50 * Object.keys(groupedByShop).length; // Fee per shop
  const totalAmount = totalRentalFee + totalDeposit + deliveryFee;

  const handleReserve = async () => {
    // 1. ตรวจสอบการยืนยันตัวตน (KYC)
    const kycStatus = userData?.kyc_status || 'none';
    
    if (kycStatus === 'pending') {
      Alert.alert(
        "รอการตรวจสอบ",
        "การยืนยันตัวตนของคุณอยู่ระหว่างการตรวจสอบ กรุณารอผลการอนุมัติก่อนทำการเช่า",
        [{ text: "ตกลง" }]
      );
      return;
    }

    if (kycStatus !== 'verified' && kycStatus !== 'approved') {
      Alert.alert(
        "ยืนยันตัวตน",
        "กรุณายืนยันตัวตนให้สำเร็จก่อนจึงจะสามารถเช่าสินค้าได้",
        [
          { text: "ยกเลิก", style: "cancel" },
          { text: "ไปหน้ายืนยันตัวตน", onPress: () => router.push('/(tabs)/profile/kyc') }
        ]
      );
      return;
    }

    // 2. ตรวจสอบที่อยู่
    if (!userData?.address || userData.address === 'ไม่ระบุที่อยู่') {
      Alert.alert('แจ้งเตือน', 'กรุณาระบุที่อยู่ในการจัดส่งก่อนทำการจอง', [
        { text: 'ไปเพิ่มที่อยู่', onPress: () => router.push('/(tabs)/profile/address') }
      ]);
      return;
    }

    if (checkoutItems.length === 0 || !userData) return;

    try {
      setReserving(true);

      const parseThaiDateToISO = (dateStr: string) => {
        const months = ["มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน", "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"];
        const parts = dateStr.trim().split(/\s+/);
        const day = parseInt(parts[0]);
        const monthIndex = months.indexOf(parts[1]);
        const currentYear = new Date().getFullYear();
        const year = parts[2] ? parseInt(parts[2]) - 543 : currentYear;
        return new Date(year, monthIndex, day).toISOString();
      };

      // Create bookings for each item
      for (const item of checkoutItems) {
        const days = getItemDays(item);
        const bookingData = {
          product_id: item.productId.toString(),
          renter_id: userData.id.toString(),
          owner_id: item.owner_id,
          days: days,
          start_date: parseThaiDateToISO(item.startDate),
          end_date: parseThaiDateToISO(item.endDate),
          rental_fee: item.price * item.quantity * days,
          deposit_fee: Number(item.deposit || 0) * item.quantity,
          shipping_fee: 50, // shipping per item or per shop depending on backend
          total_price: (item.price * item.quantity * days) + (Number(item.deposit || 0) * item.quantity) + 50,
          quantity: item.quantity,
          status: 'pending_owner'
        };
        await rentalService.createBooking(bookingData as any);
      }

      // Clear booked items from cart
      for (const item of checkoutItems) {
        await cartService.removeFromCart(item.id);
      }

      Alert.alert(
        'จองสำเร็จ',
        'รายการจองของคุณถูกส่งไปยังเจ้าของร้านแล้ว กรุณารอเจ้าของอนุมัติก่อนทำการชำระเงิน',
        [{ text: 'ดูรายการเช่าของฉัน', onPress: () => router.push('/(tabs)/profile/bookings') }]
      );
    } catch (error: any) {
      console.error('Reserve booking failed:', error);
      Alert.alert('จองไม่สำเร็จ', error.message || 'ไม่สามารถสร้างรายการจองได้ในขณะนี้');
    } finally {
      setReserving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3498DB" />
      </View>
    );
  }

  if (checkoutItems.length === 0) {
    return (
      <View style={styles.errorContainer}>
        <Text>ไม่พบข้อมูลสินค้า</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={{ color: '#3498DB', marginTop: 10 }}>ย้อนกลับ</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={28} color="#2C3E50" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>ทำการจองเช่า</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Address Card */}
        <TouchableOpacity style={styles.card} onPress={() => router.push('/(tabs)/profile/address')}>
          <View style={styles.addressHeader}>
            <Ionicons name="location-sharp" size={20} color="#E74C3C" />
            <Text style={styles.addressName}>{address.name}</Text>
          </View>
          <Text style={styles.addressDetail}>{address.detail}</Text>
        </TouchableOpacity>

        {/* Grouped Items by Shop */}
        {Object.entries(groupedByShop).map(([shopName, items]: [string, any]) => (
          <View key={shopName} style={styles.card}>
            <View style={styles.shopHeader}>
              <MaterialIcons name="store" size={22} color="#2C3E50" />
              <Text style={styles.shopName}>{shopName}</Text>
            </View>
            
            {items.map((item: any, idx: number) => (
              <View key={item.id} style={[styles.productInfoRow, idx > 0 && { marginTop: 15, borderTopWidth: 1, borderTopColor: '#F0F0F0', paddingTop: 15 }]}>
                <Image
                  source={{ uri: chatService.formatImageUrl(item.image) || 'https://via.placeholder.com/150' }}
                  style={styles.productImage}
                />
                <View style={styles.productDetails}>
                  <Text style={styles.productTitle} numberOfLines={2}>{item.productName}</Text>
                  <Text style={styles.rentDate}>ระยะเวลา: {item.startDate} - {item.endDate}</Text>
                  <View style={styles.priceDayRow}>
                    <Text style={styles.pricePerDay}>
                      {item.price.toLocaleString()} ฿/วัน x {getItemDays(item)} วัน x {item.quantity} ชิ้น
                    </Text>
                  </View>
                </View>
              </View>
            ))}

            {/* Shop specific shipping info (like Shopee) */}
            <View style={{ marginTop: 15, borderTopWidth: 1, borderTopColor: '#F0F0F0', paddingTop: 10 }}>
               <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={{ fontSize: 13, color: '#7f8c8d' }}>ตัวเลือกการจัดส่ง (Standard Delivery)</Text>
                  <Text style={{ fontSize: 13, color: '#333' }}>฿50.00</Text>
               </View>
               <Text style={{ fontSize: 11, color: '#2ecc71', marginTop: 2 }}>จะได้รับภายใน 2-3 วันทำการ</Text>
            </View>
          </View>
        ))}

        {/* Summary Breakdown */}
        <View style={styles.card}>
          <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 15 }}>สรุปยอดจองเช่า</Text>
          
          <View style={styles.infoRowSmall}>
            <Text style={styles.infoLabelNormal}>รวมค่าเช่าสินค้า</Text>
            <Text style={styles.infoValueSmall}>฿{totalRentalFee.toLocaleString()}</Text>
          </View>

          <View style={styles.infoRowSmall}>
            <Text style={styles.infoLabelNormal}>รวมเงินมัดจำ</Text>
            <Text style={styles.infoValueSmall}>฿{totalDeposit.toLocaleString()}</Text>
          </View>

          <View style={styles.infoRowSmall}>
            <Text style={styles.infoLabelNormal}>รวมค่าจัดส่ง ({Object.keys(groupedByShop).length} ร้านค้า)</Text>
            <Text style={styles.infoValueSmall}>฿{deliveryFee.toLocaleString()}</Text>
          </View>

          <View style={[styles.infoRowSmall, { marginTop: 10, borderTopWidth: 1, borderTopColor: '#f0f0f0', paddingTop: 10 }]}>
            <Text style={{ fontSize: 16, fontWeight: 'bold' }}>ยอดจองเช่าทั้งหมด</Text>
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#E74C3C' }}>฿{totalAmount.toLocaleString()}</Text>
          </View>
        </View>

        {/* Payment Methods */}
        <View style={styles.paymentSection}>
          <Text style={styles.paymentTitle}>ช่องทางการชำระเงิน</Text>

          <TouchableOpacity
            style={styles.paymentOption}
            onPress={() => setPaymentMethod('qr')}
          >
            <View style={styles.paymentOptionLeft}>
              <View style={[styles.paymentIconBox, { backgroundColor: '#1A237E' }]}>
                <Ionicons name="qr-code-outline" size={20} color="#FFFFFF" />
              </View>
              <Text style={styles.paymentOptionText}>QR พร้อมเพย์</Text>
            </View>
            <Ionicons
              name={paymentMethod === 'qr' ? "radio-button-on" : "radio-button-off"}
              size={22}
              color={paymentMethod === 'qr' ? "#3498DB" : "#BDC3C7"}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.paymentOption}
            onPress={() => setPaymentMethod('card')}
          >
            <View style={styles.paymentOptionLeft}>
              <View style={[styles.paymentIconBox, { backgroundColor: '#34495E' }]}>
                <Ionicons name="card-outline" size={20} color="#FFFFFF" />
              </View>
              <Text style={styles.paymentOptionText}>บัตรเครดิต/บัตรเดบิต</Text>
            </View>
            <Ionicons
              name={paymentMethod === 'card' ? "radio-button-on" : "radio-button-off"}
              size={22}
              color={paymentMethod === 'card' ? "#3498DB" : "#BDC3C7"}
            />
          </TouchableOpacity>
        </View>
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.totalContainer}>
          <Text style={styles.totalLabel}>ยอดรวมทั้งหมด</Text>
          <Text style={styles.totalValue}>{totalAmount.toLocaleString()} ฿</Text>
        </View>
        <TouchableOpacity
          style={[styles.reserveButton, reserving && { backgroundColor: '#BDC3C7' }]}
          onPress={handleReserve}
          disabled={reserving}
        >
          {reserving ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.reserveButtonText}>ส่งรายการจอง</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default CheckoutScreen;
