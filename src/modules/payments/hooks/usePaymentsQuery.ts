import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { queryClient } from '@/shared/lib/queryClient';
import { confirmPayment, getPayments, verifyManualPayment } from '@/modules/payments/api/paymentsApi';
import type { ApiError } from '@/shared/types/common';
import type { ConfirmPaymentPayload, PaymentFilters } from '@/modules/payments/types/payments';

export const PAYMENTS_QUERY_KEY = ['payments', 'list'] as const;

export const usePaymentsQuery = (filters: PaymentFilters, enabled = true) =>
  useQuery({
    queryKey: [...PAYMENTS_QUERY_KEY, filters],
    queryFn: () => getPayments(filters),
    enabled,
  });

export const useVerifyPaymentMutation = () =>
  useMutation({
    mutationFn: verifyManualPayment,
    onSuccess: (response) => {
      toast.success(response.message);
      queryClient.invalidateQueries({ queryKey: PAYMENTS_QUERY_KEY });
    },
    onError: (error: ApiError) => toast.error(error.message),
  });

export const useConfirmPaymentMutation = () =>
  useMutation({
    mutationFn: (payload: ConfirmPaymentPayload) => confirmPayment(payload),
    onSuccess: (response) => {
      toast.success(response.message);
      queryClient.invalidateQueries({ queryKey: PAYMENTS_QUERY_KEY });
    },
    onError: (error: ApiError) => toast.error(error.message),
  });
