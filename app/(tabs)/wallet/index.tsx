import React, { useState, useEffect } from 'react';
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
    Modal,
    StatusBar,
    Platform
} from 'react-native';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import walletService from '@/services/wallet.service';
import { styles } from '@/styles/wallet.styles';

const WalletScreen = () => {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [balance, setBalance] = useState<number>(0);
    const [isWithdrawMode, setIsWithdrawMode] = useState(false);

    // Form State
    const [withdrawAmount, setWithdrawAmount] = useState('');
    const [accountNumber, setAccountNumber] = useState('');
    const [accountName, setAccountName] = useState('');

    // Modal States
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    useEffect(() => {
        fetchBalance();
    }, []);

    const fetchBalance = async () => {
        try {
            const response = await walletService.getWalletBalance();
            if (response && response.balance !== undefined) {
                setBalance(response.balance);
            }
        } catch (error) {
            console.error('Error fetching balance:', error);
        }
    };

    const handleWithdrawPress = () => {
        if (!isWithdrawMode) {
            setIsWithdrawMode(true);
        } else {
            // Validate form
            if (!withdrawAmount || !accountNumber || !accountName) {
                Alert.alert('กรุณากรอกข้อมูลให้ครบถ้วน');
                return;
            }
            if (Number(withdrawAmount) > balance) {
                Alert.alert('ยอดเงินคงเหลือไม่เพียงพอ');
                return;
            }
            setShowConfirmModal(true);
        }
    };

    const confirmWithdraw = async () => {
        setShowConfirmModal(false);
        setLoading(true);
        try {
            // In real app, we might need a bankId or other details, 
            // but based on design, we send amount, accountNumber, accountName.
            const data: any = {
                amount: Number(withdrawAmount),
                account_number: accountNumber,
                account_name: accountName,
            };

            // Note: services/wallet.service.ts expects WithdrawRequest { amount, bankAccountId, description }.
            // We might need to adjust based on backend. For now, assuming requestWithdraw handles it.
            const response = await walletService.requestWithdraw(data);

            if (response && !response.error) {
                setShowSuccessModal(true);
                fetchBalance(); // Refresh balance
            } else {
                Alert.alert('เกิดข้อผิดพลาดในการถอนเงิน');
            }
        } catch (error: any) {
            console.error('Withdraw Error:', error);
            Alert.alert('เกิดข้อผิดพลาด', error.message || 'ไม่สามารถดำเนินการได้');
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setShowSuccessModal(false);
        setIsWithdrawMode(false);
        setWithdrawAmount('');
        setAccountNumber('');
        setAccountName('');
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />

            {/* Header with Logo */}
            <View style={styles.headerLogoContainer}>
                <Image source={require('@/assets/images/logo.png')} style={styles.logo} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                <Text style={styles.headerTitle}>
                    {isWithdrawMode ? 'จำนวนที่ต้องการถอน' : 'ถอนเงิน'}
                </Text>

                {/* Balance Card */}
                <View style={[styles.balanceCard, isWithdrawMode && { backgroundColor: '#34495E' }]}>
                    <Text style={styles.balanceLabel}>ยอดเงินคงเหลือที่ใช้ได้</Text>
                    <Text style={styles.balanceAmount}>{balance.toLocaleString()} บาท</Text>
                    <Text style={styles.balanceFooter}>สามารถถอนเงินได้</Text>
                </View>

                {isWithdrawMode ? (
                    /* Withdraw Form */
                    <View style={styles.formContainer}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>จำนวนที่ต้องการถอน</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="0 บาท"
                                placeholderTextColor="#BDC3C7"
                                keyboardType="numeric"
                                value={withdrawAmount}
                                onChangeText={setWithdrawAmount}
                            />
                        </View>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>เลขบัญชีธนาคาร</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="กรอกเลขบัญชี"
                                placeholderTextColor="#BDC3C7"
                                keyboardType="numeric"
                                value={accountNumber}
                                onChangeText={setAccountNumber}
                            />
                        </View>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>ชื่อบัญชี</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="กรอกชื่อบัญชี"
                                placeholderTextColor="#BDC3C7"
                                value={accountName}
                                onChangeText={setAccountName}
                            />
                        </View>
                    </View>
                ) : (
                    /* History Section */
                    <View style={styles.historySection}>
                        <Text style={styles.sectionTitle}>ประวัติทำการธุรกรรม</Text>
                        <TouchableOpacity
                            style={styles.historyItem}
                            onPress={() => router.push('/(tabs)/wallet/history')}
                        >
                            <View style={styles.historyIconContainer}>
                                <MaterialCommunityIcons name="bank-transfer" size={24} color="#000" />
                            </View>
                            <View style={styles.historyContent}>
                                <Text style={styles.historyTitle}>ประวัติการทำธุรกรรม</Text>
                                <Text style={styles.historySubTitle}>ดูรายการเงิน เข้า/ออก ย้อนหลัง</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={24} color="#BDC3C7" />
                        </TouchableOpacity>
                    </View>
                )}

                {/* Withdraw Button */}
                <TouchableOpacity
                    style={[styles.actionButton, loading && { opacity: 0.7 }]}
                    onPress={handleWithdrawPress}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#FFFFFF" />
                    ) : (
                        <Text style={styles.actionButtonText}>ถอนเงิน</Text>
                    )}
                </TouchableOpacity>

            </ScrollView>

            {/* Confirmation Modal */}
            <Modal
                transparent={true}
                visible={showConfirmModal}
                animationType="fade"
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>แจ้งเตือน</Text>
                        <Text style={styles.modalMessage}>ยืนยันการถอนเงิน</Text>

                        <View style={styles.modalButtonsRow}>
                            <TouchableOpacity
                                style={styles.secondaryButton}
                                onPress={() => setShowConfirmModal(false)}
                            >
                                <Text style={styles.secondaryButtonText}>ยกเลิก</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.confirmButton}
                                onPress={confirmWithdraw}
                            >
                                <Text style={styles.confirmButtonText}>ยืนยัน</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Success Modal */}
            <Modal
                transparent={true}
                visible={showSuccessModal}
                animationType="fade"
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Ionicons name="checkmark-circle-outline" size={80} color="#2ECC71" />
                        <Text style={styles.successTitle}>เสร็จสิ้น</Text>

                        <TouchableOpacity
                            style={styles.doneButton}
                            onPress={resetForm}
                        >
                            <Text style={styles.doneButtonText}>ตกลง</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Back Arrow for Withdraw Mode */}
            {isWithdrawMode && (
                <TouchableOpacity
                    style={{ position: 'absolute', top: 50, left: 16 }}
                    onPress={() => setIsWithdrawMode(false)}
                >
                    <Ionicons name="chevron-back" size={28} color="#000" />
                </TouchableOpacity>
            )}
        </SafeAreaView>
    );
};

export default WalletScreen;
