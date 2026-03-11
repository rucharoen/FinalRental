import rentalService from '@/services/rental.service';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

const EvidenceRecordScreen = () => {
    const router = useRouter();
    const { rentalId, action, source } = useLocalSearchParams();
    const [submitting, setSubmitting] = useState(false);
    const [image, setImage] = useState<any>(null);
    const [video, setVideo] = useState<any>(null);

    const handlePickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [16, 9],
            quality: 0.8,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
            setImage(result.assets[0]);
        }
    };

    const handlePickVideo = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Videos,
            allowsEditing: true,
            quality: 1,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
            setVideo(result.assets[0]);
        }
    };

    const handleSubmit = async () => {
        if (!image) {
            Alert.alert('แจ้งเตือน', 'กรุณาถ่ายรูปภาพสินค้าเพื่อเป็นหลักฐาน');
            return;
        }

        try {
            setSubmitting(true);

            // ในแอปจริงควรจะอัปโหลดรูปขึ้น Cloud Storage (เช่น Supabase) แล้วเอา URL มาใส่ใน proof_url
            // แต่สำหรับตัวอย่างนี้ เราจะอัปเดตสถานะทันทีตามที่ผู้ใช้ต้องการ

            let targetStatus = '';
            if (action === 'receive') {
                targetStatus = 'received';
            } else if (action === 'return') {
                targetStatus = 'returning';
            } else if (action === 'verify') {
                targetStatus = 'completed'; // For owner verifying the return
            } else {
                targetStatus = 'received';
            }

            await rentalService.updateRentalStatus(rentalId as string, {
                rentalId: rentalId as string,
                status: targetStatus,
                proof_url: image.uri // จำลองการส่ง URL
            });

            const returnPath = source === 'shop' ? '/(tabs)/profile/shop/rentals' : '/(tabs)/profile/bookings';

            Alert.alert('สำเร็จ', 'บันทึกหลักฐานเรียบร้อยแล้ว', [
                { text: 'ตกลง', onPress: () => router.push(returnPath) }
            ]);
        } catch (error: any) {
            console.error('Evidence Submit Error:', error);
            Alert.alert('เกิดข้อผิดพลาด', error.message || 'ไม่สามารถบันทึกข้อมูลได้');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />

            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={28} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>บันทึกหลักฐาน</Text>
            </View>

            <View style={styles.content}>
                <View style={styles.section}>
                    <Text style={styles.label}>ถ่ายรูปภาพสินค้า</Text>
                    <TouchableOpacity style={styles.box} onPress={handlePickImage} activeOpacity={0.7}>
                        {image ? (
                            <Image source={{ uri: image.uri }} style={styles.preview} />
                        ) : (
                            <View style={styles.placeholder}>
                                <Ionicons name="camera-outline" size={48} color="#000" />
                                <View style={styles.bracketTopLeft} />
                                <View style={styles.bracketTopRight} />
                                <View style={styles.bracketBottomLeft} />
                                <View style={styles.bracketBottomRight} />
                            </View>
                        )}
                    </TouchableOpacity>
                </View>

                <View style={styles.section}>
                    <Text style={styles.label}>ถ่ายวิดีโอ</Text>
                    <TouchableOpacity style={styles.box} onPress={handlePickVideo} activeOpacity={0.7}>
                        {video ? (
                            <View style={styles.placeholder}>
                                <Ionicons name="videocam" size={48} color="#3498DB" />
                                <Text style={{ marginTop: 8, color: '#3498DB' }}>บันทึกวิดีโอแล้ว</Text>
                            </View>
                        ) : (
                            <View style={styles.placeholder}>
                                <MaterialCommunityIcons name="video-outline" size={48} color="#000" />
                                <View style={styles.bracketTopLeft} />
                                <View style={styles.bracketTopRight} />
                                <View style={styles.bracketBottomLeft} />
                                <View style={styles.bracketBottomRight} />
                            </View>
                        )}
                    </TouchableOpacity>
                </View>

                <TouchableOpacity
                    style={[styles.confirmButton, submitting && { opacity: 0.7 }]}
                    onPress={handleSubmit}
                    disabled={submitting}
                >
                    {submitting ? (
                        <ActivityIndicator color="#FFF" />
                    ) : (
                        <Text style={styles.confirmText}>ยืนยัน</Text>
                    )}
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFF',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F3F4',
    },
    backButton: {
        padding: 5,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginLeft: 10,
        color: '#000',
    },
    content: {
        flex: 1,
        padding: 20,
        alignItems: 'center',
    },
    section: {
        width: '100%',
        marginBottom: 30,
    },
    label: {
        fontSize: 16,
        color: '#333',
        marginBottom: 10,
        fontWeight: '500',
    },
    box: {
        width: '100%',
        aspectRatio: 1.6,
        backgroundColor: '#E5E7E9',
        borderRadius: 4,
        overflow: 'hidden',
    },
    placeholder: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    preview: {
        width: '100%',
        height: '100%',
    },
    bracketTopLeft: {
        position: 'absolute',
        top: 20,
        left: 20,
        width: 20,
        height: 20,
        borderTopWidth: 2,
        borderLeftWidth: 2,
        borderColor: '#000',
    },
    bracketTopRight: {
        position: 'absolute',
        top: 20,
        right: 20,
        width: 20,
        height: 20,
        borderTopWidth: 2,
        borderRightWidth: 2,
        borderColor: '#000',
    },
    bracketBottomLeft: {
        position: 'absolute',
        bottom: 20,
        left: 20,
        width: 20,
        height: 20,
        borderBottomWidth: 2,
        borderLeftWidth: 2,
        borderColor: '#000',
    },
    bracketBottomRight: {
        position: 'absolute',
        bottom: 20,
        right: 20,
        width: 20,
        height: 20,
        borderBottomWidth: 2,
        borderRightWidth: 2,
        borderColor: '#000',
    },
    confirmButton: {
        width: '80%',
        height: 50,
        backgroundColor: '#3498DB',
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 40,
        shadowColor: '#3498DB',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    confirmText: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: '600',
    }
});

export default EvidenceRecordScreen;
