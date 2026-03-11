import productService from '@/services/product.service';
import { styles } from '@/styles/product_management.styles';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Image,
    Modal,
    RefreshControl,
    SafeAreaView,
    StatusBar,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

const ProductManagementScreen = () => {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [products, setProducts] = useState<any[]>([]);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [productToDelete, setProductToDelete] = useState<any>(null);

    useFocusEffect(
        useCallback(() => {
            fetchMyProducts();
        }, [])
    );

    const fetchMyProducts = async (isRefreshing = false) => {
        try {
            if (isRefreshing) setRefreshing(true);
            else setLoading(true);

            const response = await productService.getOwnProducts();

            let items = [];
            if (response && response.products && Array.isArray(response.products)) {
                items = response.products;
            } else if (response && Array.isArray(response)) {
                items = response;
            } else if (response && response.data && Array.isArray(response.data)) {
                items = response.data;
            }

            setProducts(items);
        } catch (error: any) {
            console.error('[DEBUG] Fetch My Products Error:', error);
            Alert.alert('เกิดข้อผิดพลาด', error.message || 'ไม่สามารถโหลดข้อมูลสินค้าได้');
            setProducts([]);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = useCallback(() => {
        fetchMyProducts(true);
    }, []);

    const handleDeletePress = (product: any) => {
        setProductToDelete(product);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (!productToDelete) return;

        try {
            setShowDeleteModal(false);
            setLoading(true);
            const response = await productService.deleteProduct(productToDelete._id || productToDelete.id);
            if (response && !response.error) {
                Alert.alert('สำเร็จ', 'ลบสินค้าเรียบร้อยแล้ว');
                fetchMyProducts();
            } else {
                throw new Error(response?.message || 'Delete failed');
            }
        } catch (error: any) {
            console.error('Delete Product Error:', error);
            Alert.alert('เกิดข้อผิดพลาด', error.message || 'ไม่สามารถลบสินค้าได้');
        } finally {
            setLoading(false);
        }
    };

    const getImageUrl = (item: any) => {
        const imgData = item.images || item.product_images;
        if (!imgData) return 'https://via.placeholder.com/150';

        try {
            // If it's already an array of strings (like in your latest JSON)
            if (Array.isArray(imgData) && imgData.length > 0) {
                const path = imgData[0];
                if (!path) return 'https://via.placeholder.com/150';
                if (path.startsWith('http')) return path;
                return `https://finalrental.onrender.com${path.startsWith('/') ? '' : '/'}${path}`;
            }

            // Fallback for cases where it might be a JSON string
            const parsed = typeof imgData === 'string' ? JSON.parse(imgData) : imgData;
            if (Array.isArray(parsed) && parsed.length > 0) {
                const path = parsed[0];
                if (path.startsWith('http')) return path;
                return `https://finalrental.onrender.com${path.startsWith('/') ? '' : '/'}${path}`;
            }
        } catch (e) {
            console.error('Image parse error:', e);
        }
        return 'https://via.placeholder.com/150';
    };

    const renderItem = ({ item }: { item: any }) => (
        <View style={styles.productItem}>
            <Image
                source={{ uri: getImageUrl(item) }}
                style={styles.productImage}
            />
            <View style={styles.productInfo}>
                <View>
                    <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
                    <Text style={styles.productPrice}>ราคา {Number(item.price_per_day || 0).toLocaleString()} ฿/วัน</Text>
                </View>

                <View style={styles.buttonRow}>
                    <TouchableOpacity
                        style={styles.editButton}
                        onPress={() => router.push({
                            pathname: '/(tabs)/products/edit/[id]',
                            params: { id: (item.id || item._id).toString() }
                        })}
                    >
                        <Text style={styles.editButtonText}>แก้ไข</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={() => handleDeletePress(item)}
                    >
                        <Text style={styles.deleteButtonText}>ลบ</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.push('/(tabs)/profile')} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={28} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>จัดการสินค้า ({products.length})</Text>
            </View>

            {loading && products.length === 0 ? (
                <View style={{ flex: 1, justifyContent: 'center' }}>
                    <ActivityIndicator size="large" color="#F39C12" />
                </View>
            ) : (
                <FlatList
                    data={products}
                    renderItem={renderItem}
                    keyExtractor={(item) => (item.id || item._id || Math.random()).toString()}
                    contentContainerStyle={styles.listContent}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#F39C12"]} />
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <MaterialCommunityIcons name="package-variant" size={60} color="#BDC3C7" />
                            <Text style={styles.emptyText}>ยังไม่มีรายการสินค้า</Text>
                        </View>
                    }
                />
            )}

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
                                onPress={confirmDelete}
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

export default ProductManagementScreen;
