import { apiRequest } from './api';
import { API_ENDPOINTS } from './api';

export interface Shop {
  _id?: string;
  ownerId: string;
  shopName: string;
  shopDescription?: string;
  phoneNumber?: string;
  address?: string;
  image?: string;
  rating?: number;
  totalProducts?: number;
  createdAt?: string;
  updatedAt?: string;
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
      `${API_ENDPOINTS.BASE_URL}/shops/me`,
      {
        method: 'GET',
        withAuth: true,
      }
    );
  }
}

export default new ShopService();
