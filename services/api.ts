import * as SecureStore from 'expo-secure-store';

export const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'https://finalrental.onrender.com/api';
export const RENTAL_BASE_URL = process.env.EXPO_PUBLIC_RENTAL_BASE_URL || 'https://finalrental.onrender.com';

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
      let errorMessage = `API Error: ${response.status} ${response.statusText}`;
      console.error(`[API ERROR] ${options.method || 'GET'} ${url}`, {
        status: response.status,
        statusText: response.statusText,
      });

      try {
        const errorData = await response.json();
        console.error('[API ERROR DATA]', errorData);
        if (errorData && errorData.message) {
          errorMessage = errorData.message;
        } else if (typeof errorData === 'string') {
          errorMessage = errorData;
        }
      } catch (e) {
        // Ignore JSON parse error on error response
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`[FETCH ERROR] ${url}`, error);
    throw error;
  }
};

export const API_ENDPOINTS = {
  // BASE URLs
  BASE_URL: API_BASE_URL,
  RENTAL_BASE_URL,

  // AUTH
  AUTH_REGISTER: process.env.EXPO_PUBLIC_AUTH_REGISTER || '/auth/register',
  AUTH_SEND_OTP: process.env.EXPO_PUBLIC_AUTH_SEND_OTP || '/auth/request-otp',
  AUTH_VERIFY_OTP: process.env.EXPO_PUBLIC_AUTH_VERIFY_OTP || '/auth/verify-otp',
  AUTH_LOGIN: process.env.EXPO_PUBLIC_AUTH_LOGIN || '/auth/login',
  AUTH_LOGIN_GOOGLE: process.env.EXPO_PUBLIC_AUTH_LOGIN_GOOGLE || '/auth/google/callback',
  AUTH_LOGIN_LINE: process.env.EXPO_PUBLIC_AUTH_LOGIN_LINE || '/auth/line/callback',
  AUTH_LOGIN_FACEBOOK: process.env.EXPO_PUBLIC_AUTH_LOGIN_FACEBOOK || '/auth/facebook/callback',
  AUTH_CHECK_EMAIL: '/auth/check-email',
  AUTH_CHECK_PHONE: '/auth/check-phone',
  AUTH_ME: '/auth/me',
  AUTH_UPDATE_PROFILE: '/auth/update-profile',

  // KYC
  UPLOAD_KYC: process.env.EXPO_PUBLIC_UPLOAD_KYC || '/auth/upload-kyc',

  // CHAT
  CHAT_SEND_MESSAGE: process.env.EXPO_PUBLIC_CHAT_SEND_MESSAGE || '/chat/send',
  CHAT_HISTORY: process.env.EXPO_PUBLIC_CHAT_HISTORY || '/chat/history/{CHAT_ID}',
  CHAT_LIST_BY_USER: process.env.EXPO_PUBLIC_CHAT_LIST_BY_USER || '/chat/list/{USER_ID}',
  CHAT_BOOKING_SUMMARY: process.env.EXPO_PUBLIC_CHAT_BOOKING_SUMMARY || '/chat/summary/{CHAT_ID}',

  // AUTO / INTERVAL
  AUTO_REFUND_TRIGGER: process.env.EXPO_PUBLIC_AUTO_REFUND_TRIGGER || '/interval/trigger',

  // BANK / WALLET / MONEY
  BANK_LINK_ACCOUNT: process.env.EXPO_PUBLIC_BANK_LINK_ACCOUNT || '/money/bank/add',
  WITHDRAW_REQUEST: process.env.EXPO_PUBLIC_WITHDRAW_REQUEST || '/money/withdraw/request',
  ADMIN_APPROVE_WITHDRAW: process.env.EXPO_PUBLIC_ADMIN_APPROVE_WITHDRAW || '/money/admin/approve',

  // PAYMENT
  PAYMENT_NOTIFICATION: process.env.EXPO_PUBLIC_PAYMENT_NOTIFICATION || '/payments',
  ADMIN_CONFIRM_PAYMENT: process.env.EXPO_PUBLIC_ADMIN_CONFIRM_PAYMENT || '/payments/{PAYMENT_ID}/admin-verify',

  // PRODUCT
  CREATE_PRODUCT: process.env.EXPO_PUBLIC_CREATE_PRODUCT || '/products',
  GET_OWN_PRODUCTS: process.env.EXPO_PUBLIC_GET_OWN_PRODUCTS || '/products/me',

  UPDATE_PRODUCT: process.env.EXPO_PUBLIC_UPDATE_PRODUCT || '/products/{PRODUCT_ID}',
  TOGGLE_RENT_STATUS: process.env.EXPO_PUBLIC_TOGGLE_RENT_STATUS || '/products/{PRODUCT_ID}/toggle',
  GET_PRODUCTS_BY_SHOP: process.env.EXPO_PUBLIC_GET_PRODUCTS_BY_SHOP || '/products/shop/{SHOP_ID}',
  GET_PRODUCTS_BY_USER: process.env.EXPO_PUBLIC_GET_PRODUCTS_BY_USER || '/products/user/{USER_ID}',

  // BOOKING / RENTAL
  GET_USER_RENTALS: '/rentals/renter',
  CREATE_BOOKING: '/rentals/',
  APPROVE_RENTAL: process.env.EXPO_PUBLIC_APPROVE_RENTAL || '/rentals/{RENTAL_ID}/owner-approve',
  UPDATE_RENTAL_STATUS: process.env.EXPO_PUBLIC_UPDATE_RENTAL_STATUS || '/rentals/{RENTAL_ID}/status',
  GET_OWNER_RENTALS: '/rentals/owner',
  REPORT_DAMAGE: '/rentals/{RENTAL_ID}/damage-report',

  // WALLET
  GET_WALLET_BALANCE: process.env.EXPO_PUBLIC_GET_WALLET_BALANCE || '/rentals/wallet/balance',
  GET_WALLET_HISTORY: process.env.EXPO_PUBLIC_GET_WALLET_HISTORY || '/rentals/wallet/transactions',

  // ADDRESS
  ADDRESS_UPDATE: '/address/update',

  // FORGOT PASSWORD
  AUTH_FORGOT_PASSWORD_REQUEST: '/auth/forgot-password-request',
};
