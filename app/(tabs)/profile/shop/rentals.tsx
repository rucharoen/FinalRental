import rentalService from '@/services/rental.service';
import { styles } from '@/styles/rental_list.styles';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Image,
    SafeAreaView,
    StatusBar,
    Text,
    TouchableOpacity,
    View,
    BackHandler
} from 'react-native';

const OwnerRentalsScreen = () => {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('pending'); // pending, shipping, receiving
    const [rentals, setRentals] = useState<any[]>([]);

    useFocusEffect(
        useCallback(() => {
            fetchRentals();

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

    const fetchRentals = async () => {
        try {
            setLoading(true);
            const response = await rentalService.getOwnerRentals();
            if (response && response.success) {
                setRentals(response.rentals || response.data || (Array.isArray(response) ? response : []));
            } else if (Array.isArray(response)) {
                setRentals(response);
            } else {
                setRentals([]);
            }
        } catch (error) {
            console.error('Fetch Rentals Error:', error);
            // Alert.alert('Error', 'Failed to load rentals');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (rental: any) => {
        const rentalId = (rental.id || rental._id).toString();
        const productId = (rental.product_id || rental.productId || '').toString();
        try {
            setLoading(true);
            // บังคับใช้ updateRentalStatus ทันที เพื่อให้ Backend ไปทำ 'case approve' ที่มีการบันทึก approved_at = NOW()
            await rentalService.updateRentalStatus(rentalId, { rentalId, status: 'approved', productId });

            Alert.alert('สำเร็จ', 'อนุมัติคำขอเช่าเรียบร้อยแล้ว');
            fetchRentals();
        } catch (error: any) {
            if (error.message === 'Product no longer available') {
                Alert.alert('แจ้งเตือน', 'สินค้านี้หมดแล้ว');
            } else {
                Alert.alert('เกิดข้อผิดพลาด', error.message || 'ไม่สามารถอนุมัติได้');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleReject = async (rental: any) => {
        const rentalId = (rental.id || rental._id).toString();
        const productId = (rental.product_id || rental.productId || '').toString();
        Alert.alert(
            'ยืนยันการปฏิเสธ',
            'คุณต้องการปฏิเสธคำขอเช่านี้ใช่หรือไม่?',
            [
                { text: 'ยกเลิก', style: 'cancel' },
                {
                    text: 'ยืนยัน',
                    onPress: async () => {
                        try {
                            setLoading(true);
                            // บังคับใช้ updateRentalStatus ทันที เพื่อความถูกต้องของข้อมูลใน Backend
                            await rentalService.updateRentalStatus(rentalId, { rentalId, status: 'rejected', productId });
                            fetchRentals();
                        } catch (error: any) {
                            if (error.message === 'Product no longer available') {
                                Alert.alert('แจ้งเตือน', 'สินค้านี้หมดแล้ว');
                            } else {
                                Alert.alert('เกิดข้อผิดพลาด', error.message || 'ไม่สามารถดำเนินการได้');
                            }
                        } finally {
                            setLoading(false);
                        }
                    }
                }
            ]
        );
    };

    const handleUpdateStatus = async (item: any, newStatus: string) => {
        const rentalId = (item.id || item._id).toString();
        const productId = (item.product_id || item.productId || '').toString();
        try {
            setLoading(true);
            await rentalService.updateRentalStatus(rentalId, { rentalId, status: newStatus, productId });
            Alert.alert('สำเร็จ', 'อัปเดตสถานะเรียบร้อยแล้ว');
            fetchRentals();
        } catch (error: any) {
            if (error.message === 'Product no longer available') {
                Alert.alert('แจ้งเตือน', 'สินค้านี้หมดแล้ว');
            } else {
                Alert.alert('เกิดข้อผิดพลาด', error.message || 'ไม่สามารถอัปเดตสถานะได้');
            }
        } finally {
            setLoading(false);
        }
    };

    const filteredRentals = rentals.filter(item => {
        const status = (item.status || item.rental_status || '').toLowerCase();
        if (activeTab === 'pending') {
            return status === 'pending' ||
                status === 'pending_owner' ||
                status === 'waiting_payment' ||
                status === 'approved' ||
                status === 'waiting_verification';
        }
        if (activeTab === 'shipping') {
            return status === 'paid' ||
                status === 'verified' ||
                status === 'preparing' ||
                status === 'shipping';
        }
        if (activeTab === 'receiving') return status === 'delivered' || status === 'shipped' || status === 'received' || status === 'returning' || status === 'completed';
        return false;
    });

    const getImageUrl = (item: any) => {
        const images = item.product?.images || item.images;
        if (!images) return 'https://via.placeholder.com/150';
        try {
            const parsed = typeof images === 'string' ? JSON.parse(images) : images;
            if (Array.isArray(parsed) && parsed.length > 0) {
                const path = parsed[0];
                if (path.startsWith('http')) return path;
                return `https://finalrental.onrender.com${path}`;
            }
        } catch (e) { }
        return 'https://via.placeholder.com/150';
    };

    const formatDate = (dateString: string) => {
        const d = new Date(dateString);
        return d.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    const renderItem = ({ item }: { item: any }) => (
        <View style={styles.rentalItem}>
            <Text style={styles.productTitle}>{item.product_name || item.product?.name || 'สินค้า'}</Text>
            <View style={styles.itemContent}>
                <Image source={{ uri: getImageUrl(item) }} style={styles.productImage} />
                <View style={styles.itemDetails}>
                    <Text style={styles.dateText}>
                        {formatDate(item.start_date || item.startDate)} - {formatDate(item.end_date || item.endDate)}
                    </Text>
                    <Text style={styles.priceText}>
                        ราคา {Number(item.rent_fee || 0).toLocaleString()} ฿/วัน
                    </Text>
                    {/* Chat with Renter Button */}
                    <TouchableOpacity
                        style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}
                        onPress={() => {
                            const renterId = item.renter_id || item.renterId;
                            router.push(`/(tabs)/chat/${renterId}`);
                        }}
                    >
                        <Ionicons name="chatbubble-ellipses-outline" size={20} color="#3498DB" />
                        <Text style={{ color: '#3498DB', marginLeft: 6, fontSize: 13, fontWeight: '500' }}>แชทกับผู้เช่า</Text>
                    </TouchableOpacity>
                </View>
            </View>


            <View style={styles.actionRow}>
                {activeTab === 'pending' && (
                    <>
                        {(item.status?.toLowerCase() === 'pending' || item.status?.toLowerCase() === 'pending_owner') ? (
                            <>
                                <TouchableOpacity
                                    style={styles.approveButton}
                                    onPress={() => handleApprove(item)}
                                >
                                    <Text style={styles.buttonText}>อนุมัติ</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.rejectButton}
                                    onPress={() => handleReject(item)}
                                >
                                    <Text style={styles.buttonText}>ปฏิเสธ</Text>
                                </TouchableOpacity>
                            </>
                        ) : item.status?.toLowerCase() === 'waiting_verification' ? (
                            <View style={[styles.pendingPaymentPill, { backgroundColor: '#F9E79F' }]}>
                                <Text style={[styles.buttonText, { color: '#F39C12' }]}>รอตรวจสอบยอดเงิน</Text>
                            </View>
                        ) : (
                            <View style={styles.pendingPaymentPill}>
                                <Text style={styles.buttonText}>รอชำระ</Text>
                            </View>
                        )}
                    </>
                )}

                {activeTab === 'shipping' && (
                    <TouchableOpacity
                        style={styles.shipButton}
                        onPress={() => router.push({
                            pathname: '/(tabs)/profile/shop/evidence',
                            params: { 
                                rentalId: (item.id || item._id).toString(),
                                productId: (item.product_id || item.productId || '').toString()
                            }
                        })}
                    >
                        <Text style={styles.buttonText}>จัดส่งแล้ว</Text>
                    </TouchableOpacity>
                )}

                {activeTab === 'receiving' && (
                    <>
                        {(item.status?.toLowerCase() === 'completed' || item.status?.toLowerCase() === 'verified') ? (
                            <View style={{ alignItems: 'flex-end', flex: 1, paddingRight: 5 }}>
                                <Text style={{ color: '#2ECC71', fontSize: 14 }}>เรียบร้อย</Text>
                            </View>
                        ) : (
                            <>
                                <TouchableOpacity
                                    style={styles.damageButton}
                                    onPress={() => router.push({
                                        pathname: '/(tabs)/profile/shop/damage-report',
                                        params: { rentalId: item._id || item.id }
                                    })}
                                >
                                    <Text style={styles.buttonText}>สินค้าเสียหาย</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.receiveButton, { backgroundColor: '#3498DB' }]}
                                    onPress={() => handleUpdateStatus(item, 'verify')}
                                >
                                    <Text style={styles.buttonText}>ยืนยันการรับคืน</Text>
                                </TouchableOpacity>
                            </>
                        )}
                    </>
                )}
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => router.push({
                        pathname: '/(tabs)/profile',
                        params: { mode: 'owner' }
                    })}
                    style={styles.backButton}
                >
                    <Ionicons name="chevron-back" size={28} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>รายการเช่า</Text>
            </View>

            <View style={styles.tabContainer}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'pending' && styles.activeTab]}
                    onPress={() => setActiveTab('pending')}
                >
                    <Text style={[styles.tabText, activeTab === 'pending' && styles.activeTabText]}>รออนุมัติ</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'shipping' && styles.activeTab]}
                    onPress={() => setActiveTab('shipping')}
                >
                    <Text style={[styles.tabText, activeTab === 'shipping' && styles.activeTabText]}>ที่ต้องจัดส่ง</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'receiving' && styles.activeTab]}
                    onPress={() => setActiveTab('receiving')}
                >
                    <Text style={[styles.tabText, activeTab === 'receiving' && styles.activeTabText]}>ที่ต้องได้รับ</Text>
                </TouchableOpacity>
            </View>

            {loading && rentals.length === 0 ? (
                <View style={{ flex: 1, justifyContent: 'center' }}>
                    <ActivityIndicator size="large" color="#3498DB" />
                </View>
            ) : (
                <FlatList
                    data={filteredRentals}
                    renderItem={renderItem}
                    keyExtractor={(item) => (item._id || item.id).toString()}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <Ionicons name="document-text-outline" size={60} color="#BDC3C7" />
                            <Text style={styles.emptyText}>ไม่พบรายการที่ต้องการ</Text>
                        </View>
                    }
                />
            )}
        </SafeAreaView>
    );
};

export default OwnerRentalsScreen;
