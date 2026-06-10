import type { ResponseDTONew } from '@/shared/types/common';

export interface EmergencyPackageRecord {
  id: string;
  name: string;
  price: number;
  isActive?: boolean;
  createdAt?: string;
  serviceIds: string[];
  services: Array<{
    id: string;
    name: string;
    price: number;
    currency?: string | null;
  }>;
}

export interface EmergencyPackagePayload {
  name: string;
  price: number;
  serviceIds: string[];
  isActive?: boolean;
}

export type EmergencyPackageResponseDto = ResponseDTONew<EmergencyPackageRecord[]>;
