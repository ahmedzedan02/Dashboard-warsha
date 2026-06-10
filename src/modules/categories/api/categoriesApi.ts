import { axiosInstance } from '@/shared/lib/axiosInstance';
import type {
  CategoriesResponseDto,
  CategoryPayload,
  CategoryServicesResponseDto,
} from '@/modules/categories/types/categories';
import type { ResponseDTONew } from '@/shared/types/common';

export const getCategories = async (): Promise<CategoriesResponseDto> => {
  const response = await axiosInstance.get<CategoriesResponseDto>('/api/AdminApp/Categories');
  return response.data;
};

export const getCategoryServices = async (categoryId: string): Promise<CategoryServicesResponseDto> => {
  const response = await axiosInstance.get<CategoryServicesResponseDto>(`/api/AdminApp/Categories/by-category/${categoryId}`);
  return response.data;
};

export const addCategory = async (payload: CategoryPayload): Promise<ResponseDTONew<null>> => {
  const response = await axiosInstance.post<ResponseDTONew<null>>('/api/AdminApp/Categories/Add', payload);
  return response.data;
};

export const editCategory = async (categoryId: string, payload: CategoryPayload): Promise<ResponseDTONew<null>> => {
  const response = await axiosInstance.post<ResponseDTONew<null>>(`/api/AdminApp/Categories/Edit/${categoryId}`, payload);
  return response.data;
};

export const deleteCategory = async (categoryId: string): Promise<ResponseDTONew<null>> => {
  const response = await axiosInstance.delete<ResponseDTONew<null>>(`/api/AdminApp/Categories/Delete/${categoryId}`);
  return response.data;
};

export const setCategoryActive = async (categoryId: string, isActive: boolean): Promise<ResponseDTONew<null>> => {
  const response = await axiosInstance.put<ResponseDTONew<null>>(`/api/AdminApp/Categories/SetActive/${categoryId}`, undefined, {
    params: { isActive },
  });
  return response.data;
};
