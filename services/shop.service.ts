import * as SecureStore from 'expo-secure-store';
import { API_ENDPOINTS, apiRequest } from './api';

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
      `${API_ENDPOINTS.BASE_URL}/shops`,
      { method: 'GET', withAuth: false }
    );
  }

  async updateShopImage(shopId: string | number, formData: FormData) {
    const token = await SecureStore.getItemAsync('userToken');
    const response = await fetch(`${API_ENDPOINTS.BASE_URL}/shops/${shopId}`, {
      method: "PATCH",
      body: formData,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
        let errorMsg = `Upload failed: ${response.status}`;
        try {
            const errorData = await response.json();
            if (errorData.message) errorMsg = errorData.message;
        } catch (e) {}
        throw new Error(errorMsg);
    }

    return await response.json();
  }
}

export default new ShopService();
