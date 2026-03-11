import { API_ENDPOINTS, apiRequest } from './api';

export interface Message {
  id: number;
  room_id: string;
  sender_id: number | string;
  message: string;
  created_at?: string;
  full_name?: string;
  profile_picture?: string;
}

export interface ChatMessage extends Message {
  timestamp?: string;
  senderId?: string | number;
  chatId?: string;
  _id?: string;
}

export interface Chat {
  _id?: string;
  userId: number | string;
  otherUserId: number | string;
  otherUserName?: string;
  otherUserAvatar?: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount?: number;
  chatId?: string;
  room_id?: string;
  lastIsRead?: boolean;
  lastSenderId?: string | number;
}

class ChatService {
  // 1. ส่งข้อความใหม่
  async sendMessage(data: any) {
    try {
      const url = `${API_ENDPOINTS.BASE_URL}${API_ENDPOINTS.CHAT_SEND_MESSAGE}`;
      return await apiRequest(url, {
        method: 'POST',
        body: JSON.stringify({
          room_id: data.room_id || data.chat_id || data.chatId,
          sender_id: data.sender_id || data.senderId,
          message: data.message,
          image_url: data.image_url
        }),
      });
    } catch (error) {

      console.error('Error sending message:', error);
      throw error;
    }
  }

  // 🆕 ทำเครื่องหมายว่าอ่านแล้ว
  async markAsRead(roomId: string, userId: string | number) {
    try {
      const url = `${API_ENDPOINTS.BASE_URL}${API_ENDPOINTS.CHAT_MARK_READ}`;
      return await apiRequest(url, {
        method: 'POST',
        body: JSON.stringify({
          room_id: roomId,
          userId: userId.toString()
        }),
      });
    } catch (error) {
      console.error('Error marking as read:', error);
      return { success: false };
    }
  }

  // 🆕 อัปโหลดรูปภาพ
  async uploadImage(imageUri: string) {
    try {
      const baseUrl = API_ENDPOINTS.BASE_URL.endsWith('/')
        ? API_ENDPOINTS.BASE_URL.slice(0, -1)
        : API_ENDPOINTS.BASE_URL;

      const endpoint = API_ENDPOINTS.CHAT_UPLOAD_IMAGE.startsWith('/')
        ? API_ENDPOINTS.CHAT_UPLOAD_IMAGE
        : `/${API_ENDPOINTS.CHAT_UPLOAD_IMAGE}`;

      const url = `${baseUrl}${endpoint}`;

      const formData = new FormData();
      const filename = imageUri.split('/').pop();
      const match = /\.(\w+)$/.exec(filename || '');
      const type = match ? `image/${match[1]}` : `image`;

      formData.append('image', {
        uri: imageUri,
        name: filename,
        type,
      } as any);

      return await apiRequest(url, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    } catch (error) {
      console.error('Error uploading chat image:', error);
      throw error;
    }
  }

  // 2. ดึงประวัติการแชท
  async getChatHistory(room_id: string) {
    try {
      const url = `${API_ENDPOINTS.BASE_URL}${API_ENDPOINTS.CHAT_HISTORY.replace('{CHAT_ID}', room_id)}`;
      return await apiRequest(url, {
        method: 'GET',
      });
    } catch (error) {
      console.error('Error fetching chat history:', error);
      return [];
    }
  }

  // 3. ดึงรายการแชทล่าสุด
  async getChatListByUser(userId: number | string) {
    try {
      const url = `${API_ENDPOINTS.BASE_URL}${API_ENDPOINTS.CHAT_LIST_BY_USER.replace('{USER_ID}', userId.toString())}`;
      const response = await apiRequest(url, {
        method: 'GET',
      });
      return response.success ? response.data : response;
    } catch (error) {
      console.error('Error fetching chat list:', error);
      return [];
    }
  }

  // 4. ดึงข้อมูลสรุปการจอง
  async getChatBookingSummary(chatId: string) {
    try {
      const url = `${API_ENDPOINTS.BASE_URL}${API_ENDPOINTS.CHAT_BOOKING_SUMMARY.replace('{CHAT_ID}', chatId)}`;
      return await apiRequest(url, {
        method: 'GET',
      });
    } catch (error) {
      console.error('Error fetching booking summary:', error);
      return null;
    }
  }

  // 5. จัดการ URL รูปภาพ
  formatImageUrl(url?: string) {
    if (!url || typeof url !== 'string' || url === 'undefined' || url === 'null') return null;
    if (url.startsWith('http')) return url;

    // ล้างค่าที่เป็น path สกปรก เช่น //uploads หรือ ./uploads
    let cleanPath = url.replace(/^[\/\.]+/, '');

    let finalUrl = '';
    // ✅ กรณีเป็น path uploads/ (ทั้งรูปสินค้าและแชท)
    if (cleanPath.includes('uploads/')) {
      finalUrl = `${API_ENDPOINTS.RENTAL_BASE_URL}/${cleanPath}`;
    }
    // fallback กรณีเป็นรูปโปรไฟล์ที่เก็บแค่ชื่อไฟล์
    else if (cleanPath.includes('profile-')) {
      finalUrl = `${API_ENDPOINTS.RENTAL_BASE_URL}/uploads/profiles/${cleanPath}`;
    }
    // fallback กรณีรูปอื่นๆ ที่มี path มาเฉยๆ
    else {
      finalUrl = `${API_ENDPOINTS.RENTAL_BASE_URL}/${cleanPath}`;
    }

    // เพิ่ม cache buster เล็กน้อยเพื่อไม่ให้รูปค้าง (เลือกใช้ t=... ถ้าต้องการ force refresh)
    // return `${finalUrl}?t=${new Date().getTime()}`; 
    return finalUrl;
  }


}

const chatService = new ChatService();
export default chatService;
