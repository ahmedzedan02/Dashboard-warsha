import { axiosInstance } from '@/shared/lib/axiosInstance';
import type { PaymentFilters, PaymentsResponseDto, ConfirmPaymentPayload } from '@/modules/payments/types/payments';
import type { ResponseDTONew } from '@/shared/types/common';
import { mapPagedResponse, pickNumber, pickString } from '@/shared/lib/apiMappers';

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
