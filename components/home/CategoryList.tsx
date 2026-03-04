import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { styles } from '../../styles/home.styles';

const categories = [
  { id: '1', name: 'หนังสือ', icon: require('../../assets/images/books.png') },
  { id: '2', name: 'รองเท้าและเสื้อผ้า', icon: require('../../assets/images/shoes.png') },
  { id: '3', name: 'อิเล็กทรอนิกส์', icon: require('../../assets/images/electronics.png') },
];

interface CategoryListProps {
  onSelectCategory: (name: string) => void;
  selectedCategory: string;
}

export const CategoryList: React.FC<CategoryListProps> = ({ onSelectCategory, selectedCategory }) => {
  return (
    <View style={styles.categoryWrapper}>
      <View style={styles.categoryList}>
        {categories.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.categoryItem}
            onPress={() => onSelectCategory(item.name)}
          >
            <View style={[
              styles.categoryIcon,
              selectedCategory === item.name && { borderColor: '#3498DB' }
            ]}>
              <Image source={item.icon} style={{ width: 50, height: 50, borderRadius: 32.5 }} resizeMode="cover" />
            </View>

            <Text style={[
              styles.categoryText,
              selectedCategory === item.name && { color: '#3498DB', fontWeight: 'bold' }
            ]} numberOfLines={2}>
              {item.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};


export default CategoryList;
