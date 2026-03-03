import { apiRequest } from './api';
import { API_ENDPOINTS } from './api';

export interface Product {
  id: number;
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
  rating_avg: number;
  images: string[];
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

  async createProduct(data: Product) {

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
    );
  }

  async updateProduct(productId: string, data: Partial<Product>) {
    const url = API_ENDPOINTS.UPDATE_PRODUCT.replace('{PRODUCT_ID}', productId);
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
    const url = API_ENDPOINTS.UPDATE_PRODUCT.replace('{PRODUCT_ID}', productId);
    const response = await apiRequest<any>(
      `${API_ENDPOINTS.BASE_URL}${url}`,
      {
        method: 'GET',
        withAuth: false,
      }
    );
    // ตรวจสอบว่า API ส่งกลับมาเป็น { product: { ... } } หรือ { ... } ตรงๆ
    if (response && response.product) {
      return response.product as Product;
    }
    return response as Product;
  }
}




export default new ProductService();
