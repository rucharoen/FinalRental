import { apiRequest } from './api';
import { API_ENDPOINTS } from './api';
import * as SecureStore from 'expo-secure-store';

export interface Product {
  id: number;
  _id?: string;
  name: string;
  description: string;
  price_per_day: number;
  status: 'available' | 'rented' | 'disabled';
  owner_id: number;
  shop_id: number;
  quantity: number;
  deposit: number;
  is_active: boolean;
  review_count: number;
  rating_avg: string | number;
  images: string[];
  shop_name?: string;
  created_at?: string;
  updated_at?: string;
}

class ProductService {
  async getProducts() {
    const response = await apiRequest(
      `${API_ENDPOINTS.BASE_URL}${API_ENDPOINTS.CREATE_PRODUCT}`,
      {
        method: 'GET',
        withAuth: false,
      }
    );
    // If the API returns { products: [...] }
    if (response && response.products) {
      return response.products as Product[];
    }
    // If it returns an array directly
    return response as Product[];
  }

  async createProduct(data: Product | FormData) {
    if (data instanceof FormData) {
      const token = await SecureStore.getItemAsync('userToken');
      const response = await fetch(`${API_ENDPOINTS.BASE_URL}${API_ENDPOINTS.CREATE_PRODUCT}`, {
        method: 'POST',
        body: data,
        headers: {
          'Authorization': `Bearer ${token}`,
          // Don't set Content-Type, fetch will set it automatically for FormData with boundary
        },
      });

      if (!response.ok) {
        let errorMsg = `Create product failed: ${response.status}`;
        try {
          const resData = await response.json();
          if (resData && resData.message) errorMsg = resData.message;
        } catch (e) { }
        throw new Error(errorMsg);
      }
      return await response.json();
    }

    return apiRequest(
      `${API_ENDPOINTS.BASE_URL}${API_ENDPOINTS.CREATE_PRODUCT}`,
      {
        method: 'POST',
        body: JSON.stringify(data),
        withAuth: true,
      }
    );
  }

  async getOwnProducts() {
    return apiRequest(
      `${API_ENDPOINTS.BASE_URL}${API_ENDPOINTS.GET_OWN_PRODUCTS}`,
      {
        method: 'GET',
        withAuth: true,
      }
    ).then(response => {
      console.log('[ProductService] getOwnProducts Success:', JSON.stringify(response, null, 2));
      if (response && response.products) {
        console.log(`[ProductService] Found ${response.products.length} products`);
      } else {
        console.warn('[ProductService] No products key found in response');
      }
      return response;
    }).catch(error => {
      console.error('[ProductService] getOwnProducts Failed:', error);
      throw error;
    });
  }

  async updateProduct(productId: string, data: Partial<Product> | FormData) {
    const url = API_ENDPOINTS.UPDATE_PRODUCT.replace('{PRODUCT_ID}', productId);

    if (data instanceof FormData) {
      const token = await SecureStore.getItemAsync('userToken');
      const response = await fetch(`${API_ENDPOINTS.BASE_URL}${url}`, {
        method: 'PUT',
        body: data,
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        let errorMsg = `Update product failed: ${response.status}`;
        try {
          const resData = await response.json();
          console.log('[ProductService] Update Error Response:', JSON.stringify(resData, null, 2));
          if (resData && resData.message) errorMsg = resData.message;
        } catch (e) {
          console.log('[ProductService] Could not parse error JSON');
        }
        throw new Error(errorMsg);
      }
      return await response.json();
    }

    return apiRequest(
      `${API_ENDPOINTS.BASE_URL}${url}`,
      {
        method: 'PUT',
        body: JSON.stringify(data),
        withAuth: true,
      }
    );
  }

  async toggleRentStatus(productId: string) {
    const url = API_ENDPOINTS.TOGGLE_RENT_STATUS.replace('{PRODUCT_ID}', productId);
    return apiRequest(
      `${API_ENDPOINTS.BASE_URL}${url}`,
      {
        method: 'PUT',
        withAuth: true,
      }
    );
  }

  async getProductsByShop(shopId: string) {
    const url = API_ENDPOINTS.GET_PRODUCTS_BY_SHOP.replace('{SHOP_ID}', shopId);
    return apiRequest(
      `${API_ENDPOINTS.BASE_URL}${url}`,
      {
        method: 'GET',
        withAuth: true,
      }
    );
  }

  async getProductsByUser(userId: string) {
    const url = API_ENDPOINTS.GET_PRODUCTS_BY_USER.replace('{USER_ID}', userId);
    return apiRequest(
      `${API_ENDPOINTS.BASE_URL}${url}`,
      {
        method: 'GET',
        withAuth: true,
      }
    );
  }

  async getProductById(productId: string) {
    try {
      // ค้นหาจากรายการทั้งหมดแทนการเรียกตรงๆ เพื่อเลี่ยง 404 เพราะ Backend อาจไม่มี endpoint รายชิ้น
      const allProducts = await this.getProducts();
      const found = allProducts.find(p => (p.id?.toString() === productId || p._id === productId));

      if (found) return found;

      // ถ้าหาใน List ไม่เจอจริงๆ ค่อยลองเรียก API ตรงๆ (เผื่ออนาคต Backend มี)
      const url = API_ENDPOINTS.UPDATE_PRODUCT.replace('{PRODUCT_ID}', productId);
      const response = await apiRequest<any>(
        `${API_ENDPOINTS.BASE_URL}${url}`,
        {
          method: 'GET',
          withAuth: true,
        }
      );
      if (response && response.product) return response.product as Product;
      return (response.data || response) as Product;
    } catch (error) {
      // หากพังทั้งสองทาง ให้ส่ง error ต่อไป
      throw error;
    }
  }

  async deleteProduct(productId: string) {
    const url = API_ENDPOINTS.UPDATE_PRODUCT.replace('{PRODUCT_ID}', productId);
    return apiRequest(
      `${API_ENDPOINTS.BASE_URL}${url}`,
      {
        method: 'DELETE',
        withAuth: true,
      }
    );
  }
}




export default new ProductService();
