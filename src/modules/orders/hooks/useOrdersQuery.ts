import { useQuery } from '@tanstack/react-query';
import { getOrderById, getOrders } from '@/modules/orders/api/ordersApi';
import type { OrderFilters } from '@/modules/orders/types/orders';

export const ORDERS_QUERY_KEY = ['orders', 'list'] as const;
export const ORDER_DETAILS_QUERY_KEY = ['orders', 'details'] as const;

export const useOrdersQuery = (filters: OrderFilters, enabled = true) =>
  useQuery({
    queryKey: [...ORDERS_QUERY_KEY, filters],
    queryFn: () => getOrders(filters),
    enabled,
  });

export const useOrderDetailsQuery = (orderId?: string) =>
  useQuery({
    queryKey: [...ORDER_DETAILS_QUERY_KEY, orderId],
    queryFn: () => getOrderById(orderId ?? ''),
    enabled: Boolean(orderId),
  });
