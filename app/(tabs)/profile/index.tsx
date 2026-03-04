import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  Image, 
  TouchableOpacity, 
  ScrollView, 
  SafeAreaView,
  Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import authService from '../../../services/auth.service';
import styles from '../../../styles/profile.styles';

export default function ProfileScreen() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const data = await authService.getUserData();
      setUser(data);
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // ใช้ข้อมูลจาก User จริง ถ้าไม่มีให้ใช้ข้อมูลจากความต้องการ
  const displayData = {
    full_name: user?.full_name,
    email: user?.email,
    address: user?.address,
    avatar: user?.avatar
  };

  const handleLogout = () => {
    Alert.alert(
      "ออกจากระบบ",
      "คุณต้องการออกจากระบบใช่หรือไม่?",
      [
        { text: "ยกเลิก", style: "cancel" },
        { 
          text: "ตกลง", 
          onPress: async () => {
            await authService.logout();
            router.replace('/login');
          } 
        }
      ]
    );
  };

  const getKYCStatus = () => {
    if (!user) return 'none';
    return user.kyc_status || 'none'; 
  };

  const renderStatusButton = () => {
    const status = getKYCStatus();
    
    switch(status) {
      case 'verified':
        return (
          <View style={[styles.statusButton, styles.statusVerified]}>
            <Text style={[styles.statusButtonText, styles.statusVerifiedText]}>ยืนยันตัวตนแล้ว</Text>
          </View>
        );
      case 'pending':
        return (
          <View style={[styles.statusButton, styles.statusPending]}>
            <Text style={[styles.statusButtonText, styles.statusPendingText]}>รออนุมัติ</Text>
          </View>
        );
      default:
        return (
          <TouchableOpacity 
            style={[styles.statusButton, styles.statusNone]}
            onPress={() => router.push('/(tabs)/profile/kyc')}
          >
            <Text style={[styles.statusButtonText, styles.statusNoneText]}>กรุณายืนยันตัวตน</Text>
          </TouchableOpacity>
        );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <Image 
              source={{ uri: displayData.avatar}} 
              style={styles.avatar}
            />
          </View>
          
          <Text style={styles.userName}>{displayData.full_name}</Text>
          <Text style={styles.userEmail}>{displayData.email}</Text>
          
          <TouchableOpacity style={styles.addressPill}>
            <Ionicons name="location-outline" size={16} color="#E74C3C" />
            <Text style={styles.addressText} numberOfLines={1}>
              {displayData.address}
            </Text>
            <Feather name="edit-3" size={14} color="#7F8C8D" />
          </TouchableOpacity>

          {renderStatusButton()}
        </View>

        {/* Management Section */}
        <View style={[styles.section, { marginTop: 20 }]}>
          {/* Platform Rules */}
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuIconContainer}>
              <Ionicons name="alert-circle-outline" size={32} color="#000000" />
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>กฎระเบียบของแพลตฟอร์มตัวกลาง การเช่าสินค้า</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#BDC3C7" />
          </TouchableOpacity>

          {/* Product List */}
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuIconContainer}>
              <MaterialCommunityIcons name="tag-outline" size={32} color="#000000" />
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>รายการสินค้า</Text>
              <Text style={styles.menuSubTitle}>รออนุมัติ/ที่ต้องชำระ/ที่ต้องได้รับ</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#BDC3C7" />
          </TouchableOpacity>

          {/* Open Shop */}
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuIconContainer}>
              <Feather name="clipboard" size={28} color="#000000" />
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>เปิดร้านปล่อยเช่า</Text>
              <Text style={styles.menuSubTitle}>ปล่อยเช่าสินค้า</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#BDC3C7" />
          </TouchableOpacity>
        </View>



        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>ออกจากระบบ</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
