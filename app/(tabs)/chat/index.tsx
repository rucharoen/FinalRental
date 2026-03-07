import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  SafeAreaView
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import chatService, { Chat } from '../../../services/chat.service';
import authService from '../../../services/auth.service';
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
      const date = new Date(time);
      if (isNaN(date.getTime())) return '';
      return `${date.getHours().toString().padStart(2, '0')}.${date.getMinutes().toString().padStart(2, '0')}`;
    } catch (e) {
      return '';
    }
  };

  const renderChatItem = ({ item }: { item: Chat }) => {
    // 🔥 Debug เพื่อดูข้อมูลในแต่ละแถว
    console.log('--- [DEBUG] Rendering Chat Item ---', {
      id: item.chatId,
      name: item.otherUserName,
      avatar: item.otherUserAvatar
    });

    // ระบุตัวตนของอีกฝ่ายในแชท
    const otherId = item.userId.toString() === userId ? item.otherUserId : item.userId;
    const isUnread = (item.unreadCount ?? 0) > 0;
    const navigationId = item.chatId || otherId;

    return (
      <TouchableOpacity
        style={styles.chatItem}
        onPress={() => router.push(`/(tabs)/chat/${navigationId}`)}
      >
        <View style={styles.avatarContainer}>
          <Image
            source={{ uri: item.otherUserAvatar || 'https://picsum.photos/seed/' + otherId + '/100/100' }}
            style={styles.avatar}
          />
          {isUnread && <View style={styles.unreadBadge} />}
        </View>
        <View style={styles.chatContent}>
          <View style={styles.chatHeader}>
            <Text style={[styles.shopName, isUnread && styles.unreadText]}>
              {item.otherUserName || `ผู้ใช้ ${otherId.toString().substring(0, 8)}`}
            </Text>
            <Text style={[styles.timeText, isUnread && styles.unreadTime]}>{formatTime(item.lastMessageTime)}</Text>
          </View>
          <View style={styles.lastMessageRow}>
            <Text
              style={[styles.lastMessage, isUnread && styles.unreadMessage]}
              numberOfLines={1}
            >
              {item.lastMessage || 'เริ่มต้นการสนทนาได้เลย'}
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

