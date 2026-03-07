import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    SafeAreaView,
    ScrollView,
    Image,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    Modal,
    StatusBar,
    KeyboardAvoidingView,
    Platform
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import productService from '@/services/product.service';
import { styles } from '@/styles/product_management.styles';

const EditProductScreen = () => {
    const router = useRouter();
    const { id } = useLocalSearchParams();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    // Form State
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [description, setDescription] = useState('');
    const [quantity, setQuantity] = useState('');
    const [deposit, setDeposit] = useState('');
    const [images, setImages] = useState<string[]>([]);
    const [originalProduct, setOriginalProduct] = useState<any>(null);

    useEffect(() => {
        if (id) {
            fetchProductDetail();
        }
    }, [id]);

    const fetchProductDetail = async () => {
        if (!id || id === 'undefined') {
            console.error('Invalid Product ID:', id);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            let product: any = null;

            // แทนที่จะเรียก API รายตัว (ซึ่งไม่มีใน Backend) ให้ดึงจากรายการทั้งหมดของเราแทน
            const response = await productService.getOwnProducts();
            const products = response.products || response.data || (Array.isArray(response) ? response : []);

            product = products.find((p: any) =>
                (p.id?.toString() === id?.toString()) ||
                (p._id?.toString() === id?.toString())
            );

            if (product) {
                setOriginalProduct(product);
                setName(product.name || '');
                setPrice(product.price_per_day?.toString() || '0');
                setDescription(product.description || '');
                setQuantity(product.quantity?.toString() || '1');
                setDeposit(product.deposit?.toString() || '0');

                // Handle images
                const imgData = product.images || (product as any).product_images;
                if (imgData) {
                    try {
                        const parsed = typeof imgData === 'string' ? JSON.parse(imgData) : imgData;
                        // Map local paths to full URLs for initial display
                        const mappedImages = Array.isArray(parsed) ? parsed.map((img: string) => {
                            if (img.startsWith('http')) return img;
                            // Ensure one slash between base and path
                            const path = img.startsWith('/') ? img : `/${img}`;
                            return `https://finalrental.onrender.com${path}`;
                        }) : [];
                        setImages(mappedImages);
                    } catch (e) {
                        console.error('Image JSON parse error:', e);
                        setImages([]);
                    }
                }
            } else {
                Alert.alert('ไม่พบข้อมูลสินค้า', 'ไม่พบสินค้านี้ในรายการของคุณ');
                router.back();
            }
        } catch (error) {
            console.error('Fetch Product Detail Error:', error);
        } finally {
            setLoading(false);
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

    const handleUpdate = async () => {
        if (!name || !price || !quantity) {
            Alert.alert('กรุณากรอกข้อมูลให้ครบถ้วน');
            return;
        }

        try {
            setSaving(true);

            // เนื่องจาก Backend ปัจจุบันของคุณ (updateProduct) ยังไม่รองรับการนำเข้ารูปภาพ
            // และไม่มีคำสั่ง UPDATE images ใน SQL ของ Backend ฝั่งแก้ไข
            // เราจึงต้องส่งแค่ข้อมูลตัวหนังสือแบบ JSON เพื่อให้ Backend รับค่าได้ถูกต้องครับ
            const updateData = {
                name: name.trim(),
                description: description.trim(),
                price_per_day: Number(price),
                quantity: Number(quantity),
                deposit: Number(deposit || 0)
            };

            const response = await productService.updateProduct(id as string, updateData);

            if (response && !response.error) {
                Alert.alert('สำเร็จ', 'อัปเดตข้อมูลสินค้าเรียบร้อยแล้ว', [
                    { text: 'ตกลง', onPress: () => router.back() }
                ]);
            } else {
                throw new Error(response?.message || 'Update failed');
            }
        } catch (error: any) {
            console.error('Update Product Error:', error);
            // แจ้งเตือนหาก Backend ติดกติกาเรื่องค่ามัดจำ
            if (error.message.includes('มัดจำ')) {
                Alert.alert('แจ้งเตือนจาก Server', 'ค่ามัดจำต้องเป็นตัวเลขที่มากกว่า 0 เท่านั้นครับ (ตามกติกา Backend เดิมของคุณ)');
            } else {
                Alert.alert('เกิดข้อผิดพลาด', error.message || 'ไม่สามารถอัปเดตสินค้าได้');
            }
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        try {
            setShowDeleteModal(false);
            setSaving(true);
            const response = await productService.deleteProduct(id as string);
            if (response && !response.error) {
                Alert.alert('สำเร็จ', 'ลบสินค้าเรียบร้อยแล้ว', [
                    { text: 'ตกลง', onPress: () => router.replace('/(tabs)/products/index') }
                ]);
            } else {
                throw new Error(response?.message || 'Delete failed');
            }
        } catch (error: any) {
            console.error('Delete Product Error:', error);
            Alert.alert('เกิดข้อผิดพลาด', error.message || 'ไม่สามารถลบสินค้าได้');
        } finally {
            setSaving(false);
        }
    };

    const getImageUrl = (imgUri?: string) => {
        const path = imgUri || (images && images.length > 0 ? images[0] : null);
        if (path) {
            if (path.startsWith('http') || path.startsWith('file://') || path.startsWith('content://')) return path;
            return `https://finalrental.onrender.com${path.startsWith('/') ? '' : '/'}${path}`;
        }
        return 'https://via.placeholder.com/300';
    };

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', backgroundColor: '#FFF' }}>
                <ActivityIndicator size="large" color="#F39C12" />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={28} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>จัดการสินค้า</Text>
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={{ flex: 1 }}
            >
                <ScrollView showsVerticalScrollIndicator={false}>
                    {/* Image Edit Section */}
                    <View style={{ paddingHorizontal: 20, marginBottom: 15 }}>
                        <Text style={styles.label}>
                            รูปภาพสินค้า ({images.length}/10)
                            {images.length < 4 && (
                                <Text style={{ fontWeight: 'normal', fontSize: 13, color: '#E74C3C' }}> *ขั้นต่ำ 4 รูป</Text>
                            )}
                        </Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexDirection: 'row', marginTop: 10 }}>
                            {images.map((uri, index) => (
                                <View key={index} style={{ marginRight: 10, position: 'relative' }}>
                                    <Image source={{ uri: getImageUrl(uri) }} style={{ width: 100, height: 100, borderRadius: 8 }} />
                                    <TouchableOpacity
                                        onPress={() => removeImage(index)}
                                        style={{ position: 'absolute', top: -5, right: -5, backgroundColor: 'white', borderRadius: 12 }}
                                    >
                                        <Ionicons name="close-circle" size={24} color="#E74C3C" />
                                    </TouchableOpacity>
                                </View>
                            ))}
                            {images.length < 10 && (
                                <TouchableOpacity
                                    onPress={pickImage}
                                    style={{
                                        width: 100,
                                        height: 100,
                                        borderRadius: 8,
                                        borderWidth: 1,
                                        borderColor: '#BDC3C7',
                                        borderStyle: 'dashed',
                                        justifyContent: 'center',
                                        alignItems: 'center'
                                    }}
                                >
                                    <Ionicons name="add" size={30} color="#BDC3C7" />
                                    <Text style={{ fontSize: 12, color: '#BDC3C7' }}>เพิ่มรูป</Text>
                                </TouchableOpacity>
                            )}
                        </ScrollView>
                    </View>

                    {/* Form */}
                    <View style={styles.formSection}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>ชื่อสินค้า</Text>
                            <TextInput
                                style={styles.input}
                                value={name}
                                onChangeText={setName}
                                placeholder="ชื่อสินค้า"
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>ราคาเช่า</Text>
                            <TextInput
                                style={styles.input}
                                value={price}
                                onChangeText={setPrice}
                                placeholder="0 บาท/วัน"
                                keyboardType="numeric"
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>จำนวนสินค้า</Text>
                            <TextInput
                                style={styles.input}
                                value={quantity}
                                onChangeText={setQuantity}
                                placeholder="จำนวน"
                                keyboardType="numeric"
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>ราคามัดจำ</Text>
                            <TextInput
                                style={styles.input}
                                value={deposit}
                                onChangeText={setDeposit}
                                placeholder="0 บาท"
                                keyboardType="numeric"
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>รายละเอียดเพิ่มเติม</Text>
                            <TextInput
                                style={[styles.input, { height: 120, textAlignVertical: 'top' }]}
                                value={description}
                                onChangeText={setDescription}
                                placeholder="กรอกรายละเอียดเพิ่มเติมเกี่ยวกับสินค้า"
                                multiline
                            />
                        </View>

                        <View style={{ marginTop: 10 }}>
                            <TouchableOpacity
                                style={[styles.updateButton, saving && { opacity: 0.7 }]}
                                onPress={handleUpdate}
                                disabled={saving}
                            >
                                {saving ? <ActivityIndicator color="#FFF" /> : <Text style={styles.updateButtonText}>อัปเดตสินค้า</Text>}
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.deleteFullButton, saving && { opacity: 0.7 }]}
                                onPress={() => setShowDeleteModal(true)}
                                disabled={saving}
                            >
                                <Text style={styles.deleteFullButtonText}>ลบสินค้า</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>

            {/* Delete Confirmation Modal */}
            <Modal
                transparent={true}
                visible={showDeleteModal}
                animationType="fade"
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>แจ้งเตือน</Text>
                        <Text style={styles.modalMessage}>ยืนยันการลบสินค้า</Text>

                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={styles.cancelButton}
                                onPress={() => setShowDeleteModal(false)}
                            >
                                <Text style={styles.cancelButtonText}>ยกเลิก</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.confirmDeleteButton}
                                onPress={handleDelete}
                            >
                                <Text style={styles.confirmDeleteButtonText}>ยืนยัน</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

export default EditProductScreen;
