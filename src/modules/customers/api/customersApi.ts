import { axiosInstance } from '@/shared/lib/axiosInstance';
import type { CustomerDetailsResponseDto, CustomerFilters, CustomerFormValues, CustomersResponseDto } from '@/modules/customers/types/customers';
import type { ResponseDTONew } from '@/shared/types/common';
import { mapPagedResponse, mapResponse, pickBoolean, pickString } from '@/shared/lib/apiMappers';

export const getCustomers = async (params: CustomerFilters): Promise<CustomersResponseDto> => {
  const response = await axiosInstance.get<CustomersResponseDto>('/api/AdminApp/Maintusers/SearchData', {
    params: {
      search: params.search,
      page: params.page,
      limit: params.pageSize,
    },
  });
  return mapPagedResponse(response.data, params.page, params.pageSize, (value) => ({
    id: pickString(value, 'id', 'userId', 'userid', 'wrshauser_id'),
    fullName: pickString(value, 'fullName', 'fullname', 'userName', 'username'),
    email: pickString(value, 'email'),
    mobileNo: pickString(value, 'mobileNo', 'mobileno', 'phone', 'phoneno'),
    whatsapp: pickString(value, 'whatsapp') || undefined,
    country: pickString(value, 'country', 'country_name_en', 'country_name_ar') || undefined,
    address: pickString(value, 'address', 'adress') || undefined,
    isActive: pickBoolean(value, 'isActive', 'isactive', 'active'),
  }));
};

export const getCustomerById = async (customerId: string): Promise<CustomerDetailsResponseDto> => {
  const response = await axiosInstance.get<CustomerDetailsResponseDto>(`/api/AdminApp/Maintusers/GetByID/${customerId}`);
  return mapResponse(response.data, (value) => {
    const record = Array.isArray(value) ? value[0] ?? {} : value;

    return {
      id: pickString(record, 'id', 'userId', 'userid', 'wrshauser_id'),
      fullName: pickString(record, 'fullName', 'fullname', 'userName', 'username'),
      email: pickString(record, 'email'),
      mobileNo: pickString(record, 'mobileNo', 'mobileno', 'phone', 'phoneno'),
      whatsapp: pickString(record, 'whatsapp') || undefined,
      country: pickString(record, 'country', 'country_name_en', 'country_name_ar') || undefined,
      address: pickString(record, 'address', 'adress') || undefined,
      isActive: pickBoolean(record, 'isActive', 'isactive', 'active'),
    };
  });
};

export const addCustomer = async (payload: CustomerFormValues): Promise<ResponseDTONew<null>> => {
  const response = await axiosInstance.post<ResponseDTONew<null>>('/api/AdminApp/Maintusers/Add', {
    fullname: payload.fullName,
    email: payload.email,
    mobileno: payload.mobileNo,
  });
  return response.data;
};

export const editCustomer = async (customerId: string, payload: CustomerFormValues): Promise<ResponseDTONew<null>> => {
  const response = await axiosInstance.post<ResponseDTONew<null>>(`/api/AdminApp/Maintusers/Edit/${customerId}`, {
    id: Number(customerId),
    fullname: payload.fullName,
    email: payload.email,
    mobileno: payload.mobileNo,
  });
  return response.data;
};

export const deleteCustomer = async (customerId: string): Promise<ResponseDTONew<null>> => {
  const response = await axiosInstance.delete<ResponseDTONew<null>>(`/api/AdminApp/Maintusers/Delete/${customerId}`);
  return response.data;
};

export const setCustomerActive = async (customerId: string, isActive: boolean): Promise<ResponseDTONew<null>> => {
  const response = await axiosInstance.put<ResponseDTONew<null>>(`/api/AdminApp/Maintusers/SetActive/${customerId}`, undefined, {
    params: { isActive },
  });
  return response.data;
};
