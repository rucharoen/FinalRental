import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { Product } from '../../services/product.service';
import { styles } from '../../styles/home.styles';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  return (
    <TouchableOpacity style={styles.productCard}>
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
          <Text style={styles.productPrice}>{product.price_per_day.toLocaleString()} ฿</Text>
          <Text style={styles.priceUnit}>/วัน</Text>
        </View>

      </View>
    </TouchableOpacity>
  );
};

export default ProductCard;
