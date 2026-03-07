import React, { useEffect, useState } from 'react';
import { ScrollView, View, StatusBar, ActivityIndicator, Text, RefreshControl } from 'react-native';
import SearchBar from '../../components/home/SearchBar';
import CategoryList from '../../components/home/CategoryList';
import ProductCard from '../../components/product/ProductCard';
import productService, { Product } from '../../services/product.service';
import authService from '../../services/auth.service';
import { styles } from '../../styles/home.styles';

export default function HomeScreen() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [ownProductIds, setOwnProductIds] = useState<Set<number>>(new Set<number>());

  useEffect(() => {
    loadUserAndProducts();
  }, []);

  const loadUserAndProducts = async () => {
    try {
      // ใช้ Token ดึงสินค้าของตัวเองมาเก็บไว้เพื่อใช้คัดออก (เพราะข้อมูลหน้า Home ไม่มี owner_id)
      const ownResponse = await productService.getOwnProducts();
      const ownList = ownResponse.products || ownResponse.data || (Array.isArray(ownResponse) ? ownResponse : []);
      const ids = new Set<number>(ownList.map((p: any) => Number(p.id)));
      setOwnProductIds(ids);

      await fetchProducts();
    } catch (error) {
      console.error('Error loading user products mapping:', error);
      await fetchProducts(); // ถ้าดึงของตัวเองไม่ได้ อย่างน้อยก็โชว์สินค้าทั่วไป
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

  const filteredProducts = products.filter(product => {
    // 1. กรองสินค้าของตัวเองออก (โดยเช็คจาก List ที่ดึงมาจาก Token)
    const isMyProduct = ownProductIds.has(Number(product.id));
    if (isMyProduct) return false;

    // กรองตามการค้นหา
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
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
      <StatusBar barStyle="light-content" />
      <SearchBar value={searchQuery} onChangeText={setSearchQuery} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#3498DB']} // Android
            tintColor="#3498DB" // iOS
          />
        }
      >
        <CategoryList onSelectCategory={handleCategorySelect} selectedCategory={searchQuery} />

        <View style={styles.productList}>
          {loading ? (
            <ActivityIndicator size="large" color="#3498DB" style={{ marginTop: 20 }} />
          ) : (
            <View style={styles.productGrid}>
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
              {filteredProducts.length === 0 && (
                <Text style={{ textAlign: 'center', marginTop: 20, color: '#95A5A6' }}>
                  ไม่พบข้อมูลสินค้า{searchQuery ? ` ที่ค้นหา "${searchQuery}"` : ''}
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

