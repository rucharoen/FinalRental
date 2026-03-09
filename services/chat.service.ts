import { API_ENDPOINTS, apiRequest } from './api';

export interface ChatMessage {
  _id?: string;
  chatId?: string;
  room_id?: string;
  senderId?: string;
  sender_id?: string;
  message: string;
  timestamp?: string;
  created_at?: string;
}

export interface Chat {
  _id?: string;
  chatId: string;
  userId: string;
  otherUserId: string;
  otherUserName?: string;
  otherUserAvatar?: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount?: number;
  messages?: ChatMessage[];
}

class ChatService {
  async sendMessage(data: any) {
    const payload = {
      room_id: data.chatId || data.room_id || data.chat_id,
      sender_id: data.senderId || data.sender_id,
      message: data.message
    };
    return apiRequest(
      `${API_ENDPOINTS.BASE_URL}${API_ENDPOINTS.CHAT_SEND_MESSAGE}`,
      {
        method: 'POST',
        body: JSON.stringify(payload),
        withAuth: true,
      }
    );
  }

  async getChatHistory(chatId: string) {
    const url = API_ENDPOINTS.CHAT_HISTORY.replace('{CHAT_ID}', chatId);
    const response = await apiRequest<any>(
      `${API_ENDPOINTS.BASE_URL}${url}`,
      {
        method: 'GET',
        withAuth: true,
      }
    );
    // ดึง data จาก { success: true, data: [...] }
    return response?.data || response;
  }

  async getChatListByUser(userId: string) {
    const url = API_ENDPOINTS.CHAT_LIST_BY_USER.replace('{USER_ID}', userId);
    const response = await apiRequest<any>(
      `${API_ENDPOINTS.BASE_URL}${url}`,
      {
        method: 'GET',
        withAuth: true,
      }
    );

    console.log('[DEBUG] Chat List Response for User:', userId, JSON.stringify(response, null, 2));

    // แมปข้อมูลจาก Backend ให้ตรงกับ Interface ของแอป
    const list = response?.data || [];
    return list.map((item: any) => ({
      ...item,
      chatId: item.room_id,
      otherUserId: item.partner_id?.toString(),
      otherUserName: item.partner_shop_name || item.shop_name || item.partner_name || item.partner_shopName || 'ผู้ใช้',
      otherUserAvatar: this.formatImageUrl(item.partner_shop_image || item.partner_image || item.shop_image || item.partner_avatar || item.partner_shopAvatar),
      lastMessage: item.message,
      lastMessageTime: item.created_at,
      userId: userId // เราคือผู้ใช้งานปัจจุบัน
    }));
  }

  public formatImageUrl(path: string | null) {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    const baseUrl = 'https://finalrental.onrender.com';
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    return `${baseUrl}${normalizedPath}`;
  }


  async getChatBookingSummary(chatId: string) {
    const url = API_ENDPOINTS.CHAT_BOOKING_SUMMARY.replace('{CHAT_ID}', chatId);
    const response = await apiRequest<any>(
      `${API_ENDPOINTS.BASE_URL}${url}`,
      {
        method: 'GET',
        withAuth: true,
      }
    );
    return response?.data || response;
  }
}

export default new ChatService();
