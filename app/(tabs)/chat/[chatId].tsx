import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import authService from '../../../services/auth.service';
import chatService, { ChatMessage } from '../../../services/chat.service';
import shopService from '../../../services/shop.service';
import styles from '../../../styles/chat.styles';

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
      if (!targetChatId || targetChatId === 'default' || targetChatId === 'NaN') {
        setLoading(false);
        setShopName('รายการสนทนา');
        console.warn('[DEBUG] Invalid Chat ID detected:', targetChatId);
        return;
      }

      if (targetChatId && !targetChatId.startsWith('chat_')) {
        const id1 = parseInt(myId);
        const id2 = parseInt(targetChatId);

        if (isNaN(id2)) {
          // targetChatId remains as is
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

      if (otherUserId && otherUserId !== 'NaN' && otherUserId !== 'default') {
        try {
          let nameFound: string = '';
          let avatarFound: string = '';

          // 1. พยายามหาจาก Chat List (มีข้อมูล Shop สวยๆ จาก SQL Join)
          try {
            const chatList = await chatService.getChatListByUser(myId);
            const currentChat = chatList.find((c: any) => c.chatId === targetChatId || c.room_id === targetChatId);
            if (currentChat && currentChat.otherUserName && currentChat.otherUserName !== 'ผู้ใช้') {
              nameFound = currentChat.otherUserName;
              avatarFound = currentChat.otherUserAvatar ?? '';
            }
          } catch (e) { /* ignore chat list error */ }

          // 2. ถ้ายังไม่ได้ชื่อร้าน หรืออยากอัปเดตข้อมูลให้สดใหม่ ให้ลองหาผ่าน shopService
          try {
            const response = await shopService.getShopInfo(otherUserId);
            let shop = response?.data || response;

            // ตรวจสอบชื่อในหลายๆ รูปแบบ (Backend อาจส่งมาต่างกัน)
            const sName = shop?.name || shop?.shop_name || shop?.shopName || shop?.partner_shop_name;
            const sImg = shop?.image || shop?.shop_image || shop?.profile_picture || shop?.avatar || shop?.partner_shop_image;

            if (sName) nameFound = sName;
            if (sImg) avatarFound = chatService.formatImageUrl(sImg) ?? '';

            // 3. Fallback: ถ้ายังไม่เจอชื่อ (เพราะ ID ที่ได้มาเป็น Owner ID ไม่ใช่ Shop ID) ให้หาจากร้านค้าทั้งหมด
            if (!nameFound) {
              const allShopsRes = await shopService.getMyShop();
              const allShops = allShopsRes?.shops || allShopsRes?.data || (Array.isArray(allShopsRes) ? allShopsRes : []);
              if (Array.isArray(allShops)) {
                const foundShop = allShops.find((s: any) =>
                  s.owner_id?.toString() === otherUserId ||
                  s.id?.toString() === otherUserId ||
                  s.ownerId?.toString() === otherUserId
                );
                if (foundShop) {
                  nameFound = foundShop.name || foundShop.shop_name || foundShop.shopName;
                  avatarFound = chatService.formatImageUrl(foundShop.image || foundShop.shop_image) ?? '';
                }
              }
            }
          } catch (e) { /* ignore shop fetch error */ }

          // แสดงผลข้อมูลที่หาได้
          if (nameFound) {
            setShopName(nameFound);
            if (avatarFound) setShopAvatar(avatarFound);
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
          // No booking summary available
        }
      } else {
        setShopName('รายการสนทนา');
      }

      console.log('[DEBUG] Chat Init:', { myId, targetChatId, otherUserId });
      await fetchMessages(userData, targetChatId);
    } catch (error) {
      // Chat Init Error
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (userParam?: any, idParam?: string) => {
    const activeId = idParam || actualChatId;
    if (!activeId || activeId === 'default' || activeId === 'NaN') return;

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

      console.log(`[DEBUG] Fetched ${newMessages.length} messages for room: ${activeId}`);

      if (newMessages.length !== messages.length) {
        setMessages(newMessages);
      }
    } catch (error) {
      // Error fetching messages
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
      alert('ไม่สามารถส่งข้อความได้');
    }
  };

  const groupMessagesByDate = (history: ChatMessage[]) => {
    const groups: { [key: string]: ChatMessage[] } = {};

    // Sort messages to ensure they are in order before grouping
    const sorted = [...history].sort((a, b) => {
      const dateA = new Date(a.created_at || a.timestamp || 0).getTime();
      const dateB = new Date(b.created_at || b.timestamp || 0).getTime();
      return dateA - dateB;
    });

    sorted.forEach(msg => {
      const timestamp = msg.created_at || msg.timestamp || new Date().toISOString();
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

  const formatTime = (msg: ChatMessage) => {
    const timestamp = msg.created_at || msg.timestamp;
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
            <Image
              source={{
                uri: (bookingSummary.product_images && Array.isArray(bookingSummary.product_images) && bookingSummary.product_images.length > 0)
                  ? chatService.formatImageUrl(bookingSummary.product_images[0])
                  : (bookingSummary.image || 'https://via.placeholder.com/150')
              }}
              style={styles.summaryImage}
            />
            <View style={styles.summaryInfo}>
              <Text style={styles.summaryName} numberOfLines={1}>
                {bookingSummary.product_name || bookingSummary.productName}
              </Text>
              <Text style={styles.summaryPrice}>
                ฿{(bookingSummary.total_price || bookingSummary.totalPrice || 0).toLocaleString()}
              </Text>
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
                        <Text style={styles.timeText}>{formatTime(item)}</Text>
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
