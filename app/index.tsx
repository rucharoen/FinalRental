import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons, Fontisto } from "@expo/vector-icons";

import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';

export default function WelcomeScreen() {
  const router = useRouter();

  const handleSocialLogin = async (platform: string) => {
    try {
      const baseUrl = process.env.EXPO_PUBLIC_API_BASE_URL;
      let endpoint = '';

      if (platform === 'Line') {
        endpoint = process.env.EXPO_PUBLIC_AUTH_LOGIN_LINE || '/auth/line/callback';
      } else if (platform === 'Facebook') {
        endpoint = process.env.EXPO_PUBLIC_AUTH_LOGIN_FACEBOOK || '/auth/facebook/callback';
      } else if (platform === 'Google') {
        endpoint = '/auth/google/callback';
      }

      if (!baseUrl) return;

      const authUrl = `${baseUrl}${endpoint}`;
      const redirectUrl = Linking.createURL('/');
      const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUrl);

      if (result.type === 'success' && result.url) {
        const { queryParams } = Linking.parse(result.url);
        if (queryParams?.token) {
          router.replace('/(tabs)');
        }
      }
    } catch (error) {
      // Login failed silently for user experience
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
              <Ionicons name="logo-google" size={24} color="#DB4437" />
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
              <Fontisto name="line" size={28} color="#06C755" />
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
    height: 350,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
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
    borderRadius: 8,
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
    fontSize: 18,
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