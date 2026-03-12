import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Image,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import authService from '../../../services/auth.service';
import chatService from '../../../services/chat.service';
import productService from '../../../services/product.service';
import shopService from '../../../services/shop.service';
import styles from '../../../styles/profile.styles';

export default function ProfileScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [user, setUser] = useState<any>(null);
  const [shop, setShop] = useState<any>(null);
  const [productCount, setProductCount] = useState(0);
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

      let actualShop = null;
      if (shopData?.shops && Array.isArray(shopData.shops)) {
        actualShop = shopData.shops.find((s: any) => Number(s.owner_id) === currentUserId);
      } else if (shopData && !shopData.error) {
        // Handle direct object or other formats
        const dataToPath = shopData.data || shopData;
        actualShop = (Number(dataToPath.owner_id) === currentUserId) ? dataToPath : null;
      }

      if (actualShop) {
        setShop(actualShop);

        // Remove automatic setMode('owner') that forces switch on every focus
        // This allows user choice to persist.
        // The initial mode is already handled by params.mode or default state.

        // Load product count
        try {
          const prodResponse = await productService.getOwnProducts();
          const items = prodResponse.products || prodResponse.data || (Array.isArray(prodResponse) ? prodResponse : []);
          setProductCount(items.length);
        } catch (e) {
          if (e instanceof Error && e.message === 'Unauthenticated') {
            // Normal behavior for non-logged-in
          } else {
            console.error('Error fetching product count:', e);
          }
        }
      } else {
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
    const status = getKYCStatus();

    // เพิ่มการตรวจสอบสถานะ "รออนุมัติ" (pending)
    if (status === 'pending') {
      Alert.alert(
        "รอการตรวจสอบ",
        "คำขอเปิดร้านของคุณอยู่ระหว่างการตรวจสอบ",
        [{ text: "ตกลง" }]
      );
      return;
    }

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

  const handleUpdateProfileImage = async () => {

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setLoading(true);
        const selectedImage = result.assets[0];
        const fileName = selectedImage.uri.split('/').pop() || 'profile.jpg';
        const match = /\.(\w+)$/.exec(fileName);
        const type = match ? `image/${match[1]}` : `image/jpeg`;

        if ((mode as string) === 'owner' && shop?.id) {
          // If in owner mode, update shop image
          const shopFormData = new FormData();
          shopFormData.append('image', {
            uri: selectedImage.uri,
            name: fileName,
            type: type,
          } as any);

          const shopResponse = await shopService.updateShopImage(shop.id, shopFormData);

          if (shopResponse && !shopResponse.error) {
            Alert.alert('สำเร็จ', 'อัปเดตรูปโลโกร้านค้าเรียบร้อยแล้ว');
            await loadUserData(); // Refresh shop data
          } else {
            throw new Error(shopResponse?.message || 'Shop Logo upload failed');
          }
        } else {
          // Otherwise update user profile picture
          const userFormData = new FormData();
          userFormData.append('profile_picture', {
            uri: selectedImage.uri,
            name: fileName,
            type: type,
          } as any);

          const response = await authService.updateProfileImage(userFormData);

          if (response && !response.error) {
            Alert.alert('สำเร็จ', 'อัปเดตรูปโปรไฟล์เรียบร้อยแล้ว');
            if (response.user) {
              setUser(response.user);
            } else {
              await loadUserData();
            }
          } else {
            throw new Error(response?.message || 'Profile Picture upload failed');
          }
        }
      }
    } catch (error: any) {
      console.error('Update profile image error:', error);
      Alert.alert('เกิดข้อผิดพลาด', error.message || 'ไม่สามารถอัปเดตรูปภาพได้');
    } finally {
      setLoading(false);
    }
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

      {/* Open Shop or Switch Account */}
      {shop ? (
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => setMode('owner')}
        >
          <View style={styles.menuIconContainer}>
            <Ionicons name="people" size={32} color="#000000" />
          </View>
          <View style={styles.menuContent}>
            <Text style={styles.menuTitle}>เปลี่ยนเป็นผู้ปล่อยเช่า</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#BDC3C7" />
        </TouchableOpacity>
      ) : (
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
      )}
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
      <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/(tabs)/products')}>
        <View style={styles.menuIconContainer}>
          <MaterialCommunityIcons name="tag-multiple-outline" size={32} color="#000000" />
        </View>
        <View style={styles.menuContent}>
          <Text style={styles.menuTitle}>จัดการสินค้า</Text>
          <Text style={styles.menuSubTitle}>{productCount > 0 ? `คุณมีสินค้าทั้งหมด ${productCount} รายการ` : 'แก้ไข/ลบ สินค้าที่ลงประกาศไว้'}</Text>
        </View>
        <Ionicons name="chevron-forward" size={24} color="#BDC3C7" />
      </TouchableOpacity>

      {/* Bookings (Owner view) */}
      <TouchableOpacity
        style={styles.menuItem}
        onPress={() => router.push('/(tabs)/profile/shop/rentals')}
      >
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

      {/* Switch Account */}
      <TouchableOpacity
        style={styles.menuItem}
        onPress={() => setMode('renter')}
      >
        <View style={styles.menuIconContainer}>
          <Ionicons name="people" size={32} color="#000000" />
        </View>
        <View style={styles.menuContent}>
          <Text style={styles.menuTitle}>เปลี่ยนเป็นผู้เช่า</Text>
        </View>
        <Ionicons name="chevron-forward" size={24} color="#BDC3C7" />
      </TouchableOpacity>
    </View>
  );

  const getImageUrl = (imagePath: string) => {
    return chatService.formatImageUrl(imagePath) || 'https://via.placeholder.com/150';
  };

  const displayData = mode === 'renter' ? {
    name: user?.full_name || 'ไม่ระบุชื่อ',
    email: user?.email || 'ไม่ระบุอีเมล',
    image: getImageUrl(user?.profile_picture),
    address: user?.address || 'ไม่ระบุที่อยู่'
  } : {
    name: shop?.name || 'กำลังดาวน์โหลด...',
    email: user?.email || 'ไม่ระบุอีเมล',
    image: getImageUrl(shop?.image || user?.profile_picture),
    address: shop?.address || user?.address || 'ไม่ระบุที่อยู่'
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header Section */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.avatarWrapper}
            onPress={handleUpdateProfileImage}
            activeOpacity={0.8}
          >
            <View style={styles.avatarContainer}>
              <Image
                source={{ uri: displayData.image }}
                style={styles.avatar}
              />
            </View>
            <View style={styles.editBadge}>
              <Feather name="camera" size={16} color="#000000" />
            </View>
          </TouchableOpacity>

          <Text style={styles.userName}>{displayData.name}</Text>
          <Text style={styles.userEmail}>{displayData.email}</Text>

          <TouchableOpacity
            style={styles.addressPill}
            onPress={() => router.push('/(tabs)/profile/address')}
          >
            <Ionicons name="location-outline" size={16} color="#E74C3C" />
            <Text style={styles.addressText} numberOfLines={1}>
              {(() => {
                const addr = displayData.address;
                if (!addr || addr === 'ไม่ระบุที่อยู่') return 'ยังไม่ได้เพิ่มที่อยู่';
                try {
                  const parsed = typeof addr === 'object' ? addr : JSON.parse(addr);
                  const prov = parsed.province || '';
                  const dist = parsed.district || '';
                  const detail = parsed.house_no || parsed.address_detail || '';
                  return `${detail} ${dist} ${prov}`.trim() || 'ดูรายละเอียดที่อยู่';
                } catch (e) {
                  return addr;
                }
              })()}
            </Text>
            <Feather name="edit-3" size={14} color="#7F8C8D" />
          </TouchableOpacity>

          {renderStatusButton()}
        </View>



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
