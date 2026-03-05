import { apiRequest } from './api';
import { API_ENDPOINTS } from './api';

export interface Shop {
  id?: number;         // เปลี่ยนจาก _id: string เป็น id: number (ตาม int4)
  owner_id: number;    // เปลี่ยนจาก ownerId เป็น owner_id
  name: string;        // เปลี่ยนจาก shopName เป็น name
  description?: string; // เปลี่ยนจาก shopDescription เป็น description
  // ... field อื่นๆ ถ้ามี
}


class ShopService {
  async getShopInfo(shopId: string) {
    return apiRequest(
      `${API_ENDPOINTS.BASE_URL}/shops/${shopId}`,
      {
        method: 'GET',
        withAuth: false,
      }
    );
  }

  async createShop(data: Shop) {
    return apiRequest(
      `${API_ENDPOINTS.BASE_URL}/shops`,
      {
        method: 'POST',
        body: JSON.stringify(data),
        withAuth: true,
      }
    );
  }

  async updateShop(shopId: string, data: Partial<Shop>) {
    return apiRequest(
      `${API_ENDPOINTS.BASE_URL}/shops/${shopId}`,
      {
        method: 'PUT',
        body: JSON.stringify(data),
        withAuth: true,
      }
    );
  }

  async getMyShop() {
    return apiRequest(
      `${API_ENDPOINTS.BASE_URL}/shops`, // <--- ใช้ตัวเดียวกับที่เราดูในบราวเซอร์ (ซึ่งมันผ่าน)
      { method: 'GET', withAuth: false } // ปิด withAuth ไปก่อน เพราะในบราวเซอร์เราดูได้โดยไม่ต้องมี
    );
  }
}

export default new ShopService();
