import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    SafeAreaView,
    TouchableOpacity,
    Image,
    StyleSheet,
    Alert,
    ScrollView,
    StatusBar
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';

export default function QRPaymentScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const { amount } = params;

    const handleFinish = () => {
        Alert.alert('ตรวจสอบสำเร็จ', 'ได้รับยอดชำระเงินเรียบร้อยแล้ว', [
            { text: 'ดูรายการเช่าของฉัน', onPress: () => router.push('/(tabs)/profile/bookings') }
        ]);
    };

    const handleSaveQR = () => {
        Alert.alert('สำเร็จ', 'บันทึกรูปภาพ QR Code เรียบร้อยแล้ว');
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <Ionicons name="chevron-back" size={28} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>การชำระเงิน</Text>
            </View>

            <View style={styles.mainContent}>
                <View style={styles.qrCardMain}>
                    {/* Dark Blue Header of Card */}
                    <View style={styles.cardHeader}>
                        <View style={styles.headerLogoContainer}>
                            <Image
                                source={{ uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c2/Thai_QR_Payment_logo.svg/1200px-Thai_QR_Payment_logo.svg.png' }}
                                style={styles.headerLogoImage}
                                resizeMode="contain"
                            />
                        </View>
                    </View>

                    {/* White Content of Card */}
                    <View style={styles.cardBody}>
                        <View style={styles.promptPayBox}>
                            <Image
                                source={{ uri: 'https://www.bot.or.th/content/dam/bot/logos/promtpay-logo.png' }}
                                style={styles.ppImage}
                                resizeMode="contain"
                            />
                        </View>

                        <Image
                            source={{ uri: 'https://cdn.pixabay.com/photo/2013/07/12/14/45/qr-code-148732_1280.png' }}
                            style={styles.qrImage}
                        />

                        <Text style={styles.amountTextRed}>{Number(amount || 0).toLocaleString()} ฿</Text>
                        <Text style={styles.subTextGrey}>ตัวกลางการเช่า</Text>
                    </View>
                </View>
            </View>

            {/* Bottom Buttons Container */}
            <View style={styles.bottomActions}>
                <TouchableOpacity style={styles.saveBtn} onPress={handleSaveQR}>
                    <Text style={styles.saveBtnText}>บันทึก QR</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.confirmBtn} onPress={handleFinish}>
                    <Text style={styles.confirmBtnText}>ตกลง</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    backButton: {
        padding: 5,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '500',
        marginLeft: 10,
    },
    mainContent: {
        flex: 1,
        alignItems: 'center',
        paddingTop: 40,
        backgroundColor: '#F8F9FA',
    },
    qrCardMain: {
        width: '85%',
        backgroundColor: '#FFFFFF',
        borderRadius: 25,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#E0E0E0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
    },
    cardHeader: {
        backgroundColor: '#003D6B', // เข้มแบบ Thai QR
        height: 80,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerLogoContainer: {
        width: '60%',
        height: '60%',
        backgroundColor: '#FFFFFF',
        borderRadius: 5,
        padding: 5,
    },
    headerLogoImage: {
        width: '100%',
        height: '100%',
    },
    cardBody: {
        padding: 30,
        alignItems: 'center',
    },
    promptPayBox: {
        borderWidth: 1.5,
        borderColor: '#003D6B',
        paddingHorizontal: 15,
        paddingVertical: 3,
        marginBottom: 25,
        borderRadius: 4,
    },
    ppImage: {
        width: 100,
        height: 35,
    },
    qrImage: {
        width: 220,
        height: 220,
        marginBottom: 25,
    },
    amountTextRed: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#E74C3C',
        marginBottom: 8,
    },
    subTextGrey: {
        fontSize: 18,
        color: '#444',
        fontWeight: '500',
    },
    bottomActions: {
        flexDirection: 'row',
        padding: 20,
        paddingBottom: 40,
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1,
        borderTopColor: '#ECF0F1',
        justifyContent: 'space-between',
    },
    saveBtn: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#3498DB',
        borderRadius: 10,
        paddingVertical: 12,
        alignItems: 'center',
        marginRight: 10,
    },
    saveBtnText: {
        color: '#3498DB',
        fontSize: 16,
        fontWeight: '600',
    },
    confirmBtn: {
        flex: 1,
        backgroundColor: '#3498DB',
        borderRadius: 10,
        paddingVertical: 12,
        alignItems: 'center',
        marginLeft: 10,
    },
    confirmBtnText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
});
