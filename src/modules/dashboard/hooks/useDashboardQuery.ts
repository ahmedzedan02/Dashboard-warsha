import { useQuery } from '@tanstack/react-query';
import { getDashboardStats } from '@/modules/dashboard/api/dashboardApi';

export const DASHBOARD_QUERY_KEY = ['dashboard', 'stats'] as const;

export const useDashboardQuery = () =>
  useQuery({
    queryKey: DASHBOARD_QUERY_KEY,
    queryFn: getDashboardStats,
    staleTime: 0,
    refetchInterval: 60_000,
  });
