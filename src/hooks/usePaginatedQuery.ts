import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { fetchPaginatedData, type ApiResponse, type PaginationParams } from '@/services/api';

export const usePaginatedQuery = <T>(endpoint: string, params: PaginationParams) =>
  useQuery<ApiResponse<T>>({
    queryKey: [endpoint, params],
    queryFn: () => fetchPaginatedData<T>(endpoint, params),
    placeholderData: keepPreviousData,
  });
