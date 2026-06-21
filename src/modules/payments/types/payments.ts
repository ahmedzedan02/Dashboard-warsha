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
  isServicePayment?: boolean | null;
  isEmergencyPayment?: boolean | null;
  canPay?: boolean | null;
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

// ─── Customer Payments ────────────────────────────────────────────────────────

export type PaymentStatus = 'Pending' | 'Paid' | 'Failed' | 'Cancelled' | 'Expired' | 'Refunded';

export interface CustomerPaymentRecord {
  id: string;
  userId: string;
  userName: string;
  requestRef?: string;
  transactionRef: string;
  amount: number;
  currency: string;
  status: string;
  createdAt: string;
  paidDate?: string | null;
  paymentType?: string;
}

export interface CustomerPaymentFilters {
  status?: string;
  userId?: string;
  fromDate?: string;
  toDate?: string;
  page: number;
  pageSize: number;
}

export type CustomerPaymentsResponseDto = ResponseDTONew<PagedResult<CustomerPaymentRecord>>;

// ─── Provider Payments ───────────────────────────────────────────────────────

export interface ProviderPaymentRecord {
  id: string;
  providerId: string;
  providerName: string;
  requestRef?: string;
  transactionRef: string;
  amount: number;
  currency: string;
  status: string;
  createdAt: string;
  paidDate?: string | null;
  paymentType?: string;
}

export interface ProviderPaymentFilters {
  status?: string;
  providerId?: string;
  fromDate?: string;
  toDate?: string;
  page: number;
  pageSize: number;
}

export type ProviderPaymentsResponseDto = ResponseDTONew<PagedResult<ProviderPaymentRecord>>;
