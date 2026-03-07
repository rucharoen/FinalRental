import { apiRequest } from './api';
import { API_ENDPOINTS } from './api';
import * as SecureStore from 'expo-secure-store';

export interface Booking {
  id?: number;
  product_id: string;
  renter_id: string;
  owner_id: number;
  days: number;
  start_date: string;
  end_date: string;
  rent_fee: number;
  deposit_fee: number;
  shipping_fee: number;
  total_price: number;
  quantity: number;
  status?: string;
  product_name?: string;
  images?: string;
  shop_name?: string;
}

export interface RentalApproval {
  rentalId: string;
  status: 'approved' | 'rejected';
  productId?: string;
}

export interface RentalStatusUpdate {
  rentalId: string;
  status: string;
  productId?: string;
  outbound_shipping_company?: string;
  outbound_tracking_number?: string;
  proof_url?: string;
}

class RentalService {
  async createBooking(data: Booking) {
    const url = API_ENDPOINTS.CREATE_BOOKING;
    return apiRequest(
      `${API_ENDPOINTS.BASE_URL}${url}`,
      {
        method: 'POST',
        body: JSON.stringify(data),
        withAuth: true,
      }
    );
  }

  async approveRental(rentalId: string, approval: RentalApproval) {
    // ตามโค้ด Backend: POST /rentals/:id/owner-approve
    const url = API_ENDPOINTS.APPROVE_RENTAL.replace('{RENTAL_ID}', rentalId);
    const numericRentalId = parseInt(rentalId);

    // ส่ง body ไปด้วยเผื่อ Backend บาง version ต้องการ
    return apiRequest(
      `${API_ENDPOINTS.BASE_URL}${url}`,
      {
        method: 'PUT',
        body: JSON.stringify({ rental_id: numericRentalId, id: numericRentalId }),
        withAuth: true,
      }
    );
  }

  async getUserRentals() {
    const response = await apiRequest<any>(
      `${API_ENDPOINTS.BASE_URL}${API_ENDPOINTS.GET_USER_RENTALS}`,
      {
        method: 'GET',
        withAuth: true,
      }
    );

    // รองรับหลายโครงสร้าง: data, rentals หรือเป็น array โดยตรง
    if (response?.data && Array.isArray(response.data)) return response.data;
    if (response?.rentals && Array.isArray(response.rentals)) return response.rentals;
    if (response?.bookings && Array.isArray(response.bookings)) return response.bookings; // เพิ่ม bookings
    if (Array.isArray(response)) return response;
    return [];
  }

  async uploadPaymentSlip(data: { rental_id: number, slip_image: string }) {
    const url = API_ENDPOINTS.PAYMENT_NOTIFICATION;
    return apiRequest(
      `${API_ENDPOINTS.BASE_URL}${url}`,
      {
        method: 'POST',
        body: JSON.stringify(data),
        withAuth: true,
      }
    );
  }

  async updateRentalStatus(rentalId: string, update: RentalStatusUpdate) {
    const url = API_ENDPOINTS.UPDATE_RENTAL_STATUS.replace('{RENTAL_ID}', rentalId);
    const numericRentalId = parseInt(rentalId);

    // ปรับ action ให้ตรงตาม switch-case ของ Backend เป๊ะๆ
    let action = '';
    if (update.status === 'approved') action = 'approve';
    else if (update.status === 'paid') action = 'pay';
    else if (update.status === 'shipped' || update.status === 'delivered') action = 'ship';
    else if (update.status === 'received' || update.status === 'completed') action = 'receive';
    else if (update.status === 'returned') action = 'return';
    else if (update.status === 'verified') action = 'verify';
    else action = update.status;

    const payload: any = {
      action: action,
      rental_id: numericRentalId,
      id: numericRentalId,
      // เพิ่มฟิลด์ที่ Backend SHIP/RECEIVE เรียกหา
      outbound_shipping_company: update.outbound_shipping_company || 'Flash Express',
      outbound_tracking_number: update.outbound_tracking_number || `TH${Date.now()}`,
      proof_url: update.proof_url || 'https://via.placeholder.com/300'
    };

    return apiRequest(
      `${API_ENDPOINTS.BASE_URL}${url}`,
      {
        method: 'PUT',
        body: JSON.stringify(payload),
        withAuth: true,
      }
    );
  }

  async getOwnerRentals() {
    const response = await apiRequest<any>(
      `${API_ENDPOINTS.BASE_URL}${API_ENDPOINTS.GET_OWNER_RENTALS}`,
      {
        method: 'GET',
        withAuth: true,
      }
    );

    // รองรับหลายโครงสร้าง: data, rentals หรือเป็น array โดยตรง
    if (response?.data && Array.isArray(response.data)) return response.data;
    if (response?.rentals && Array.isArray(response.rentals)) return response.rentals;
    if (response?.bookings && Array.isArray(response.bookings)) return response.bookings;
    if (Array.isArray(response)) return response;
    return [];
  }

  async reportDamage(rentalId: string, formData: FormData) {
    const url = API_ENDPOINTS.REPORT_DAMAGE.replace('{RENTAL_ID}', rentalId);
    const token = await SecureStore.getItemAsync('userToken');

    return fetch(`${API_ENDPOINTS.BASE_URL}${url}`, {
      method: "POST",
      body: formData,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }).then(res => {
      if (!res.ok) throw new Error('Failed to report damage');
      return res.json();
    });
  }
}

export default new RentalService();
