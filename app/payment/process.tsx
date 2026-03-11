import authService from '@/services/auth.service';
import rentalService from '@/services/rental.service';
import { styles } from '@/styles/checkout.styles';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import PaymentCountdown from '@/components/rental/PaymentCountdown';
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

const PaymentProcessScreen = () => {
    const router = useRouter();
    const { rentalId } = useLocalSearchParams();
    const [rental, setRental] = useState<any>(null);
    const [userData, setUserData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [paymentMethod, setPaymentMethod] = useState<'qr' | 'card'>('qr');

    useEffect(() => {
        if (rentalId) {
            loadData();
        }
    }, [rentalId]);

    const loadData = async () => {
        try {
            setLoading(true);
            // 1. โหลดที่อยู่ผู้ใช้
            const profile = await authService.getProfile();
            if (profile && !profile.error) {
                setUserData(profile);
            } else {
                const localUser = await authService.getUserData();
                setUserData(localUser);
            }

            // 2. โหลดรายการเช่าเพื่อเอาข้อมูลราคาและสินค้า
            const allRentals = await rentalService.getUserRentals();
            const found = allRentals.find((r: any) => (r.id || r._id).toString() === rentalId);

            if (found) {
                setRental(found);
            } else {
                Alert.alert('ไม่พบข้อมูล', 'ไม่สามารถดึงข้อมูลการเช่านี้ได้');
                router.back();
            }
        } catch (error) {
            // Error handling
        } finally {
            setLoading(false);
        }
    };

    const renderAddress = () => {
        if (!userData?.address || userData.address === 'ไม่ระบุที่อยู่') {
            return {
                name: userData?.full_name || 'ไม่ระบุชื่อ',
                phone: userData?.phone || '',
                detail: 'กรุณาเพิ่มที่อยู่สำหรับการจัดส่ง'
            };
        }

        try {
            const addr = JSON.parse(userData.address);
            const subDistrict = addr.sub_district || addr.subDistrict || '';
            const district = addr.district || '';
            const province = addr.province || '';
            const postalCode = addr.postal_code || addr.postalCode || '';
            const detail = addr.address_detail || addr.addressDetail || '';

            return {
                name: addr.shipping_name || userData.full_name,
                phone: addr.shipping_phone || userData.phone || '-',
                detail: `${detail} ${subDistrict ? 'ต.' + subDistrict : ''} ${district ? 'อ.' + district : ''} ${province ? 'จ.' + province : ''} ${postalCode}`.trim()
            };
        } catch (e) {
            return {
                name: userData.full_name || 'ผู้ใช้งาน',
                phone: userData.phone || '-',
                detail: userData.address
            };
        }
    };

    const getImageUrl = (imgData: any) => {
        if (!imgData) return 'https://via.placeholder.com/150';
        try {
            const parsed = typeof imgData === 'string' ? JSON.parse(imgData) : imgData;
            if (Array.isArray(parsed) && parsed.length > 0) {
                const path = parsed[0];
                if (!path) return 'https://via.placeholder.com/150';
                if (path.startsWith('http')) return path;
                return `https://finalrental.onrender.com${path.startsWith('/') ? path : `/${path}`}`;
            }
        } catch (e) { }
        return 'https://via.placeholder.com/150';
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return '-';
        const d = new Date(dateString);
        return d.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    const handlePayment = () => {
        if (paymentMethod === 'qr') {
            router.push({
                pathname: '/payment/qr',
                params: { rentalId, amount: rental.total_price }
            });
        } else {
            router.push({
                pathname: '/payment/card',
                params: { rentalId, amount: rental.total_price }
            });
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#3498DB" />
            </View>
        );
    }

    if (!rental) return null;

    const address = renderAddress();
    const rentalFee = Number(rental.rent_fee || 0);
    const shippingFee = Number(rental.shipping_fee || 45);
    const depositFee = Number(rental.deposit_fee || 0);
    const totalAmount = Number(rental.total_price || (rentalFee + shippingFee + depositFee));

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <Ionicons name="chevron-back" size={28} color="#2C3E50" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>ทำการเช่า</Text>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Countdown Timer Alert */}
                <View style={{ marginBottom: 15, paddingHorizontal: 5 }}>
                    <PaymentCountdown approvedAt={rental.approved_at || rental.updated_at || rental.created_at} />
                    <Text style={{ fontSize: 11, color: '#7F8C8D', marginTop: 4, marginLeft: 2 }}>
                        *หากชำระไม่ทันเวลา รายการจะถูกยกเลิกอัตโนมัติ
                    </Text>
                </View>

                {/* Address Section */}
                <TouchableOpacity style={styles.card} onPress={() => router.push('/(tabs)/profile/address')}>
                    <View style={styles.addressHeader}>
                        <Ionicons name="location-sharp" size={20} color="#E74C3C" />
                        <Text style={styles.addressName}>{address.name} ({address.phone})</Text>
                    </View>
                    <Text style={styles.addressDetail}>{address.detail}</Text>
                </TouchableOpacity>

                {/* Product Section */}
                <View style={styles.card}>
                    <View style={styles.shopHeader}>
                        <MaterialIcons name="store" size={22} color="#2C3E50" />
                        <Text style={styles.shopName}>{rental.shop_name || 'ร้านค้า'}</Text>
                    </View>
                    <View style={styles.productInfoRow}>
                        <Image
                            source={{ uri: getImageUrl(rental.images) }}
                            style={styles.productImage}
                        />
                        <View style={styles.productDetails}>
                            <Text style={styles.productTitle} numberOfLines={2}>{rental.product_name || 'สินค้า'}</Text>
                            <Text style={styles.rentDate}>
                                ระยะเวลาเช่า {formatDate(rental.start_date)} - {formatDate(rental.end_date)}
                            </Text>
                            <Text style={styles.pricePerDay}>
                                {((rentalFee / (rental.days || 1)) || 0).toLocaleString()} ฿/วัน x {rental.days || 1} วัน
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Rental Fee Breakdown */}
                <View style={styles.infoRow}>
                    <View style={styles.infoCol}>
                        <Text style={styles.infoLabelBold}>ค่าเช่าสำหรับ {rental.days || 1} วัน</Text>
                        <Text style={styles.infoSubText}>({((rentalFee / (rental.days || 1)) || 0).toLocaleString()} ฿ x {rental.days || 1} วัน)</Text>
                    </View>
                    <Text style={styles.infoValue}>฿{rentalFee.toLocaleString()}</Text>
                </View>

                {/* Delivery Info */}
                <View style={styles.infoRow}>
                    <View style={styles.infoCol}>
                        <Text style={styles.infoLabelBold}>Standard Delivery - <Text style={styles.infoLabelNormal}>ส่งธรรมดาในประเทศ</Text></Text>
                        <Text style={styles.infoSubText}>จะได้รับภายใน 2-3 วันทำการ</Text>
                    </View>
                    <Text style={styles.infoValue}>฿{shippingFee}</Text>
                </View>

                {/* Deposit Info */}
                <View style={styles.infoRow}>
                    <Text style={styles.infoLabelBold}>ค่ามัดจำสินค้า</Text>
                    <Text style={styles.infoValue}>฿{depositFee}</Text>
                </View>

                {/* Payment Methods Selection */}
                <View style={styles.paymentSection}>
                    <Text style={styles.paymentTitle}>ช่องทางการชำระเงิน</Text>

                    <TouchableOpacity
                        style={styles.paymentOption}
                        onPress={() => setPaymentMethod('qr')}
                    >
                        <View style={styles.paymentOptionLeft}>
                            <View style={[styles.paymentIconBox, { backgroundColor: '#1A237E' }]}>
                                <Ionicons name="qr-code-outline" size={20} color="#FFFFFF" />
                            </View>
                            <Text style={styles.paymentOptionText}>QR พร้อมเพย์</Text>
                        </View>
                        <Ionicons
                            name={paymentMethod === 'qr' ? "radio-button-on" : "radio-button-off"}
                            size={22}
                            color={paymentMethod === 'qr' ? "#3498DB" : "#BDC3C7"}
                        />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.paymentOption}
                        onPress={() => setPaymentMethod('card')}
                    >
                        <View style={styles.paymentOptionLeft}>
                            <View style={[styles.paymentIconBox, { backgroundColor: '#34495E' }]}>
                                <Ionicons name="card-outline" size={20} color="#FFFFFF" />
                            </View>
                            <Text style={styles.paymentOptionText}>บัตรเครดิต/บัตรเดบิต</Text>
                        </View>
                        <Ionicons
                            name={paymentMethod === 'card' ? "radio-button-on" : "radio-button-off"}
                            size={22}
                            color={paymentMethod === 'card' ? "#3498DB" : "#BDC3C7"}
                        />
                    </TouchableOpacity>
                </View>
            </ScrollView>

            {/* Total & Action Button */}
            <View style={styles.footer}>
                <View style={styles.totalContainer}>
                    <Text style={styles.totalLabel}>รวมทั้งหมด</Text>
                    <Text style={styles.totalValue}>{totalAmount.toLocaleString()} ฿</Text>
                </View>
                <TouchableOpacity
                    style={styles.reserveButton}
                    onPress={handlePayment}
                >
                    <Text style={styles.reserveButtonText}>ชำระเงิน</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

export default PaymentProcessScreen;
