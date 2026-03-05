import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    SafeAreaView
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import styles from '../../../styles/rules.styles';

export default function RulesScreen() {
    const router = useRouter();

    const warningRules = [
        "1. หลีกเลี่ยงระบบส่วนกลาง, พยายามชักจูงกันไปโอนนอกระบบ",
        "2. ยกเลิกการจองบ่อยทำให้ผู้เช่าและผู้ปล่อยเช่าเสียเวลา",
        "3. ส่งของล่าช้าเป็นประจำโดยไม่มีเหตุผลสมควร",
        "4. ใช้คำหยาบคาย, ข่มขู่, คุกคาม ผ่านช่องทางติดต่อของแอพ"
    ];

    const suspensionRules = [
        "1. จงใจฉ้อโกง , ไม่ส่งคืนสินค้า, ส่งกล่องเปล่า, เอาของปลอมมาเปลี่ยน",
        "2. ปลอมแปลงเอกสาร, รูปบัตรประชาชนปลอม, สวมรอยคนอื่นในการยืนยันตัวตน",
        "3. สินค้าผิดกฎหมาย, เช่นสินค้าที่เป็นอาวุธมีคมที่ก่อให้เกิดอันตรายได้, สารเสพติด, หรือสินค้าที่มีเนื้อหาอนาจาร",
        "4. บัญชีม้า, สมัครบัญชีรัวๆเพื่อสแปมระบบ พวกนี้จะแบนทันทีที่ตรวจพบ"
    ];

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => router.push('/(tabs)/profile')}>
                    <Ionicons name="chevron-back" size={28} color="#000000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>กฎระเบียบ</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {/* Warning Card */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>ตักเตือน</Text>
                    <View style={styles.rulesList}>
                        {warningRules.map((rule, index) => (
                            <Text key={index} style={styles.ruleItem}>{rule}</Text>
                        ))}
                    </View>
                </View>

                {/* Suspension Card */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>ถูกระงับบัญชี</Text>
                    <View style={styles.rulesList}>
                        {suspensionRules.map((rule, index) => (
                            <Text key={index} style={styles.ruleItem}>{rule}</Text>
                        ))}
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
