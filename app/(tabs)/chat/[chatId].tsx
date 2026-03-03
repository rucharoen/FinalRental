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

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const userData = await authService.getUserData();
      setCurrentUser(userData);
      
      // ดึงข้อมูลชื่อร้านค้า
      try {
        if (chatId) {
          const shopInfo = await shopService.getShopInfo(chatId as string);
          if (shopInfo && shopInfo.shopName) {
              setShopName(shopInfo.shopName);
              if (shopInfo.image) setShopAvatar(shopInfo.image);
          } else {
              setShopName(`ร้านค้า ${chatId.toString().substring(0, 6)}`);
          }
        }
      } catch (e) {
        setShopName(`ร้านค้า ${chatId?.toString().substring(0, 6)}`);
      }

      await fetchMessages();
    } catch (error) {
      console.error('Chat Init Error:', error);
    } finally {
      setLoading(false);
      // เลื่อนลงล่างสุดหลังจากโหลดเสร็จ
      setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 500);
    }
  };

  const fetchMessages = async () => {
    if (!chatId) return;
    try {
      const history = await chatService.getChatHistory(chatId as string);
      
      let newMessages = [];
      if (Array.isArray(history)) {
        newMessages = history;
      } else if (history && history.messages) {
        newMessages = history.messages;
      }

      // อัปเดตเฉพาะเมื่อมีข้อความใหม่จริงๆ เพื่อไม่ให้กระตุก
      if (newMessages.length !== messages.length) {
        setMessages(newMessages);
      }
    } catch (error) {
      // Quietly handle errors in polling
    }
  };

  const handleSend = async () => {
    if (!message.trim() || !currentUser) return;

    const currentMessage = message.trim();
    setMessage(''); // ล้างช่องพิมพ์ทันทีแบบตัวแปรส่ง (Real App feel)

    const newMessage: ChatMessage = {
      chatId: chatId as string,
      senderId: currentUser.id || currentUser._id,
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

  const formatTime = (timestamp?: string) => {
    if (!timestamp) return 'กำลังส่ง...';
    try {
      const date = new Date(timestamp);
      return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    } catch (e) {
      return '';
    }
  };

  if (loading && messages.length === 0) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F5F5F5' }}>
        <ActivityIndicator size="large" color="#3498DB" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color="#2C3E50" />
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
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
      >
        <View style={{ paddingTop: 10, paddingBottom: 20 }}>
          {messages.length > 0 ? (
            messages.map((item, index) => {
              const isMe = currentUser && (item.senderId === (currentUser.id || currentUser._id));
              return (
                <View 
                  key={item._id || index} 
                  style={[
                    styles.messageContainer, 
                    isMe ? styles.rightMessage : styles.leftMessage
                  ]}
                >
                  <Text style={styles.messageText}>{item.message}</Text>
                  <Text style={styles.timeText}>{formatTime(item.timestamp)}</Text>
                </View>
              );
            })
          ) : (
            <View style={styles.dateHeader}>
              <Text style={styles.dateText}>ยังไม่มีข้อความ เริ่มต้นการสนทนาได้เลย</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Input Area */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <View style={styles.inputContainer}>
          <TouchableOpacity style={styles.iconButton}>
            <Feather name="camera" size={24} color="#34495E" />
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
