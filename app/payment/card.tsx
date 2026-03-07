import React, { useState } from 'react';
import {
    View,
    Text,
    SafeAreaView,
    TouchableOpacity,
    TextInput,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    Alert,
    ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';

export default function CreditCardPaymentScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const { amount } = params;

    const [cardName, setCardName] = useState('');
    const [cardNumber, setCardNumber] = useState('');
    const [expiry, setExpiry] = useState('');
    const [cvv, setCvv] = useState('');

    const handleConfirm = () => {
        if (!cardName || !cardNumber || !expiry || !cvv) {
            Alert.alert('แจ้งเตือน', 'กรุณากรอกข้อมูลบัตรให้ครบถ้วน');
            return;
        }

        // Simulate payment process
        Alert.alert('สำเร็จ', 'ดำเนินการจองและชำระเงินเรียบร้อยแล้ว', [
            { text: 'ดูรายการเช่าของฉัน', onPress: () => router.push('/(tabs)/profile/bookings') }
        ]);
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <Ionicons name="chevron-back" size={28} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>การชำระเงิน</Text>
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.content}>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>ชื่อบนบัตร</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="เช่น MR. RUCHAREON"
                            value={cardName}
                            onChangeText={setCardName}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>หมายเลขบัตรเครดิต/บัตรเดบิต</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="xxxx xxxx xxxx xxxx"
                            keyboardType="numeric"
                            maxLength={16}
                            value={cardNumber}
                            onChangeText={setCardNumber}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>วันหมดอายุ (ดด/ปป)</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="MM/YY"
                            maxLength={5}
                            value={expiry}
                            onChangeText={setExpiry}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>รหัส CVV/CVC</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="xxx"
                            keyboardType="numeric"
                            secureTextEntry
                            maxLength={3}
                            value={cvv}
                            onChangeText={setCvv}
                        />
                    </View>

                    <View style={styles.amountBox}>
                        <Text style={styles.amountLabel}>ยอดชำระสุทธิ</Text>
                        <Text style={styles.amountValue}>{Number(amount).toLocaleString()} ฿</Text>
                    </View>

                    <TouchableOpacity style={styles.submitButton} onPress={handleConfirm}>
                        <Text style={styles.submitButtonText}>ยืนยันบัตร</Text>
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>
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
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    backButton: {
        padding: 5,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '500',
        marginLeft: 15,
    },
    content: {
        padding: 25,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        color: '#000',
        marginBottom: 10,
    },
    input: {
        borderWidth: 1,
        borderColor: '#333',
        borderRadius: 8,
        paddingHorizontal: 15,
        paddingVertical: 12,
        fontSize: 16,
    },
    amountBox: {
        marginTop: 20,
        padding: 20,
        backgroundColor: '#F8F9FA',
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 30,
    },
    amountLabel: {
        fontSize: 14,
        color: '#7F8C8D',
        marginBottom: 5,
    },
    amountValue: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#E74C3C',
    },
    submitButton: {
        backgroundColor: '#3498DB',
        borderRadius: 10,
        paddingVertical: 15,
        alignItems: 'center',
        marginTop: 10,
    },
    submitButtonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
});
