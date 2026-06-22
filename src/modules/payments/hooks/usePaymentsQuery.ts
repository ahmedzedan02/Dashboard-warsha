import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { queryClient } from '@/shared/lib/queryClient';
import {
  confirmPayment,
  getCustomerPayments,
  getPayments,
  getProviderPayments,
  verifyManualPayment,
} from '@/modules/payments/api/paymentsApi';
import type { ApiError } from '@/shared/types/common';
import type {
  ConfirmPaymentPayload,
  CustomerPaymentFilters,
  PaymentFilters,
  ProviderPaymentFilters,
} from '@/modules/payments/types/payments';

export const PAYMENTS_QUERY_KEY = ['payments', 'list'] as const;
export const CUSTOMER_PAYMENTS_QUERY_KEY = ['payments', 'customer'] as const;
export const PROVIDER_PAYMENTS_QUERY_KEY = ['payments', 'provider'] as const;

export const usePaymentsQuery = (filters: PaymentFilters, enabled = true) =>
  useQuery({
    queryKey: [...PAYMENTS_QUERY_KEY, filters],
    queryFn: () => getPayments(filters),
    enabled,
  });

export const useCustomerPaymentsQuery = (filters: CustomerPaymentFilters, enabled = true) =>
  useQuery({
    queryKey: [...CUSTOMER_PAYMENTS_QUERY_KEY, filters],
    queryFn: () => getCustomerPayments(filters),
    enabled,
  });

export const useProviderPaymentsQuery = (filters: ProviderPaymentFilters, enabled = true) =>
  useQuery({
    queryKey: [...PROVIDER_PAYMENTS_QUERY_KEY, filters],
    queryFn: () => getProviderPayments(filters),
    enabled,
  });

export const useVerifyPaymentMutation = () =>
  useMutation({
    mutationFn: verifyManualPayment,
    onSuccess: (response) => {
      toast.success(response.message);
      queryClient.invalidateQueries({ queryKey: PAYMENTS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: PROVIDER_PAYMENTS_QUERY_KEY });
    },
    onError: (error: ApiError) => toast.error(error.message),
  });

export const useConfirmPaymentMutation = () =>
  useMutation({
    mutationFn: confirmPayment,
    onSuccess: (response) => {
      toast.success(response.message);
      queryClient.invalidateQueries({ queryKey: PAYMENTS_QUERY_KEY });
    },
    onError: (error: ApiError) => toast.error(error.message),
  });

