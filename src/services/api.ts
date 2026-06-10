import { axiosInstance } from '@/shared/lib/axiosInstance';

export interface ApiResponse<T> {
  isSuccess: boolean;
  statusCode: number;
  message: string;
  data: T[];
}

export interface PaginationParams {
  page: number;
  limit: number;
  search?: string;
  fieldname?: string;
  fieldvalue?: string;
  orderby?: string;
  ordertype?: 'asc' | 'desc';
}

export const fetchPaginatedData = async <T>(endpoint: string, params: PaginationParams): Promise<ApiResponse<T>> => {
  const response = await axiosInstance.get<ApiResponse<T>>(endpoint, {
    params: {
      page: params.page,
      limit: params.limit,
      search: params.search ?? '',
      fieldname: params.fieldname ?? '',
      fieldvalue: params.fieldvalue ?? '',
      orderby: params.orderby ?? '',
      ordertype: params.ordertype ?? 'asc',
    },
  });

  return response.data;
};
