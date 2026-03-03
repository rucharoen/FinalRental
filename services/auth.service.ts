import * as SecureStore from "expo-secure-store";
import { apiRequest, API_ENDPOINTS } from "./api";

// --- Interfaces ---
export interface RegisterData {
    full_name: string;
    email: string;
    phone: string;
    password: string;
    address?: string;
}

export interface LoginData {
    email: string;
    password: string;
}

export interface OTPData {
    phoneNumber: string;
}

export interface VerifyOTPData {
    phoneNumber: string;
    otp: string;
}

class AuthService {
    // 📌 สมัครสมาชิก
    async register(data: RegisterData) {
        return apiRequest(
            `${API_ENDPOINTS.BASE_URL}${API_ENDPOINTS.AUTH_REGISTER}`,
            {
                method: "POST",
                body: JSON.stringify(data),
                withAuth: false,
            }
        );
    }

    // 📌 เข้าสู่ระบบ และบันทึก Token
    async login(data: LoginData) {
        const response = await apiRequest(
            `${API_ENDPOINTS.BASE_URL}${API_ENDPOINTS.AUTH_LOGIN}`,
            {
                method: "POST",
                body: JSON.stringify(data),
                withAuth: false,
            }
        );

        // บันทึก Token และข้อมูล User ลงเครื่องทันทีเมื่อ Login สำเร็จ
        if (response && response.token) {
            await SecureStore.setItemAsync("userToken", response.token);
            await SecureStore.setItemAsync("userData", JSON.stringify(response.user));
        }

        return response;
    }

    // 📌 OTP
    async sendOTP(data: OTPData) {
        return apiRequest(
            `${API_ENDPOINTS.BASE_URL}${API_ENDPOINTS.AUTH_SEND_OTP}`,
            {
                method: "POST",
                body: JSON.stringify(data),
                withAuth: false,
            }
        );
    }

    async verifyOTP(data: VerifyOTPData) {
        return apiRequest(
            `${API_ENDPOINTS.BASE_URL}${API_ENDPOINTS.AUTH_VERIFY_OTP}`,
            {
                method: "POST",
                body: JSON.stringify(data),
                withAuth: false,
            }
        );
    }

    // 📌 Social Login
    async loginLineCallback(code: string) {
        return apiRequest(
            `${API_ENDPOINTS.BASE_URL}${API_ENDPOINTS.AUTH_LOGIN_LINE}?code=${code}`,
            {
                method: "GET",
                withAuth: false,
            }
        );
    }

    async loginFacebookCallback(code: string) {
        return apiRequest(
            `${API_ENDPOINTS.BASE_URL}${API_ENDPOINTS.AUTH_LOGIN_FACEBOOK}?code=${code}`,
            {
                method: "GET",
                withAuth: false,
            }
        );
    }

    // 📌 ฟังก์ชันจัดการสถานะ Session
    async getToken() {
        return await SecureStore.getItemAsync("userToken");
    }

    async logout() {
        await SecureStore.deleteItemAsync("userToken");
        await SecureStore.deleteItemAsync("userData");
    }

    async getUserData() {
        const data = await SecureStore.getItemAsync("userData");
        return data ? JSON.parse(data) : null;
    }
}

export default new AuthService();