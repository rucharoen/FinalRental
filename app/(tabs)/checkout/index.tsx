import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import productService, { Product } from '@/services/product.service';
import authService from '@/services/auth.service';
import rentalService from '@/services/rental.service';
import { styles } from '@/styles/checkout.styles';
import { Alert } from 'react-native';

const CheckoutScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { productId, startDate, endDate } = params;

  const [product, setProduct] = useState<Product | null>(null);
  const [userData, setUserData] = useState<any>(null); // Added userData state
  const [loading, setLoading] = useState(true);
  const [reserving, setReserving] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'qr' | 'card'>('qr');

  useEffect(() => {
    if (productId) {
      loadInitialData(); // Changed to loadInitialData
    }
  }, [productId]);

  const loadInitialData = async () => {
    try {
      setLoading(true);

      // 1. โหลดข้อมูลสินค้า
      if (productId) {
        try {
          // พยายามดึงแบบรายชิ้นก่อนเพื่อให้ได้ข้อมูลครบถ้วน (เช่น deposit)
          const data = await productService.getProductById(productId as string);

          if (data && !(data as any).error) {
            setProduct(data);
          } else {
            throw new Error('Not found');
          }
        } catch (itemError) {
          // Fallback
          // หากดึงรายชิ้นไม่ได้ (อาจจะเพราะ 404) ให้ดึงจากรายการทั้งหมดแทน
          const allProducts = await productService.getProducts();
          if (Array.isArray(allProducts)) {
            const foundProduct = allProducts.find(p => p && p.id && p.id.toString() === productId);
            if (foundProduct) {
              setProduct(foundProduct);
            }
          }
        }
      }

      // 2. โหลดข้อมูลผู้ใช้ (ที่อยู่)
      const profile = await authService.getProfile();
      if (profile && !profile.error) {
        setUserData(profile);
      } else {
        const localUser = await authService.getUserData();
        setUserData(localUser);
      }

    } catch (error) {
      // Error loading data
    } finally {
      setLoading(false);
    }
  };

  // ฟังก์ชันช่วยแสดงผลที่อยู่แบบสวยงาม
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

  const address = renderAddress(); // Called renderAddress

  const calculateDays = () => {
    if (!startDate || !endDate) return 0;

    // ฟังก์ชันช่วยแปลงวันที่ภาษาไทยเป็น Date object สำหรับคำนวณ
    const parseThaiDate = (dateStr: string) => {
      const months = [
        "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
        "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
      ];
      const parts = dateStr.split(' ');
      const day = parseInt(parts[0]);
      const monthIndex = months.indexOf(parts[1]);
      let year = parts[2] ? parseInt(parts[2]) : 2026 + 543; // ถ้าไม่มีปี (startDate) ให้ใช้ปีปัจจุบัน พ.ศ.

      // แปลงปี พ.ศ. เป็น ค.ศ.
      const yearAD = year - 543;
      return new Date(yearAD, monthIndex, day);
    };

    try {
      const start = parseThaiDate(startDate as string);
      const end = parseThaiDate(endDate as string);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const daysCount = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      return isNaN(daysCount) ? 0 : daysCount;
    } catch (e) {
      console.error('Date calculation error:', e);
      return 0;
    }
  };

  const days = calculateDays();
  const rentalPrice = product ? (Number(product.price_per_day) || 0) * days : 0;
  const deliveryFee = 45;
  const depositFee = product ? Number(product.deposit) || 0 : 0;
  const totalAmount = rentalPrice + deliveryFee + depositFee;

  const getImageUrl = (item: any) => {
    const imgData = item.images || item.product_images;
    if (!imgData) return 'https://via.placeholder.com/150';

    try {
      const parsed = typeof imgData === 'string' ? JSON.parse(imgData) : imgData;
      if (Array.isArray(parsed) && parsed.length > 0) {
        const path = parsed[0];
        if (!path) return 'https://via.placeholder.com/150';
        if (path.startsWith('http')) return path;

        const baseUrl = 'https://finalrental.onrender.com';
        const normalizedPath = path.startsWith('/') ? path : `/${path}`;
        return `${baseUrl}${normalizedPath}`;
      }
    } catch (e) {
      console.error('Image parse error:', e);
    }
    return 'https://via.placeholder.com/150';
  };

  const handleReserve = async () => {
    if (!userData?.address || userData.address === 'ไม่ระบุที่อยู่') {
      Alert.alert('แจ้งเตือน', 'กรุณาระบุที่อยู่ในการจัดส่งก่อนทำการจอง', [
        { text: 'ไปเพิ่มที่อยู่', onPress: () => router.push('/(tabs)/profile/address') }
      ]);
      return;
    }

    if (!product || !userData) return;

    try {
      setReserving(true);

      // แปลงวันที่สำหรับส่งให้ API (ควรเป็น ISO format หรือวันที่ระบบเข้าใจ)
      const parseThaiDateToISO = (dateStr: string) => {
        const months = [
          "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
          "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
        ];
        const parts = dateStr.split(' ');
        const day = parseInt(parts[0]);
        const monthIndex = months.indexOf(parts[1]);
        const year = parts[2] ? parseInt(parts[2]) - 543 : 2026;
        return new Date(year, monthIndex, day).toISOString();
      };

      const bookingData = {
        product_id: product.id.toString(),
        renter_id: userData.id.toString(),
        owner_id: product.owner_id,
        days: days,
        start_date: parseThaiDateToISO(startDate as string),
        end_date: parseThaiDateToISO(endDate as string),
        rental_fee: rentalPrice,
        deposit_fee: depositFee,
        shipping_fee: deliveryFee,
        total_price: totalAmount,
        quantity: 1,
        status: 'pending_owner' // เริ่มต้นเป็นรอเจ้าของอนุมัติ
      };

      console.log('--- DEBUG: Creating Booking ---');
      console.log('Booking Data:', JSON.stringify(bookingData, null, 2));

      await rentalService.createBooking(bookingData as any);

      Alert.alert(
        'จองสำเร็จ',
        'รายการจองของคุณถูกส่งไปยังเจ้าของร้านแล้ว กรุณารอเจ้าของอนุมัติก่อนทำการชำระเงิน',
        [
          {
            text: 'ดูรายการเช่าของฉัน',
            onPress: () => router.push('/(tabs)/profile/bookings')
          }
        ]
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

  if (!product) {
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
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={28} color="#2C3E50" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>ทำการเช่า</Text>
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

        {/* Product Card */}
        <View style={styles.card}>
          <View style={styles.shopHeader}>
            <MaterialIcons name="store" size={22} color="#2C3E50" />
            <Text style={styles.shopName}>ร้านค้า ID: {product.shop_id || 'ทั่วไป'}</Text>
          </View>
          <View style={styles.productInfoRow}>
            <Image
              source={{ uri: getImageUrl(product) }}
              style={styles.productImage}
            />
            <View style={styles.productDetails}>
              <Text style={styles.productTitle} numberOfLines={2}>{product.name}</Text>
              <Text style={styles.rentDate}>ระยะเวลาเช่า {startDate} - {endDate}</Text>
              <View style={styles.priceDayRow}>
                <Text style={styles.pricePerDay}>{product.price_per_day || 0} ฿/วัน</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Standard Delivery */}
        <View style={styles.infoRow}>
          <View style={styles.infoCol}>
            <Text style={styles.infoLabelBold}>Standard Delivery - <Text style={styles.infoLabelNormal}>ส่งธรรมดาในประเทศ</Text></Text>
          </View>
          <Text style={styles.infoValue}>฿{deliveryFee}</Text>
        </View>

        {/* Deposit Card */}
        <View style={styles.infoRow}>
          <Text style={styles.infoLabelBold}>ค่ามัดจำสินค้า</Text>
          <Text style={styles.infoValue}>฿{depositFee}</Text>
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
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.totalContainer}>
          <Text style={styles.totalLabel}>รวมทั้งหมด</Text>
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
            <Text style={styles.reserveButtonText}>จอง</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default CheckoutScreen;
