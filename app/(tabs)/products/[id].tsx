import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  Image, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator, 
  SafeAreaView 
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons, Feather, MaterialCommunityIcons, AntDesign } from '@expo/vector-icons';
import productService, { Product } from '@/services/product.service';
import SelectionModal from '@/components/SelectionModal';
import styles from '@/styles/product-detail';


export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'details' | 'terms'>('details');
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<'cart' | 'rent'>('cart');

  useEffect(() => {
    if (id) {
      fetchProduct();
    }
  }, [id]);


const fetchProduct = async () => {
  try {
    setLoading(true);
    // ดึงสินค้าทั้งหมดมาหารายการที่ตรงกับ ID
    const allProducts = await productService.getProducts();
    const foundProduct = allProducts.find(p => p.id.toString() === id);
    
    if (foundProduct) {
      setProduct(foundProduct);
    } else {
      // หากหาไม่พบในรายการ ให้ลองเรียก API รายตัวเป็นทางเลือกสุดท้าย
      const data = await productService.getProductById(id as string);
      setProduct(data);
    }
  } catch (error) {
    console.error('Error fetching product details:', error);
  } finally {
    setLoading(false);
  }
};

  

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#3498DB" />
      </View>
    );
  }
  

  if (!product) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>ไม่พบสินค้า</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={30} color="#2C3E50" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Product Image */}
        <View style={styles.imageContainer}>
          <Image 
            source={{ uri: product.images && product.images.length > 0 ? product.images[0] : '' }} 
            style={styles.productImage}
            resizeMode="contain"
          />
        </View>

        {/* Product Info */}
        <View style={styles.infoContainer}>
          <View style={styles.priceRow}>
            <Text style={styles.price}>{product.price_per_day.toLocaleString()}</Text>
            <Text style={styles.priceUnit}> ฿/วัน</Text>
          </View>
          <Text style={styles.deposit}>เงินมัดจำ {product.deposit}฿</Text>
          <Text style={styles.name}>{product.name}</Text>
        </View>

        {/* Shipping Info */}
        <View style={styles.shippingContainer}>
          <View style={styles.shippingInfo}>
            <MaterialCommunityIcons name="truck-delivery-outline" size={24} color="#7F8C8D" />
            <Text style={styles.shippingText}>จัดส่งภายใน 48 ชั่วโมง</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#BDC3C7" />
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'details' && styles.activeTab]}
            onPress={() => setActiveTab('details')}
          >
            <Text style={[styles.tabLabel, activeTab === 'details' && styles.activeTabLabel]}>รายละเอียดสินค้า</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'terms' && styles.activeTab]}
            onPress={() => setActiveTab('terms')}
          >
            <Text style={[styles.tabLabel, activeTab === 'terms' && styles.activeTabLabel]}>เงื่อนไขการเช่า</Text>
          </TouchableOpacity>
        </View>

        {/* Details Content */}
        <View style={styles.detailsContainer}>
          {activeTab === 'details' ? (
            <>
              <Text style={styles.sectionTitle}>รายละเอียด: {product.name}</Text>
              <Text style={styles.description}>
                {product.description}
              </Text>
            </>
          ) : (
            <View>
              <Text style={[styles.sectionTitle, { marginBottom: 20 }]}>ขั้นตอนการเช่า</Text>
              
              {/* Step 1 */}
              <View style={styles.timelineItem}>
                <View style={styles.timelineDotOuter}>
                  <View style={styles.timelineDotInner} />
                </View>
                <View style={styles.timelineContent}>
                  <Text style={styles.timelineStepText}>ชำระค่าเช่า + เงินมัดจำ</Text>
                </View>
              </View>
              <View style={styles.timelineConnector}>
                <MaterialCommunityIcons name="chevron-double-down" size={16} color="#C5CAE9" />
              </View>

              {/* Step 2 */}
              <View style={styles.timelineItem}>
                <View style={styles.timelineDotOuter}>
                  <View style={styles.timelineDotInner} />
                </View>
                <View style={styles.timelineContent}>
                  <Text style={styles.timelineStepText}>เช่าจบ ส่งสินค้าคืนภายใน 24 ชั่วโมง</Text>
                </View>
              </View>
              <View style={styles.timelineConnector}>
                <MaterialCommunityIcons name="chevron-double-down" size={16} color="#C5CAE9" />
              </View>

              {/* Step 3 */}
              <View style={styles.timelineItem}>
                <View style={styles.timelineDotOuter}>
                  <View style={styles.timelineDotInner} />
                </View>
                <View style={styles.timelineContent}>
                  <Text style={styles.timelineStepText}>ร้านค้าเซ็นรับพัสดุและตรวจสอบคุณภาพสินค้า</Text>
                </View>
              </View>
              <View style={styles.timelineConnector}>
                <MaterialCommunityIcons name="chevron-double-down" size={16} color="#C5CAE9" />
              </View>

              {/* Step 4 */}
              <View style={styles.timelineItem}>
                <View style={styles.timelineDotOuter}>
                  <View style={styles.timelineDotInner} />
                </View>
                <View style={styles.timelineContent}>
                  <Text style={styles.timelineStepText}>สินค้าไม่มีปัญหา คืนมัดจำ</Text>
                </View>
              </View>
              <View style={styles.timelineConnector}>
                <MaterialCommunityIcons name="chevron-double-down" size={16} color="#C5CAE9" />
              </View>

              {/* Step 5 */}
              <View style={styles.timelineItem}>
                <View style={styles.timelineDotOuter}>
                  <View style={styles.timelineDotInner} />
                </View>
                <View style={styles.timelineContent}>
                  <Text style={styles.timelineStepText}>คำสั่งซื้อเสร็จสมบูรณ์</Text>
                </View>
              </View>
            </View>
          )}
        </View>

      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.footerIcons}>
          <TouchableOpacity 
            style={styles.iconButton}
            onPress={() => router.push(`/(tabs)/chat/${product.owner_id || 'default'}`)}
          >
            <Ionicons name="chatbubble-ellipses-outline" size={24} color="#7F8C8D" />
            <Text style={styles.iconLabel}>แชท</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.iconButton}
            onPress={() => {
              setModalType('cart');
              setModalVisible(true);
            }}
          >
            <Ionicons name="cart-outline" size={24} color="#7F8C8D" />
            <Text style={styles.iconLabel}>เพิ่มไปยังรถเข็น</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity 
          style={styles.rentButton}
          onPress={() => {
            setModalType('rent');
            setModalVisible(true);
          }}
        >
          <Text style={styles.rentButtonText}>เช่าเลย</Text>
        </TouchableOpacity>
      </View>

      <SelectionModal 
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        product={product}
        type={modalType}
      />

    </SafeAreaView>
  );
}
