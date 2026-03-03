import { apiRequest } from './api';
import { API_ENDPOINTS } from './api';

export interface Booking {
  _id?: string;
  productId: string;
  userId: string;
  rentalDays: number;
  startDate: string;
  endDate: string;
  totalPrice: number;
  status?: string;
}

export interface RentalApproval {
  rentalId: string;
  status: 'approved' | 'rejected';
}

export interface RentalStatusUpdate {
  rentalId: string;
  status: string;
}

class RentalService {
  async createBooking(data: Booking) {
    const url = API_ENDPOINTS.CREATE_BOOKING.replace('{USER_ID}', data.userId);
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
    const url = API_ENDPOINTS.APPROVE_RENTAL.replace('{RENTAL_ID}', rentalId);
    return apiRequest(
      `${API_ENDPOINTS.BASE_URL}${url}`,
      {
        method: 'PUT',
        body: JSON.stringify(approval),
        withAuth: true,
      }
    );
  }

  async updateRentalStatus(rentalId: string, update: RentalStatusUpdate) {
    const url = API_ENDPOINTS.UPDATE_RENTAL_STATUS.replace('{RENTAL_ID}', rentalId);
    return apiRequest(
      `${API_ENDPOINTS.BASE_URL}${url}`,
      {
        method: 'PUT',
        body: JSON.stringify(update),
        withAuth: true,
      }
    );
  }
}

export default new RentalService();
