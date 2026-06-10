import type { PagedResult, ResponseDTONew } from '@/shared/types/common';

export interface OrderRecord {
  id: string;
  orderNumber: string;
  providerId: string;
  providerName: string;
  userId: string;
  customerName: string;
  status: string;
  amount: number;
  createdAt: string;
}

export interface OrderDetails extends OrderRecord {
  address: string;
  latitude?: number;
  longitude?: number;
  cancelReason?: string;
}

export interface OrderFilters {
  status?: string;
  providerId?: string;
  userId?: string;
  fromDate?: string;
  toDate?: string;
  page: number;
  pageSize: number;
}

export type OrdersResponseDto = ResponseDTONew<PagedResult<OrderRecord>>;
export type OrderDetailsResponseDto = ResponseDTONew<OrderDetails>;
