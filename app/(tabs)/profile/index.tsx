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
  
  // ใช้ข้อมูลจาก User จริง ถ้าไม่มีให้ใช้ข้อมูลจากความต้องการ (ตามรูปที่ระบุว่าเป็นข้อมูลใน .env)
  const displayData = {
    full_name: user?.full_name,
    email: user?.emai,
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


        {/* Shop Management Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>การจัดการร้านค้า</Text>
          
          {/* New Product */}
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => router.push('/(tabs)/products/create')}
          >
            <View style={[styles.menuIconContainer, { backgroundColor: '#FF5252' }]}>
              <Ionicons name="add" size={28} color="#FFFFFF" />
            </View>
            <View style={styles.menuContent}>
              <Text style={[styles.menuTitle, { color: '#FF5252' }]}>ลงประกาศสินค้าใหม่</Text>
              <Text style={styles.menuSubTitle}>สร้างรายได้จากการเพิ่มสินค้าในระบบ</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#BDC3C7" />
          </TouchableOpacity>

          {/* Manage Products */}
          <TouchableOpacity style={styles.menuItem}>
            <View style={[styles.menuIconContainer, { backgroundColor: '#F7F8FA', borderWidth: 1, borderColor: '#EEEEEE' }]}>
              <MaterialCommunityIcons name="tag-outline" size={24} color="#2C3E50" />
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>จัดการสินค้า</Text>
              <Text style={styles.menuSubTitle}>แก้ไข/ลบ สินค้าที่ลงประกาศไว้</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#BDC3C7" />
          </TouchableOpacity>

          {/* Incoming Rentals */}
          <TouchableOpacity style={styles.menuItem}>
            <View style={[styles.menuIconContainer, { backgroundColor: '#F7F8FA', borderWidth: 1, borderColor: '#EEEEEE' }]}>
              <Feather name="clipboard" size={22} color="#2C3E50" />
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>รายการที่มีคนเช่ามา</Text>
              <Text style={styles.menuSubTitle}>อนุมัติการเช่า/ตรวจสอบสินค้าคืน</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#BDC3C7" />
          </TouchableOpacity>

          {/* Wallet */}
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => router.push('/(tabs)/wallet')}
          >
            <View style={[styles.menuIconContainer, { backgroundColor: '#F7F8FA', borderWidth: 1, borderColor: '#EEEEEE' }]}>
              <MaterialCommunityIcons name="circle-multiple-outline" size={24} color="#2C3E50" />
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>กระเป๋าเงิน</Text>
              <Text style={styles.menuSubTitle}>รายการถอนเงิน/ประวัติธุรกรรม</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#BDC3C7" />
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
