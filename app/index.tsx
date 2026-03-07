import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons, Fontisto } from "@expo/vector-icons";

import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import AuthService from '../services/auth.service';

export default function WelcomeScreen() {
  const router = useRouter();

  React.useEffect(() => {
    const checkAuth = async () => {
      const token = await AuthService.getToken();
      if (token) {
        router.replace("/(tabs)");
      }
    };
    checkAuth();
  }, []);

  const handleSocialLogin = async (platform: string) => {
    try {
      const baseUrl = process.env.EXPO_PUBLIC_API_BASE_URL;
      let endpoint = '';

      if (platform === 'Line') {
        endpoint = process.env.EXPO_PUBLIC_AUTH_LOGIN_LINE || '/auth/line/callback';
      } else if (platform === 'Facebook') {
        endpoint = process.env.EXPO_PUBLIC_AUTH_LOGIN_FACEBOOK || '/auth/facebook/callback';
      } else if (platform === 'Google') {
        endpoint = process.env.EXPO_PUBLIC_AUTH_LOGIN_GOOGLE || '/auth/google/callback';
      }

      if (!baseUrl) {
        Alert.alert('Error', 'API Base URL is not defined');
        return;
      }

      const authUrl = `${baseUrl}${endpoint}`;
      const redirectUrl = Linking.createURL('/');

      console.log('--- Social Login Debug ---');
      console.log('Auth URL:', authUrl);
      console.log('Redirect URL:', redirectUrl);

      const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUrl);

      if (result.type === 'success' && result.url) {
        console.log('Success, URL:', result.url);

        // Manual parsing as fallback
        let token: string | null = null;
        const match = result.url.match(/[?#&](?:token|accessToken|access_token)=([^&]+)/);
        if (match) {
          token = match[1];
        } else {
          const parsed = Linking.parse(result.url);
          token = (parsed.queryParams?.token ||
            parsed.queryParams?.accessToken ||
            parsed.queryParams?.access_token) as string;
        }

        if (token) {
          try {
            console.log('Token found, saving...');
            await AuthService.setToken(token);
            // โหลดข้อมูลโปรไฟล์
            await AuthService.getProfile();
            console.log('Login successful, navigating to Home');
            router.replace('/(tabs)');
          } catch (profileError: any) {
            console.error('Profile fetch failed:', profileError);
            Alert.alert('เข้าสู่ระบบสำเร็จ', 'แต่ไม่สามารถโหลดข้อมูลโปรไฟล์ได้: ' + profileError.message);
            router.replace('/(tabs)');
          }
        } else {
          console.warn('No token found in response URL:', result.url);
          Alert.alert('ล้มเหลว', 'ไม่พบ Token ใน URL ที่ตอบกลับมา: ' + result.url);
        }
      } else if (result.type === 'cancel') {
        console.log('User cancelled login');
      } else {
        console.log('Login session failed or dismissed:', result.type);
        // Alert.alert('การเข้าสู่ระบบถูกยกเลิก', 'สถานะ: ' + result.type);
      }
    } catch (error: any) {
      console.error('Social Login Error:', error);
      Alert.alert('เกิดข้อผิดพลาด', 'ไม่สามารถเชื่อมต่อกับระบบได้: ' + error.message);
    }

  };

  const handleEmailSignup = () => {
    router.push('/register');
  };

  const handleLogin = () => {
    router.push('/login');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Image
            source={require('../assets/images/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.socialButton} onPress={() => handleSocialLogin('Google')}>
            <View style={styles.iconWrapper}>
              <Image
                source={{ uri: 'https://www.gstatic.com/images/branding/product/2x/googleg_96dp.png' }}
                style={{ width: 24, height: 24 }}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.socialButtonText}>ดำเนินการต่อด้วย Google</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.socialButton} onPress={() => handleSocialLogin('Facebook')}>
            <View style={styles.iconWrapper}>
              <Ionicons name="logo-facebook" size={28} color="#1877F2" />
            </View>
            <Text style={styles.socialButtonText}>ดำเนินการต่อด้วย Facebook</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.socialButton} onPress={() => handleSocialLogin('Line')}>
            <View style={styles.iconWrapper}>
              <Image
                source={{ uri: 'https://cdn-icons-png.flaticon.com/512/124/124027.png' }}
                style={{ width: 26, height: 26, borderRadius: 14 }}
                resizeMode="cover"
              />
            </View>
            <Text style={styles.socialButtonText}>ดำเนินการต่อด้วย Line</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.emailButton} onPress={handleEmailSignup}>
            <Text style={styles.emailButtonText}>สมัครสมาชิกด้วยอีเมล</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.loginLink} onPress={handleLogin}>
            <Text style={styles.loginLinkText}>เข้าสู่ระบบ</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 25,
    justifyContent: 'center',
  },
  logoContainer: {
    width: '100%',
    height: 300,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  buttonContainer: {
    width: '100%',
    gap: 12,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 5,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    position: 'relative',
    height: 56,
  },
  iconWrapper: {
    position: 'absolute',
    left: 20,
    width: 32,
    alignItems: 'center',
  },
  socialButtonText: {
    fontSize: 16,
    color: '#000',
    fontWeight: '500',
  },
  emailButton: {
    backgroundColor: '#EAEAEA',
    borderRadius: 8,
    paddingVertical: 16,
    width: '100%',
    alignItems: 'center',
    marginTop: 4,
    height: 56,
    justifyContent: 'center',
  },
  emailButtonText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#000',
  },
  loginLink: {
    marginTop: 20,
    alignItems: 'center',
  },
  loginLinkText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#000',
  },
});