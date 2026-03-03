import React from 'react';
import { View, TextInput, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from '../../styles/home.styles';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({ value, onChangeText }) => {
  return (
    <View style={styles.header}>
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#95A5A6" />
        <TextInput
          style={[styles.searchPlaceholder, { flex: 1, height: '100%' }]}
          placeholder="ค้นหาสินค้า"
          value={value}
          onChangeText={onChangeText}
          placeholderTextColor="#95A5A6"
        />
        {value.length > 0 && (
          <TouchableOpacity onPress={() => onChangeText('')}>
            <Ionicons name="close-circle" size={18} color="#95A5A6" />
          </TouchableOpacity>
        )}
      </View>
      <TouchableOpacity style={styles.cartButton}>
        <Ionicons name="cart-outline" size={28} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
};


export default SearchBar;
