import type { PagedResult, ResponseDTONew } from '@/shared/types/common';

export interface ProviderRecord {
  id: string;
  providerName: string;
  email: string;
  whatsapp: string;
  mobileNo: string;
  regionId: string;
  countryName?: string;
  logoUrl?: string;
  isActive: boolean;
  isPaperOk: boolean;
}

export interface ProviderDetails extends ProviderRecord {
  subscriptions: Array<{ id: string; serviceName: string; status: string }>;
  ratings: Array<{ id: string; score: number; comment: string }>;
  documents: Array<{ id: string; fileName: string; url: string }>;
}

export interface ProviderSearchFilters {
  page: number;
  pageSize: number;
  search?: string;
}

export interface ProviderFormValues {
  provider_name: string;
  email: string;
  password?: string;
  whatsapp: string;
  mobileno: string;
  region_id: string;
  fcomplogo?: FileList;
  fcompAttachments?: FileList;
}

export type ProvidersResponseDto = ResponseDTONew<PagedResult<ProviderRecord>>;
export type ProviderDetailsResponseDto = ResponseDTONew<ProviderDetails>;
