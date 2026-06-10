import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { queryClient } from '@/shared/lib/queryClient';
import {
  addCategory,
  deleteCategory,
  editCategory,
  getCategories,
  getCategoryServices,
  setCategoryActive,
} from '@/modules/categories/api/categoriesApi';
import type { ApiError } from '@/shared/types/common';
import type { CategoryPayload } from '@/modules/categories/types/categories';

export const CATEGORIES_QUERY_KEY = ['categories', 'list'] as const;
export const CATEGORY_SERVICES_QUERY_KEY = ['categories', 'services'] as const;

export const useCategoriesQuery = () =>
  useQuery({
    queryKey: CATEGORIES_QUERY_KEY,
    queryFn: getCategories,
  });

export const useCategoryServicesQuery = (categoryId?: string) =>
  useQuery({
    queryKey: [...CATEGORY_SERVICES_QUERY_KEY, categoryId],
    queryFn: () => getCategoryServices(categoryId ?? ''),
    enabled: Boolean(categoryId),
  });

export const useAddCategoryMutation = () =>
  useMutation({
    mutationFn: (payload: CategoryPayload) => addCategory(payload),
    onSuccess: (response) => {
      toast.success(response.message);
      queryClient.invalidateQueries({ queryKey: CATEGORIES_QUERY_KEY });
    },
    onError: (error: ApiError) => toast.error(error.message),
  });

export const useEditCategoryMutation = () =>
  useMutation({
    mutationFn: ({ categoryId, payload }: { categoryId: string; payload: CategoryPayload }) => editCategory(categoryId, payload),
    onSuccess: (response) => {
      toast.success(response.message);
      queryClient.invalidateQueries({ queryKey: CATEGORIES_QUERY_KEY });
    },
    onError: (error: ApiError) => toast.error(error.message),
  });

export const useDeleteCategoryMutation = () =>
  useMutation({
    mutationFn: deleteCategory,
    onSuccess: (response) => {
      toast.success(response.message);
      queryClient.invalidateQueries({ queryKey: CATEGORIES_QUERY_KEY });
    },
    onError: (error: ApiError) => toast.error(error.message),
  });

export const useSetCategoryActiveMutation = () =>
  useMutation({
    mutationFn: ({ categoryId, isActive }: { categoryId: string; isActive: boolean }) => setCategoryActive(categoryId, isActive),
    onSuccess: (response) => {
      toast.success(response.message);
      queryClient.invalidateQueries({ queryKey: CATEGORIES_QUERY_KEY });
    },
    onError: (error: ApiError) => toast.error(error.message),
  });
