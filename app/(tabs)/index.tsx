import React, { useEffect, useState } from 'react';
import { ScrollView, View, StatusBar, ActivityIndicator, Text } from 'react-native';
import SearchBar from '../../components/home/SearchBar';
import CategoryList from '../../components/home/CategoryList';
import ProductCard from '../../components/product/ProductCard';
import productService, { Product } from '../../services/product.service';
import { styles } from '../../styles/home.styles';

export default function HomeScreen() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const data = await productService.getProducts();
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
      
      <ScrollView showsVerticalScrollIndicator={false}>
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

