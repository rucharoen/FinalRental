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

  const getImageUrl = (imgData: any) => {
    if (!imgData) return 'https://via.placeholder.com/150';

    // Check if it's an array or string-array
    let imagesArr = [];
    try {
      imagesArr = typeof imgData === 'string' ? JSON.parse(imgData) : imgData;
    } catch (e) {
      imagesArr = [imgData];
    }

    if (!Array.isArray(imagesArr) || imagesArr.length === 0) return 'https://via.placeholder.com/150';

    let path = imagesArr[0];
    if (!path) return 'https://via.placeholder.com/150';
    if (path.startsWith('http')) return path;

    const baseUrl = 'https://finalrental.onrender.com';
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    return `${baseUrl}${normalizedPath}`;
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
