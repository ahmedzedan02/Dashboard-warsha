import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { queryClient } from '@/shared/lib/queryClient';
import {
  approvePendingContract,
  getPendingContracts,
  getSubscriptions,
  rejectPendingContract,
  verifyManualPayment,
} from '@/modules/subscriptions/api/subscriptionsApi';
import type { ApiError } from '@/shared/types/common';
import type { ApproveContractPayload, RejectContractPayload, SubscriptionFilters } from '@/modules/subscriptions/types/subscriptions';

export const SUBSCRIPTIONS_QUERY_KEY = ['subscriptions', 'list'] as const;
export const PENDING_CONTRACTS_QUERY_KEY = ['subscriptions', 'pending-contracts'] as const;

export const useSubscriptionsQuery = (filters: SubscriptionFilters) =>
  useQuery({
    queryKey: [...SUBSCRIPTIONS_QUERY_KEY, filters],
    queryFn: () => getSubscriptions(filters),
  });

export const usePendingContractsQuery = () =>
  useQuery({
    queryKey: PENDING_CONTRACTS_QUERY_KEY,
    queryFn: getPendingContracts,
  });

export const useApproveContractMutation = () =>
  useMutation({
    mutationFn: approvePendingContract,
    onSuccess: (response) => {
      toast.success(response.message);
      queryClient.invalidateQueries({ queryKey: PENDING_CONTRACTS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: SUBSCRIPTIONS_QUERY_KEY });
    },
    onError: (error: ApiError) => toast.error(error.message),
  });

export const useRejectContractMutation = () =>
  useMutation({
    mutationFn: rejectPendingContract,
    onSuccess: (response) => {
      toast.success(response.message);
      queryClient.invalidateQueries({ queryKey: PENDING_CONTRACTS_QUERY_KEY });
    },
    onError: (error: ApiError) => toast.error(error.message),
  });

export const useVerifyManualPaymentMutation = () =>
  useMutation({
    mutationFn: verifyManualPayment,
    onSuccess: (response) => {
      toast.success(response.message);
      queryClient.invalidateQueries({ queryKey: PENDING_CONTRACTS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: SUBSCRIPTIONS_QUERY_KEY });
    },
    onError: (error: ApiError) => toast.error(error.message),
  });
