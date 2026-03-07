import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    SafeAreaView,
    Image,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    ScrollView,
    StatusBar
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons, Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import rentalService from '@/services/rental.service';
import { styles } from '@/styles/rental_list.styles';

const DamageReportScreen = () => {
    const router = useRouter();
    const { rentalId } = useLocalSearchParams();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [rental, setRental] = useState<any>(null);

    // Form State
    const [description, setDescription] = useState('');
    const [images, setImages] = useState<any[]>([]);

    useEffect(() => {
        // In a real app, we would fetch the specific rental details here
        // For now, we'll try to find it from the list or fetch if needed
        // Assuming we have an endpoint for this
        setLoading(false);
    }, [rentalId]);

    const handlePickImage = async () => {
        if (images.length >= 3) {
            Alert.alert('แจ้งเตือน', 'อัปโหลดรูปภาพได้สูงสุด 3 รูป');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.All,
            allowsEditing: true,
            quality: 0.8,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
            setImages([...images, result.assets[0]]);
        }
    };

    const handleSubmit = async () => {
        if (!description) {
            Alert.alert('กรุณากรอกรายละเอียดปัญหา');
            return;
        }

        try {
            setSubmitting(true);
            const formData = new FormData();
            formData.append('description', description);

            images.forEach((img, index) => {
                const fileName = img.uri.split('/').pop() || `damage_${index}.jpg`;
                const match = /\.(\w+)$/.exec(fileName);
                const type = match ? `image/${match[1]}` : `image/jpeg`;

                formData.append('images', {
                    uri: img.uri,
                    name: fileName,
                    type: type,
                } as any);
            });

            await rentalService.reportDamage(rentalId as string, formData);

            Alert.alert('สำเร็จ', 'แจ้งสินค้าเสียหายเรียบร้อยแล้ว', [
                { text: 'ตกลง', onPress: () => router.back() }
            ]);
        } catch (error: any) {
            console.error('Report Damage Error:', error);
            Alert.alert('เกิดข้อผิดพลาด', error.message || 'ไม่สามารถส่งข้อมูลได้');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', backgroundColor: '#FFF' }}>
                <ActivityIndicator size="large" color="#E74C3C" />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={28} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>แจ้งสินค้าเสียหาย</Text>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Product Section */}
                <View style={styles.reportCard}>
                    <Image
                        source={{ uri: 'https://via.placeholder.com/150' }}
                        style={styles.productImage}
                    />
                    <View style={styles.reportProductInfo}>
                        <Text style={styles.productTitle} numberOfLines={2}>ชื่อสินค้าตามรายการเช่า</Text>
                        <Text style={styles.priceText}>ราคา 50 ฿/วัน</Text>
                        <Text style={styles.deductionText}>จำนวนหักจากค่ามัดจำ{"\n"}-50 บาท</Text>
                    </View>
                </View>

                {/* Input Section */}
                <Text style={styles.sectionTitle}>รายละเอียดและปัญหา</Text>
                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.descriptionInput}
                        placeholder="กรอกรายละเอียดและปัญหา"
                        multiline
                        value={description}
                        onChangeText={setDescription}
                    />
                </View>

                {/* Evidence Section */}
                <Text style={styles.sectionTitle}>หลักฐานการเสียหาย</Text>
                <View style={styles.evidenceContainer}>
                    {[0, 1, 2].map((index) => (
                        <TouchableOpacity
                            key={index}
                            style={styles.evidenceBox}
                            onPress={handlePickImage}
                        >
                            {images[index] ? (
                                <Image source={{ uri: images[index].uri }} style={{ width: '100%', height: '100%', borderRadius: 10 }} />
                            ) : (
                                <>
                                    <Feather name={index === 2 ? "video" : "camera"} size={24} color="#BDC3C7" />
                                    <Text style={styles.evidenceLabel}>{index === 2 ? 'วิดีโอ' : 'รูปภาพ'}</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    ))}
                </View>

                <View style={{ height: 100 }} />
            </ScrollView>

            <TouchableOpacity
                style={[styles.submitButton, submitting && { opacity: 0.7 }]}
                onPress={handleSubmit}
                disabled={submitting}
            >
                {submitting ? <ActivityIndicator color="#FFF" /> : <Text style={styles.submitButtonText}>ยืนยัน</Text>}
            </TouchableOpacity>
        </SafeAreaView>
    );
};

export default DamageReportScreen;
