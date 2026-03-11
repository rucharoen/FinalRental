import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  SafeAreaView,
  StatusBar,
  Text,
  TouchableOpacity,
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

  const formatTime = (time?: string) => {
    if (!time) return '';
    try {
      // ตรวจสอบความถูกต้องของวันเวลา
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
    
    // ตรวจสอบสถานะการอ่าน
    const unreadCount = item.unreadCount || (item as any).unread_count || 0;
    const lastIsRead = item.lastIsRead !== undefined ? item.lastIsRead : (item as any).is_read;
    const lastSenderId = item.lastSenderId || (item as any).last_sender_id;
    
    // แสดงจุดแดงถ้า: มีจำนวนข้อความค้างอยู่ หรือ (ข้อความล่าสุดยังไม่อ่าน และเราไม่ใช่คนส่ง)
    const isUnread = unreadCount > 0 || (lastIsRead === false && lastSenderId?.toString() !== userId);
    
    const navigationId = item.room_id || item.chatId || otherId;

    return (
      <TouchableOpacity
        style={styles.chatItem}
        onPress={() => router.push(`/(tabs)/chat/${navigationId}`)}
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
                ? `${item.unreadCount || 1} ข้อความใหม่`
                : ((item as any).lastMessage || 'เริ่มต้นการสนทนาได้เลย')}
            </Text>
            {isUnread && (
              <View style={styles.countBadge}>
                <Text style={styles.countText}>{item.unreadCount}</Text>
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
        keyExtractor={(item) => item._id || Math.random().toString()}
        style={styles.chatList}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>ยังไม่มีบทสนทนา</Text>
          </View>
        }
        onRefresh={loadChatList}
        refreshing={false}
      />
    </SafeAreaView>
  );
}

