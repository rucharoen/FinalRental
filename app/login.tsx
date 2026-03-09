import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import AuthService from "../services/auth.service";

export default function LoginScreen() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [identifierError, setIdentifierError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const validateIdentifier = (text: string) => {
    if (!text.trim()) {
      setIdentifierError("กรุณาป้อนอีเมลหรือหมายเลขโทรศัพท์");
      return false;
    }

    if (text.includes("@")) {
      const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
      if (!emailRegex.test(text)) {
        setIdentifierError("รูปแบบอีเมลไม่ถูกต้อง");
        return false;
      }
    } else {
      const cleanPhone = text.replace(/[\s-]/g, "");
      const isNumeric = /^\d+$/.test(cleanPhone);

      if (!isNumeric && text.trim().length > 0) {
        setIdentifierError("กรุณากรอกอีเมลหรือหมายเลขโทรศัพท์ให้ถูกต้อง");
        return false;
      }

      if (cleanPhone.length !== 10) {
        setIdentifierError("รูปแบบหมายเลขโทรศัพท์ไม่ถูกต้อง");
        return false;
      }
    }

    setIdentifierError("");
    return true;
  };

  const validatePassword = (text: string) => {
    if (!text) {
      setPasswordError("กรุณาป้อนรหัสผ่าน");
      return false;
    }
    setPasswordError("");
    return true;
  };

  const isFormValid = () => {
    return identifier.trim() !== "" && password !== "" && !identifierError && !passwordError;
  };

  const handleLogin = async () => {
    // 1️⃣ ตรวจสอบช่อง อีเมลหรือเบอร์โทรศัพท์
    if (!identifier.trim()) {
      Alert.alert("แจ้งเตือน", "กรุณาป้อนอีเมลหรือหมายเลขโทรศัพท์");
      return;
    }

    if (identifier.includes("@")) {
      const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
      if (!emailRegex.test(identifier)) {
        Alert.alert("แจ้งเตือน", "รูปแบบอีเมลไม่ถูกต้อง");
        return;
      }
    } else {
      const cleanPhone = identifier.replace(/[\s-]/g, "");
      const isNumeric = /^\d+$/.test(cleanPhone);

      if (!isNumeric) {
        Alert.alert("แจ้งเตือน", "กรุณากรอกอีเมลหรือหมายเลขโทรศัพท์ให้ถูกต้อง");
        return;
      }

      if (cleanPhone.length !== 10) {
        Alert.alert("แจ้งเตือน", "รูปแบบหมายเลขโทรศัพท์ไม่ถูกต้อง");
        return;
      }
    }

    // 2️⃣ ตรวจสอบช่อง รหัสผ่าน
    if (!password) {
      Alert.alert("แจ้งเตือน", "กรุณาป้อนรหัสผ่าน");
      return;
    }

    setLoading(true);
    try {
      await AuthService.login({
        email: identifier,
        password: password,
      });

      router.replace("/(tabs)");
    } catch (error: any) {
      // 3️⃣ ดักจับระดับฟอร์ม (รวม) สำหรับกรณีข้อมูลไม่ตรงกัน

      Alert.alert("เข้าสู่ระบบไม่สำเร็จ", "อีเมลหรือรหัสผ่านไม่ถูกต้อง");
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/");
    }
  };

  const handleRegister = () => {
    router.push("/register");
  };

  const handleForgotPassword = () => {
    router.push("/forgot-password");
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.flex}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Ionicons name="chevron-back" size={28} color="#000" />
          </TouchableOpacity>
        </View>

        <Text style={styles.title}>เข้าสู่ระบบ</Text>

        <View style={styles.content}>
          <View style={styles.inputContainer}>
            <TextInput
              style={[styles.input, identifierError ? styles.inputError : null]}
              placeholder="อีเมลหรือเบอร์โทรศัพท์"
              placeholderTextColor="#999"
              value={identifier}
              onChangeText={(text) => {
                let processedText = text;
                if (!text.includes("@")) {
                  processedText = text.replace(/[\s-]/g, "");
                }
                setIdentifier(processedText);
                validateIdentifier(processedText);
              }}
              autoCapitalize="none"
              keyboardType="email-address"
            />
            {identifierError ? (
              <Text style={styles.errorText}>{identifierError}</Text>
            ) : null}

            <View style={[styles.passwordContainer, passwordError ? styles.inputError : null]}>
              <TextInput
                style={styles.passwordInput}
                placeholder="รหัสผ่าน"
                placeholderTextColor="#999"
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  validatePassword(text);
                }}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Ionicons
                  name={showPassword ? "eye-outline" : "eye-off-outline"}
                  size={24}
                  color="#666"
                />
              </TouchableOpacity>
            </View>
            {passwordError ? (
              <Text style={styles.errorText}>{passwordError}</Text>
            ) : null}
          </View>

          <TouchableOpacity
            style={[
              styles.loginButton,
              (loading || !isFormValid()) && styles.disabledButton,
            ]}
            onPress={handleLogin}
            disabled={loading || !isFormValid()}
          >
            <Text style={styles.loginButtonText}>
              {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleForgotPassword} style={styles.forgotPassword}>
            <Text style={styles.forgotPasswordText}>ลืมรหัสผ่าน</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>ยังไม่มีบัญชี? </Text>
          <TouchableOpacity onPress={handleRegister}>
            <Text style={styles.registerLink}>สมัครสมาชิก</Text>
          </TouchableOpacity>
        </View>
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
    justifyContent: "space-between",
    paddingHorizontal: 20,
    height: 56,
    marginTop: 40,
  },
  backButton: {
    padding: 5,
  },
  title: {
    fontSize: 28,
    fontWeight: "500",
    color: "#000",
    textAlign: "center",
    marginTop: 40,
    marginBottom: 30,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  inputContainer: {
    gap: 15,
    marginBottom: 30,
  },
  input: {
    width: "100%",
    height: 56,
    borderWidth: 1,
    borderColor: "#333",
    borderRadius: 5,
    paddingHorizontal: 15,
    fontSize: 18,
    color: "#000",
    backgroundColor: "#FFF",
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    height: 56,
    borderWidth: 1,
    borderColor: "#333",
    borderRadius: 5,
    backgroundColor: "#FFF",
  },
  passwordInput: {
    flex: 1,
    height: "100%",
    paddingHorizontal: 15,
    fontSize: 18,
    color: "#000",
  },
  eyeIcon: {
    padding: 15,
  },
  loginButton: {
    backgroundColor: "#3498db",
    height: 58,
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },
  disabledButton: {
    backgroundColor: "#bdc3c7",
  },
  loginButtonText: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "500",
  },
  forgotPassword: {
    marginTop: 20,
    alignItems: "center",
  },
  forgotPasswordText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "400",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 35,
    backgroundColor: "#FFFFFF",
  },
  footerText: {
    fontSize: 18,
    color: "#333",
  },
  registerLink: {
    fontSize: 18,
    color: "#000",
    fontWeight: "600",
  },
  errorText: {
    color: "#e74c3c",
    fontSize: 14,
    marginTop: -10,
    marginBottom: 5,
    marginLeft: 5,
  },
  inputError: {
    borderColor: "#e74c3c",
  },
});
