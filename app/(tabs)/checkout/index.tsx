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
import { styles } from '@/styles/checkout.styles';

const CheckoutScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { productId, startDate, endDate } = params;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState<'qr' | 'card'>('qr');

  useEffect(() => {
    if (productId) {
      loadProduct();
    }
  }, [productId]);

  const loadProduct = async () => {
    try {
      const data = await productService.getProductById(productId as string);
      setProduct(data);
    } catch (error) {
      console.error('Error loading product for checkout:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateDays = () => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate as string);
    const end = new Date(endDate as string);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  const days = calculateDays();
  const rentalPrice = product ? product.price_per_day * days : 0;
  const deliveryFee = 45;
  const depositFee = product?.deposit || 0;
  const totalAmount = rentalPrice + deliveryFee + depositFee;

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
        <View style={styles.card}>
          <View style={styles.addressHeader}>
            <Ionicons name="location-sharp" size={20} color="#E74C3C" />
            <Text style={styles.addressName}>ทนงคงควรคอย (+66) 64 319 7106</Text>
          </View>
          <Text style={styles.addressDetail}>
            เลขที่ 6/899 หมู่ 5 ซอย พหลโยธิน 52 แยก 11 แขวงคลองถนน เขตสายไหม จังหวัดกรุงเทพมหานคร 10220
          </Text>
        </View>

        {/* Product Card */}
        <View style={styles.card}>
          <View style={styles.shopHeader}>
            <MaterialIcons name="store" size={22} color="#2C3E50" />
            <Text style={styles.shopName}>SR Shop</Text>
          </View>
          <View style={styles.productInfoRow}>
            <Image 
              source={{ uri: product.images[0] || '' }} 
              style={styles.productImage} 
            />
            <View style={styles.productDetails}>
              <Text style={styles.productTitle} numberOfLines={2}>{product.name}</Text>
              <Text style={styles.rentDate}>ระยะเวลาเช่า {startDate} - {endDate}</Text>
              <View style={styles.priceDayRow}>
                 <Text style={styles.pricePerDay}>{product.price_per_day} ฿/วัน</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Standard Delivery */}
        <View style={styles.infoRow}>
          <View style={styles.infoCol}>
            <Text style={styles.infoLabelBold}>Standard Delivery - <Text style={styles.infoLabelNormal}>ส่งธรรมดาในประเทศ</Text></Text>
            <Text style={styles.infoSubText}>จะได้รับภายในวันที่ 26 - 27 ก.พ.</Text>
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
        <TouchableOpacity style={styles.reserveButton}>
          <Text style={styles.reserveButtonText}>จอง</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default CheckoutScreen;
