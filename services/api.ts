import * as SecureStore from 'expo-secure-store';

export const API_BASE_URL = 'https://finalrental.onrender.com/api';
export const RENTAL_BASE_URL = 'https://finalrental.onrender.com';

export interface FetchOptions extends RequestInit {
  withAuth?: boolean;
}

export const apiRequest = async <T = any>(
  url: string,
  options: FetchOptions = {}
): Promise<T> => {
  const { withAuth = true, headers = {}, ...rest } = options;

  try {
    const requestHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      ...headers as Record<string, string>,
    };

    if (withAuth) {
      const token = await SecureStore.getItemAsync('userToken');
      if (token) {
        requestHeaders['Authorization'] = `Bearer ${token}`;
      }
    }

    const response = await fetch(url, {
      headers: requestHeaders,
      ...rest,
    });

    if (response.status === 401) {
      console.error('Unauthorized - redirect to login');

    }

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    throw error;
  }

};

export const API_ENDPOINTS = {
  // BASE URLs
  BASE_URL: API_BASE_URL,
  RENTAL_BASE_URL,

  // AUTH
  AUTH_REGISTER: '/auth/register',
  AUTH_SEND_OTP: '/auth/request-otp',
  AUTH_VERIFY_OTP: '/auth/verify-otp',
  AUTH_LOGIN: '/auth/login',
  AUTH_LOGIN_LINE: '/auth/line/callback',
  AUTH_LOGIN_FACEBOOK: '/auth/facebook/callback',

  // KYC
  UPLOAD_KYC: '/upload-kyc',

  // CHAT
  CHAT_SEND_MESSAGE: '/chat/send',
  CHAT_HISTORY: '/chat/history/{CHAT_ID}',
  CHAT_LIST_BY_USER: '/chat/list/{USER_ID}',
  CHAT_BOOKING_SUMMARY: '/chat/summary/{CHAT_ID}',

  // AUTO / INTERVAL
  AUTO_REFUND_TRIGGER: '/interval/trigger',

  // BANK / WALLET / MONEY
  BANK_LINK_ACCOUNT: '/money/bank/add',
  WITHDRAW_REQUEST: '/money/withdraw/request',
  ADMIN_APPROVE_WITHDRAW: '/money/admin/approve',

  // PAYMENT
  PAYMENT_NOTIFICATION: '/payments',
  ADMIN_CONFIRM_PAYMENT: '/payments/{PAYMENT_ID}/admin-verify',

  // PRODUCT
  CREATE_PRODUCT: '/products',
  GET_OWN_PRODUCTS: '/products/me',

  UPDATE_PRODUCT: '/products/{PRODUCT_ID}',
  TOGGLE_RENT_STATUS: '/products/{PRODUCT_ID}/toggle',
  GET_PRODUCTS_BY_SHOP: '/products/shop/{SHOP_ID}',
  GET_PRODUCTS_BY_USER: '/products/user/{USER_ID}',

  // BOOKING / RENTAL
  GET_USER_RENTALS: '/rentals/user/{USER_ID}',
  CREATE_BOOKING: '/products/user/{USER_ID}',
  APPROVE_RENTAL: '/rentals/{RENTAL_ID}/owner-approve',
  UPDATE_RENTAL_STATUS: '/rentals/{RENTAL_ID}/status',

  // WALLET
  GET_WALLET_BALANCE: '/wallet/balance',
  GET_WALLET_HISTORY: '/wallet/transactions',
};
