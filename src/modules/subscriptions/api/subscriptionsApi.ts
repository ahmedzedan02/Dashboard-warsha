import { axiosInstance } from '@/shared/lib/axiosInstance';
import type {
  ApproveContractPayload,
  PendingContractsResponseDto,
  RejectContractPayload,
  SubscriptionFilters,
  SubscriptionListResponseDto,
} from '@/modules/subscriptions/types/subscriptions';
import type { ResponseDTONew } from '@/shared/types/common';
import { mapListResponse, mapPagedResponse, pickArray, pickNumber, pickString } from '@/shared/lib/apiMappers';

export const getSubscriptions = async (params: SubscriptionFilters): Promise<SubscriptionListResponseDto> => {
  const response = await axiosInstance.get<SubscriptionListResponseDto>('/api/AdminApp/Admin/subscriptions', { params });
  return mapPagedResponse(response.data, params.page, params.pageSize, (value) => ({
    id: pickString(value, 'id', 'subscriptionId', 'subscription_id'),
    providerId: pickString(value, 'providerId', 'provider_id'),
    providerName: pickString(value, 'providerName', 'provider_name'),
    phone: pickString(value, 'phone', 'mobileno', 'mobileNo'),
    service: pickString(value, 'service', 'serviceName', 'service_name'),
    paidMonths: pickNumber(value, 'paidMonths', 'months', 'monthsCount'),
    startDate: pickString(value, 'startDate', 'start_date'),
    endDate: pickString(value, 'endDate', 'end_date'),
    status: pickString(value, 'status'),
    createdAt: pickString(value, 'createdAt', 'createdDate', 'created_at'),
  }));
};

export const getPendingContracts = async (): Promise<PendingContractsResponseDto> => {
  const response = await axiosInstance.get<PendingContractsResponseDto>('/api/AdminApp/Subscribtion/admin/pending-contracts');
  return mapListResponse(response.data, (value) => ({
    id: pickString(value, 'id', 'paymentId', 'payment_id'),
    providerName: pickString(value, 'providerName', 'provider_name'),
    phone: pickString(value, 'phone', 'mobileno', 'mobileNo'),
    email: pickString(value, 'email'),
    requestDate: pickString(value, 'requestDate', 'createdAt', 'created_at'),
    serviceNames: pickArray(value, 'serviceNames', 'services').map((item) => pickString(item, 'name', 'serviceName') || String(item)),
  }));
};

export const approvePendingContract = async (payload: ApproveContractPayload): Promise<ResponseDTONew<null>> => {
  const response = await axiosInstance.post<ResponseDTONew<null>>(`/api/AdminApp/Subscribtion/admin/confirm-contract/${payload.paymentId}`);
  return response.data;
};

export const rejectPendingContract = async (payload: RejectContractPayload): Promise<ResponseDTONew<null>> => {
  const response = await axiosInstance.post<ResponseDTONew<null>>(`/api/AdminApp/Subscribtion/admin/reject-contract/${payload.paymentId}`, undefined, {
    params: { reason: payload.reason },
  });
  return response.data;
};
