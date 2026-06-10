import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { queryClient } from '@/shared/lib/queryClient';
import { createEmergencyPackage, getEmergencyPackage, updateEmergencyPackage } from '@/modules/emergency/api/emergencyApi';
import type { ApiError } from '@/shared/types/common';
import type { EmergencyPackagePayload } from '@/modules/emergency/types/emergency';

export const EMERGENCY_PACKAGE_QUERY_KEY = ['emergency', 'package'] as const;

export const useEmergencyPackageQuery = () =>
  useQuery({
    queryKey: EMERGENCY_PACKAGE_QUERY_KEY,
    queryFn: getEmergencyPackage,
  });

export const useSaveEmergencyPackageMutation = () =>
  useMutation({
    mutationFn: ({ packageId, payload, hasExistingPackage }: { packageId?: string; payload: EmergencyPackagePayload; hasExistingPackage: boolean }) =>
      hasExistingPackage && packageId ? updateEmergencyPackage(packageId, payload) : createEmergencyPackage(payload),
    onSuccess: (response) => {
      toast.success(response.message);
      queryClient.invalidateQueries({ queryKey: EMERGENCY_PACKAGE_QUERY_KEY });
    },
    onError: (error: ApiError) => toast.error(error.message),
  });
