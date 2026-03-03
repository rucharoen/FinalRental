import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
// 📌 Import AuthService เข้ามาจัดการเรื่อง Login และ Token
import AuthService from "../services/auth.service";

export default function LoginScreen() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState(""); // รับได้ทั้ง Email หรือ Phone
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!identifier || !password) {
      Alert.alert("แจ้งเตือน", "กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }

    setLoading(true);
    try {
      // 1. เรียกใช้ AuthService.login
      // ภายในฟังก์ชันนี้ควรมีการเก็บ Token ลงใน SecureStore/AsyncStorage เรียบร้อยแล้ว
      await AuthService.login({
        email: identifier, // หรือ identifier ตามที่ Backend ของคุณตั้งไว้
        password: password,
      });

      // 2. ถ้าสำเร็จ ย้ายหน้าไปที่ Tabs หลัก
      router.replace("/(tabs)/index")
    } catch (error: any) {
      console.error("Login error:", error);
      Alert.alert(
        "เข้าสู่ระบบไม่สำเร็จ",
        error.message || "อีเมลหรือรหัสผ่านไม่ถูกต้อง"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  const handleRegister = () => {
    router.push("/register");
  };

  const handleForgotPassword = () => {
    // ฟังก์ชันลืมรหัสผ่าน
    console.log("Forgot password");
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
          <Text style={styles.title}>เข้าสู่ระบบ</Text>
          <View style={{ width: 28 }} />
        </View>

        <View style={styles.content}>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="อีเมลหรือเบอร์โทรศัพท์"
              placeholderTextColor="#999"
              value={identifier}
              onChangeText={setIdentifier}
              autoCapitalize="none"
              keyboardType="email-address"
            />
            <TextInput
              style={styles.input}
              placeholder="รหัสผ่าน"
              placeholderTextColor="#999"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <TouchableOpacity
            style={[styles.loginButton, loading && styles.disabledButton]}
            onPress={handleLogin}
            disabled={loading}
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
    paddingTop: 10,
    height: 60,
  },
  backButton: {
    padding: 5,
  },
  title: {
    fontSize: 28,
    fontWeight: "500",
    color: "#000",
    textAlign: "center",
    marginTop: 20,
  },
  content: {
    flex: 1,
    paddingHorizontal: 30,
    paddingTop: 40,
  },
  inputContainer: {
    gap: 15,
    marginBottom: 30,
  },
  input: {
    width: "100%",
    height: 56,
    borderWidth: 1.2,
    borderColor: "#333",
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 18,
    color: "#000",
    backgroundColor: "#FFF",
  },
  loginButton: {
    backgroundColor: "#3494ce",
    height: 58,
    borderRadius: 8,
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
    marginTop: 25,
    alignItems: "center",
  },
  forgotPasswordText: {
    color: "#333",
    fontSize: 16,
    fontWeight: "400",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 40,
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
});