import React, { useEffect, useState } from 'react';
import { ScrollView, View, StatusBar, ActivityIndicator, Text } from 'react-native';
import SearchBar from '../../components/home/SearchBar';
import CategoryList from '../../components/home/CategoryList';
import ProductCard from '../../components/product/ProductCard';
import productService, { Product } from '../../services/product.service';
import { styles } from '../../styles/home.styles';

export default function HomeScreen() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredProducts(products);
    } else {
      const filtered = products.filter(product => 
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredProducts(filtered);
    }
  }, [searchQuery, products]);

  const fetchProducts = async () => {
    try {
      const data = await productService.getProducts();
      setProducts(data);
      setFilteredProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (text: string) => {
    setSearchQuery(text);
  };

  const handleCategorySelect = (categoryName: string) => {
    setSearchQuery(categoryName);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <SearchBar value={searchQuery} onChangeText={handleSearch} />
      
      <ScrollView showsVerticalScrollIndicator={false}>
        <CategoryList onSelectCategory={handleCategorySelect} />
        
        <View style={styles.productList}>
          {loading ? (
            <ActivityIndicator size="large" color="#3498DB" style={{ marginTop: 20 }} />
          ) : (
            <View style={styles.productGrid}>
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
              {filteredProducts.length === 0 && (
                <View style={{ width: '100%', alignItems: 'center', marginTop: 40 }}>
                  <Text style={{ textAlign: 'center', color: '#95A5A6', fontSize: 16 }}>
                    {searchQuery ? `ไม่พบสินค้าที่ตรงกับ "${searchQuery}"` : 'ไม่พบข้อมูลสินค้า'}
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>
        
        <View style={{ height: 80 }} />
      </ScrollView>
    </View>
  );
}
