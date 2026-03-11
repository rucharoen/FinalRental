import rentalService from '@/services/rental.service';
import { styles } from '@/styles/rental_list.styles';
import { Feather, Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    SafeAreaView,
    ScrollView,
    StatusBar,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

const DamageReportScreen = () => {
    const router = useRouter();
    const { rentalId } = useLocalSearchParams();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [rental, setRental] = useState<any>(null);

    // Form State
    const [description, setDescription] = useState('');
    const [images, setImages] = useState<any[]>([]); // Slots 0 and 1
    const [video, setVideo] = useState<any>(null); // Slot 2

    useEffect(() => {
        fetchRentalDetails();
    }, [rentalId]);

    const fetchRentalDetails = async () => {
        try {
            setLoading(true);
            if (rentalId) {
                const data = await rentalService.getRentalById(rentalId as string);
                setRental(data);
            }
        } catch (error) {
            console.error('Fetch Rental Error:', error);
            Alert.alert('ข้อผิดพลาด', 'ไม่สามารถดึงข้อมูลรายการเช่าได้');
        } finally {
            setLoading(false);
        }
    };

    const getImageUrl = (imgData: any) => {
        if (!imgData) return 'https://via.placeholder.com/150';
        try {
            const parsed = typeof imgData === 'string' ? JSON.parse(imgData) : imgData;
            if (Array.isArray(parsed) && parsed.length > 0) {
                const path = parsed[0];
                if (!path) return 'https://via.placeholder.com/150';
                if (path.startsWith('http')) return path;

                const baseUrl = 'https://finalrental.onrender.com';
                const normalizedPath = path.startsWith('/') ? path : `/${path}`;
                return `${baseUrl}${normalizedPath}`;
            }
        } catch (e) {
            console.error('Image parse error:', e);
        }
        return 'https://via.placeholder.com/150';
    };

    const handlePickImage = async (index: number) => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 0.8,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
            const newImages = [...images];
            newImages[index] = result.assets[0];
            setImages(newImages);
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

    const removeImage = (index: number) => {
        const newImages = [...images];
        newImages[index] = null;
        setImages(newImages);
    };

    const removeVideo = () => {
        setVideo(null);
    };

    const handleSubmit = async () => {
        if (!description && images.filter(img => img).length === 0 && !video) {
            Alert.alert('แจ้งเตือน', 'กรุณากรอกรายละเอียดหรือแนบหลักฐานความเสียหาย');
            return;
        }

        try {
            setSubmitting(true);
            const formData = new FormData();
            formData.append('description', description || "แจ้งสินค้าเสียหาย");

            // Append images
            images.forEach((img, idx) => {
                if (img) {
                    const uri = img.uri;
                    const fileName = uri.split('/').pop() || `damage_img_${idx}.jpg`;
                    const match = /\.(\w+)$/.exec(fileName);
                    const type = match ? `image/${match[1]}` : `image/jpeg`;

                    formData.append('images', {
                        uri: uri,
                        name: fileName,
                        type: type,
                    } as any);
                }
            });

            // Append video
            if (video) {
                const uri = video.uri;
                const fileName = uri.split('/').pop() || `damage_video.mp4`;
                const match = /\.(\w+)$/.exec(fileName);
                const type = match ? `video/${match[1]}` : `video/mp4`;

                formData.append('images', {
                    uri: uri,
                    name: fileName,
                    type: type,
                } as any);
            }

            await rentalService.reportDamage(rentalId as string, formData);

            Alert.alert('สำเร็จ', 'แจ้งสินค้าเสียหายเรียบร้อยแล้ว เจ้าหน้าที่จะดำเนินการตรวจสอบข้อมูล', [
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

    const pricePerDay = parseFloat(rental?.price_per_day || 0);
    const depositFee = parseFloat(rental?.deposit_fee || 0);

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={28} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>แจ้งสินค้าเสียหาย</Text>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
                {/* Product Section */}
                <View style={[styles.reportCard, { backgroundColor: '#FFF', borderRadius: 15, margin: 16, padding: 12, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2 }]}>
                    <Image
                        source={{ uri: getImageUrl(rental?.images) }}
                        style={[styles.productImage, { width: 80, height: 80, borderRadius: 10 }]}
                    />
                    <View style={styles.reportProductInfo}>
                        <Text style={[styles.productTitle, { fontSize: 16, fontWeight: 'bold' }]} numberOfLines={2}>{rental?.product_name || 'ไม่ระบุชื่อสินค้า'}</Text>
                        <Text style={[styles.priceText, { color: '#E74C3C', marginTop: 4 }]}>ราคา {pricePerDay.toLocaleString()} ฿/วัน</Text>
                        
                        <View style={{ marginTop: 8 }}>
                           <Text style={{ fontSize: 12, color: '#E74C3C', fontWeight: 'bold' }}>จำนวนหักจากค่ามัดจำ</Text>
                           <Text style={{ fontSize: 18, color: '#E74C3C', fontWeight: 'bold' }}>-{pricePerDay.toLocaleString()} บาท</Text>
                        </View>
                    </View>
                </View>

                {/* Input Section */}
                <View style={{ paddingHorizontal: 16 }}>
                    <Text style={[styles.sectionTitle, { fontSize: 16, fontWeight: 'bold', marginBottom: 8 }]}>รายละเอียดและปัญหา</Text>
                    <View style={[styles.inputContainer, { backgroundColor: '#FFF', borderRadius: 10, borderWidth: 1, borderColor: '#E0E0E0', padding: 10 }]}>
                        <TextInput
                            style={[styles.descriptionInput, { height: 60, textAlignVertical: 'top' }]}
                            placeholder="กรอกรายละเอียดและปัญหา"
                            multiline
                            value={description}
                            onChangeText={setDescription}
                        />
                    </View>
                </View>

                {/* Evidence Section */}
                <View style={{ paddingHorizontal: 16, marginTop: 20 }}>
                    <Text style={[styles.sectionTitle, { fontSize: 16, fontWeight: 'bold', marginBottom: 8 }]}>หลักฐานการเสียหาย</Text>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        {/* Image Slot 1 */}
                        <TouchableOpacity
                            style={[styles.evidenceBox, { width: '31%', aspectRatio: 1, backgroundColor: '#FFF', borderRadius: 10, borderWidth: 1, borderStyle: 'dashed', borderColor: '#BDC3C7', justifyContent: 'center', alignItems: 'center' }]}
                            onPress={() => handlePickImage(0)}
                        >
                            {images[0] ? (
                                <View style={{ width: '100%', height: '100%' }}>
                                    <Image source={{ uri: images[0].uri }} style={{ width: '100%', height: '100%', borderRadius: 10 }} />
                                    <TouchableOpacity
                                        style={{ position: 'absolute', top: -5, right: -5, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 10 }}
                                        onPress={() => removeImage(0)}
                                    >
                                        <Ionicons name="close-circle" size={20} color="#FFF" />
                                    </TouchableOpacity>
                                </View>
                            ) : (
                                <>
                                    <Feather name="camera" size={24} color="#BDC3C7" />
                                    <Text style={{ fontSize: 10, color: '#BDC3C7', marginTop: 4 }}>รูปภาพ</Text>
                                </>
                            )}
                        </TouchableOpacity>

                        {/* Image Slot 2 */}
                        <TouchableOpacity
                            style={[styles.evidenceBox, { width: '31%', aspectRatio: 1, backgroundColor: '#FFF', borderRadius: 10, borderWidth: 1, borderStyle: 'dashed', borderColor: '#BDC3C7', justifyContent: 'center', alignItems: 'center' }]}
                            onPress={() => handlePickImage(1)}
                        >
                            {images[1] ? (
                                <View style={{ width: '100%', height: '100%' }}>
                                    <Image source={{ uri: images[1].uri }} style={{ width: '100%', height: '100%', borderRadius: 10 }} />
                                    <TouchableOpacity
                                        style={{ position: 'absolute', top: -5, right: -5, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 10 }}
                                        onPress={() => removeImage(1)}
                                    >
                                        <Ionicons name="close-circle" size={20} color="#FFF" />
                                    </TouchableOpacity>
                                </View>
                            ) : (
                                <>
                                    <Feather name="camera" size={24} color="#BDC3C7" />
                                    <Text style={{ fontSize: 10, color: '#BDC3C7', marginTop: 4 }}>รูปภาพ</Text>
                                </>
                            )}
                        </TouchableOpacity>

                        {/* Video Slot */}
                        <TouchableOpacity
                            style={[styles.evidenceBox, { width: '31%', aspectRatio: 1, backgroundColor: '#FFF', borderRadius: 10, borderWidth: 1, borderStyle: 'dashed', borderColor: '#BDC3C7', justifyContent: 'center', alignItems: 'center' }]}
                            onPress={handlePickVideo}
                        >
                            {video ? (
                                <View style={{ width: '100%', height: '100%' }}>
                                    {/* Video asset doesn't easily show a preview without components, showing icon instead */}
                                    <View style={{ width: '100%', height: '100%', backgroundColor: '#F0F0F0', borderRadius: 10, justifyContent: 'center', alignItems: 'center' }}>
                                        <Feather name="video" size={30} color="#3498DB" />
                                        <Text style={{ fontSize: 10, color: '#3498DB', marginTop: 4 }}>แนบวิดีโอแล้ว</Text>
                                    </View>
                                    <TouchableOpacity
                                        style={{ position: 'absolute', top: -5, right: -5, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 10 }}
                                        onPress={removeVideo}
                                    >
                                        <Ionicons name="close-circle" size={20} color="#FFF" />
                                    </TouchableOpacity>
                                </View>
                            ) : (
                                <>
                                    <Feather name="video" size={24} color="#BDC3C7" />
                                    <Text style={{ fontSize: 10, color: '#BDC3C7', marginTop: 4 }}>วิดีโอ</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={{ padding: 16 }}>
                    <Text style={{ color: '#7F8C8D', fontSize: 12, lineHeight: 18 }}>
                        * หมายเหตุ: การแจ้งสินค้าเสียหายอาจมีผลต่อการคืนเงินมัดจำ เจ้าหน้าที่จะประเมินความเสียหายตามหลักฐานที่แนบมา
                    </Text>
                </View>
            </ScrollView>

            <View style={{ position: 'absolute', bottom: 30, left: 16, right: 16 }}>
                <TouchableOpacity
                    style={[styles.submitButton, { backgroundColor: '#E74C3C', borderRadius: 15, height: 55, justifyContent: 'center', alignItems: 'center' }, (submitting || (!description && images.filter(i => i).length === 0 && !video)) && { opacity: 0.5 }]}
                    onPress={handleSubmit}
                    disabled={submitting || (!description && images.filter(i => i).length === 0 && !video)}
                >
                    {submitting ? <ActivityIndicator color="#FFF" /> : <Text style={{ color: '#FFF', fontSize: 20, fontWeight: 'bold' }}>ยืนยัน</Text>}
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

export default DamageReportScreen;
