import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { styles } from '../../styles/home.styles';

const categories = [
  { id: '1', name: 'หนังสือ', icon: require('../../assets/images/books.png') },
  { id: '2', name: 'รองเท้าและเสื้อผ้า', icon: require('../../assets/images/shoes.png') },
  { id: '3', name: 'อิเล็กทรอนิกส์', icon: require('../../assets/images/electronics.png') },
];

interface CategoryListProps {
  onSelectCategory: (categoryName: string) => void;
}

export const CategoryList: React.FC<CategoryListProps> = ({ onSelectCategory }) => {
  return (
    <View style={styles.categoryWrapper}>
      <View style={styles.categoryList}>
        {categories.map((item) => (
          <TouchableOpacity 
            key={item.id} 
            style={styles.categoryItem}
            onPress={() => onSelectCategory(item.name)}
          >
            <View style={styles.categoryIcon}>
              <Image source={item.icon} style={{ width: 50, height: 50 }} resizeMode="contain" />
            </View>

            <Text style={styles.categoryText} numberOfLines={2}>
              {item.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

export default CategoryList;
