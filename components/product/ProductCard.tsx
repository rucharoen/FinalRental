import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Product } from '../../services/product.service';
import { styles } from '../../styles/home.styles';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const router = useRouter();

  return (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() => router.push(`/(tabs)/products/${product.id}`)}
    >
      <View style={styles.productImage}>
        <Image
          source={{ uri: product.images && product.images.length > 0 ? product.images[0] : '' }}
          style={{ width: '100%', height: '100%' }}
          resizeMode="cover"
        />
      </View>
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={2}>
          {product.name}
        </Text>
        <View style={styles.priceRow}>
          <Text style={styles.productPrice}>{product.price_per_day.toLocaleString()} ฿/วัน</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default ProductCard;
