import type { PagedResult, ResponseDTONew } from '@/shared/types/common';

export interface SubscriptionRecord {
  id: string;
  providerId: string;
  providerName: string;
  phone: string;
  service: string;
  paidMonths: number;
  startDate: string;
  endDate: string;
  status: string;
  createdAt: string;
}

export interface SubscriptionFilters {
  status?: string;
  providerId?: string;
  page: number;
  pageSize: number;
}

export interface PendingContract {
  id: string;
  providerName: string;
  phone: string;
  email: string;
  requestDate: string;
  serviceNames: string[];
}

export interface ApproveContractPayload {
  paymentId: string;
}

export interface RejectContractPayload {
  paymentId: string;
  reason: string;
}

export type SubscriptionListResponseDto = ResponseDTONew<PagedResult<SubscriptionRecord>>;
export type PendingContractsResponseDto = ResponseDTONew<PendingContract[]>;
