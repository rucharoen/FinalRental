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
            const user = await authService.getUserData();
            if (user && user.id) {
                const data = await rentalService.getUserRentals(user.id);
                // ดึงข้อมูล rentals ที่ได้จาก API
                // บางครั้ง API อาจหุ้มข้อมูลมาด้วย { rentals: [] }
                const rentalList = Array.isArray(data) ? data : (data.rentals || []);
                setRentals(rentalList);
            }
        } catch (error) {
            console.error('Error loading rentals:', error);
        } finally {
            setLoading(false);
        }
    };

    const getFilteredData = () => {
        switch (activeTab) {
            case 'pending':
                return rentals.filter(r => r.status === 'requested' || r.status === 'pending');
            case 'payment':
                return rentals.filter(r => r.status === 'approved' || r.status === 'unpaid');
            case 'receive':
                return rentals.filter(r => r.status === 'paid' || r.status === 'shipped' || r.status === 'in_progress');
            default:
                return [];
        }
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
        // ดึงข้อมูลสินค้าที่หุ้มอยู่ใน rental object
        const product = item.productId || {};
        const startDate = formatDate(item.startDate);
        const endDate = formatDate(item.endDate);

        return (
            <View key={item._id || item.id} style={styles.bookingCard}>
                {/* Shop Name (assuming it's in ownerId or something similar) */}
                <View style={styles.shopHeader}>
                    <MaterialCommunityIcons name="storefront-outline" size={20} color="#000000" />
                    <Text style={styles.shopName}>{product.shopName || 'ร้านค้าทางการ'}</Text>
                </View>

                {/* Product Section */}
                <View style={styles.productSection}>
                    <Image
                        source={{ uri: product.images?.[0] || 'https://via.placeholder.com/100' }}
                        style={styles.productImage}
                    />
                    <View style={styles.productDetails}>
                        <Text style={styles.productTitle}>{product.name || 'ไม่มีชื่อสินค้า'}</Text>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoText}>ระยะเวลาเช่า {startDate} - {endDate}</Text>
                        </View>
                        <Text style={styles.priceText}>{item.totalPrice?.toLocaleString()} ฿</Text>
                        <Text style={styles.warningText}>*กรุณาส่งสินค้าคืนเมื่อครบกำหนด</Text>
                    </View>
                </View>

                {/* Action Button Section */}
                <View style={styles.actionSection}>
                    {activeTab === 'pending' && (
                        <TouchableOpacity style={[styles.actionButton, styles.pendingButton]}>
                            <Text style={styles.buttonText}>รออนุมัติ</Text>
                        </TouchableOpacity>
                    )}
                    {activeTab === 'payment' && (
                        <TouchableOpacity style={styles.actionButton} onPress={() => {/* Navigate to payment */ }}>
                            <Text style={styles.buttonText}>ชำระ</Text>
                        </TouchableOpacity>
                    )}
                    {activeTab === 'receive' && (
                        <>
                            <Text style={styles.statusText}>{item.status === 'paid' ? 'รอรับสินค้า' : 'อยู่ระหว่างจัดส่ง'}</Text>
                            <TouchableOpacity style={styles.actionButton}>
                                <Text style={styles.buttonText}>ยืนยันการรับสินค้า</Text>
                            </TouchableOpacity>
                        </>
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
