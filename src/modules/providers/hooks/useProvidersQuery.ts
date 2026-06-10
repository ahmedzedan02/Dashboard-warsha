import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { queryClient } from '@/shared/lib/queryClient';
import {
  addProvider,
  editProvider,
  getProviderById,
  getProviders,
  setProviderActive,
  setProviderPaperOk,
} from '@/modules/providers/api/providersApi';
import type { ApiError } from '@/shared/types/common';
import type { ProviderFormValues, ProviderSearchFilters } from '@/modules/providers/types/providers';

export const PROVIDERS_QUERY_KEY = ['providers', 'list'] as const;
export const PROVIDER_DETAILS_QUERY_KEY = ['providers', 'details'] as const;

export const useProvidersQuery = (filters: ProviderSearchFilters) =>
  useQuery({
    queryKey: [...PROVIDERS_QUERY_KEY, filters],
    queryFn: () => getProviders(filters),
  });

export const useProviderDetailsQuery = (providerId?: string) =>
  useQuery({
    queryKey: [...PROVIDER_DETAILS_QUERY_KEY, providerId],
    queryFn: () => getProviderById(providerId ?? ''),
    enabled: Boolean(providerId),
  });

export const useAddProviderMutation = () =>
  useMutation({
    mutationFn: (payload: ProviderFormValues) => addProvider(payload),
    onSuccess: (response) => {
      toast.success(response.message);
      queryClient.invalidateQueries({ queryKey: PROVIDERS_QUERY_KEY });
    },
    onError: (error: ApiError) => toast.error(error.message),
  });

export const useEditProviderMutation = () =>
  useMutation({
    mutationFn: ({ providerId, payload }: { providerId: string; payload: Omit<ProviderFormValues, 'password' | 'fcomplogo' | 'fcompAttachments'> }) =>
      editProvider(providerId, payload),
    onSuccess: (response) => {
      toast.success(response.message);
      queryClient.invalidateQueries({ queryKey: PROVIDERS_QUERY_KEY });
    },
    onError: (error: ApiError) => toast.error(error.message),
  });

export const useSetProviderActiveMutation = () =>
  useMutation({
    mutationFn: ({ providerId, isActive }: { providerId: string; isActive: boolean }) => setProviderActive(providerId, isActive),
    onSuccess: (response) => {
      toast.success(response.message);
      queryClient.invalidateQueries({ queryKey: PROVIDERS_QUERY_KEY });
    },
    onError: (error: ApiError) => toast.error(error.message),
  });

export const useSetProviderPaperMutation = () =>
  useMutation({
    mutationFn: ({ providerId, isPaperOk }: { providerId: string; isPaperOk: boolean }) => setProviderPaperOk(providerId, isPaperOk),
    onSuccess: (response) => {
      toast.success(response.message);
      queryClient.invalidateQueries({ queryKey: PROVIDERS_QUERY_KEY });
    },
    onError: (error: ApiError) => toast.error(error.message),
  });
