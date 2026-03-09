import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
    Alert,
    Animated,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import AuthService from "../services/auth.service";

export default function ForgotPasswordScreen() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    // Form Fields
    const [fullName, setFullName] = useState("");
    const [idCard, setIdCard] = useState("");
    const [identifier, setIdentifier] = useState(""); // Email or Phone

    // Error States
    const [fullNameError, setFullNameError] = useState("");
    const [idCardError, setIdCardError] = useState("");
    const [identifierError, setIdentifierError] = useState("");

    const [fadeAnim] = useState(new Animated.Value(0));
    const [slideAnim] = useState(new Animated.Value(20));

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 500,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 500,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    const validateForm = () => {
        let isValid = true;

        setFullNameError("");
        setIdCardError("");
        setIdentifierError("");

        if (!fullName.trim()) {
            setFullNameError("กรุณากรอก ชื่อ-นามสกุลให้ถูกต้อง");
            isValid = false;
        }

        if (!idCard.trim() || idCard.length !== 13) {
            setIdCardError("กรุณากรอก เลขบัตรประชาชนให้ถูกต้อง");
            isValid = false;
        }

        if (!identifier.trim()) {
            setIdentifierError("กรุณากรอก อีเมลหรือเบอร์โทรศัพท์ให้ถูกต้อง");
            isValid = false;
        }

        return isValid;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        setLoading(true);
        try {
            await AuthService.requestPasswordReset({
                full_name: fullName,
                id_card: idCard,
                identifier: identifier,
            });

            Alert.alert(
                "ส่งคำขอสำเร็จ",
                "ระบบได้รับการขอเปลี่ยนรหัสผ่านของคุณแล้ว แอดมินจะตรวจสอบและติดต่อคุณผ่านอีเมลหรือเบอร์โทรศัพท์ที่แจ้งไว้",
                [{ text: "ตกลง", onPress: () => router.replace("/login") }]
            );
        } catch (error: any) {
            Alert.alert(
                "ข้อผิดพลาด",
                error?.message || "ไม่สามารถส่งคำขอได้ในขณะนี้ กรุณาลองใหม่อีกครั้ง"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.flex}
            >
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => {
                        if (router.canGoBack()) {
                            router.back();
                        } else {
                            router.replace("/");
                        }
                    }} style={styles.backButton}>
                        <Ionicons name="chevron-back" size={28} color="#1a1a1a" />
                    </TouchableOpacity>
                </View>

                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    <Text style={styles.title}>รีเซ็ทรหัสผ่าน</Text>

                    <Animated.View style={[
                        styles.animatedContainer,
                        {
                            opacity: fadeAnim,
                            transform: [{ translateY: slideAnim }]
                        }
                    ]}>
                        <View style={styles.content}>
                            <View style={styles.inputGroup}>
                                <TextInput
                                    style={[styles.input, fullNameError ? styles.inputError : null]}
                                    placeholder="ชื่อ-นามสกุล"
                                    placeholderTextColor="#9ca3af"
                                    value={fullName}
                                    onChangeText={(v) => {
                                        setFullName(v);
                                        if (fullNameError) setFullNameError("");
                                    }}
                                />
                                {fullNameError ? <Text style={styles.errorText}>{fullNameError}</Text> : null}
                            </View>

                            <View style={styles.inputGroup}>
                                <TextInput
                                    style={[styles.input, idCardError ? styles.inputError : null]}
                                    placeholder="เลขบัตรประชาชน"
                                    placeholderTextColor="#9ca3af"
                                    value={idCard}
                                    onChangeText={(text) => {
                                        const cleaned = text.replace(/[^0-9]/g, "");
                                        setIdCard(cleaned);
                                        if (idCardError) setIdCardError("");
                                    }}
                                    keyboardType="numeric"
                                    maxLength={13}
                                />
                                {idCardError ? <Text style={styles.errorText}>{idCardError}</Text> : null}
                            </View>

                            <View style={styles.inputGroup}>
                                <TextInput
                                    style={[styles.input, identifierError ? styles.inputError : null]}
                                    placeholder="อีเมลหรือเบอร์โทรศัพท์"
                                    placeholderTextColor="#9ca3af"
                                    value={identifier}
                                    onChangeText={(v) => {
                                        setIdentifier(v);
                                        if (identifierError) setIdentifierError("");
                                    }}
                                    autoCapitalize="none"
                                    keyboardType="email-address"
                                />
                                {identifierError ? <Text style={styles.errorText}>{identifierError}</Text> : null}
                            </View>

                            <TouchableOpacity
                                style={[styles.mainButton, loading && styles.disabledButton]}
                                onPress={handleSubmit}
                                disabled={loading}
                                activeOpacity={0.8}
                            >
                                <Text style={styles.mainButtonText}>
                                    {loading ? "กำลังส่งคำขอ..." : "รีเซ็ทรหัสผ่าน"}
                                </Text>
                            </TouchableOpacity>

                            <View style={styles.infoContainer}>
                                <Ionicons name="information-circle-outline" size={20} color="#666" />
                                <Text style={styles.infoText}>
                                    เมื่อคุณส่งคำขอ แอดมินจะดำเนินการตรวจสอบข้อมูลและทำการรีเซ็ทรหัสผ่านให้คุณในเร็วๆ นี้
                                </Text>
                            </View>
                        </View>
                    </Animated.View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FFFFFF",
    },
    flex: {
        flex: 1,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        height: 56,
        marginTop: Platform.OS === 'android' ? 10 : 0,
    },
    backButton: {
        padding: 8,
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 24,
        paddingBottom: 40,
    },
    title: {
        fontSize: 32,
        fontWeight: "600",
        color: "#111827",
        textAlign: "center",
        marginTop: 20,
        marginBottom: 48,
        letterSpacing: -0.5,
    },
    animatedContainer: {
        flex: 1,
    },
    content: {
        width: "100%",
    },
    inputGroup: {
        marginBottom: 20,
    },
    input: {
        width: "100%",
        height: 58,
        borderWidth: 1.5,
        borderColor: "#e5e7eb",
        borderRadius: 12,
        paddingHorizontal: 16,
        fontSize: 16,
        color: "#111827",
        backgroundColor: "#f9fafb",
    },
    inputError: {
        borderColor: "#ef4444",
        backgroundColor: "#fef2f2",
    },
    errorText: {
        color: "#dc2626",
        fontSize: 13,
        marginTop: 6,
        marginLeft: 4,
        fontWeight: "500",
    },
    mainButton: {
        backgroundColor: "#3498db",
        height: 60,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
        marginTop: 12,
        shadowColor: "#3498db",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    disabledButton: {
        backgroundColor: "#93c5fd",
        shadowOpacity: 0,
        elevation: 0,
    },
    mainButtonText: {
        color: "#FFFFFF",
        fontSize: 18,
        fontWeight: "600",
        letterSpacing: 0.2,
    },
    infoContainer: {
        flexDirection: "row",
        marginTop: 30,
        padding: 16,
        backgroundColor: "#f8fafc",
        borderRadius: 12,
        alignItems: "flex-start",
    },
    infoText: {
        flex: 1,
        fontSize: 14,
        color: "#64748b",
        lineHeight: 20,
        marginLeft: 10,
    },
});
