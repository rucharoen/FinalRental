import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    SafeAreaView,
    TouchableOpacity,
    TextInput,
    ScrollView,
    Image,
    Alert,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    BackHandler
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import productService from '@/services/product.service';
import shopService from '@/services/shop.service';
import authService from '@/services/auth.service';
import { styles } from '@/styles/product_create.styles';

const CreateProductScreen = () => {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [userShop, setUserShop] = useState<any>(null);

    // Form State
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [quantity, setQuantity] = useState('1');
    const [pricePerDay, setPricePerDay] = useState('');
    const [deposit, setDeposit] = useState('');
    const [images, setImages] = useState<string[]>([]);

    useFocusEffect(
        useCallback(() => {
            loadShopInfo();

            const onBackPress = () => {
                router.push({
                    pathname: '/(tabs)/profile',
                    params: { mode: 'owner' }
                });
                return true;
            };

            const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);

            return () => subscription.remove();
        }, [])
    );

    const loadShopInfo = async () => {
        try {
            const userData = await authService.getUserData();
            const currentUserId = Number(userData?.id || userData?._id);
            const shopData = await shopService.getMyShop();

            let foundShop = null;
            if (shopData?.shops && Array.isArray(shopData.shops)) {
                foundShop = shopData.shops.find((s: any) => Number(s.owner_id) === currentUserId);
            } else if (shopData && !shopData.error) {
                const dataToPath = shopData.data || shopData;
                if (Number(dataToPath.owner_id) === currentUserId) {
                    foundShop = dataToPath;
                }
            }

            if (!foundShop) {
                Alert.alert(
                    'ไม่พบร้านค้า',
                    'กรุณาสร้างร้านค้าก่อนทำการลงประกาศสินค้า',
                    [{ text: 'ตกลง', onPress: () => router.replace('/(tabs)/profile/shop') }]
                );
            } else {
                setUserShop(foundShop);
            }
        } catch (error) {
            console.error('Error loading shop info:', error);
        }
    };

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsMultipleSelection: true,
            selectionLimit: 10,
            quality: 1,
        });

        if (!result.canceled) {
            const newUris = result.assets.map(asset => asset.uri);
            setImages(prev => [...prev, ...newUris]);
        }
    };

    const removeImage = (index: number) => {
        setImages(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async () => {
        if (!name || !description || !pricePerDay || !quantity) {
            Alert.alert('กรุณากรอกข้อมูลให้ครบถ้วน');
            return;
        }

        if (images.length < 4) {
            Alert.alert('กรุณาเพิ่มรูปภาพอย่างน้อย 4 รูป');
            return;
        }

        if (!userShop) {
            Alert.alert('เกิดข้อผิดพลาด', 'ไม่พบข้อมูลร้านค้า');
            return;
        }

        setLoading(true);
        try {
            const userData = await authService.getUserData();

            // ใช้ FormData เพื่ออัปโหลดไฟล์รูปภาพ
            const formData = new FormData();
            formData.append('name', name);
            formData.append('description', description);
            formData.append('price_per_day', pricePerDay);
            formData.append('quantity', quantity);
            formData.append('deposit', deposit || '0');
            formData.append('shop_id', String(userShop.id));
            formData.append('owner_id', String(userData?.id || userData?._id));
            formData.append('status', 'available');
            formData.append('is_active', 'true');

            // เพิ่มรูปภาพเข้าไปใน FormData
            images.forEach((uri) => {
                const fileName = uri.split('/').pop();
                const match = /\.(\w+)$/.exec(fileName || '');
                const type = match ? `image/${match[1]}` : `image/jpeg`;
                formData.append('product_images', {
                    uri: uri,
                    name: fileName,
                    type: type,
                } as any);
            });

            const response = await productService.createProduct(formData);

            if (response && !response.error) {
                Alert.alert(
                    'สำเร็จ',
                    'ลงประกาศสินค้าเรียบร้อยแล้ว',
                    [{ 
                        text: 'ตกลง', 
                        onPress: () => router.push({
                            pathname: '/(tabs)/profile',
                            params: { mode: 'owner' }
                        }) 
                    }]
                );
            } else {
                throw new Error(response?.message || 'เกิดข้อผิดพลาดในการสร้างสินค้า');
            }
        } catch (error: any) {
            console.error('Create product error:', error);
            Alert.alert('เกิดข้อผิดพลาด', error.message || 'ไม่สามารถลงประกาศได้');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity 
                    style={styles.backButton} 
                    onPress={() => router.push({
                        pathname: '/(tabs)/profile',
                        params: { mode: 'owner' }
                    })}
                >
                    <Ionicons name="chevron-back" size={28} color="#2C3E50" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>ลงประกาศสินค้า</Text>
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView
                    style={styles.content}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Image Upload Area */}
                    <View style={styles.imageSection}>
                        <Text style={styles.label}>
                            รูปภาพสินค้า ({images.length}/10)
                            {images.length < 4 && (
                                <Text style={{ fontWeight: 'normal', fontSize: 13, color: '#E74C3C' }}> *ขั้นต่ำ 4 รูป</Text>
                            )}
                        </Text>

                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imagesList}>
                            {images.map((uri, index) => (
                                <View key={index} style={styles.imageWrapper}>
                                    <Image source={{ uri }} style={styles.imageThumbnail} />
                                    <TouchableOpacity
                                        style={styles.removeImageButton}
                                        onPress={() => removeImage(index)}
                                    >
                                        <Ionicons name="close-circle" size={24} color="#E74C3C" />
                                    </TouchableOpacity>
                                </View>
                            ))}

                            {images.length < 10 && (
                                <TouchableOpacity style={styles.addMoreImage} onPress={pickImage}>
                                    <Ionicons name="add" size={32} color="#BDC3C7" />
                                    <Text style={styles.addMoreText}>เพิ่มรูป</Text>
                                </TouchableOpacity>
                            )}
                        </ScrollView>
                    </View>

                    {/* Product Name */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>ชื่อสินค้า</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="เช่น โทรศัพท์ Iphone 15"
                            placeholderTextColor="#BDC3C7"
                            value={name}
                            onChangeText={setName}
                        />
                    </View>

                    {/* Product Description */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>รายละเอียดสินค้า</Text>
                        <TextInput
                            style={[styles.input, styles.textarea]}
                            placeholder="สภาพสินค้า"
                            placeholderTextColor="#BDC3C7"
                            multiline
                            numberOfLines={4}
                            value={description}
                            onChangeText={setDescription}
                        />
                    </View>

                    <View style={styles.row}>
                        {/* Quantity */}
                        <View style={[styles.inputGroup, styles.halfInput]}>
                            <Text style={styles.label}>จำนวนที่มี</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="1"
                                placeholderTextColor="#BDC3C7"
                                keyboardType="numeric"
                                value={quantity}
                                onChangeText={setQuantity}
                            />
                        </View>

                        {/* Price */}
                        <View style={[styles.inputGroup, styles.halfInput]}>
                            <Text style={styles.label}>ราคาเช่า (ต่อวัน)</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="500"
                                placeholderTextColor="#BDC3C7"
                                keyboardType="numeric"
                                value={pricePerDay}
                                onChangeText={setPricePerDay}
                            />
                        </View>
                    </View>

                    {/* Deposit */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>ค่ามัดจำสินค้า (บาท)</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="ระบุค่ามัดจำที่คนเช่าต้องจ่าย"
                            placeholderTextColor="#BDC3C7"
                            keyboardType="numeric"
                            value={deposit}
                            onChangeText={setDeposit}
                        />
                    </View>

                    {/* Submit Button */}
                    <TouchableOpacity
                        style={[styles.submitButton, loading && { opacity: 0.7 }]}
                        onPress={handleSubmit}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#FFFFFF" />
                        ) : (
                            <Text style={styles.submitButtonText}>ลงประกาศ</Text>
                        )}
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default CreateProductScreen;
