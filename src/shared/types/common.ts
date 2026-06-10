export interface ResponseDTONew<T> {
  code?: number;
  success?: boolean;
  isSuccess?: boolean;
  message: string;
  data?: T;
  generalData?: T;
}

export interface PagedResult<T> {
  page: number;
  pageSize: number;
  total: number;
  data: T[];
}

export interface ApiError {
  message: string;
  code?: string;
  status?: number;
}

export interface SupportResponseDto<T> {
  statusCode: number;
  isSuccess: boolean;
  message: string;
  data: T;
}

export interface SelectOption<TValue extends string | number = string> {
  label: string;
  value: TValue;
}
