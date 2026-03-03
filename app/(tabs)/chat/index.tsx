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
  }, []);

  const loadChatList = async () => {
    try {
      const userData = await authService.getUserData();
      if (userData) {
        const id = userData.id || userData._id;
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
      return `${date.getHours().toString().padStart(2, '0')}.${date.getMinutes().toString().padStart(2, '0')}`;
    } catch (e) {
      return '';
    }
  };

  const renderChatItem = ({ item }: { item: Chat }) => {
    // ระบุตัวตนของอีกฝ่ายในแชท (ถ้า userId ไม่ใช่เรา แสดงว่าเป็นอีกฝ่าย)
    const otherId = item.userId === userId ? item.otherUserId : item.userId;
    
    return (
      <TouchableOpacity 
        style={styles.chatItem}
        onPress={() => router.push(`/(tabs)/chat/${otherId}`)}
      >
        <Image 
          source={{ uri: 'https://picsum.photos/seed/' + otherId + '/100/100' }} 
          style={styles.avatar} 
        />
        <View style={styles.chatContent}>
          <View style={styles.chatHeader}>
            <Text style={styles.shopName}>ห้องแชท {otherId ? otherId.substring(0, 8) : 'ผู้ใช้'}</Text>
            <Text style={styles.timeText}>{formatTime(item.lastMessageTime)}</Text>
          </View>
          <Text style={styles.lastMessage} numberOfLines={1}>
            {item.lastMessage || 'ส่งข้อความเลย!'}
          </Text>
        </View>
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

