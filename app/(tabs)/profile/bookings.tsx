import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    SafeAreaView,
    ScrollView,
    StatusBar,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import authService from '../../../services/auth.service';
import rentalService from '../../../services/rental.service';
import PaymentCountdown from '../../../components/rental/PaymentCountdown';
import styles from '../../../styles/bookings.styles';

export default function BookingsScreen() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('pending'); // 'pending', 'payment', 'receive'
    const [rentals, setRentals] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const getImageUrl = (imgData: any) => {
        if (!imgData) return 'https://via.placeholder.com/100';
        try {
            const parsed = typeof imgData === 'string' ? JSON.parse(imgData) : imgData;
            if (Array.isArray(parsed) && parsed.length > 0) {
                const path = parsed[0];
                if (!path) return 'https://via.placeholder.com/100';
                if (path.startsWith('http')) return path;

                const baseUrl = 'https://finalrental.onrender.com';
                const normalizedPath = path.startsWith('/') ? path : `/${path}`;
                return `${baseUrl}${normalizedPath}`;
            }
        } catch (e) {
            console.error('Image parse error:', e);
        }
        return 'https://via.placeholder.com/100';
    };

    const tabs = [
        { id: 'pending', label: 'รออนุมัติ' },
        { id: 'payment', label: 'ที่ต้องชำระ' },
        { id: 'receive', label: 'ที่ต้องได้รับ' },
    ];

    useFocusEffect(
        useCallback(() => {
            loadRentals();
        }, [])
    );

    const loadRentals = async () => {
        try {
            setLoading(true);
            const user = await authService.getUserData();
            if (user && (user.id || user._id)) {
                const data = await rentalService.getUserRentals();
                console.log('Fetched Rentals:', data); // Add logging to debug status issues
                setRentals(Array.isArray(data) ? data : []);
            }
        } catch (error) {
            console.error('Load Rentals Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const getFilteredData = () => {
        return rentals.filter(r => {
            const status = (r.status || r.rental_status || '').toLowerCase();
            switch (activeTab) {
                case 'pending':
                    return status === 'pending' ||
                        status === 'pending_owner' ||
                        status === 'waiting_verification' ||
                        status === 'waiting_admin_verify';
                case 'payment':
                    return status === 'approved' ||
                        status === 'waiting_payment';
                case 'receive':
                    return status === 'shipped' ||
                        status === 'received' ||
                        status === 'delivered' ||
                        status === 'paid' ||
                        status === 'verified' ||
                        status === 'returning' ||
                        status === 'completed';
                default:
                    return false;
            }
        });
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString('th-TH', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    const renderBookingCard = (item: any) => {
        const productName = item.product_name || item.product?.name || 'ไม่มีชื่อสินค้า';
        const startDate = formatDate(item.start_date || item.startDate);
        const endDate = formatDate(item.end_date || item.endDate);

        // จัดการเรื่องค่าเช่าและจำนวนวัน (รองรับทั้ง rent_fee และ rental_fee)
        const fee = parseFloat(item.rent_fee || item.rental_fee || item.total_price || 0);
        const days = parseInt(item.days || 1);
        const pricePerDay = fee / days;

        const shopName = item.shop_name || item.shop?.name || 'ร้านค้า';

        // คำนวณวันคืน (หลังวันสิ้นสุด 1 วัน)
        const endD = item.end_date || item.endDate;
        const returnDate = endD ? new Date(endD) : new Date();
        returnDate.setDate(returnDate.getDate() + 1);
        const returnDateStr = formatDate(returnDate.toISOString());

        return (
            <View key={item.id || Math.random().toString()} style={styles.bookingCard}>
                <View style={styles.shopHeader}>
                    <MaterialCommunityIcons name="storefront-outline" size={20} color="#000000" />
                    <Text style={styles.shopName}>{shopName}</Text>
                </View>

                <View style={styles.productSection}>
                    <Image
                        source={{ uri: getImageUrl(item.images) }}
                        style={styles.productImage}
                    />
                    <View style={styles.productDetails}>
                        <Text style={styles.productTitle} numberOfLines={1}>{productName}</Text>
                        <Text style={styles.infoText}>ระยะเวลาเช่า {startDate} - {endDate}</Text>
                        <Text style={[styles.priceText, { color: '#E74C3C', fontSize: 16, marginTop: 4 }]}>
                            {pricePerDay.toLocaleString()} ฿/วัน
                        </Text>
                        <TouchableOpacity
                            style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}
                            onPress={() => {
                                const ownerId = item.owner_id || item.ownerId;
                                router.push(`/(tabs)/chat/${ownerId}`);
                            }}
                        >
                            <Ionicons name="chatbubble-ellipses-outline" size={18} color="#3498DB" />
                            <Text style={{ color: '#3498DB', marginLeft: 6, fontSize: 12, fontWeight: '500' }}>แชทกับเจ้าของร้าน</Text>
                        </TouchableOpacity>
                        <Text style={[
                            styles.warningText,

                            {
                                color: ((item.status?.toLowerCase() === 'received') && new Date() > returnDate) ? '#E74C3C' : '#E67E22',
                                fontSize: 11
                            }
                        ]}>
                            {((item.status?.toLowerCase() === 'received') && new Date() > returnDate) ? (
                                `*ล่าช้ากว่ากำหนด ปรับ 1.5 เท่าจากมัดจำ`
                            ) : (
                                `*กรุณาส่งสินค้าคืนภายในวันที่ ${returnDateStr}`
                            )}
                        </Text>
                    </View>
                </View>

                <View style={styles.actionSection}>
                    {/* 1. สถานะ รออนุมัติ */}
                    {(item.status?.toLowerCase() === 'pending' || item.status?.toLowerCase() === 'pending_owner') && (
                        <View style={[styles.actionButton, { backgroundColor: '#AED6F1' }]}>
                            <Text style={[styles.buttonText, { color: '#3498DB' }]}>รออนุมัติ</Text>
                        </View>
                    )}

                    {/* 2. สถานะ รอตรวจสอบสลิป */}
                    {(item.status?.toLowerCase() === 'waiting_verification' || item.status?.toLowerCase() === 'waiting_admin_verify') && (
                        <View style={[styles.actionButton, { backgroundColor: '#F9E79F' }]}>
                            <Text style={[styles.buttonText, { color: '#F39C12' }]}>รอตรวจสอบ</Text>
                        </View>
                    )}

                    {/* 3. สถานะ รอชำระเงิน */}
                    {(item.status?.toLowerCase() === 'approved' || item.status?.toLowerCase() === 'waiting_payment') && (activeTab === 'payment') && (() => {
                        const approvedAt = item.approved_at || item.updated_at || item.created_at;
                        const isExpired = approvedAt ? (new Date().getTime() - new Date(approvedAt).getTime()) > 24 * 60 * 60 * 1000 : false;
                        
                        return (
                            <View style={{ alignItems: 'flex-end' }}>
                                <PaymentCountdown 
                                    approvedAt={approvedAt} 
                                />
                                <TouchableOpacity
                                    style={[
                                        styles.actionButton, 
                                        { marginTop: 10 },
                                        isExpired && { backgroundColor: '#BDC3C7' }
                                    ]}
                                    onPress={() => {
                                        if (isExpired) {
                                            Alert.alert(
                                                'หมดเวลาชำระเงิน', 
                                                'รายการนี้หมดระยะเวลาชำระเงิน (24 ชม.) แล้ว ระบบได้ทำการคืนสต็อกสินค้าเรียบร้อยแล้ว หากยังต้องการเช่ากรุณาทำรายการใหม่อีกครั้ง',
                                                [{ text: 'ตกลง' }]
                                            );
                                            return;
                                        }
                                        router.push({
                                            pathname: '/payment/process',
                                            params: { rentalId: item.id }
                                        })
                                    }}
                                >
                                    <Text style={styles.buttonText}>{isExpired ? 'หมดอายุ' : 'ชำระเงิน'}</Text>
                                </TouchableOpacity>
                            </View>
                        );
                    })()}

                    {/* 4. สถานะ ชำระแล้ว/กำลังจัดส่ง */}
                    {(item.status?.toLowerCase() === 'paid' || item.status?.toLowerCase() === 'verified') && (
                        <View style={{ alignItems: 'flex-end' }}>
                            <Text style={{ color: '#F39C12', fontSize: 13, marginBottom: 5 }}>รอร้านค้าจัดส่ง</Text>
                        </View>
                    )}

                    {/* 5. สถานะ จัดส่งแล้ว -> ปุ่ม ยืนยันการรับสินค้า */}
                    {(item.status?.toLowerCase() === 'shipped' || item.status?.toLowerCase() === 'delivered') && (
                        <View style={{ alignItems: 'flex-end' }}>
                            <Text style={{ color: '#F39C12', fontSize: 13, marginBottom: 5 }}>รอรับสินค้า</Text>
                            <TouchableOpacity
                                style={styles.actionButton}
                                onPress={() => router.push({
                                    pathname: '/evidence/record',
                                    params: { rentalId: item.id, action: 'receive' }
                                })}
                            >
                                <Text style={styles.buttonText}>ยืนยันการรับสินค้า</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* 6. สถานะ รับของแล้ว -> ปุ่ม ยืนยันการส่งคืน */}
                    {(item.status?.toLowerCase() === 'received') && (
                        <View style={{ alignItems: 'flex-end' }}>
                            <Text style={{ color: '#2ECC71', fontSize: 13, marginBottom: 5 }}>รอส่งคืน</Text>
                            <TouchableOpacity
                                style={styles.actionButton}
                                onPress={() => router.push({
                                    pathname: '/evidence/record',
                                    params: { rentalId: item.id, action: 'return' }
                                })}
                            >
                                <Text style={styles.buttonText}>ยืนยันการส่งคืน</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* 7. สถานะ คืนสำเร็จ / จบรายการ */}
                    {(item.status?.toLowerCase() === 'returning' || item.status?.toLowerCase() === 'completed') && (
                        <View style={{ alignItems: 'flex-end' }}>
                            <Text style={{ color: '#2ECC71', fontSize: 13, fontWeight: '600' }}>ส่งคืนเรียบร้อย</Text>
                        </View>
                    )}
                </View>

            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => router.push('/(tabs)/profile')}>
                    <Ionicons name="chevron-back" size={28} color="#000000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>รายการเช่า</Text>
            </View>

            {/* Tab Bar */}
            <View style={styles.tabBar}>
                {tabs.map((tab) => (
                    <TouchableOpacity
                        key={tab.id}
                        style={[styles.tabItem, activeTab === tab.id && styles.activeTab]}
                        onPress={() => setActiveTab(tab.id)}
                    >
                        <Text style={[styles.tabText, activeTab === tab.id && styles.activeTabText]}>
                            {tab.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Content */}
            <ScrollView contentContainerStyle={styles.content}>
                {loading ? (
                    <ActivityIndicator size="large" color="#3498DB" style={{ marginTop: 50 }} />
                ) : getFilteredData().length > 0 ? (
                    getFilteredData().map(renderBookingCard)
                ) : (
                    <View style={{ alignItems: 'center', marginTop: 50 }}>
                        <Ionicons name="receipt-outline" size={64} color="#BDC3C7" />
                        <Text style={{ textAlign: 'center', marginTop: 10, color: '#7F8C8D', fontSize: 16 }}>
                            ไม่มีรายการในหมวดหมู่ {tabs.find(t => t.id === activeTab)?.label}
                        </Text>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}
