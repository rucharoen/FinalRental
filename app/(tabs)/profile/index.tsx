import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert
} from 'react-native';
import { useRouter, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import authService from '../../../services/auth.service';
import shopService from '../../../services/shop.service';
import styles from '../../../styles/profile.styles';

export default function ProfileScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [user, setUser] = useState<any>(null);
  const [shop, setShop] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<'renter' | 'owner'>(params.mode === 'owner' ? 'owner' : 'renter');

  useEffect(() => {
    if (params.mode === 'owner') {
      setMode('owner');
    }
  }, [params.mode]);

  useFocusEffect(
    useCallback(() => {
      loadUserData();
    }, [])
  );

  const loadUserData = async () => {
    try {
      // Get local data first
      const localData = await authService.getUserData();
      if (localData) setUser(localData);

      // Refresh with fresh data from server
      const freshData = await authService.getProfile();
      if (freshData && !freshData.error) {
        setUser(freshData);
      }

      // Load shop data if exists
      const shopData = await shopService.getMyShop();

      const userDataObj = freshData && !freshData.error ? freshData : localData;
      const currentUserId = Number(userDataObj?.id || userDataObj?._id || user?.id || user?._id);

      console.log('--- PROFILE DEBUG ---');
      console.log('Current User ID:', currentUserId);
      console.log('Shop Data from API:', JSON.stringify(shopData));

      let actualShop = null;
      if (shopData?.shops && Array.isArray(shopData.shops)) {
        actualShop = shopData.shops.find((s: any) => Number(s.owner_id) === currentUserId);
      } else if (shopData && !shopData.error) {
        // Handle direct object or other formats
        const dataToPath = shopData.data || shopData;
        actualShop = (Number(dataToPath.owner_id) === currentUserId) ? dataToPath : null;
      }

      if (actualShop) {
        console.log('MATCH FOUND: Store owner detected');
        setShop(actualShop);
        // Automatically switch if we have a shop
        setMode('owner');
      } else {
        console.log('NO MATCH: User does not own any store in this list');
        setShop(null);
      }
    } catch (error) {
      console.error('Error loading profile data:', error);
      setShop(null);
    } finally {
      setLoading(false);
    }
  };

  const getKYCStatus = () => {
    if (!user) return 'none';
    return user.kyc_status || 'none';
  };

  const handleOpenShop = () => {
    // ถ้ามีข้อมูลร้านค้าอยู่แล้ว ให้แสดง Popup แจ้งเตือน
    if (shop) {
      Alert.alert(
        "คุณมีร้านค้าอยู่แล้ว",
        "ระบบอนุญาตให้เปิดร้านค้าได้เพียง 1 ร้านต่อ 1 บัญชีผู้ใช้เท่านั้น คุณสามารถสลับเป็น 'เจ้าของร้าน' ที่มุมบนขวาเพื่อจัดการร้านค้าของคุณ",
        [
          { text: "ตกลง", onPress: () => setMode('owner') }
        ]
      );
      return;
    }

    const status = getKYCStatus();
    if (status !== 'verified' && status !== 'approved') {
      Alert.alert(
        "ยืนยันตัวตน",
        "กรุณายืนยันตัวตนก่อนถึงจะเปิดเช่าได้",
        [
          { text: "ยกเลิก", style: "cancel" },
          { text: "ไปหน้ายืนยันตัวตน", onPress: () => router.push('/(tabs)/profile/kyc') }
        ]
      );
    } else {
      router.push('/(tabs)/profile/shop');
    }
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

  const renderStatusButton = () => {
    const status = getKYCStatus();

    switch (status) {
      case 'verified':
      case 'approved':
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

  const renderRenterMenu = () => (
    <View style={styles.section}>
      {/* Platform Rules */}
      <TouchableOpacity
        style={styles.menuItem}
        onPress={() => router.push('/(tabs)/profile/rules')}
      >
        <View style={styles.menuIconContainer}>
          <Ionicons name="alert-circle-outline" size={32} color="#000000" />
        </View>
        <View style={styles.menuContent}>
          <Text style={styles.menuTitle}>กฎระเบียบของแพลตฟอร์ม</Text>
        </View>
        <Ionicons name="chevron-forward" size={24} color="#BDC3C7" />
      </TouchableOpacity>

      {/* Product List */}
      <TouchableOpacity
        style={styles.menuItem}
        onPress={() => router.push('/(tabs)/profile/bookings')}
      >
        <View style={styles.menuIconContainer}>
          <MaterialCommunityIcons name="tag-outline" size={32} color="#000000" />
        </View>
        <View style={styles.menuContent}>
          <Text style={styles.menuTitle}>รายการเช่าของฉัน</Text>
          <Text style={styles.menuSubTitle}>รออนุมัติ/ที่ต้องชำระ/ที่ต้องได้รับ</Text>
        </View>
        <Ionicons name="chevron-forward" size={24} color="#BDC3C7" />
      </TouchableOpacity>

      {/* Open Shop */}
      <TouchableOpacity style={styles.menuItem} onPress={handleOpenShop}>
        <View style={styles.menuIconContainer}>
          <Feather name="shopping-bag" size={28} color="#000000" />
        </View>
        <View style={styles.menuContent}>
          <Text style={styles.menuTitle}>เปิดร้านปล่อยเช่า</Text>
          <Text style={styles.menuSubTitle}>เริ่มต้นเส้นทางผู้ให้เช่า</Text>
        </View>
        <Ionicons name="chevron-forward" size={24} color="#BDC3C7" />
      </TouchableOpacity>
    </View>
  );

  const renderOwnerMenu = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>การจัดการร้านค้า</Text>

      {/* Post New Product */}
      <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/(tabs)/products/create')}>
        <View style={styles.menuIconContainer}>
          <Ionicons name="add-circle" size={32} color="#E74C3C" />
        </View>
        <View style={styles.menuContent}>
          <Text style={[styles.menuTitle, { color: '#E74C3C' }]}>ลงประกาศสินค้าใหม่</Text>
          <Text style={styles.menuSubTitle}>สร้างรายได้จากการเพิ่มสินค้าในระบบ</Text>
        </View>
        <Ionicons name="chevron-forward" size={24} color="#BDC3C7" />
      </TouchableOpacity>

      {/* Manage Products */}
      <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/(tabs)/products/index')}>
        <View style={styles.menuIconContainer}>
          <MaterialCommunityIcons name="tag-multiple-outline" size={32} color="#000000" />
        </View>
        <View style={styles.menuContent}>
          <Text style={styles.menuTitle}>จัดการสินค้า</Text>
          <Text style={styles.menuSubTitle}>แก้ไข/ลบ สินค้าที่ลงประกาศไว้</Text>
        </View>
        <Ionicons name="chevron-forward" size={24} color="#BDC3C7" />
      </TouchableOpacity>

      {/* Bookings (Owner view) */}
      <TouchableOpacity style={styles.menuItem}>
        <View style={styles.menuIconContainer}>
          <MaterialCommunityIcons name="clipboard-text-outline" size={32} color="#000000" />
        </View>
        <View style={styles.menuContent}>
          <Text style={styles.menuTitle}>รายการที่มีคนเช่ามา</Text>
          <Text style={styles.menuSubTitle}>อนุมัติการเช่า/ตรวจสอบสินค้าคืน</Text>
        </View>
        <Ionicons name="chevron-forward" size={24} color="#BDC3C7" />
      </TouchableOpacity>

      {/* Wallet */}
      <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/(tabs)/wallet')}>
        <View style={styles.menuIconContainer}>
          <MaterialCommunityIcons name="wallet-outline" size={32} color="#000000" />
        </View>
        <View style={styles.menuContent}>
          <Text style={styles.menuTitle}>กระเป๋าเงิน</Text>
          <Text style={styles.menuSubTitle}>รายการถอนเงิน/ประวัติธุรกรรม</Text>
        </View>
        <Ionicons name="chevron-forward" size={24} color="#BDC3C7" />
      </TouchableOpacity>
    </View>
  );

  const displayData = mode === 'renter' ? {
    name: user?.full_name,
    email: user?.email || user?.Email,
    image: user?.profile_picture,
    address: user?.address || 'ไม่ระบุที่อยู่'
  } : {
    name: shop?.name || 'กำลังดาวน์โหลด...',
    email: user?.email || user?.Email,
    image: shop?.image || 'https://via.placeholder.com/150',
    address: shop?.address || user?.address || 'ไม่ระบุที่อยู่'
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Mode Switcher Toggle (Top Right) */}
        {shop && (
          <View style={styles.topSwitchWrapper}>
            <TouchableOpacity
              style={styles.topSwitchContainer}
              onPress={() => setMode(mode === 'renter' ? 'owner' : 'renter')}
            >
              <View style={[styles.topSwitchPill, mode === 'owner' && styles.topSwitchPillActive]}>
                <MaterialCommunityIcons
                  name={mode === 'renter' ? "account" : "storefront"}
                  size={16}
                  color={mode === 'owner' ? "#FFFFFF" : "#3498DB"}
                />
                <Text style={[styles.topSwitchLabel, mode === 'owner' && styles.topSwitchLabelActive]}>
                  {mode === 'renter' ? 'ผู้เช่า' : 'เจ้าของร้าน'}
                </Text>
                <Ionicons
                  name="repeat"
                  size={14}
                  color={mode === 'owner' ? "#FFFFFF" : "#3498DB"}
                  style={{ marginLeft: 4 }}
                />
              </View>
            </TouchableOpacity>
          </View>
        )}

        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <Image
              source={{ uri: displayData.image }}
              style={styles.avatar}
            />
          </View>

          <Text style={styles.userName}>{displayData.name}</Text>
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

        {/* Role Switcher */}
        {shop && (
          <View style={styles.switchContainer}>
            <TouchableOpacity
              style={[styles.switchButton, mode === 'renter' && styles.activeSwitch]}
              onPress={() => setMode('renter')}
            >
              <Text style={[styles.switchText, mode === 'renter' && styles.activeSwitchText]}>ผู้เช่า</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.switchButton, mode === 'owner' && styles.activeSwitch]}
              onPress={() => setMode('owner')}
            >
              <Text style={[styles.switchText, mode === 'owner' && styles.activeSwitchText]}>ผู้ปล่อยเช่า</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Menus */}
        {mode === 'renter' ? renderRenterMenu() : renderOwnerMenu()}

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>ออกจากระบบ</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
