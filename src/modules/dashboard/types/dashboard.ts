import type { ResponseDTONew } from '@/shared/types/common';

export interface DashboardStats {
  pendingContracts: number;
  activeSubscriptions: number;
  expiredSubscriptions: number;
  pendingPayments: number;
  todayRevenue: number;
  monthRevenue: number;
  totalRevenue: number;
  totalOrders: number;
  pendingOrders: number;
  inProgressOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  totalRequests: number;
  pendingRequests: number;
}

export type DashboardResponseDto = ResponseDTONew<DashboardStats>;
