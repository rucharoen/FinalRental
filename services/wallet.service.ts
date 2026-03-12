import { apiRequest } from './api';
import { API_ENDPOINTS } from './api';

export interface WalletTransaction {
  _id?: string;
  userId: string;
  type: 'deposit' | 'withdrawal' | 'payment' | 'refund';
  amount: number;
  description?: string;
  timestamp?: string;
}

export interface BankAccount {
  accountNumber: string;
  bankName: string;
  accountHolderName: string;
}

export interface WithdrawRequest {
  amount: number;
  bankAccountId?: string;
  bank_name?: string;
  account_number?: string;
  account_name?: string;
  description?: string;
}

class WalletService {
  async getWalletBalance() {
    return apiRequest(
      `${API_ENDPOINTS.BASE_URL}${API_ENDPOINTS.GET_WALLET_BALANCE}`,
      {
        method: 'GET',
        withAuth: true,
      }
    );
  }

  async getWalletHistory() {
    return apiRequest(
      `${API_ENDPOINTS.BASE_URL}${API_ENDPOINTS.GET_WALLET_HISTORY}`,
      {
        method: 'GET',
        withAuth: true,
      }
    );
  }

  async linkBankAccount(data: BankAccount) {
    return apiRequest(
      `${API_ENDPOINTS.BASE_URL}${API_ENDPOINTS.BANK_LINK_ACCOUNT}`,
      {
        method: 'POST',
        body: JSON.stringify(data),
        withAuth: true,
      }
    );
  }

  async requestWithdraw(data: WithdrawRequest) {
    return apiRequest(
      `${API_ENDPOINTS.BASE_URL}${API_ENDPOINTS.WITHDRAW_REQUEST}`,
      {
        method: 'POST',
        body: JSON.stringify(data),
        withAuth: true,
      }
    );
  }

  async approveWithdraw(withdrawId: string) {
    return apiRequest(
      `${API_ENDPOINTS.BASE_URL}${API_ENDPOINTS.ADMIN_APPROVE_WITHDRAW}/${withdrawId}`,
      {
        method: 'PUT',
        withAuth: true,
      }
    );
  }
}

export default new WalletService();
