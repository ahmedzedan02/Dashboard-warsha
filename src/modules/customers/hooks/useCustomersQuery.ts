import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { queryClient } from '@/shared/lib/queryClient';
import { addCustomer, deleteCustomer, editCustomer, getCustomerById, getCustomers, setCustomerActive } from '@/modules/customers/api/customersApi';
import type { ApiError } from '@/shared/types/common';
import type { CustomerFilters, CustomerFormValues } from '@/modules/customers/types/customers';

export const CUSTOMERS_QUERY_KEY = ['customers', 'list'] as const;
export const CUSTOMER_DETAILS_QUERY_KEY = ['customers', 'details'] as const;

export const useCustomersQuery = (filters: CustomerFilters) =>
  useQuery({
    queryKey: [...CUSTOMERS_QUERY_KEY, filters],
    queryFn: () => getCustomers(filters),
  });

export const useCustomerDetailsQuery = (customerId?: string) =>
  useQuery({
    queryKey: [...CUSTOMER_DETAILS_QUERY_KEY, customerId],
    queryFn: () => getCustomerById(customerId ?? ''),
    enabled: Boolean(customerId),
  });

export const useAddCustomerMutation = () =>
  useMutation({
    mutationFn: (payload: CustomerFormValues) => addCustomer(payload),
    onSuccess: (response) => {
      toast.success(response.message);
      queryClient.invalidateQueries({ queryKey: CUSTOMERS_QUERY_KEY });
    },
    onError: (error: ApiError) => toast.error(error.message),
  });

export const useEditCustomerMutation = () =>
  useMutation({
    mutationFn: ({ customerId, payload }: { customerId: string; payload: CustomerFormValues }) => editCustomer(customerId, payload),
    onSuccess: (response) => {
      toast.success(response.message);
      queryClient.invalidateQueries({ queryKey: CUSTOMERS_QUERY_KEY });
    },
    onError: (error: ApiError) => toast.error(error.message),
  });

export const useDeleteCustomerMutation = () =>
  useMutation({
    mutationFn: deleteCustomer,
    onSuccess: (response) => {
      toast.success(response.message);
      queryClient.invalidateQueries({ queryKey: CUSTOMERS_QUERY_KEY });
    },
    onError: (error: ApiError) => toast.error(error.message),
  });

export const useSetCustomerActiveMutation = () =>
  useMutation({
    mutationFn: ({ customerId, isActive }: { customerId: string; isActive: boolean }) => setCustomerActive(customerId, isActive),
    onSuccess: (response) => {
      toast.success(response.message);
      queryClient.invalidateQueries({ queryKey: CUSTOMERS_QUERY_KEY });
    },
    onError: (error: ApiError) => toast.error(error.message),
  });
