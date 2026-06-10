import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { queryClient } from '@/shared/lib/queryClient';
import { addService, getActiveServicePriceList, getServices, setServiceEmergency } from '@/modules/services/api/servicesApi';
import type { ApiError } from '@/shared/types/common';
import type { ServiceFilters, ServiceFormValues } from '@/modules/services/types/services';

export const SERVICES_QUERY_KEY = ['services', 'list'] as const;
export const SERVICE_PRICE_LIST_QUERY_KEY = ['services', 'prices'] as const;

export const useServicesQuery = (filters: ServiceFilters) =>
  useQuery({
    queryKey: [...SERVICES_QUERY_KEY, filters],
    queryFn: () => getServices(filters),
  });

export const useServicePriceListQuery = () =>
  useQuery({
    queryKey: SERVICE_PRICE_LIST_QUERY_KEY,
    queryFn: getActiveServicePriceList,
  });

export const useAddServiceMutation = () =>
  useMutation({
    mutationFn: (payload: ServiceFormValues) => addService(payload),
    onSuccess: (response) => {
      toast.success(response.message);
      queryClient.invalidateQueries({ queryKey: SERVICES_QUERY_KEY });
    },
    onError: (error: ApiError) => toast.error(error.message),
  });

export const useSetEmergencyMutation = () =>
  useMutation({
    mutationFn: ({ serviceId, isEmergency }: { serviceId: string; isEmergency: boolean }) => setServiceEmergency(serviceId, isEmergency),
    onSuccess: (response) => {
      toast.success(response.message);
      queryClient.invalidateQueries({ queryKey: SERVICES_QUERY_KEY });
    },
    onError: (error: ApiError) => toast.error(error.message),
  });
