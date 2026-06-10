import type { PagedResult, ResponseDTONew } from '@/shared/types/common';

export interface PaymentRecord {
  id: string;
  providerName: string;
  requestRef: string;
  transactionRef: string;
  amount: number;
  currency: string;
  months: number;
  status: string;
  createdAt: string;
  paidDate?: string | null;
}

export interface PaymentFilters {
  status?: string;
  providerId?: string;
  fromDate?: string;
  toDate?: string;
  page: number;
  pageSize: number;
}

export interface ConfirmPaymentPayload {
  requestRef: string;
  transactionId: string;
  isManual: boolean;
}

export type PaymentsResponseDto = ResponseDTONew<PagedResult<PaymentRecord>>;
