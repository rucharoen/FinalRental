import { apiRequest } from './api';
import { API_ENDPOINTS } from './api';

export interface Product {
  _id?: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image?: string;
  images?: string[];
  inStock: boolean;
  shopId?: string;
  userId?: string;
  createdAt?: string;
  updatedAt?: string;
}

class ProductService {
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
}

export default new ProductService();
