import type { PagedResult, ResponseDTONew } from '@/shared/types/common';

export interface ServiceRecord {
  id: string;
  name: string;
  nameEn?: string;
  nameAr?: string;
  iconUrl?: string;
  countryPrice: number;
  isEmergency: boolean;
}

export interface ServiceFilters {
  page: number;
  pageSize: number;
  search?: string;
}

export interface ServiceFormValues {
  titleEn: string;
  titleAr: string;
  categoryId: string;
  startingPrice: string;
  currency: string;
  images?: FileList;
}

export type ServicesResponseDto = ResponseDTONew<PagedResult<ServiceRecord>>;
