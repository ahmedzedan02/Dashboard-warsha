import type { ResponseDTONew } from '@/shared/types/common';

export interface CategoryRecord {
  id: string;
  name: string;
  isActive: boolean;
}

export interface ServiceTypeRecord {
  id: string;
  name: string;
}

export interface CategoryPayload {
  nameEn: string;
  nameAr: string;
}

export type CategoriesResponseDto = ResponseDTONew<CategoryRecord[]>;
export type CategoryServicesResponseDto = ResponseDTONew<ServiceTypeRecord[]>;
