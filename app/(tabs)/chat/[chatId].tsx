import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Keyboard
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons, Feather } from '@expo/vector-icons';
import styles from '../../../styles/chat.styles';
import chatService, { ChatMessage } from '../../../services/chat.service';
import authService from '../../../services/auth.service';
import shopService from '../../../services/shop.service';

export default function ChatScreen() {
  const { chatId } = useLocalSearchParams(); // นี่คือ ID ของคู่สนทนา (Owner ID หรือ Room ID)
  const router = useRouter();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [shopName, setShopName] = useState('กำลังโหลด...');
  const [shopAvatar, setShopAvatar] = useState('https://picsum.photos/seed/shop/100/100');
  const scrollViewRef = useRef<ScrollView>(null);

  const [actualChatId, setActualChatId] = useState<string>(chatId as string);

  useEffect(() => {
    loadInitialData();
    const interval = setInterval(() => fetchMessages(), 3000);
    return () => clearInterval(interval);
  }, [chatId, actualChatId]);

  const [bookingSummary, setBookingSummary] = useState<any>(null);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const userData = await authService.getUserData();
      if (!userData) return;

      setCurrentUser(userData);
      const myId = (userData.id || userData._id).toString();

      // จัดการกับ ChatId: ถ้าส่งมาแค่เลข ID เดียว (เช่นจากหน้า Product) ให้สร้างเป็น format chat_ID1_ID2
      let targetChatId = chatId as string;

      // ถ้าไม่มี chatId หรือเป็น 'default' ให้ข้ามไปก่อน
      if (!targetChatId || targetChatId === 'default') {
        setLoading(false);
        setShopName('รายการสนทนา');
        return;
      }

      console.log('--- [DEBUG] Chat Screen Init ---', {
        chatId,
        myId,
        targetChatId
      });

      if (targetChatId && !targetChatId.startsWith('chat_')) {
        const id1 = parseInt(myId);
        const id2 = parseInt(targetChatId);

        if (isNaN(id2)) {
          console.log('[Chat] Skipping numeric conversion for non-numeric ID:', targetChatId);
        } else {
          const sortedIds = [id1, id2].sort((a, b) => a - b);
          targetChatId = `chat_${sortedIds[0]}_${sortedIds[1]}`;
          setActualChatId(targetChatId);
        }
      }

      // Fetch shop details or User info
      const otherUserId = targetChatId && targetChatId.startsWith('chat_')
        ? targetChatId.replace('chat_', '').split('_').find(id => id !== myId)
        : targetChatId;

      console.log('--- [DEBUG] Found Partner ID ---', otherUserId);

      if (otherUserId && otherUserId !== 'NaN' && otherUserId !== 'default') {
        try {
          // พยายามหาข้อมูลผ่าน shopService ก่อน
          const shop = await shopService.getShopInfo(otherUserId);
          if (shop && (shop.name || shop.shopName)) {
            setShopName(shop.name || shop.shopName);
            setShopAvatar(chatService.formatImageUrl(shop.image || shop.profile_picture) || 'https://picsum.photos/seed/' + otherUserId + '/200/200');
          } else {
            setShopName(`ผู้ใช้ ${otherUserId}`);
            setShopAvatar('https://picsum.photos/seed/' + otherUserId + '/200/200');
          }
        } catch (e) {
          setShopName(`ผู้ใช้ ${otherUserId}`);
          setShopAvatar('https://picsum.photos/seed/' + otherUserId + '/200/200');
        }

        // Fetch Booking Summary
        try {
          const summary = await chatService.getChatBookingSummary(targetChatId);
          if (summary && (summary.productName || summary.data)) {
            setBookingSummary(summary.data || summary);
          }
        } catch (e) {
          console.log('No booking summary available');
        }
      } else {
        setShopName('รายการสนทนา');
      }

      await fetchMessages(userData, targetChatId);
    } catch (error) {
      console.error('Chat Init Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (userParam?: any, idParam?: string) => {
    const activeId = idParam || actualChatId;
    if (!activeId) return;

    const activeUser = userParam || currentUser;
    if (!activeUser) return;

    try {
      const response = await chatService.getChatHistory(activeId);
      let newMessages: ChatMessage[] = [];

      if (Array.isArray(response)) {
        newMessages = response;
      } else if (response && Array.isArray(response.messages)) {
        newMessages = response.messages;
      } else if (response && response.data && Array.isArray(response.data)) {
        newMessages = response.data;
      }

      if (newMessages.length !== messages.length) {
        setMessages(newMessages);
      }
    } catch (error) {
      console.log('Fetch error:', error);
    }
  };

  const handleSend = async () => {
    if (!message.trim() || !currentUser || !actualChatId) return;

    const currentMessage = message.trim();
    setMessage('');

    const newMessage: any = {
      chat_id: actualChatId,
      sender_id: (currentUser.id || currentUser._id).toString(),
      message: currentMessage,
    };

    try {
      const optimisticMsg: any = {
        ...newMessage,
        chatId: actualChatId, // for local UI which might use camelCase
        senderId: newMessage.sender_id,
        timestamp: new Date().toISOString(),
        _id: Date.now().toString()
      };

      setMessages(prev => [...prev, optimisticMsg]);
      await chatService.sendMessage(optimisticMsg);
      fetchMessages();
    } catch (error) {
      console.error('Send Error:', error);
      alert('ไม่สามารถส่งข้อความได้');
    }
  };

  const groupMessagesByDate = (history: ChatMessage[]) => {
    const groups: { [key: string]: ChatMessage[] } = {};

    // Sort messages to ensure they are in order before grouping
    const sorted = [...history].sort((a, b) => {
      const dateA = new Date(a.timestamp || 0).getTime();
      const dateB = new Date(b.timestamp || 0).getTime();
      return dateA - dateB;
    });

    sorted.forEach(msg => {
      const timestamp = msg.timestamp || new Date().toISOString();
      const date = new Date(timestamp);

      // Safe check for Invalid Date
      if (isNaN(date.getTime())) {
        return;
      }

      const dateStr = date.toLocaleDateString('th-TH', {
        day: 'numeric',
        month: 'short'
      });

      if (!groups[dateStr]) {
        groups[dateStr] = [];
      }
      groups[dateStr].push(msg);
    });

    return groups;
  };

  const formatTime = (timestamp?: string) => {
    if (!timestamp) return '...';
    try {
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) return '';
      return `${date.getHours().toString().padStart(2, '0')}.${date.getMinutes().toString().padStart(2, '0')}`;
    } catch (e) {
      return '';
    }
  };

  if (loading && messages.length === 0) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F7F8FA' }}>
        <ActivityIndicator size="large" color="#3498DB" />
      </View>
    );
  }

  const groupedMessages = groupMessagesByDate(messages);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)/chat')}
          style={styles.backButton}
        >
          <Ionicons name="chevron-back" size={28} color="#000" />
        </TouchableOpacity>

        <View style={styles.shopInfo}>
          <Image source={{ uri: shopAvatar }} style={styles.avatar} />
          <Text style={styles.shopName}>{shopName}</Text>
        </View>
      </View>

      {/* Chat List */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.chatList}
        contentContainerStyle={[styles.messageListContainer, { flexGrow: 1 }]}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
      >
        {/* Booking Summary Card */}
        {bookingSummary && (
          <View style={styles.summaryCard}>
            <Image source={{ uri: bookingSummary.image }} style={styles.summaryImage} />
            <View style={styles.summaryInfo}>
              <Text style={styles.summaryName} numberOfLines={1}>{bookingSummary.productName}</Text>
              <Text style={styles.summaryPrice}>฿{bookingSummary.totalPrice?.toLocaleString() || bookingSummary.price?.toLocaleString()}</Text>
            </View>
            <TouchableOpacity style={styles.summaryButton}>
              <Text style={styles.summaryButtonText}>ดูรายละเอียด</Text>
            </TouchableOpacity>
          </View>
        )}

        {messages && messages.length > 0 ? (
          Object.entries(groupedMessages || {}).map(([date, msgs]) => (
            <React.Fragment key={date}>
              <View style={styles.dateHeader}>
                <Text style={styles.dateText}>{date}</Text>
              </View>

              {msgs.map((item, index) => {
                const currentUserId = (currentUser?.id || currentUser?._id)?.toString();
                const senderId = (item.sender_id || item.senderId)?.toString();
                const isMe = currentUserId === senderId;

                return (
                  <View
                    key={item._id || `msg-${index}-${item.timestamp}`}
                    style={[styles.messageRow, isMe ? styles.rightRow : styles.leftRow]}
                  >
                    <View
                      style={[
                        styles.messageContainer,
                        isMe ? styles.rightMessage : styles.leftMessage
                      ]}
                    >
                      <View style={styles.messageContent}>
                        <Text style={styles.messageText}>{item.message}</Text>
                        <Text style={styles.timeText}>{formatTime(item.timestamp)}</Text>
                      </View>
                    </View>
                  </View>
                );
              })}
            </React.Fragment>
          ))
        ) : (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
            <View style={styles.dateHeader}>
              <Text style={styles.dateText}>ยังไม่มีข้อความ เริ่มต้นการสนทนาได้เลย</Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Input Area */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <View style={styles.inputContainer}>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="camera-outline" size={32} color="#000" />
          </TouchableOpacity>

          <TextInput
            style={styles.textInput}
            placeholder="พิมพ์ข้อความ"
            value={message}
            onChangeText={setMessage}
            multiline={false}
            returnKeyType="send"
            onSubmitEditing={handleSend}
            placeholderTextColor="#95A5A6"
          />

          <TouchableOpacity
            style={[styles.sendButton, !message.trim() && { backgroundColor: '#BDC3C7' }]}
            onPress={handleSend}
            disabled={!message.trim()}
          >
            <Text style={styles.sendText}>ส่ง</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
