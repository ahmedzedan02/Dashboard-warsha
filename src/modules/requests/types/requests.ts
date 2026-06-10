import type { PagedResult, ResponseDTONew } from '@/shared/types/common';

export interface RequestRecord {
  id: string;
  orderNumber: string;
  userName: string;
  service: string;
  budget: number;
  address: string;
  offers: number;
  status: string;
  createdAt: string;
}

export interface RequestDetails extends RequestRecord {
  phone: string;
  email: string;
  expectedStartDate?: string;
  latitude?: number;
  longitude?: number;
}

export interface RequestFilters {
  status?: string;
  serviceTypeId?: string;
  fromDate?: string;
  toDate?: string;
  page: number;
  pageSize: number;
}

export type RequestsResponseDto = ResponseDTONew<PagedResult<RequestRecord>>;
export type RequestDetailsResponseDto = ResponseDTONew<RequestDetails>;
