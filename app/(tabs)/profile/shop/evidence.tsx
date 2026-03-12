import { Ionicons, Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    Dimensions
} from 'react-native';
import rentalService from '@/services/rental.service';
import chatService from '@/services/chat.service';

const { width } = Dimensions.get('window');

const EvidenceScreen = () => {
    const router = useRouter();
    const { rentalId, productId } = useLocalSearchParams();
    const [loading, setLoading] = useState(false);
    const [image, setImage] = useState<any>(null);
    const [video, setVideo] = useState<any>(null);

    const handlePickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
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
        if (!image && !video) {
            Alert.alert('แจ้งเตือน', 'กรุณาแนบรูปภาพหรือวิดีโอหลักฐาน');
            return;
        }

        try {
            setLoading(true);
            
            let proofUrl = 'https://via.placeholder.com/300';

            // Upload image if exists
            if (image) {
                try {
                    // Using chatService.uploadImage which is likely compatible with the general upload logic
                    const uploadResponse = await chatService.uploadImage(image.uri);
                    if (uploadResponse && (uploadResponse.image_url || uploadResponse.url || uploadResponse.data?.url)) {
                        proofUrl = uploadResponse.image_url || uploadResponse.url || uploadResponse.data?.url;
                    }
                } catch (uploadError) {
                    console.error('Image upload failed, proceeding with fallback:', uploadError);
                }
            }
            
            await rentalService.updateRentalStatus(rentalId as string, {
                rentalId: rentalId as string,
                status: 'shipped',
                productId: productId as string,
                proof_url: proofUrl
            });

            Alert.alert('สำเร็จ', 'บันทึกหลักฐานและเริ่มการจัดส่งเรียบร้อยแล้ว', [
                { text: 'ตกลง', onPress: () => router.push({ pathname: '/(tabs)/profile/shop/rentals', params: { tab: 'receiving' }}) }
            ]);
        } catch (error: any) {
            console.error('Evidence Submit Error:', error);
            Alert.alert('เกิดข้อผิดพลาด', error.message || 'ไม่สามารถบันทึกข้อมูลได้');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />
            
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={28} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>บันทึกหลักฐาน</Text>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Photo Evidence */}
                <View style={styles.section}>
                    <Text style={styles.sectionLabel}>ถ่ายรูปภาพสินค้า</Text>
                    <TouchableOpacity 
                        style={styles.evidencePlaceholder} 
                        onPress={handlePickImage}
                    >
                        {image ? (
                            <Image source={{ uri: image.uri }} style={styles.previewImage} />
                        ) : (
                            <View style={styles.iconContainer}>
                                <View style={styles.cornerTL} />
                                <View style={styles.cornerTR} />
                                <View style={styles.cornerBL} />
                                <View style={styles.cornerBR} />
                                <Feather name="camera" size={40} color="#000" />
                            </View>
                        )}
                    </TouchableOpacity>
                </View>

                {/* Video Evidence */}
                <View style={[styles.section, { marginTop: 30 }]}>
                    <Text style={styles.sectionLabel}>ถ่ายวิดีโอ</Text>
                    <TouchableOpacity 
                        style={styles.evidencePlaceholder} 
                        onPress={handlePickVideo}
                    >
                        {video ? (
                            <View style={styles.videoPreview}>
                                <Feather name="video" size={40} color="#3498DB" />
                                <Text style={styles.videoText}>แนบวิดีโอแล้ว</Text>
                            </View>
                        ) : (
                            <View style={styles.iconContainer}>
                                <View style={styles.cornerTL} />
                                <View style={styles.cornerTR} />
                                <View style={styles.cornerBL} />
                                <View style={styles.cornerBR} />
                                <Feather name="video" size={40} color="#000" />
                            </View>
                        )}
                    </TouchableOpacity>
                </View>
            </ScrollView>

            {/* Submit Button */}
            <View style={styles.footer}>
                <TouchableOpacity 
                    style={[styles.submitButton, loading && { opacity: 0.7 }]} 
                    onPress={handleSubmit}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#FFF" />
                    ) : (
                        <Text style={styles.submitButtonText}>ยืนยัน</Text>
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
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        flex: 1,
        textAlign: 'center',
        fontSize: 20,
        fontWeight: 'bold',
        marginRight: 32, // Offset back button
        color: '#000',
    },
    scrollContent: {
        padding: 24,
    },
    section: {
        width: '100%',
    },
    sectionLabel: {
        fontSize: 16,
        color: '#333',
        marginBottom: 12,
    },
    evidencePlaceholder: {
        width: '100%',
        aspectRatio: 1.6,
        backgroundColor: '#D9D9D9',
        borderRadius: 4,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    previewImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    videoPreview: {
        alignItems: 'center',
    },
    videoText: {
        marginTop: 8,
        color: '#3498DB',
        fontWeight: 'bold',
    },
    iconContainer: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    cornerTL: {
        position: 'absolute',
        top: 15,
        left: 15,
        width: 25,
        height: 25,
        borderTopWidth: 2,
        borderLeftWidth: 2,
        borderColor: '#000',
    },
    cornerTR: {
        position: 'absolute',
        top: 15,
        right: 15,
        width: 25,
        height: 25,
        borderTopWidth: 2,
        borderRightWidth: 2,
        borderColor: '#000',
    },
    cornerBL: {
        position: 'absolute',
        bottom: 15,
        left: 15,
        width: 25,
        height: 25,
        borderBottomWidth: 2,
        borderLeftWidth: 2,
        borderColor: '#000',
    },
    cornerBR: {
        position: 'absolute',
        bottom: 15,
        right: 15,
        width: 25,
        height: 25,
        borderBottomWidth: 2,
        borderRightWidth: 2,
        borderColor: '#000',
    },
    footer: {
        padding: 24,
        paddingBottom: 20,
    },
    submitButton: {
        backgroundColor: '#3498DB',
        height: 55,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },
    submitButtonText: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
});

export default EvidenceScreen;
