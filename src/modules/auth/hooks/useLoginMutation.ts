import { useMutation } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { createSupportAgent, loginAdmin } from '@/modules/auth/api/authApi';
import { authStore, mapGeneralDataToUser } from '@/modules/auth/store/authStore';
import type { ApiError } from '@/shared/types/common';
import type { CreateSupportAgentRequestDto } from '@/modules/auth/types/auth';
import { queryClient } from '@/shared/lib/queryClient';

export const LOGIN_MUTATION_KEY = ['auth', 'login'] as const;
export const CREATE_SUPPORT_AGENT_MUTATION_KEY = ['auth', 'create-support-agent'] as const;

export const useLoginMutation = () =>
  useMutation({
    mutationKey: LOGIN_MUTATION_KEY,
    mutationFn: loginAdmin,
    onSuccess: (response) => {
      if (!response.isSuccess || !response.accessToken || !response.refreshToken || !response.expiration || !response.generalData) {
        toast.error(response.message || 'Login failed');
        return;
      }

      authStore.getState().setAuth({
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
        expiration: response.expiration,
        user: mapGeneralDataToUser(response.generalData),
      });
      toast.success(response.message);
    },
    onError: (error: ApiError) => {
      toast.error(error.message);
    },
  });

export const useCreateSupportAgentMutation = () =>
  useMutation({
    mutationKey: CREATE_SUPPORT_AGENT_MUTATION_KEY,
    mutationFn: (payload: CreateSupportAgentRequestDto) => createSupportAgent(payload),
    onSuccess: (response) => {
      if (response.isSuccess === false) {
        toast.error(response.message);
        return;
      }

      toast.success(response.message);
      queryClient.invalidateQueries({ queryKey: ['support-agents'] });
    },
    onError: (error: ApiError) => {
      toast.error(error.message);
    },
  });
