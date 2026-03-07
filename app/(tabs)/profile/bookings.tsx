import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Image,
    ScrollView,
    SafeAreaView,
    StatusBar,
    ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import styles from '../../../styles/bookings.styles';
import rentalService from '../../../services/rental.service';
import authService from '../../../services/auth.service';

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

    useEffect(() => {
        loadRentals();
    }, []);

    const loadRentals = async () => {
        try {
            setLoading(true);
            const user = await authService.getUserData();
            if (user && (user.id || user._id)) {
                const data = await rentalService.getUserRentals();
                setRentals(Array.isArray(data) ? data : []);
            }
        } catch (error) {
            // Error handling
        } finally {
            setLoading(false);
        }
    };

    const getFilteredData = () => {
        return rentals.filter(r => {
            const status = (r.status || '').toLowerCase();
            switch (activeTab) {
                case 'pending':
                    return status === 'pending' || status === 'pending_owner';
                case 'payment':
                    return status === 'approved' ||
                        status === 'waiting_payment' ||
                        status === 'waiting_verification';
                case 'receive':
                    return status === 'paid' ||
                        status === 'shipped' ||
                        status === 'received' ||
                        status === 'delivered';
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
                        <Text style={[styles.warningText, { color: '#E74C3C', fontSize: 11 }]}>
                            *กรุณาส่งสินค้าคืนภายในวันที่ {returnDateStr}
                        </Text>
                    </View>
                </View>

                <View style={styles.actionSection}>
                    {(item.status === 'pending' || item.status === 'pending_owner') && (
                        <View style={[styles.actionButton, { backgroundColor: '#AED6F1' }]}>
                            <Text style={[styles.buttonText, { color: '#3498DB' }]}>รออนุมัติ</Text>
                        </View>
                    )}

                    {item.status === 'waiting_verification' && (
                        <View style={[styles.actionButton, { backgroundColor: '#F9E79F' }]}>
                            <Text style={[styles.buttonText, { color: '#F39C12' }]}>รอตรวจสอบ</Text>
                        </View>
                    )}

                    {(item.status === 'approved' || item.status === 'waiting_payment') && (
                        <TouchableOpacity
                            style={styles.actionButton}
                            onPress={() => router.push({
                                pathname: '/payment/process',
                                params: { rentalId: item.id }
                            })}
                        >
                            <Text style={styles.buttonText}>ชำระเงิน</Text>
                        </TouchableOpacity>
                    )}

                    {(item.status === 'paid' || item.status === 'shipped') && (
                        <TouchableOpacity style={[styles.actionButton, { backgroundColor: '#2ECC71' }]}>
                            <Text style={styles.buttonText}>ยืนยันรับสินค้า</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />
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
