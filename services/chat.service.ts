import { apiRequest } from './api';
import { API_ENDPOINTS } from './api';

export interface ChatMessage {
  _id?: string;
  chatId: string;
  senderId: string;
  message: string;
  timestamp?: string;
}

export interface Chat {
  _id?: string;
  userId: string;
  otherUserId: string;
  messages?: ChatMessage[];
  lastMessage?: string;
  lastMessageTime?: string;
}

class ChatService {
  async sendMessage(data: ChatMessage) {
    return apiRequest(
      `${API_ENDPOINTS.BASE_URL}${API_ENDPOINTS.CHAT_SEND_MESSAGE}`,
      {
        method: 'POST',
        body: JSON.stringify(data),
        withAuth: true,
      }
    );
  }

  async getChatHistory(chatId: string) {
    const url = API_ENDPOINTS.CHAT_HISTORY.replace('{CHAT_ID}', chatId);
    return apiRequest(
      `${API_ENDPOINTS.BASE_URL}${url}`,
      {
        method: 'GET',
        withAuth: true,
      }
    );
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
    // ตรวจสอบโครงสร้างข้อมูลที่ส่งกลับมา
    if (response && Array.isArray(response)) return response;
    if (response && Array.isArray(response.chats)) return response.chats;
    if (response && Array.isArray(response.chatList)) return response.chatList;
    if (response && response.data && Array.isArray(response.data)) return response.data;
    return [];
  }


  async getChatBookingSummary(chatId: string) {
    const url = API_ENDPOINTS.CHAT_BOOKING_SUMMARY.replace('{CHAT_ID}', chatId);
    return apiRequest(
      `${API_ENDPOINTS.BASE_URL}${url}`,
      {
        method: 'GET',
        withAuth: true,
      }
    );
  }
}

export default new ChatService();
