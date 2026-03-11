import * as SecureStore from "expo-secure-store";
import { API_ENDPOINTS, apiRequest } from "./api";

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

  // 📌 ตั้งค่า Token (ใช้สำหรับ Social Login หรือกรณีได้ Token มาโดยตรง)
  async setToken(token: string) {
    await SecureStore.setItemAsync("userToken", token);
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

  // 📌 ตรวจสอบอีเมลและเบอร์โทรศัพท์
  async checkEmail(email: string) {
    try {
      const response = await apiRequest(
        `${API_ENDPOINTS.BASE_URL}${API_ENDPOINTS.AUTH_CHECK_EMAIL}?email=${email}`,
        { method: "GET", withAuth: false }
      );
      return response.exists;
    } catch (error) {
      console.error("Check email error:", error);
      return false;
    }
  }

  async checkPhone(phone: string) {
    try {
      const response = await apiRequest(
        `${API_ENDPOINTS.BASE_URL}${API_ENDPOINTS.AUTH_CHECK_PHONE}?phone=${phone}`,
        { method: "GET", withAuth: false }
      );
      return response.exists;
    } catch (error) {
      console.error("Check phone error:", error);
      return false;
    }
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

  async getProfile() {
    const response = await apiRequest(
      `${API_ENDPOINTS.BASE_URL}${API_ENDPOINTS.AUTH_ME}`,
      {
        method: "GET",
        withAuth: true,
      }
    );

    // ตรวจสอบโครงสร้าง response จาก /auth/me (ที่มี { success: true, user: { ... } })
    if (response && response.success && response.user) {
      await SecureStore.setItemAsync("userData", JSON.stringify(response.user));
      return response.user;
    }

    // กรณีโครงสร้างอื่น (สำรอง)
    if (response && !response.error) {
      await SecureStore.setItemAsync("userData", JSON.stringify(response));
    }
    return response;
  }

  async updateProfile(data: any) {
    const response = await apiRequest(
      `${API_ENDPOINTS.BASE_URL}${API_ENDPOINTS.AUTH_UPDATE_PROFILE}`,
      {
        method: "PATCH",
        body: JSON.stringify(data),
        withAuth: true,
      }
    );

    if (response && !response.error) {
      const currentData = await this.getUserData();
      const updatedData = { ...currentData, ...response };
      await SecureStore.setItemAsync("userData", JSON.stringify(updatedData));
    }
    return response;
  }

  async updateAddress(data: any) {
    const response = await apiRequest(
      `${API_ENDPOINTS.BASE_URL}${API_ENDPOINTS.ADDRESS_UPDATE}`,
      {
        method: "PUT",
        body: JSON.stringify(data),
        withAuth: true,
      }
    );

    if (response && !response.error) {
      // Refresh profile to get updated address
      await this.getProfile();
    }
    return response;
  }

  async uploadKYC(formData: any) {
    const token = await this.getToken();
    const response = await fetch(`${API_ENDPOINTS.BASE_URL}${API_ENDPOINTS.UPLOAD_KYC}`, {
      method: "POST",
      body: formData,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      let errorMsg = `Upload failed: ${response.status}`;
      try {
        const data = await response.json();
        if (data && data.message) errorMsg = data.message;
      } catch (e) {
        // If not JSON, use default
      }
      throw new Error(errorMsg);
    }

    const result = await response.json();

    // After success, refresh profile to get new status (e.g., 'pending' or 'verified')
    await this.getProfile();

    return result;
  }

  async updateProfileImage(formData: FormData) {
    const token = await this.getToken();
    const response = await fetch(`${API_ENDPOINTS.BASE_URL}${API_ENDPOINTS.AUTH_UPDATE_PROFILE}`, {
      method: "PATCH",
      body: formData,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.status}`);
    }

    const result = await response.json();

    // บันทึกข้อมูล user ทันทีที่อัปเดตสำเร็จ
    if (result.success && result.user) {
      await SecureStore.setItemAsync("userData", JSON.stringify(result.user));
    } else {
      await this.getProfile(); // Refresh profile to get new image URL
    }

    return result;
  }

  // 📌 ลืมรหัสผ่าน (ขั้นตอนที่ 1: ตรวจสอบข้อมูล)
  async verifyResetUser(data: { full_name: string; id_card: string; identifier: string }) {
    return apiRequest(
      `${API_ENDPOINTS.BASE_URL}${API_ENDPOINTS.AUTH_VERIFY_RESET_USER}`,
      {
        method: "POST",
        body: JSON.stringify({ 
          full_name: data.full_name,
          id_card_number: data.id_card,
          contact: data.identifier
        }),
        withAuth: false,
      }
    );
  }

  // 📌 ลืมรหัสผ่าน (ขั้นตอนที่ 2: ตั้งรหัสใหม่)
  async resetPassword(data: { resetToken: string; newPassword: string }) {
    return apiRequest(
      `${API_ENDPOINTS.BASE_URL}${API_ENDPOINTS.AUTH_RESET_PASSWORD}`,
      {
        method: "POST",
        body: JSON.stringify(data),
        withAuth: false,
      }
    );
  }
}

export default new AuthService();