import { useQuery } from '@tanstack/react-query';
import { getRequestById, getRequests } from '@/modules/requests/api/requestsApi';
import type { RequestFilters } from '@/modules/requests/types/requests';

export const REQUESTS_QUERY_KEY = ['requests', 'list'] as const;
export const REQUEST_DETAILS_QUERY_KEY = ['requests', 'details'] as const;

export const useRequestsQuery = (filters: RequestFilters) =>
  useQuery({
    queryKey: [...REQUESTS_QUERY_KEY, filters],
    queryFn: () => getRequests(filters),
  });

export const useRequestDetailsQuery = (requestId?: string) =>
  useQuery({
    queryKey: [...REQUEST_DETAILS_QUERY_KEY, requestId],
    queryFn: () => getRequestById(requestId ?? ''),
    enabled: Boolean(requestId),
  });
