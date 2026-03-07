import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    TextInput,
    Image,
    ScrollView,
    SafeAreaView,
    Alert,
    KeyboardAvoidingView,
    Platform
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import styles from '../../../styles/kyc.styles';
import authService from '../../../services/auth.service';
import { API_ENDPOINTS } from '../../../services/api';

export default function KYCScreen() {
    const router = useRouter();
    const [step, setStep] = useState(1);

    // Step 1 Data
    const [fullName, setFullName] = useState('');
    const [idNumber, setIdNumber] = useState('');
    const [expiryDate, setExpiryDate] = useState('');
    const [idImage, setIdImage] = useState<string | null>(null);

    // Step 2 Data
    const [selfieImage, setSelfieImage] = useState<string | null>(null);

    const pickImage = async (type: 'id' | 'selfie') => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('ขออภัย', 'เราต้องการสิทธิ์เข้าถึงกล้องเพื่อทำการยืนยันตัวตน');
            return;
        }

        const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: type === 'id' ? [16, 9] : [3, 4],
            quality: 0.7,
        });

        if (!result.canceled) {
            if (type === 'id') setIdImage(result.assets[0].uri);
            else setSelfieImage(result.assets[0].uri);
        }
    };

    const validateStep1 = () => {
        // ขั้นที่ 1: ตรวจสอบค่าว่าง
        if (!fullName || !idNumber || !expiryDate) {
            Alert.alert('แจ้งเตือน', 'กรุณากรอกข้อมูลให้ครบทุกช่อง');
            return false;
        }

        if (!idImage) {
            Alert.alert('แจ้งเตือน', 'กรุณาอัปโหลดรูปบัตรประชาชน');
            return false;
        }

        // ขั้นที่ 2: ตรวจสอบรูปแบบชื่อ–นามสกุล
        const nameRegex = /^[a-zA-Z\u0E00-\u0E7F ]+$/;
        if (!nameRegex.test(fullName) || /^\d+$/.test(fullName)) {
            Alert.alert(
                'แจ้งเตือน',
                '❗️ชื่อ–นามสกุลต้องเป็นภาษาไทยหรือภาษาอังกฤษ ไม่ใช้ตัวเลข อักขระพิเศษ หรืออิโมจิ'
            );
            return false;
        }

        // ขั้นที่ 3: ตรวจสอบเลขบัตร
        const idRegex = /^\d{13}$/;
        if (!idRegex.test(idNumber) || /^0+$/.test(idNumber)) {
            Alert.alert('แจ้งเตือน', '❗️เลขบัตรไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง');
            return false;
        }

        // ขั้นที่ 4: ตรวจสอบวันหมดอายุ
        const dateRegex = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
        const match = expiryDate.match(dateRegex);
        if (!match) {
            Alert.alert('แจ้งเตือน', '❗️วันหมดอายุไม่ถูกต้อง กรุณาใช้รูปแบบ วว/ดด/ปปปป');
            return false;
        }

        const day = parseInt(match[1]);
        const month = parseInt(match[2]) - 1;
        const year = parseInt(match[3]);
        const d = new Date(year, month, day);

        if (d.getFullYear() !== year || d.getMonth() !== month || d.getDate() !== day) {
            Alert.alert('แจ้งเตือน', '❗️วันหมดอายุไม่ถูกต้อง');
            return false;
        }

        if (d <= new Date()) {
            Alert.alert('แจ้งเตือน', '❗️วันหมดอายุไม่ถูกต้อง หรือบัตรหมดอายุแล้ว');
            return false;
        }

        return true;
    };

    const handleNext = () => {
        if (step === 1) {
            if (validateStep1()) {
                setStep(2);
            }
        } else {
            if (!selfieImage) {
                Alert.alert('แจ้งเตือน', 'กรุณาถ่ายรูปใบหน้าคู่กับบัตรประชาชน');
                return;
            }
            handleSubmit();
        }
    };

    const handleSubmit = async () => {
        try {
            // เตรียมข้อมูลสำหรับส่งแบบ Multipart (ปรับให้ตรงกับ Backend และ Admin)
            const formData = new FormData();
            formData.append('id_card_number', idNumber);
            formData.append('full_name', fullName);           // เพิ่มกลับเข้าไป
            formData.append('expiry_date', expiryDate);        // เพิ่มกลับเข้าไป

            console.log('--- KYC DEBUG ---');
            console.log('Target URL:', `${API_ENDPOINTS.BASE_URL}${API_ENDPOINTS.UPLOAD_KYC}`);
            console.log('ID Number:', idNumber);

            if (idImage) {
                const idFileName = idImage.split('/').pop() || 'id_card.jpg';
                const idMatch = /\.(\w+)$/.exec(idFileName);
                const idType = idMatch ? `image/${idMatch[1].toLowerCase()}` : 'image/jpeg';

                formData.append('id_card_image', {
                    uri: idImage,
                    name: idFileName,
                    type: idType,
                } as any);
            }

            if (selfieImage) {
                const selfieFileName = selfieImage.split('/').pop() || 'selfie.jpg';
                const selfieMatch = /\.(\w+)$/.exec(selfieFileName);
                const selfieType = selfieMatch ? `image/${selfieMatch[1].toLowerCase()}` : 'image/jpeg';

                formData.append('face_image', {
                    uri: selfieImage,
                    name: selfieFileName,
                    type: selfieType,
                } as any);
            }

            // ส่งข้อมูลไปยัง Backend
            await authService.uploadKYC(formData);

            Alert.alert(
                'ส่งข้อมูลเรียบร้อย',
                'ข้อมูลของคุณได้รับการบันทึกแล้ว ระบบจะอัปเดตสถานะการยืนยันตัวตนของคุณในลำดับถัดไป',
                [{ text: 'ตกลง', onPress: () => router.push('/(tabs)/profile') }]
            );
        } catch (error: any) {
            console.error('KYC Submit Error:', error);
            const errorMsg = error?.message || 'ไม่สามารถส่งข้อมูลได้ กรุณาลองใหม่อีกครั้ง';
            Alert.alert('เกิดข้อผิดพลาด', errorMsg);
        }
    };

    const renderStep1 = () => (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            <Text style={styles.label}>อัปโหลดรูปบัตรประชาชน</Text>

            <TouchableOpacity
                style={styles.uploadPlaceholder}
                onPress={() => pickImage('id')}
            >
                <View style={[styles.cornerMarker, styles.topLeft]} />
                <View style={[styles.cornerMarker, styles.topRight]} />
                <View style={[styles.cornerMarker, styles.bottomLeft]} />
                <View style={[styles.cornerMarker, styles.bottomRight]} />

                {idImage ? (
                    <Image source={{ uri: idImage }} style={styles.previewImage} />
                ) : (
                    <Ionicons name="camera-outline" size={50} color="#7F8C8D" />
                )}
            </TouchableOpacity>

            <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>ชื่อ - นามสกุล</Text>
                <TextInput
                    style={styles.input}
                    value={fullName}
                    onChangeText={setFullName}
                    placeholder="กรอกชื่อ-นามสกุล"
                    placeholderTextColor="#BDC3C7"
                    autoCapitalize="words"
                />
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>เลขบัตร</Text>
                <TextInput
                    style={styles.input}
                    value={idNumber}
                    onChangeText={setIdNumber}
                    placeholder="กรอกเลขบัตรประชาชน 13 หลัก"
                    keyboardType="numeric"
                    maxLength={13}
                    placeholderTextColor="#BDC3C7"
                />
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>วันหมดอายุ</Text>
                <TextInput
                    style={styles.input}
                    value={expiryDate}
                    onChangeText={setExpiryDate}
                    placeholder="วว/ดด/ปปปป"
                    placeholderTextColor="#BDC3C7"
                />
            </View>
        </ScrollView>
    );

    const renderStep2 = () => (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            <Text style={styles.label}>ถ่ายใบหน้าคู่กับบัตรประชาชน</Text>

            <TouchableOpacity
                style={[styles.uploadPlaceholder, styles.uploadPlaceholderVertical]}
                onPress={() => pickImage('selfie')}
            >
                <View style={[styles.cornerMarker, styles.topLeft]} />
                <View style={[styles.cornerMarker, styles.topRight]} />
                <View style={[styles.cornerMarker, styles.bottomLeft]} />
                <View style={[styles.cornerMarker, styles.bottomRight]} />

                {selfieImage ? (
                    <Image source={{ uri: selfieImage }} style={styles.previewImage} />
                ) : (
                    <Ionicons name="camera-outline" size={50} color="#7F8C8D" />
                )}
            </TouchableOpacity>

            <View style={styles.warningSection}>
                <Text style={styles.instructionText}>
                    เพื่อความรวดเร็วในการตรวจสอบ{"\n"}
                    กรุณาถ่ายภาพในที่ที่มีแสงสว่างและเห็นใบหน้าชัดเจน
                </Text>
                <Text style={[styles.instructionText, { marginTop: 10, fontWeight: '500' }]}>
                    กรุณาตรวจสอบความถูกต้องของข้อมูล
                </Text>
            </View>
        </ScrollView>
    );

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => step === 2 ? setStep(1) : router.back()}
                    >
                        <Ionicons name="chevron-back" size={28} color="#000000" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>ยืนยันตัวตน</Text>
                </View>

                {/* Progress Bar */}
                <View style={styles.progressContainer}>
                    <View style={[styles.stepCircle, step >= 1 && styles.stepCircleActive]}>
                        <Text style={styles.stepText}>1</Text>
                    </View>
                    <View style={styles.stepLine} />
                    <View style={[styles.stepCircle, step >= 2 && styles.stepCircleActive]}>
                        <Text style={styles.stepText}>2</Text>
                    </View>
                </View>

                {step === 1 ? renderStep1() : renderStep2()}

                {/* Footer */}
                <View style={styles.footer}>
                    <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
                        <Text style={styles.buttonText}>ถัดไป</Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
