import { Feather, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Modal,
    Platform,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import authService from '../../../services/auth.service';

// Define theme constants locally since @/constants/theme is missing
const COLORS = {
    primary: '#3498db',
    white: '#FFFFFF',
    black: '#000000',
    gray: '#7F8C8D',
};

const FONTS = {
    regular: Platform.OS === 'ios' ? 'System' : 'normal',
    medium: Platform.OS === 'ios' ? 'System' : 'normal',
    bold: Platform.OS === 'ios' ? 'System' : 'normal',
};

export default function AddressScreen() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [fetchingData, setFetchingData] = useState(true);

    // Form States
    const [shippingName, setShippingName] = useState('');
    const [phone, setPhone] = useState('');
    const [province, setProvince] = useState('');
    const [district, setDistrict] = useState('');
    const [subDistrict, setSubDistrict] = useState('');
    const [postalCode, setPostalCode] = useState('');
    const [addressDetail, setAddressDetail] = useState('');

    // Address Data State (77 Provinces)
    const [fullAddressData, setFullAddressData] = useState<any[]>([]);

    // Modal states
    const [modalVisible, setModalVisible] = useState(false);
    const [modalTitle, setModalTitle] = useState('');
    const [modalType, setModalType] = useState<'province' | 'district' | 'subDistrict'>('province');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchThaiAddressData();
        fetchCurrentAddress();
    }, []);

    const fetchThaiAddressData = async () => {
        try {
            // ดึงข้อมูลที่อยู่ประเทศไทยแบบครบถ้วน (77 จังหวัด) จาก CDN
            const resp = await fetch('https://raw.githubusercontent.com/kongvut/thai-province-data/master/api/latest/province_with_district_and_sub_district.json');
            const data = await resp.json();
            setFullAddressData(data);
        } catch (err) {
            console.error('Fetch Thai Address Error:', err);
        } finally {
            setFetchingData(false);
        }
    };

    const fetchCurrentAddress = async () => {
        try {
            // ดึงข้อมูลโปรไฟล์จาก AuthService
            const userData = await authService.getUserData();
            if (userData && userData.address) {
                populateAddress(userData.address);
            } else {
                // If not in local storage, try API
                const profile = await authService.getProfile();
                if (profile && profile.address) {
                    populateAddress(profile.address);
                }
            }
        } catch (error) {
            console.error('Fetch Address Error:', error);
        } finally {
            setFetching(false);
        }
    };

    const populateAddress = (addressStr: string) => {
        if (!addressStr || addressStr === 'ไม่ระบุที่อยู่') return;
        try {
            const parsed = typeof addressStr === 'object' ? addressStr : JSON.parse(addressStr);
            setShippingName(parsed.name || parsed.shipping_name || '');
            setPhone(parsed.phone || parsed.shipping_phone || '');
            setProvince(parsed.province || '');
            setDistrict(parsed.district || '');
            setSubDistrict(parsed.sub_district || '');
            setPostalCode(parsed.postcode || parsed.postal_code || '');
            setAddressDetail(parsed.house_no || parsed.address_detail || '');
        } catch (e) {
            // If it's just a plain string, put it in detail
            if (typeof addressStr === 'string') {
                setAddressDetail(addressStr);
            }
        }
    };

    const openSelector = (type: 'province' | 'district' | 'subDistrict', title: string) => {
        setModalType(type);
        setModalTitle(title);
        setSearchQuery('');
        setModalVisible(true);
    };

    const getFilteredOptions = () => {
        let options: string[] = [];
        if (modalType === 'province') {
            options = fullAddressData.map(p => p.name_th);
        } else if (modalType === 'district') {
            const prov = fullAddressData.find(p => p.name_th === province);
            options = prov ? prov.districts.map((d: any) => d.name_th) : [];
        } else if (modalType === 'subDistrict') {
            const prov = fullAddressData.find(p => p.name_th === province);
            const dist = prov?.districts.find((d: any) => d.name_th === district);
            options = dist ? dist.sub_districts.map((s: any) => s.name_th) : [];
        }

        if (searchQuery) {
            return options.filter(o => o.includes(searchQuery));
        }
        return options;
    };

    const handleSelect = (value: string) => {
        if (modalType === 'province') {
            setProvince(value);
            setDistrict('');
            setSubDistrict('');
            setPostalCode('');
        } else if (modalType === 'district') {
            setDistrict(value);
            setSubDistrict('');
            setPostalCode('');
        } else {
            setSubDistrict(value);
            // ดึงรหัสไปรษณีย์
            const prov = fullAddressData.find(p => p.name_th === province);
            const dist = prov?.districts.find((d: any) => d.name_th === district);
            const sub = dist?.sub_districts.find((s: any) => s.name_th === value);
            if (sub && sub.zip_code) setPostalCode(sub.zip_code.toString());
        }
        setModalVisible(false);
    };

    const handleSave = async () => {
        if (!shippingName || !phone || !province || !district || !subDistrict || !postalCode || !addressDetail) {
            Alert.alert('ข้อมูลไม่ครบถ้วน', 'กรุณากรอกข้อมูลให้ครบทุกช่อง');
            return;
        }

        setLoading(true);
        try {
            // เตรียมข้อมูลตามที่ปรากฏในรูปภาพ (API Payload)
            const addressData = {
                name: shippingName,
                phone: phone,
                province: province,
                district: district,
                sub_district: subDistrict,
                postcode: postalCode,
                house_no: addressDetail,
            };

            // เรียกใช้ apiRequest โดยตรงหรือผ่าน service
            const response = await authService.updateAddress(addressData);

            if (response && !response.error) {
                Alert.alert('สำเร็จ', 'บันทึกที่อยู่เรียบร้อยแล้ว', [
                    {
                        text: 'ตกลง', onPress: () => {
                            router.replace('/(tabs)/profile');
                        }
                    }
                ]);
            } else {
                throw new Error(response?.message || 'เกิดข้อผิดพลาดในการบันทึกที่อยู่');
            }
        } catch (error: any) {
            console.error('Save Address Error:', error);
            Alert.alert('เกิดข้อผิดพลาด', 'ไม่สามารถบันทึกข้อมูลได้ กรุณาลองใหม่อีกครั้ง');
        } finally {
            setLoading(false);
        }
    };

    if (fetching || fetchingData) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={{ marginTop: 10, fontFamily: FONTS.medium }}>กำลังโหลดข้อมูลจังหวัด...</Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.push('/(tabs)/profile')} style={styles.backButton}>
                    <Feather name="chevron-left" size={32} color={COLORS.black} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>ที่อยู่ใหม่</Text>
                <View style={{ width: 44 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>ที่อยู่</Text>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>ชื่อ-นามสกุล (จ่าหน้าซอง)</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="กรอกชื่อ-นามสกุล"
                            value={shippingName}
                            onChangeText={setShippingName}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>หมายเลขโทรศัพท์</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="กรอกหมายเลขโทรศัพท์"
                            keyboardType="phone-pad"
                            value={phone}
                            onChangeText={setPhone}
                        />
                    </View>

                    <TouchableOpacity style={styles.inputGroup} onPress={() => openSelector('province', 'เลือกจังหวัด')}>
                        <Text style={styles.label}>จังหวัด</Text>
                        <View style={styles.selectorTrigger}>
                            <Text style={[styles.input, !province && { color: '#ccc' }]}>{province || 'เลือกจังหวัด'}</Text>
                            <Feather name="chevron-down" size={18} color="#999" />
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.inputGroup, !province && styles.disabledGroup]}
                        onPress={() => province && openSelector('district', 'เลือกอำเภอ')}
                    >
                        <Text style={styles.label}>อำเภอ</Text>
                        <View style={styles.selectorTrigger}>
                            <Text style={[styles.input, !district && { color: '#ccc' }]}>{district || 'เลือกอำเภอ'}</Text>
                            <Feather name="chevron-down" size={18} color="#999" />
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.inputGroup, !district && styles.disabledGroup]}
                        onPress={() => district && openSelector('subDistrict', 'เลือกตำบล')}
                    >
                        <Text style={styles.label}>ตำบล</Text>
                        <View style={styles.selectorTrigger}>
                            <Text style={[styles.input, !subDistrict && { color: '#ccc' }]}>{subDistrict || 'เลือกตำบล'}</Text>
                            <Feather name="chevron-down" size={18} color="#999" />
                        </View>
                    </TouchableOpacity>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>รหัสไปรษณีย์</Text>
                        <TextInput
                            style={[styles.input, { backgroundColor: '#fcfcfc' }]}
                            placeholder="รหัสไปรษณีย์ (อัตโนมัติ)"
                            value={postalCode}
                            editable={false}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>บ้านเลขที่ / รายละเอียดเพิ่มเติม</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            placeholder="กรอกบ้านเลขที่, ซอย, ถนน"
                            multiline
                            numberOfLines={3}
                            value={addressDetail}
                            onChangeText={setAddressDetail}
                        />
                    </View>
                </View>

                <TouchableOpacity
                    style={[styles.saveButton, loading && styles.disabledButton]}
                    onPress={handleSave}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color={COLORS.white} />
                    ) : (
                        <Text style={styles.saveButtonText}>บันทึกที่อยู่</Text>
                    )}
                </TouchableOpacity>
            </ScrollView>

            {/* Selector Modal */}
            <Modal visible={modalVisible} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>{modalTitle}</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Ionicons name="close" size={28} color={COLORS.black} />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.searchContainer}>
                            <Feather name="search" size={20} color="#999" />
                            <TextInput
                                style={styles.searchInput}
                                placeholder="ค้นหา..."
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                            />
                        </View>

                        <FlatList
                            data={getFilteredOptions()}
                            keyExtractor={(item) => item}
                            renderItem={({ item }) => (
                                <TouchableOpacity style={styles.optionItem} onPress={() => handleSelect(item)}>
                                    <Text style={styles.optionText}>{item}</Text>
                                </TouchableOpacity>
                            )}
                            ListEmptyComponent={<Text style={styles.emptyOption}>ไม่พบข้อมูล</Text>}
                        />
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f5f5' },
    centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: {
        height: 60,
        backgroundColor: COLORS.white,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#eee'
    },
    backButton: { width: 44 },
    headerTitle: { fontFamily: FONTS.bold, fontSize: 18, color: COLORS.black },
    scrollContent: { padding: 15, paddingBottom: 40 },
    card: {
        backgroundColor: COLORS.white,
        borderRadius: 15,
        padding: 20,
        marginBottom: 25,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 3
    },
    sectionTitle: { fontFamily: FONTS.bold, fontSize: 20, marginBottom: 20, color: '#333' },
    inputGroup: { marginBottom: 15, borderBottomWidth: 1, borderBottomColor: '#f0f0f0', paddingBottom: 5 },
    label: { fontFamily: FONTS.regular, fontSize: 13, color: '#999', marginBottom: 5 },
    input: { fontFamily: FONTS.medium, fontSize: 16, color: '#333', paddingVertical: 5 },
    textArea: { height: 60, textAlignVertical: 'top' },
    selectorTrigger: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    disabledGroup: { opacity: 0.5 },
    saveButton: {
        backgroundColor: '#3498db',
        height: 55,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#3498db',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5
    },
    saveButtonText: { fontFamily: FONTS.bold, fontSize: 18, color: COLORS.white },
    disabledButton: { backgroundColor: '#bdc3c7' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: COLORS.white, height: '80%', borderTopLeftRadius: 25, borderTopRightRadius: 25, padding: 20 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    modalTitle: { fontFamily: FONTS.bold, fontSize: 18 },
    searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f5f5f5', borderRadius: 10, paddingHorizontal: 15, marginBottom: 20 },
    searchInput: { flex: 1, height: 45, fontFamily: FONTS.regular, marginLeft: 10 },
    optionItem: { paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
    optionText: { fontFamily: FONTS.medium, fontSize: 16 },
    emptyOption: { textAlign: 'center', marginTop: 50, color: '#999', fontFamily: FONTS.regular },
});
