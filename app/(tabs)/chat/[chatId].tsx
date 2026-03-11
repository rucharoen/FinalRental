import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
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
import { API_ENDPOINTS, apiRequest } from '../../../services/api';
import authService from '../../../services/auth.service';
import chatService, { ChatMessage } from '../../../services/chat.service';
import shopService from '../../../services/shop.service';
import styles from '../../../styles/chat.styles';

export default function ChatScreen() {
  const { chatId, shopId, shopName: paramShopName } = useLocalSearchParams();
  const router = useRouter();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [shopName, setShopName] = useState('กำลังโหลด...');
  const [shopAvatar, setShopAvatar] = useState('https://picsum.photos/seed/shop/100/100');
  const scrollViewRef = useRef<ScrollView>(null);

  const [actualChatId, setActualChatId] = useState<string>(chatId as string);
  const [bookingSummary, setBookingSummary] = useState<any>(null);
  const [sendingImage, setSendingImage] = useState(false);

  useEffect(() => {
    loadInitialData();
    const interval = setInterval(() => fetchMessages(), 3000);
    return () => clearInterval(interval);
  }, [chatId, actualChatId]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      
      // Use param values if available to avoid unnecessary API calls
      if (paramShopName) {
        setShopName(paramShopName as string);
      }
      
      const userData = await authService.getUserData();
      if (!userData) return;

      setCurrentUser(userData);
      const myId = (userData.id || userData._id).toString();

      let targetChatId = chatId as string;

      if (!targetChatId || targetChatId === 'default' || targetChatId === 'NaN') {
        setLoading(false);
        setShopName('รายการสนทนา');
        return;
      }

      if (targetChatId && !targetChatId.startsWith('chat_')) {
        const id1 = parseInt(myId);
        const id2 = parseInt(targetChatId);

        if (!isNaN(id2)) {
          const sortedIds = [id1, id2].sort((a, b) => a - b);
          targetChatId = `chat_${sortedIds[0]}_${sortedIds[1]}`;
          setActualChatId(targetChatId);
        }
      }

      const otherUserId = targetChatId && targetChatId.startsWith('chat_')
        ? targetChatId.replace('chat_', '').split('_').find(id => id !== myId)
        : targetChatId;

      if (otherUserId && otherUserId !== 'NaN' && otherUserId !== 'default') {
        let nameFound: string = '';
        let avatarFound: string = '';

        try {
          // 1. Try from Chat List
          try {
            const chatList = await chatService.getChatListByUser(myId);
            const currentChat = chatList.find((c: any) => c.room_id === targetChatId || c.chatId === targetChatId);
            if (currentChat && currentChat.otherUserName) {
              nameFound = currentChat.otherUserName;
              avatarFound = chatService.formatImageUrl(currentChat.otherUserAvatar) ?? '';
            }
          } catch (e) { }

          // 2. Try from Shop Info
          if (!nameFound) {
            try {
              const fetchId = (shopId as string) || otherUserId;
              const response = await shopService.getShopInfo(fetchId);
              let shop = response?.data || response;
              const sName = shop?.name || shop?.shop_name || shop?.shopName;
              const sImg = shop?.image || shop?.shop_image || shop?.profile_picture;
              if (sName) nameFound = sName;
              if (sImg) avatarFound = chatService.formatImageUrl(sImg) ?? '';
            } catch (e) {
              console.warn('[Chat] Failed to fetch shop info for ID:', (shopId || otherUserId));
            }
          }

          // 3. Try from All Shops fallback
          if (!nameFound) {
            try {
              const allShopsRes = await shopService.getMyShop();
              const allShops = allShopsRes?.shops || allShopsRes?.data || (Array.isArray(allShopsRes) ? allShopsRes : []);
              if (Array.isArray(allShops)) {
                const foundShop = allShops.find((s: any) =>
                  s.owner_id?.toString() === otherUserId ||
                  s.id?.toString() === otherUserId
                );
                if (foundShop) {
                  nameFound = foundShop.name || foundShop.shop_name;
                  avatarFound = chatService.formatImageUrl(foundShop.image || foundShop.shop_image) ?? '';
                }
              }
            } catch (e) { }
          }

          // 4. Try from User Info API
          if (!nameFound) {
            try {
              const url = `${API_ENDPOINTS.BASE_URL}${API_ENDPOINTS.CHAT_USER_INFO.replace('{USER_ID}', otherUserId)}`;
              const response = await apiRequest(url, { method: 'GET', withAuth: false });
              if (response && response.success && response.user) {
                nameFound = response.user.full_name;
                avatarFound = chatService.formatImageUrl(response.user.profile_picture) ?? '';
              }
            } catch (e) { }
          }

          if (nameFound) {
            setShopName(nameFound);
            if (avatarFound) setShopAvatar(avatarFound);
          } else {
            setShopName(`ผู้ใช้ ${otherUserId}`);
            setShopAvatar('https://ui-avatars.com/api/?name=User&background=random');
          }
        } catch (e) {
          setShopName(`ผู้ใช้ ${otherUserId}`);
        }
      }

      try {
        const summary = await chatService.getChatBookingSummary(targetChatId);
        if (summary && (summary.productName || summary.data)) {
          setBookingSummary(summary.data || summary);
        }
      } catch (e) { }

      await fetchMessages(userData, targetChatId);

      // ✅ มาร์กว่าอ่านแล้วเมื่อเข้าห้อง
      if (userData && targetChatId) {
        await chatService.markAsRead(targetChatId, userData.id || userData._id);
      }
    } catch (error) {
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

      if (newMessages.length !== messages.length) {
        setMessages(newMessages);
      }
    } catch (error) { }
  };

  const handlePickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.7,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const uri = result.assets[0].uri;
        setSendingImage(true);
        const uploadRes = await chatService.uploadImage(uri);
        if (uploadRes.success && uploadRes.imageUrl) {
          await handleSend(uploadRes.imageUrl);
        }
      }
    } catch (error) {
      alert('ไม่สามารถอัปโหลดรูปภาพได้');
    } finally {
      setSendingImage(false);
    }
  };

  const handleSend = async (imageParam?: string) => {
    if (!message.trim() && !imageParam) return;
    if (!currentUser || !actualChatId) return;

    const currentMessage = message.trim();
    if (!imageParam) setMessage('');

    const newMessage: any = {
      room_id: actualChatId,
      sender_id: (currentUser.id || currentUser._id).toString(),
      message: currentMessage || null,
      image_url: imageParam || null
    };

    try {
      const optimisticMsg: any = {
        ...newMessage,
        timestamp: new Date().toISOString(),
        _id: Date.now().toString()
      };

      setMessages(prev => [...prev, optimisticMsg]);
      await chatService.sendMessage(newMessage);
      fetchMessages();
    } catch (error) {
      alert('ไม่สามารถส่งข้อความได้');
    }
  };

  const groupMessagesByDate = (history: ChatMessage[]) => {
    const groups: { [key: string]: ChatMessage[] } = {};
    const sorted = [...history].sort((a, b) => {
      const dateA = new Date(a.created_at || a.timestamp || 0).getTime();
      const dateB = new Date(b.created_at || b.timestamp || 0).getTime();
      return dateA - dateB;
    });

    sorted.forEach(msg => {
      const timestamp = msg.created_at || msg.timestamp || new Date().toISOString();
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) return;
      const dateStr = date.toLocaleDateString('th-TH', { day: 'numeric', month: 'short' });
      if (!groups[dateStr]) groups[dateStr] = [];
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
      
      return date.toLocaleTimeString('th-TH', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      }).replace(':', '.');
    } catch (e) { return ''; }
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
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
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
  
        <ScrollView
          ref={scrollViewRef}
          style={styles.chatList}
          contentContainerStyle={[styles.messageListContainer, { flexGrow: 1 }]}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
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
                <Text style={styles.summaryName} numberOfLines={1}>{bookingSummary.product_name || bookingSummary.productName}</Text>
                <Text style={styles.summaryPrice}>฿{(bookingSummary.total_price || 0).toLocaleString()}</Text>
              </View>
              <TouchableOpacity style={styles.summaryButton}>
                <Text style={styles.summaryButtonText}>ดูรายละเอียด</Text>
              </TouchableOpacity>
            </View>
          )}
  
          {Object.entries(groupedMessages || {}).map(([date, msgs]) => (
            <React.Fragment key={date}>
              <View style={styles.dateHeader}><Text style={styles.dateText}>{date}</Text></View>
              {msgs.map((item, index) => {
                const currentUserId = (currentUser?.id || currentUser?._id)?.toString();
                const senderId = (item.sender_id || item.senderId)?.toString();
                const isMe = currentUserId === senderId;
                const imgUrl = (item as any).image_url;
  
                return (
                  <View key={item._id || `msg-${index}-${item.timestamp}`} style={[styles.messageRow, isMe ? styles.rightRow : styles.leftRow]}>
                    <View style={[
                      styles.messageContainer,
                      isMe ? styles.rightMessage : styles.leftMessage,
                      imgUrl && { backgroundColor: 'transparent', padding: 0 }
                    ]}>
                      <View style={styles.messageContent}>
                        {imgUrl ? (
                          <Image
                            source={{ uri: chatService.formatImageUrl(imgUrl) || '' }}
                            style={{ width: 200, height: 200, borderRadius: 12 }}
                            resizeMode="cover"
                          />
                        ) : (
                          <Text style={[styles.messageText, isMe && { color: '#FFFFFF' }]}>{item.message}</Text>
                        )}
                        <Text style={[
                          styles.timeText,
                          isMe && !imgUrl && { color: 'rgba(255, 255, 255, 0.8)' },
                          imgUrl && { position: 'absolute', bottom: 5, right: 10, backgroundColor: 'rgba(0,0,0,0.5)', color: '#FFF', padding: 2, borderRadius: 4 }
                        ]}>
                          {formatTime(item)}
                        </Text>
                      </View>
                    </View>
                  </View>
                );
              })}
            </React.Fragment>
          ))}
        </ScrollView>
  
        <View style={styles.inputContainer}>
          <TouchableOpacity style={styles.iconButton} onPress={handlePickImage} disabled={sendingImage}>
            {sendingImage ? <ActivityIndicator size="small" color="#000" /> : <Ionicons name="camera-outline" size={32} color="#000" />}
          </TouchableOpacity>
          <TextInput
            style={styles.textInput}
            placeholder="พิมพ์ข้อความ"
            value={message}
            onChangeText={setMessage}
            onSubmitEditing={() => handleSend()}
            placeholderTextColor="#95A5A6"
          />
          <TouchableOpacity
            style={[styles.sendButton, !message.trim() && { backgroundColor: '#BDC3C7' }]}
            onPress={() => handleSend()}
            disabled={!message.trim()}
          >
            <Text style={styles.sendText}>ส่ง</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
