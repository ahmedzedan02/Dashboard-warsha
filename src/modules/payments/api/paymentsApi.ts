import { axiosInstance } from '@/shared/lib/axiosInstance';
import type {
  PaymentFilters,
  PaymentsResponseDto,
  ConfirmPaymentPayload,
  CustomerPaymentFilters,
  CustomerPaymentsResponseDto,
  ProviderPaymentFilters,
  ProviderPaymentsResponseDto,
} from '@/modules/payments/types/payments';
import type { ResponseDTONew } from '@/shared/types/common';
import { mapPagedResponse, pickBoolean, pickNumber, pickString } from '@/shared/lib/apiMappers';

export const getPayments = async (params: PaymentFilters): Promise<PaymentsResponseDto> => {
  const response = await axiosInstance.get<PaymentsResponseDto>('/api/AdminApp/Admin/payments', { params });
  return mapPagedResponse(response.data, params.page, params.pageSize, (value) => ({
    id: pickString(value, 'id', 'paymentId', 'payment_id'),
    providerName: pickString(value, 'providerName', 'providername', 'provider_name'),
    requestRef: pickString(value, 'requestRef', 'requestref'),
    transactionRef: pickString(value, 'transactionRef', 'transactionId', 'transaction_id'),
    amount: pickNumber(value, 'amount', 'total', 'price'),
    currency: pickString(value, 'currency', 'currencyCode') || 'QAR',
    months: pickNumber(value, 'months', 'monthsCount', 'month_count'),
    status: pickString(value, 'status'),
    createdAt: pickString(value, 'createdAt', 'createdDate', 'created_at'),
    paidDate: pickString(value, 'paidDate', 'paymentDate', 'paid_at') || null,
    isServicePayment: pickBoolean(value, 'iservicePayment', 'isServicePayment', 'is_service_payment'),
    isEmergencyPayment: pickBoolean(value, 'isEmergencyPayment', 'is_emergency_payment'),
    canPay: pickBoolean(value, 'canPay', 'can_pay'),
  }));
};

export const verifyManualPayment = async (paymentId: string): Promise<ResponseDTONew<null>> => {
  const response = await axiosInstance.post<ResponseDTONew<null>>(`/api/AdminApp/Subscribtion/admin/AdminVerifyManualPayment/${paymentId}`);
  return response.data;
};

export const confirmPayment = async (payload: ConfirmPaymentPayload): Promise<ResponseDTONew<null>> => {
  const response = await axiosInstance.post<ResponseDTONew<null>>('/api/AdminApp/Subscribtion/payment/confirm', payload);
  return response.data;
};

// ─── Customer Payments ────────────────────────────────────────────────────────

export const getCustomerPayments = async (params: CustomerPaymentFilters): Promise<CustomerPaymentsResponseDto> => {
  const response = await axiosInstance.get<CustomerPaymentsResponseDto>('/api/AdminApp/Admin/customer-payments', { params });
  return mapPagedResponse(response.data, params.page, params.pageSize, (value) => ({
    id: pickString(value, 'id', 'paymentId', 'payment_id'),
    userId: pickString(value, 'userId', 'user_id', 'customerId'),
    userName: pickString(value, 'userName', 'customerName', 'fullName', 'name', 'user_name'),
    requestRef: pickString(value, 'requestRef', 'requestref'),
    transactionRef: pickString(value, 'transactionRef', 'transactionId', 'transaction_id', 'reference'),
    amount: pickNumber(value, 'amount', 'total', 'price'),
    currency: pickString(value, 'currency', 'currencyCode') || 'QAR',
    status: pickString(value, 'status'),
    createdAt: pickString(value, 'createdAt', 'createdDate', 'created_at'),
    paidDate: pickString(value, 'paidDate', 'paymentDate', 'paid_at') || null,
    paymentType: pickString(value, 'paymentType', 'payment_type'),
  }));
};

// ─── Provider Payments ───────────────────────────────────────────────────────

export const getProviderPayments = async (params: ProviderPaymentFilters): Promise<ProviderPaymentsResponseDto> => {
  const response = await axiosInstance.get<ProviderPaymentsResponseDto>('/api/AdminApp/Admin/provider-payments', { params });
  return mapPagedResponse(response.data, params.page, params.pageSize, (value) => ({
    id: pickString(value, 'id', 'paymentId', 'payment_id'),
    providerId: pickString(value, 'providerId', 'provider_id'),
    providerName: pickString(value, 'providerName', 'provider_name', 'name', 'fullName'),
    requestRef: pickString(value, 'requestRef', 'requestref'),
    transactionRef: pickString(value, 'transactionRef', 'transactionId', 'transaction_id', 'reference'),
    amount: pickNumber(value, 'amount', 'total', 'price'),
    currency: pickString(value, 'currency', 'currencyCode') || 'QAR',
    status: pickString(value, 'status'),
    createdAt: pickString(value, 'createdAt', 'createdDate', 'created_at'),
    paidDate: pickString(value, 'paidDate', 'paymentDate', 'paid_at') || null,
    paymentType: pickString(value, 'paymentType', 'payment_type'),
  }));
};

