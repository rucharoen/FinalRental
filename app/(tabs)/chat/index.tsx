import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Modal,
  SafeAreaView,
  StatusBar,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from 'react-native';
import authService from '../../../services/auth.service';
import chatService, { Chat } from '../../../services/chat.service';
import styles from '../../../styles/chat-list.styles';

export default function ChatListScreen() {
  const router = useRouter();
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  
  // States for deletion
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [showOptions, setShowOptions] = useState(false);

  useEffect(() => {
    loadChatList();
    const interval = setInterval(loadChatList, 5000); // เช็คข้อความใหม่ทุก 5 วินาที
    return () => clearInterval(interval);
  }, []);

  const loadChatList = async () => {
    try {
      const userData = await authService.getUserData();
      if (userData) {
        const id = (userData.id || userData._id).toString();
        setUserId(id);
        const data = await chatService.getChatListByUser(id);
        if (Array.isArray(data)) {
          setChats(data);
        }
      }
    } catch (error) {
      console.error('Error fetching chat list:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLongPress = (chat: Chat) => {
    setSelectedChat(chat);
    setShowOptions(true);
  };

  const confirmDelete = () => {
    if (!selectedChat) return;
    
    Alert.alert(
      'ยืนยันการลบ',
      'คุณต้องการลบการสนทนานี้ใช่หรือไม่? (การลบจะมีผลเฉพาะฝั่งของคุณเท่านั้น)',
      [
        { text: 'ยกเลิก', style: 'cancel' },
        { 
          text: 'ลบ', 
          style: 'destructive',
          onPress: handleDeleteChat
        }
      ]
    );
  };

  const handleDeleteChat = async () => {
    if (!selectedChat || !userId) return;
    
    try {
      const roomId = selectedChat.room_id || selectedChat.chatId;
      if (roomId) {
        setShowOptions(false);
        const res = await chatService.hideChat(roomId, userId);
        if (res.success) {
          // อัปเดต UI ทันที
          setChats(prev => prev.filter(c => (c.room_id || c.chatId) !== roomId));
        } else {
          Alert.alert('ผิดพลาด', 'ไม่สามารถลบการสนทนาได้');
        }
      }
    } catch (error) {
      console.error('Delete chat error:', error);
      Alert.alert('ผิดพลาด', 'เกิดข้อผิดพลาดในการลบการสนทนา');
    }
  };

  const formatTime = (time?: string) => {
    if (!time) return '';
    try {
      const date = new Date(time);
      if (isNaN(date.getTime())) return '';
      
      return date.toLocaleTimeString('th-TH', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      }).replace(':', '.');
    } catch (e) {
      return '';
    }
  };

  const renderChatItem = ({ item }: { item: Chat }) => {
    const otherId = (item as any).otherUserId;
    const unreadCount = item.unreadCount || (item as any).unread_count || 0;
    const lastIsRead = item.lastIsRead !== undefined ? item.lastIsRead : (item as any).is_read;
    const lastSenderId = item.lastSenderId || (item as any).last_sender_id;
    const isUnread = unreadCount > 0 || (lastIsRead === false && lastSenderId?.toString() !== userId);
    const navigationId = item.room_id || item.chatId || otherId;

    return (
      <TouchableOpacity
        style={styles.chatItem}
        onPress={() => router.push(`/(tabs)/chat/${navigationId}`)}
        onLongPress={() => handleLongPress(item)}
        delayLongPress={500}
      >
        <View style={styles.avatarContainer}>
          <Image
            source={{
              uri: chatService.formatImageUrl((item as any).otherUserAvatar) ||
                'https://api.dicebear.com/7.x/avataaars/svg?seed=' + otherId
            }}
            style={styles.avatar}
          />
          {isUnread && <View style={styles.unreadBadge} />}
        </View>
        <View style={styles.chatContent}>
          <View style={styles.chatHeader}>
            <Text style={[styles.shopName, isUnread && styles.unreadText]}>
              {(item as any).otherUserName || `ผู้ใช้ ${otherId}`}
            </Text>
            <Text style={[styles.timeText, isUnread && styles.unreadTime]}>{formatTime((item as any).lastMessageTime)}</Text>
          </View>
          <View style={styles.lastMessageRow}>
            <Text
              style={[styles.lastMessage, isUnread && styles.unreadMessage]}
              numberOfLines={1}
            >
              {isUnread
                ? `${unreadCount} ข้อความใหม่`
                : ((item as any).lastMessage || 'เริ่มต้นการสนทนาได้เลย')}
            </Text>
            {isUnread && unreadCount > 0 && (
              <View style={styles.countBadge}>
                <Text style={styles.countText}>{unreadCount}</Text>
              </View>
            )}
          </View>
        </View>
        <Ionicons name="chevron-forward" size={18} color="#BDC3C7" />
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3498DB" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>ข้อความ</Text>
        <Ionicons name="chatbubble-ellipses-outline" size={28} color="#000000" />
      </View>

      {/* Chat List */}
      <FlatList
        data={chats}
        renderItem={renderChatItem}
        keyExtractor={(item) => (item.room_id || item.chatId || Math.random().toString())}
        style={styles.chatList}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>ยังไม่มีบทสนทนา</Text>
          </View>
        }
        onRefresh={loadChatList}
        refreshing={false}
      />

      {/* Slide up Options Modal */}
      <Modal
        visible={showOptions}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowOptions(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowOptions(false)}>
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' }}>
            <TouchableWithoutFeedback>
              <View style={{ backgroundColor: '#FFF', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, paddingBottom: 40 }}>
                <View style={{ width: 40, height: 5, backgroundColor: '#E0E0E0', borderRadius: 5, alignSelf: 'center', marginBottom: 20 }} />
                
                <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' }}>
                  {(selectedChat as any)?.otherUserName || 'การสนทนา'}
                </Text>

                <TouchableOpacity 
                  style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' }}
                  onPress={confirmDelete}
                >
                  <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#FFEBEE', justifyContent: 'center', alignItems: 'center', marginRight: 15 }}>
                    <Ionicons name="trash-outline" size={24} color="#E74C3C" />
                  </View>
                  <Text style={{ fontSize: 16, color: '#E74C3C', fontWeight: 'bold' }}>ลบการสนทนา</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 15, marginTop: 10 }}
                  onPress={() => setShowOptions(false)}
                >
                  <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#F5F5F5', justifyContent: 'center', alignItems: 'center', marginRight: 15 }}>
                    <Ionicons name="close-outline" size={24} color="#666" />
                  </View>
                  <Text style={{ fontSize: 16, color: '#666' }}>ยกเลิก</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </SafeAreaView>
  );
}
