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

  useEffect(() => {
    loadInitialData();
    // ดึงข้อมูลใหม่ทุก 3 วินาทีเพื่อให้ดู Real-time
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [chatId]);

  const [bookingSummary, setBookingSummary] = useState<any>(null);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const userData = await authService.getUserData();
      if (userData) {
        setCurrentUser(userData);
      }

      // Fetch shop details if it's a shop
      if (chatId) {
        try {
          const shop = await shopService.getShopInfo(chatId as string);
          if (shop) {
            setShopName(shop.shopName || shop.name || `ร้านค้า ${chatId.toString().substring(0, 6)}`);
            setShopAvatar(shop.image || 'https://picsum.photos/200/200');
          }
        } catch (e) {
          // If not a shop, maybe it's a user
          setShopName(`ร้านค้า ${chatId?.toString().substring(0, 6)}`);
        }

        // Fetch Booking Summary if available
        try {
          const summary = await chatService.getChatBookingSummary(chatId as string);
          console.log('Booking Summary:', summary);
          if (summary && (summary.productName || summary.data)) {
            setBookingSummary(summary.data || summary);
          }
        } catch (e) {
          console.log('No booking summary available for this chat');
        }
      }

      await fetchMessages(userData);
    } catch (error) {
      console.error('Chat Init Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (userParam?: any) => {
    if (!chatId) return;
    const activeUser = userParam || currentUser;
    if (!activeUser) return;

    try {
      const response = await chatService.getChatHistory(chatId as string);
      console.log('Chat History Response for', chatId, ':', JSON.stringify(response).substring(0, 100));

      let newMessages: ChatMessage[] = [];

      // Extensive fallback for various API response structures
      if (Array.isArray(response)) {
        newMessages = response;
      } else if (response && Array.isArray(response.messages)) {
        newMessages = response.messages;
      } else if (response && Array.isArray(response.data)) {
        newMessages = response.data;
      } else if (response && response.chat && Array.isArray(response.chat.messages)) {
        newMessages = response.chat.messages;
      } else if (response && response.history && Array.isArray(response.history)) {
        newMessages = response.history;
      }

      // ตรวจสอบข้อมูลใหม่
      if (newMessages.length > 0) {
        if (newMessages.length !== messages.length) {
          setMessages(newMessages);
        }
      } else if (messages.length === 0) {
        // เฉพาะกรณีที่เดิมว่างอยู่แล้ว
        setMessages([]);
      }
    } catch (error) {
      console.log('Fetch error for', chatId, ':', error);
    }
  };

  const handleSend = async () => {
    if (!message.trim() || !currentUser) return;

    const currentMessage = message.trim();
    setMessage(''); // ล้างช่องพิมพ์ทันทีแบบตัวแปรส่ง (Real App feel)

    const newMessage: ChatMessage = {
      chatId: chatId as string,
      senderId: (currentUser.id || currentUser._id).toString(),
      message: currentMessage,
    };

    try {
      // Optimistic Update: แสดงผลทันที
      const tempId = Date.now().toString();
      const optimisticMsg: ChatMessage = {
        ...newMessage,
        timestamp: new Date().toISOString(),
        _id: tempId
      };

      setMessages(prev => [...prev, optimisticMsg]);

      // ส่งข้อมูลเข้า Server จริง
      await chatService.sendMessage(newMessage);
      fetchMessages(); // รีโหลดเพื่อเอาจังหวะจริงจาก Server
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
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
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
                const senderId = item.senderId?.toString();
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
