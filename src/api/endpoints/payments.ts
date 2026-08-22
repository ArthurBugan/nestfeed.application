import apiClient from '../client';
import type { IAPReceiptVerificationRequest, IAPReceiptVerificationResponse } from '../../types';

export const paymentsApi = {
  verifyIAPReceipt: async (data: IAPReceiptVerificationRequest): Promise<IAPReceiptVerificationResponse> => {
    return apiClient.post<IAPReceiptVerificationResponse>('/api/v3/payments/verify-iap', data);
  },
};
