import { useRouter } from 'expo-router';
import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import chatService from '../../services/chat.service';
import { Product } from '../../services/product.service';
import { styles } from '../../styles/home.styles';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const router = useRouter();

  const getImageUrl = (imgData: any) => {
    if (!imgData) return 'https://via.placeholder.com/150';

    let imagesArr = [];
    try {
      imagesArr = typeof imgData === 'string' ? JSON.parse(imgData) : imgData;
    } catch (e) {
      imagesArr = [imgData];
    }

    const path = Array.isArray(imagesArr) ? imagesArr[0] : imagesArr;
    return chatService.formatImageUrl(path) || 'https://via.placeholder.com/150';
  };

  const mainImage = getImageUrl(product.images || (product as any).product_images);
  const productId = product._id || product.id;

  return (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() => router.push(`/(tabs)/products/${productId}`)}
    >
      <View style={styles.productImage}>
        <Image
          source={{ uri: mainImage }}
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
