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

    // Flow Control
    const [step, setStep] = useState(1); // 1: Verify, 2: New Password
    const [resetToken, setResetToken] = useState("");

    // Form Fields (Step 1)
    const [fullName, setFullName] = useState("");
    const [idCard, setIdCard] = useState("");
    const [identifier, setIdentifier] = useState(""); // Email or Phone

    // Form Fields (Step 2)
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Error States
    const [fullNameError, setFullNameError] = useState("");
    const [idCardError, setIdCardError] = useState("");
    const [identifierError, setIdentifierError] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [passwordSuggestion, setPasswordSuggestion] = useState("");
    const [confirmPasswordError, setConfirmPasswordError] = useState("");

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

    const validateFullName = (name: string) => {
        if (name.trim() === "") {
            setFullNameError("❗️กรุณาป้อนชื่อของคุณ");
            return false;
        }
        if (/^\d+$/.test(name)) {
            setFullNameError("❗️ชื่อ–นามสกุลต้องเป็นตัวอักษร ไม่สามารถเป็นตัวเลขได้");
            return false;
        }
        const specialChars = /[@#$%^&*()_+=\!\?\/\\|<>]/;
        if (specialChars.test(name)) {
            setFullNameError("❗️ชื่อ–นามสกุลไม่สามารถใช้อักขระพิเศษได้");
            return false;
        }
        const emojiRegex = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;
        if (emojiRegex.test(name)) {
            setFullNameError("❗️ชื่อ–นามสกุลไม่สามารถใช้อิโมจิได้");
            return false;
        }
        const validChars = /^[a-zA-Z\u0e00-\u0e7f\s]+$/;
        if (!validChars.test(name)) {
            setFullNameError("❗️กรุณากรอกชื่อ–นามสกุลเป็นภาษาไทยหรือภาษาอังกฤษเท่านั้น");
            return false;
        }
        setFullNameError("");
        return true;
    };

    const validateIdCard = (id: string) => {
        if (!id.trim() || id.length !== 13) {
            setIdCardError("❗️กรุณากรอกเลขบัตรประชาชนให้ครบ 13 หลัก");
            return false;
        }
        setIdCardError("");
        return true;
    };

    const validateIdentifier = (text: string) => {
        if (!text.trim()) {
            setIdentifierError("❗️กรุณาป้อนอีเมลหรือเบอร์โทรศัพท์");
            return false;
        }
        setIdentifierError("");
        return true;
    };

    const validatePassword = (pass: string) => {
        if (pass.trim() === "") {
            setPasswordError("❗️กรุณาป้อนรหัสผ่าน");
            return false;
        }
        if (pass.length < 8) {
            setPasswordError("❗️รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษร");
            return false;
        }
        if (/[\u0e00-\u0e7f]/.test(pass)) {
            setPasswordError("❗️ห้ามใช้ภาษาไทย");
            return false;
        }
        if (pass.includes(" ")) {
            setPasswordError("❗️ห้ามเว้นรหัสผ่าน");
            return false;
        }
        const hasLetter = /[a-zA-Z]/.test(pass);
        const hasNumber = /\d/.test(pass);
        const hasSpecial = /[^a-zA-Z0-9]/.test(pass);
        if (!hasLetter || !hasNumber || hasSpecial) {
            setPasswordError("❗️รหัสผ่านต้องมี A-z, 0-9 และไม่มีอักขระพิเศษ");
            return false;
        }
        const blacklist = ["12345678", "password", "qwerty", "11111111"];
        if (blacklist.includes(pass.toLowerCase())) {
            setPasswordError("❗️รหัสผ่านนี้คาดเดาได้ง่าย กรุณาเปลี่ยนรหัสผ่านใหม่");
            return false;
        }

        const hasLower = /[a-z]/.test(pass);
        const hasUpper = /[A-Z]/.test(pass);
        if (!hasLower || !hasUpper) {
            setPasswordSuggestion("❗️รหัสผ่านควรมีทั้งตัวพิมพ์เล็กและตัวพิมพ์ใหญ่");
        } else {
            setPasswordSuggestion("");
        }

        setPasswordError("");
        return true;
    };

    const validateConfirmPassword = (confirm: string, original: string) => {
        if (confirm !== original) {
            setConfirmPasswordError("❗️รหัสผ่านไม่ตรงกัน");
            return false;
        }
        setConfirmPasswordError("");
        return true;
    };

    const handleVerifyUser = async () => {
        const isNameValid = validateFullName(fullName);
        const isIdValid = validateIdCard(idCard);
        const isContactValid = validateIdentifier(identifier);

        if (!isNameValid || !isIdValid || !isContactValid) return;

        setLoading(true);
        try {
            const response = await AuthService.verifyResetUser({
                full_name: fullName,
                id_card: idCard,
                identifier: identifier,
            });

            if (response.success && response.resetToken) {
                setResetToken(response.resetToken);
                setStep(2);
                Animated.sequence([
                    Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
                    Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
                ]).start();
            }
        } catch (error: any) {
            Alert.alert(
                "ข้อมูลไม่ถูกต้อง",
                "ข้อมูลที่คุณกรอกไม่ตรงกับฐานข้อมูลของระบบ กรุณาตรวจสอบและลองใหม่อีกครั้ง"
            );
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async () => {
        const isPassValid = validatePassword(newPassword);
        const isConfirmValid = validateConfirmPassword(confirmPassword, newPassword);

        if (!isPassValid || !isConfirmValid) return;

        setLoading(true);
        try {
            await AuthService.resetPassword({
                resetToken: resetToken,
                newPassword: newPassword,
            });

            Alert.alert(
                "สำเร็จ",
                "เปลี่ยนรหัสผ่านสำเร็จแล้ว คุณสามารถเข้าสู่ด้วยรหัสผ่านใหม่ได้ทันที",
                [{ text: "ตกลง", onPress: () => router.replace("/login") }]
            );
        } catch (error: any) {
            Alert.alert("ข้อผิดพลาด", error?.message || "เปลี่ยนรหัสผ่านไม่สำเร็จ กรุณาลองใหม่");
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
                        if (step === 2) {
                            setStep(1);
                        } else if (router.canGoBack()) {
                            router.back();
                        } else {
                            router.replace("/login");
                        }
                    }} style={styles.backButton}>
                        <Ionicons name="chevron-back" size={28} color="#000000" />
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
                            {step === 1 ? (
                                <>
                                    <View style={styles.inputGroup}>
                                        <TextInput
                                            style={[styles.input, fullNameError ? styles.inputError : null]}
                                            placeholder="ชื่อ-นามสกุล"
                                            placeholderTextColor="#9ca3af"
                                            value={fullName}
                                            onChangeText={(v) => {
                                                setFullName(v);
                                                if (fullNameError) validateFullName(v);
                                            }}
                                            onBlur={() => validateFullName(fullName)}
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
                                                if (idCardError) validateIdCard(cleaned);
                                            }}
                                            onBlur={() => validateIdCard(idCard)}
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
                                                if (identifierError) validateIdentifier(v);
                                            }}
                                            onBlur={() => validateIdentifier(identifier)}
                                            autoCapitalize="none"
                                            keyboardType="email-address"
                                        />
                                        {identifierError ? <Text style={styles.errorText}>{identifierError}</Text> : null}
                                    </View>

                                    <TouchableOpacity
                                        style={[styles.mainButton, loading && styles.disabledButton]}
                                        onPress={handleVerifyUser}
                                        disabled={loading}
                                        activeOpacity={0.8}
                                    >
                                        <Text style={styles.mainButtonText}>
                                            {loading ? "กำลังตรวจสอบ..." : "รีเซ็ทรหัสผ่าน"}
                                        </Text>
                                    </TouchableOpacity>
                                </>
                            ) : (
                                <>
                                    <View style={styles.inputGroup}>
                                        <View style={styles.inputWrapper}>
                                            <TextInput
                                                style={[styles.input, passwordError ? styles.inputError : null]}
                                                placeholder="รหัสผ่าน"
                                                placeholderTextColor="#9ca3af"
                                                secureTextEntry={!showPassword}
                                                value={newPassword}
                                                onChangeText={(v) => {
                                                    setNewPassword(v);
                                                    validatePassword(v);
                                                }}
                                                onBlur={() => validatePassword(newPassword)}
                                            />
                                            <TouchableOpacity 
                                                onPress={() => setShowPassword(!showPassword)}
                                                style={styles.eyeIcon}
                                            >
                                                <Ionicons name={showPassword ? "eye-off" : "eye"} size={22} color="#9ca3af" />
                                            </TouchableOpacity>
                                        </View>
                                        {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : 
                                         passwordSuggestion ? <Text style={styles.suggestionText}>{passwordSuggestion}</Text> : null}
                                    </View>

                                    <View style={styles.inputGroup}>
                                        <View style={styles.inputWrapper}>
                                            <TextInput
                                                style={[styles.input, confirmPasswordError ? styles.inputError : null]}
                                                placeholder="ยืนยันรหัสผ่าน"
                                                placeholderTextColor="#9ca3af"
                                                secureTextEntry={!showConfirmPassword}
                                                value={confirmPassword}
                                                onChangeText={(v) => {
                                                    setConfirmPassword(v);
                                                    validateConfirmPassword(v, newPassword);
                                                }}
                                                onBlur={() => validateConfirmPassword(confirmPassword, newPassword)}
                                            />
                                            <TouchableOpacity 
                                                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                                                style={styles.eyeIcon}
                                            >
                                                <Ionicons name={showConfirmPassword ? "eye-off" : "eye"} size={22} color="#9ca3af" />
                                            </TouchableOpacity>
                                        </View>
                                        {confirmPasswordError ? <Text style={styles.errorText}>{confirmPasswordError}</Text> : null}
                                    </View>

                                    <TouchableOpacity
                                        style={[styles.mainButton, loading && styles.disabledButton]}
                                        onPress={handleResetPassword}
                                        disabled={loading}
                                        activeOpacity={0.8}
                                    >
                                        <Text style={styles.mainButtonText}>
                                            {loading ? "กำลังบันทึก..." : "ยืนยันรหัสผ่าน"}
                                        </Text>
                                    </TouchableOpacity>
                                </>
                            )}
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
        padding: 4,
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 30,
        paddingBottom: 40,
    },
    title: {
        fontSize: 24,
        fontWeight: "600",
        color: "#2c3e50",
        textAlign: "center",
        marginTop: 20,
        marginBottom: 40,
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
    inputWrapper: {
        position: 'relative',
        width: '100%',
        justifyContent: 'center',
    },
    input: {
        width: "100%",
        height: 56,
        borderWidth: 1,
        borderColor: "#BDC3C7",
        borderRadius: 8,
        paddingHorizontal: 16,
        fontSize: 16,
        color: "#2C3E50",
        backgroundColor: "#FFFFFF",
    },
    inputError: {
        borderColor: "#E74C3C",
    },
    eyeIcon: {
        position: 'absolute',
        right: 16,
        padding: 4,
    },
    errorText: {
        color: "#E74C3C",
        fontSize: 13,
        marginTop: 6,
        marginLeft: 4,
    },
    suggestionText: {
        color: "#F39C12",
        fontSize: 13,
        marginTop: 6,
        marginLeft: 4,
    },
    mainButton: {
        backgroundColor: "#3498DB",
        height: 56,
        borderRadius: 8,
        alignItems: "center",
        justifyContent: "center",
        marginTop: 10,
    },
    disabledButton: {
        backgroundColor: "#AED6F1",
    },
    mainButtonText: {
        color: "#FFFFFF",
        fontSize: 18,
        fontWeight: "600",
    },
});
