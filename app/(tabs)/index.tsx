import React, { useEffect, useState } from 'react';
import { ActivityIndicator, RefreshControl, SafeAreaView, ScrollView, StatusBar, Text, View } from 'react-native';
import CategoryList from '../../components/home/CategoryList';
import SearchBar from '../../components/home/SearchBar';
import ProductCard from '../../components/product/ProductCard';
import authService from '../../services/auth.service';
import productService, { Product } from '../../services/product.service';
import { styles } from '../../styles/home.styles';

export default function HomeScreen() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [ownProductIds, setOwnProductIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    loadUserAndProducts();
  }, []);

  const loadUserAndProducts = async () => {
    try {
      // ตรวจสอบก่อนว่ามีการ Login หรือไม่
      const token = await authService.getToken();
      
      if (token) {
        // ใช้ Token ดึงสินค้าของตัวเองมาเก็บไว้เพื่อใช้คัดออก (เพราะข้อมูลหน้า Home ไม่มี owner_id)
        const ownResponse = await productService.getOwnProducts();
        const ownList =
          ownResponse.products ||
          ownResponse.data ||
          (Array.isArray(ownResponse) ? ownResponse : []);

        const ids = new Set<number>(ownList.map((p: any) => Number(p.id)));
        setOwnProductIds(ids);
      }

      await fetchProducts();
    } catch (error) {
      // ถ้าเป็น Unauthenticated หมายถึงไม่ได้ Login ให้โหลดสินค้าปกติ
      if (error instanceof Error && error.message === 'Unauthenticated') {
        await fetchProducts();
      } else {
        console.error('Error loading user products mapping:', error);
        await fetchProducts();
      }
    }
  };

  const fetchProducts = async (isRefreshing = false) => {
    try {
      if (!isRefreshing) setLoading(true);

      const data = await productService.getProducts();
      setProducts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchProducts(true);
  }, []);

  // keyword ของแต่ละหมวด
  const categoryKeywords: Record<string, string[]> = {
    หนังสือ: [
      'หนังสือ',
      'เล่ม',
      'นิยาย',
      'การ์ตูน',
      'ตำรา',
      'นิตยสาร',
      'book',
      'novel',
      'ebook',
      'manga',
      'comic',
      'light novel',
      'pocketbook',
      'วรรณกรรม',
    ],

    'รองเท้าและเสื้อผ้า': [
      'รองเท้า',
      'เสื้อผ้า',
      'แฟชั่น',
      'กางเกง',
      'กระโปรง',
      'เสื้อ',
      'shoes',
      'clothes',
      'shirt',
      'tshirt',
      'hoodie',
      'jacket',
      'coat',
      'dress',
      'sneaker',
      'boots',
      'sandal',
    ],

    อิเล็กทรอนิกส์: [
      'อิเล็กทรอนิกส์',
      'มือถือ',
      'คอมพิวเตอร์',
      'หูฟัง',
      'สายชาร์จ',
      'ไอโฟน',
      'ซัมซุง',
      'tablet',
      'laptop',
      'iphone',
      'android',
      'ipad',
      'macbook',
      'tv',
      'camera',
      'mouse',
      'keyboard',
      'powerbank',
      'charger',
      'smartwatch',
      'ลำโพง',
      'ไมค์',
      'speaker',
      'mic',
      'audio',
    ],
  };

  const filteredProducts = products.filter(product => {
    // กรองสินค้าของตัวเอง
    if (ownProductIds.has(Number(product.id))) return false;

    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;

    const name = product.name?.toLowerCase() || '';
    const desc = product.description?.toLowerCase() || '';

    let matchedCategoryKeywords: string[] | null = null;

    // ตรวจว่าคำค้นหาอยู่ในหมวดไหน
    for (const category in categoryKeywords) {
      const keywords = categoryKeywords[category];

      if (
        category.toLowerCase().includes(query) ||
        keywords.some(k => query.includes(k))
      ) {
        matchedCategoryKeywords = keywords;
        break;
      }
    }

    // ถ้าตรงกับหมวด ให้เช็ค keyword ของหมวด
    if (matchedCategoryKeywords) {
      return matchedCategoryKeywords.some(keyword => {
        const k = keyword.toLowerCase();
        return name.includes(k) || desc.includes(k);
      });
    }

    // ค้นหาทั่วไป
    return name.includes(query) || desc.includes(query);
  });

  const handleCategorySelect = (categoryName: string) => {
    if (searchQuery === categoryName) {
      setSearchQuery('');
    } else {
      setSearchQuery(categoryName);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#3498DB" />
      <SearchBar value={searchQuery} onChangeText={setSearchQuery} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#3498DB']}
            tintColor="#3498DB"
          />
        }
      >
        <CategoryList
          onSelectCategory={handleCategorySelect}
          selectedCategory={searchQuery}
        />

        <View style={styles.productList}>
          {loading ? (
            <ActivityIndicator
              size="large"
              color="#3498DB"
              style={{ marginTop: 20 }}
            />
          ) : (
            <View style={styles.productGrid}>
              {filteredProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}

              {filteredProducts.length === 0 && (
                <Text
                  style={{
                    textAlign: 'center',
                    marginTop: 20,
                    color: '#95A5A6',
                  }}
                >
                  ไม่พบข้อมูลสินค้า
                  {searchQuery ? ` ที่ค้นหา "${searchQuery}"` : ''}
                </Text>
              )}
            </View>
          )}
        </View>

        <View style={{ height: 80 }} />
      </ScrollView>
    </View>
  );
}