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
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
// 📌 เรียกใช้ AuthService สำหรับยิง API
import AuthService from "../services/auth.service";

export default function RegisterScreen() {
  const router = useRouter();
  
  // --- States ---
  const [fullName, setFullName] = useState<string>("");
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  // --- Validation Helpers ---
  const validateEmail = (addr: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(addr);
  const validatePhone = (phone: string) => /^\d{10}$/.test(phone);

  // --- Functions ---
  const handleRegister = async () => {
    // 1. เช็คความถูกต้องของข้อมูล (Validation) ก่อนยิง API
    if (!fullName.trim()) {
      Alert.alert("แจ้งเตือน", "กรุณากรอกชื่อ-นามสกุล");
      return;
    }
    if (!validatePhone(phoneNumber)) {
      Alert.alert("แจ้งเตือน", "กรุณากรอกเบอร์โทรศัพท์ให้ครบ 10 หลัก");
      return;
    }
    if (!validateEmail(email)) {
      Alert.alert("แจ้งเตือน", "รูปแบบอีเมลไม่ถูกต้อง");
      return;
    }
    if (password.length < 6) {
      Alert.alert("แจ้งเตือน", "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร");
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("แจ้งเตือน", "รหัสผ่านไม่ตรงกัน");
      return;
    }

    // 2. เริ่มกระบวนการส่งข้อมูล
    setLoading(true);
    try {
      console.log("กำลังส่งข้อมูลสมัครสมาชิก...");
      
      const response = await AuthService.register({
        full_name: fullName,
        email: email,
        phone: phoneNumber,
        password: password,
        address: "", // ใส่ค่าว่างไว้ตาม Interface
      });

      console.log("สมัครสมาชิกสำเร็จ:", response);
      Alert.alert("สำเร็จ", "สมัครสมาชิกเรียบร้อยแล้ว", [
        { text: "ตกลง", onPress: () => router.replace("/login") },
      ]);
    } catch (error: any) {
      // จับ Error 404 หรือ Network Error ตรงนี้
      console.error("Registration error:", error);
      Alert.alert(
        "สมัครสมาชิกไม่สำเร็จ",
        error?.message || "ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้ (Error 404)"
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
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="chevron-back" size={28} color="#000" />
            </TouchableOpacity>
            <Text style={styles.title}>สมัครสมาชิก</Text>
            <View style={{ width: 28 }} /> 
          </View>

          {/* Form Content */}
          <View style={styles.content}>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="ชื่อ-นามสกุล"
                placeholderTextColor="#999"
                value={fullName}
                onChangeText={setFullName}
              />
              <TextInput
                style={styles.input}
                placeholder="เบอร์โทรศัพท์ (10 หลัก)"
                placeholderTextColor="#999"
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                keyboardType="phone-pad"
                maxLength={10}
              />
              <TextInput
                style={styles.input}
                placeholder="อีเมล"
                placeholderTextColor="#999"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
              <TextInput
                style={styles.input}
                placeholder="รหัสผ่าน (6 ตัวขึ้นไป)"
                placeholderTextColor="#999"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
              <TextInput
                style={styles.input}
                placeholder="ยืนยันรหัสผ่าน"
                placeholderTextColor="#999"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
              />
            </View>

            {/* Register Button */}
            <TouchableOpacity
              style={[styles.registerButton, loading && styles.disabledButton]}
              onPress={handleRegister}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.registerButtonText}>สมัครสมาชิก</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>มีบัญชีอยู่แล้ว? </Text>
            <TouchableOpacity onPress={() => router.push("/login")}>
              <Text style={styles.loginLink}>เข้าสู่ระบบ</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },
  flex: { flex: 1 },
  scrollContent: { flexGrow: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    height: 60,
  },
  backButton: { padding: 5 },
  title: { fontSize: 24, fontWeight: "bold", color: "#000" },
  content: { flex: 1, paddingHorizontal: 30, paddingTop: 20 },
  inputContainer: { gap: 15, marginBottom: 30 },
  input: {
    width: "100%",
    height: 56,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 12,
    paddingHorizontal: 15,
    fontSize: 16,
    color: "#000",
    backgroundColor: "#F9F9F9",
  },
  registerButton: {
    backgroundColor: "#3494ce",
    height: 58,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  disabledButton: { backgroundColor: "#A0D2EB" },
  registerButtonText: { color: "#FFFFFF", fontSize: 18, fontWeight: "600" },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 30,
  },
  footerText: { fontSize: 16, color: "#666" },
  loginLink: { fontSize: 16, color: "#3494ce", fontWeight: "bold" },
});