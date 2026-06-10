import type { PagedResult, ResponseDTONew } from '@/shared/types/common';

export interface CustomerRecord {
  id: string;
  fullName: string;
  email: string;
  mobileNo: string;
  whatsapp?: string;
  country?: string;
  address?: string;
  isActive: boolean;
}

export interface CustomerFilters {
  page: number;
  pageSize: number;
  search?: string;
}

export interface CustomerFormValues {
  fullName: string;
  email: string;
  mobileNo: string;
}

export interface CustomerDetails extends CustomerRecord {}

export type CustomersResponseDto = ResponseDTONew<PagedResult<CustomerRecord>>;
export type CustomerDetailsResponseDto = ResponseDTONew<CustomerDetails>;
