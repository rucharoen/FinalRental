import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    TextInput,
    SafeAreaView,
    ScrollView,
    Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import styles from '../../../styles/shop_registration.styles';
import shopService from '../../../services/shop.service';
import authService from '../../../services/auth.service';

export default function ShopRegistrationScreen() {
    const router = useRouter();
    const [step, setStep] = useState(1); // 1: Welcome, 2: Form, 3: Success

    // Form State
    const [shopName, setShopName] = useState('');
    const [shopDescription, setShopDescription] = useState('');
    const [agreed, setAgreed] = useState(false);
    const [loading, setLoading] = useState(false);
    const [initialChecking, setInitialChecking] = useState(true);

    React.useEffect(() => {
        checkExistingShop();
    }, []);

    const checkExistingShop = async () => {
        try {
            const shopData = await shopService.getMyShop();
            if (shopData && !shopData.error) {
                Alert.alert(
                    'คุณมีร้านค้าอยู่แล้ว',
                    'ระบบอนุญาตให้เปิดร้านค้าได้เพียง 1 ร้านต่อ 1 บัญชีผู้ใช้',
                    [{ text: 'ตกลง', onPress: () => router.replace('/(tabs)/profile') }]
                );
            }
        } catch (error) {
            console.log('No existing shop found or error:', error);
        } finally {
            setInitialChecking(false);
        }
    };

    const handleCreateAccountClick = () => {
        setStep(2);
    };

    const handleSubmit = async () => {
        if (!shopName || !shopDescription) {
            Alert.alert('ข้อมูลไม่ครบถ้วน', 'กรุณาระบุชื่อร้านและคำอธิบายร้านค้า');
            return;
        }

        if (!agreed) {
            Alert.alert('ข้อตกลง', 'กรุณายอมรับเงื่อนไขการใช้บริการ');
            return;
        }

        setLoading(true);
        try {
            const user = await authService.getUserData();
            // เปลี่ยนตรงนี้ให้ตรงกับ Database
            await shopService.createShop({
                owner_id: Number(user.id || user._id),
                name: shopName,
                description: shopDescription,
            });

            setStep(3);
        } catch (error) {
            console.error('Error creating shop:', error);
            Alert.alert('เกิดข้อผิดพลาด', 'ไม่สามารถสร้างบัญชีผู้ขายได้ กรุณาลองใหม่อีกครั้ง');
        } finally {
            setLoading(false);
        }
    };

    const handleFinalConfirm = () => {
        router.replace({
            pathname: '/(tabs)/profile',
            params: { mode: 'owner' }
        });
    };

    const renderHeader = () => (
        <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={() => step > 1 ? setStep(step - 1) : router.back()}>
                <Ionicons name="chevron-back" size={28} color="#000000" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>ยินดีต้อนรับผู้ใช้ใหม่</Text>
        </View>
    );

    const renderWelcome = () => (
        <View style={styles.content}>
            <Text style={styles.welcomeText}>
                คุณสามารถเริ่มต้นการขายสินค้าใน Chao{"\n"}
                ได้โดยสร้างบัญชีผู้ขาย
            </Text>
            <TouchableOpacity style={styles.mainButton} onPress={handleCreateAccountClick}>
                <Text style={styles.buttonText}>สร้างบัญชีผู้ขาย</Text>
            </TouchableOpacity>
        </View>
    );

    const renderForm = () => (
        <View style={{ flex: 1 }}>
            <ScrollView style={styles.formContent} showsVerticalScrollIndicator={false}>
                <View style={{ paddingHorizontal: 20 }}>
                    <View style={styles.inputGroup}>
                        <View style={styles.labelRow}>
                            <Text style={styles.label}>ชื่อร้านค้า</Text>
                            <Text style={styles.required}>*</Text>
                        </View>
                        <TextInput
                            style={styles.input}
                            value={shopName}
                            onChangeText={setShopName}
                            placeholder="Sunny"
                            placeholderTextColor="#BDC3C7"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <View style={styles.labelRow}>
                            <Text style={styles.label}>คำอธิบายร้านค้า</Text>
                            <Text style={styles.required}>*</Text>
                        </View>
                        <TextInput
                            style={[styles.input, styles.textarea]}
                            value={shopDescription}
                            onChangeText={setShopDescription}
                            placeholder="ขายหนังสือ และ เสื้อผ้า"
                            placeholderTextColor="#BDC3C7"
                            multiline
                        />
                    </View>
                </View>

                <TouchableOpacity
                    style={styles.checkboxContainer}
                    onPress={() => setAgreed(!agreed)}
                >
                    <View style={[styles.checkbox, agreed && styles.checkboxChecked]}>
                        {agreed && <Ionicons name="checkmark" size={16} color="#FFFFFF" />}
                    </View>
                    <Text style={styles.checkboxText}>
                        ฉันยอมรับ <Text style={styles.linkText}>เงื่อนไขการใช้บริการ</Text> และ{"\n"}
                        <Text style={styles.linkText}>นโยบายความเป็นส่วนตัว</Text>
                    </Text>
                </TouchableOpacity>

                <View style={styles.noteContainer}>
                    <Text style={styles.noteText}>• ข้อมูลที่ให้แก่ chao เป็นข้อมูลที่ถูกต้อง สมบูรณ์</Text>
                    <Text style={styles.noteText}>• ผู้ขายมีสิทธิ์และอำนาจโดยสมบูรณ์ตามกฎหมายที่ใช้บังคับในการขายสินค้าที่แสดงบนแพลตฟอร์ม</Text>
                </View>
            </ScrollView>

            <View style={styles.formFooter}>
                <TouchableOpacity style={styles.cancelButton} onPress={() => router.back()}>
                    <Text style={styles.cancelButtonText}>ยกเลิก</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.confirmButton, loading && { opacity: 0.7 }]}
                    onPress={handleSubmit}
                    disabled={loading}
                >
                    <Text style={styles.confirmButtonText}>ยืนยัน</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    const renderSuccess = () => (
        <View style={styles.content}>
            <View style={styles.successCard}>
                <View style={styles.successIconContainer}>
                    <Ionicons name="checkmark" size={50} color="#2ECC71" />
                </View>
                <Text style={styles.successText}>เสร็จสมบูรณ์</Text>
            </View>
            <TouchableOpacity style={styles.mainButton} onPress={handleFinalConfirm}>
                <Text style={styles.buttonText}>ยืนยัน</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            {renderHeader()}
            {step === 1 && renderWelcome()}
            {step === 2 && renderForm()}
            {step === 3 && renderSuccess()}
        </SafeAreaView>
    );
}
