import React, { useState } from 'react';
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
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AuthService from "../services/auth.service";

export default function RegisterScreen() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [fullNameError, setFullNameError] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuggestion, setPasswordSuggestion] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validateFullName = (name: string) => {
    if (name.length === 0) {
      setFullNameError('');
      return true;
    }

    if (name.trim() === '') {
      setFullNameError('❗️กรุณาป้อนชื่อของคุณ');
      return false;
    }

    if (/^\d+$/.test(name)) {
      setFullNameError('❗️ชื่อ–นามสกุลต้องเป็นตัวอักษร ไม่สามารถเป็นตัวเลขได้');
      return false;
    }

    const specialChars = /[@#$%^&*()_+=\!\?\/\\|<>]/;
    if (specialChars.test(name)) {
      setFullNameError('❗️ชื่อ–นามสกุลไม่สามารถใช้อักขระพิเศษได้');
      return false;
    }

    const emojiRegex = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;
    if (emojiRegex.test(name)) {
      setFullNameError('❗️ชื่อ–นามสกุลไม่สามารถใช้อิโมจิได้');
      return false;
    }

    const validChars = /^[a-zA-Z\u0e00-\u0e7f\s]+$/;
    if (!validChars.test(name)) {
      setFullNameError('❗️กรุณากรอกชื่อ–นามสกุลเป็นภาษาไทยหรือภาษาอังกฤษเท่านั้น');
      return false;
    }

    setFullNameError('');
    return true;
  };

  const validatePhone = (phone: string) => {
    const cleaned = phone.replace(/[^\d]/g, '');
    
    if (phone.length === 0) {
      setPhoneError('');
      return true;
    }

    if (phone.trim() === '') {
      setPhoneError('❗️กรุณาป้อนหมายเลขโทรศัพท์');
      return false;
    }

    if (/[^\d\s-]/.test(phone)) {
      setPhoneError('❗️หมายเลขโทรศัพท์ต้องเป็นตัวเลขเท่านั้น');
      return false;
    }

    if (cleaned.length > 0 && cleaned.length < 10) {
      setPhoneError('❗️กรุณากรอกหมายเลขโทรศัพท์ให้ครบ 10 หลัก');
      return false;
    }

    if (cleaned.length > 10) {
      setPhoneError('❗️กรุณากรอกหมายเลขโทรศัพท์ให้ครบ 10 หลัก');
      return false;
    }

    if (cleaned.length === 10) {
      const validPrefix = /^(06|08|09)/;
      const isRepeating = /^(.)\1+$/.test(cleaned);
      
      if (!validPrefix.test(cleaned) || isRepeating) {
        setPhoneError('❗️รูปแบบหมายเลขโทรศัพท์ไม่ถูกต้อง');
        return false;
      }
    }

    setPhoneError('');
    return true;
  };

  const validateEmail = (email: string) => {
    if (email.length === 0) {
      setEmailError('');
      return true;
    }

    if (email.trim() === '') {
      setEmailError('❗️กรุณาป้อนอีเมล');
      return false;
    }

    // รูปแบบอีเมลไม่ถูกต้อง (ไม่มี @)
    if (!email.includes('@')) {
      setEmailError('❗️รูปแบบอีเมลไม่ถูกต้อง');
      return false;
    }

    // ไม่มีโดเมน (.com, .net ฯลฯ)
    const emailParts = email.split('@');
    if (emailParts.length > 1) {
      const domain = emailParts[1];
      if (!domain || !domain.includes('.') || domain.split('.').pop()?.length === 0) {
        setEmailError('❗️กรุณากรอกอีเมลให้มีโดเมน เช่น example@email.com');
        return false;
      }
    }

    // รูปแบบอีเมลไม่ถูกต้อง (โครงสร้างผิด)
    // - ห้ามมีช่องว่าง
    // - โครงสร้างพื้นฐาน
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    if (!emailRegex.test(email) || email.includes(' ')) {
      setEmailError('❗️รูปแบบอีเมลไม่ถูกต้อง');
      return false;
    }

    setEmailError('');
    return true;
  };

  const validatePassword = (pass: string) => {
    if (pass.length === 0) {
      setPasswordError('');
      setPasswordSuggestion('');
      return true;
    }

    // ห้ามว่าง - จัดการใน handleSubmit/real-time set
    if (pass.trim() === '') {
      setPasswordError('❗️กรุณาป้อนรหัสผ่าน');
      return false;
    }

    // ความยาวไม่ถึงขั้นต่ำ (≥ 8 ตัวอักษร)
    if (pass.length < 8) {
      setPasswordError('❗️รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษร');
      return false;
    }

    // ต้องมีตัวอักษรและตัวเลข + ห้ามอักขระพิเศษ
    const hasLetter = /[a-zA-Z]/.test(pass);
    const hasNumber = /\d/.test(pass);
    const hasSpecial = /[^a-zA-Z0-9]/.test(pass);

    if (!hasLetter || !hasNumber || hasSpecial) {
      setPasswordError('❗️รหัสผ่านต้องมี A-z, 0-9 ต้องไม่อักขระพิเศษ');
      return false;
    }

    // Blacklist
    const blacklist = ['12345678', 'password', 'qwerty', '11111111'];
    if (blacklist.includes(pass.toLowerCase())) {
      setPasswordError('❗️รหัสผ่านนี้คาดเดาได้ง่าย กรุณาเปลี่ยนรหัสผ่านใหม่');
      return false;
    }

    setPasswordError('');

    // ข้อความแนะนำ (ไม่ใช่ error) - ตรวจสอบพิมพ์เล็กพิมพ์ใหญ่
    const hasLower = /[a-z]/.test(pass);
    const hasUpper = /[A-Z]/.test(pass);
    if (!hasLower || !hasUpper) {
      setPasswordSuggestion('❗️รหัสผ่านควรมีตัวพิมพ์เล็ก ตัวพิมพ์ใหญ่');
    } else {
      setPasswordSuggestion('');
    }

    return true;
  };

  const validateConfirmPassword = (confirm: string, original: string) => {
    if (confirm.length === 0) {
      setConfirmPasswordError('');
      return true;
    }

    if (confirm !== original) {
      setConfirmPasswordError('❗️รหัสผ่านไม่ตรงกัน');
      return false;
    }

    setConfirmPasswordError('');
    return true;
  };

  const isFormValid = () => {
    return (
      fullName && !fullNameError &&
      phoneNumber && !phoneError &&
      email && !emailError &&
      password && !passwordError &&
      confirmPassword && !confirmPasswordError
    );
  };

  const handleRegister = async () => {
    // ตรวจสอบความถูกต้องและแจ้งเตือนตามลำดับ
    if (!fullName) {
      Alert.alert('แจ้งเตือน', 'กรุณาป้อนชื่อของคุณ');
      return;
    }
    if (fullNameError) {
      Alert.alert('แจ้งเตือน', fullNameError.replace('❗️', ''));
      return;
    }

    if (!phoneNumber) {
      Alert.alert('แจ้งเตือน', 'กรุณาป้อนหมายเลขโทรศัพท์');
      return;
    }
    if (phoneError) {
      Alert.alert('แจ้งเตือน', phoneError.replace('❗️', ''));
      return;
    }

    if (!email) {
      Alert.alert('แจ้งเตือน', 'กรุณาป้อนอีเมล');
      return;
    }
    if (emailError) {
      Alert.alert('แจ้งเตือน', emailError.replace('❗️', ''));
      return;
    }

    if (!password) {
      Alert.alert('แจ้งเตือน', 'กรุณาป้อนรหัสผ่าน');
      return;
    }
    if (passwordError) {
      Alert.alert('แจ้งเตือน', passwordError.replace('❗️', ''));
      return;
    }

    if (!confirmPassword) {
      Alert.alert('แจ้งเตือน', 'กรุณายืนยันรหัสผ่าน');
      return;
    }
    if (confirmPasswordError) {
      Alert.alert('แจ้งเตือน', confirmPasswordError.replace('❗️', ''));
      return;
    }

    setLoading(true);
    try {
      console.log("กำลังส่งข้อมูลสมัครสมาชิก...");
      
      const response = await AuthService.register({
        full_name: fullName,
        email: email,
        phone: phoneNumber,
        password: password,
      });

      console.log("สมัครสมาชิกสำเร็จ:", response);
      Alert.alert("สำเร็จ", "สมัครสมาชิกเรียบร้อยแล้ว", [
        { text: "ตกลง", onPress: () => router.replace("/login") },
      ]);
    } catch (error: any) {
      console.error("Registration error:", error);
      
      let errorMessage = error?.message || "ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้";
      
      // ดักจับกรณีอีเมลซ้ำ
      if (errorMessage.toLowerCase().includes("email") && (errorMessage.toLowerCase().includes("taken") || errorMessage.toLowerCase().includes("exists") || errorMessage.toLowerCase().includes("already"))) {
        setEmailError("❗️อีเมลนี้มีบัญชีอยู่แล้ว กรุณาเข้าสู่ระบบหรือใช้อีเมลอื่น");
        errorMessage = "อีเมลนี้มีบัญชีอยู่แล้ว กรุณาเข้าสู่ระบบหรือใช้อีเมลอื่น";
      }

      Alert.alert("สมัครสมาชิกไม่สำเร็จ", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  const handleLogin = () => {
    router.push('/login');
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <TouchableOpacity onPress={handleBack} style={styles.backButton}>
              <Ionicons name="chevron-back" size={28} color="#000" />
            </TouchableOpacity>
            <Text style={styles.title}>สมัครสมาชิก</Text>
            <View style={{ width: 28 }} />
          </View>
          <View style={styles.content}>
            <View style={styles.inputContainer}>
              <TextInput
                style={[styles.input, fullNameError ? styles.inputError : null]}
                placeholder="ชื่อ-นามสกุล"
                placeholderTextColor="#999"
                value={fullName}
                onChangeText={(text) => {
                  setFullName(text);
                  validateFullName(text);
                }}
              />
              {fullNameError ? <Text style={styles.errorText}>{fullNameError}</Text> : null}
              <TextInput
                style={[styles.input, phoneError ? styles.inputError : null]}
                placeholder="เบอร์โทรศัพท์"
                placeholderTextColor="#999"
                value={phoneNumber}
                onChangeText={(text) => {
                  const cleaned = text.replace(/[\s-]/g, '');
                  setPhoneNumber(cleaned);
                  validatePhone(cleaned);
                }}
                keyboardType="numeric"
                maxLength={10}
              />
              {phoneError ? <Text style={styles.errorText}>{phoneError}</Text> : null}
              <TextInput
                style={[styles.input, emailError ? styles.inputError : null]}
                placeholder="อีเมล"
                placeholderTextColor="#999"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  validateEmail(text);
                }}
                autoCapitalize="none"
                keyboardType="email-address"
              />
              {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
              <View style={[styles.passwordContainer, passwordError ? styles.inputError : null]}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="รหัสผ่าน"
                  placeholderTextColor="#999"
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    validatePassword(text);
                    // Re-validate confirm pass when password changes
                    if (confirmPassword) validateConfirmPassword(confirmPassword, text);
                  }}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Ionicons
                    name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                    size={24}
                    color="#666"
                  />
                </TouchableOpacity>
              </View>
              {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}
              {passwordSuggestion && !passwordError ? <Text style={styles.suggestionText}>{passwordSuggestion}</Text> : null}

              <View style={[styles.passwordContainer, confirmPasswordError ? styles.inputError : null]}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="ยืนยันรหัสผ่าน"
                  placeholderTextColor="#999"
                  value={confirmPassword}
                  onChangeText={(text) => {
                    setConfirmPassword(text);
                    validateConfirmPassword(text, password);
                  }}
                  secureTextEntry={!showConfirmPassword}
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <Ionicons
                    name={showConfirmPassword ? 'eye-outline' : 'eye-off-outline'}
                    size={24}
                    color="#666"
                  />
                </TouchableOpacity>
              </View>
              {confirmPasswordError ? <Text style={styles.errorText}>{confirmPasswordError}</Text> : null}
            </View>
            <TouchableOpacity
              style={[styles.registerButton, (loading || !isFormValid()) && styles.disabledButton]}
              onPress={handleRegister}
              disabled={loading || !isFormValid()}
            >
              <Text style={styles.registerButtonText}>{loading ? 'กำลังดำเนินการ กรุณารอสักครู่' : 'สมัครสมาชิก'}</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.footer}>
            <Text style={styles.footerText}>มีบัญชีอยู่แล้ว? </Text>
            <TouchableOpacity onPress={handleLogin}>
              <Text style={styles.loginLink}>เข้าสู่ระบบ</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
    height: 60,
  },
  backButton: {
    padding: 5,
  },
  title: {
    fontSize: 28,
    fontWeight: '500',
    color: '#000',
    textAlign: 'center',
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
    width: '100%',
    height: 56,
    borderWidth: 1.2,
    borderColor: '#333',
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 18,
    color: '#000',
    backgroundColor: '#FFF',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    height: 56,
    borderWidth: 1.2,
    borderColor: '#333',
    borderRadius: 8,
    backgroundColor: '#FFF',
  },
  passwordInput: {
    flex: 1,
    height: '100%',
    paddingHorizontal: 15,
    fontSize: 18,
    color: '#000',
  },
  eyeIcon: {
    padding: 15,
  },
  registerButton: {
    backgroundColor: '#3494ce',
    height: 58,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  disabledButton: {
    backgroundColor: '#bdc3c7',
  },
  registerButtonText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  footerText: {
    fontSize: 18,
    color: '#333',
  },
  loginLink: {
    fontSize: 18,
    color: '#000',
    fontWeight: '600',
  },
  errorText: {
    color: '#e74c3c',
    fontSize: 14,
    marginTop: -10,
    marginBottom: 5,
    marginLeft: 5,
  },
  inputError: {
    borderColor: '#e74c3c',
  },
  suggestionText: {
    color: '#3494ce',
    fontSize: 14,
    marginTop: -10,
    marginBottom: 5,
    marginLeft: 5,
  },
});
