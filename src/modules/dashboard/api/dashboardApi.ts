import { axiosInstance } from '@/shared/lib/axiosInstance';
import type { DashboardResponseDto } from '@/modules/dashboard/types/dashboard';
import { mapResponse, pickNumber } from '@/shared/lib/apiMappers';

export const getDashboardStats = async (): Promise<DashboardResponseDto> => {
  const response = await axiosInstance.get<DashboardResponseDto>('/api/AdminApp/Admin/dashboard');
  return mapResponse(response.data, (value) => ({
    pendingContracts: pickNumber(value, 'pendingContracts', 'pendingcontracts', 'pending_contracts'),
    activeSubscriptions: pickNumber(value, 'activeSubscriptions', 'activesubscriptions', 'active_subscriptions'),
    expiredSubscriptions: pickNumber(value, 'expiredSubscriptions', 'expiredsubscriptions', 'expired_subscriptions'),
    pendingPayments: pickNumber(value, 'pendingPayments', 'pendingpayments', 'pending_payments'),
    todayRevenue: pickNumber(value, 'todayRevenue', 'todayrevenue', 'today_revenue'),
    monthRevenue: pickNumber(value, 'monthRevenue', 'monthrevenue', 'month_revenue'),
    totalRevenue: pickNumber(value, 'totalRevenue', 'totalrevenue', 'total_revenue'),
    totalOrders: pickNumber(value, 'totalOrders', 'totalorders', 'total_orders'),
    pendingOrders: pickNumber(value, 'pendingOrders', 'pendingorders', 'pending_orders'),
    inProgressOrders: pickNumber(value, 'inProgressOrders', 'inprogressorders', 'in_progress_orders'),
    completedOrders: pickNumber(value, 'completedOrders', 'completedorders', 'completed_orders'),
    cancelledOrders: pickNumber(value, 'cancelledOrders', 'cancelledorders', 'cancelled_orders'),
    totalRequests: pickNumber(value, 'totalRequests', 'totalrequests', 'total_requests'),
    pendingRequests: pickNumber(value, 'pendingRequests', 'pendingrequests', 'pending_requests'),
  }));
};
