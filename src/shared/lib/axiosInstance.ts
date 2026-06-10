import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { env } from '@/config/env';
import type { ApiError } from '@/shared/types/common';
import { authStore, mapGeneralDataToUser } from '@/modules/auth/store/authStore';
import { refreshToken } from '@/modules/auth/api/authApi';

interface RetryableRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

let refreshPromise: Promise<string | null> | null = null;

const normalizeError = (error: AxiosError): ApiError => {
  if (error.response) {
    const responseData = error.response.data as { message?: string; code?: string; statusCode?: number } | undefined;
    return {
      message: responseData?.message ?? error.message,
      code: responseData?.code ?? String(responseData?.statusCode ?? error.response.status),
      status: responseData?.statusCode ?? error.response.status,
    };
  }

  if (error.request) {
    return {
      message: 'Check your connection',
      code: 'NETWORK_ERROR',
    };
  }

  return {
    message: error.message,
    code: 'UNKNOWN_ERROR',
  };
};

export const axiosInstance = axios.create({
  baseURL: env.VITE_API_BASE_URL,
  withCredentials: true,
});

axiosInstance.interceptors.request.use((config) => {
  const token = authStore.getState().accessToken;

  if (token && config.headers.Authorization === undefined) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

const refreshAccessToken = async (): Promise<string | null> => {
  const { accessToken, refreshToken: storedRefreshToken, clearAuth, setAuth, user } = authStore.getState();

  if (!accessToken || !storedRefreshToken || !user) {
    clearAuth();
    return null;
  }

  try {
    const response = await refreshToken({ accessToken, refreshToken: storedRefreshToken });

    if (!response.isSuccess || !response.accessToken || !response.refreshToken || !response.expiration || !response.generalData) {
      clearAuth();
      return null;
    }

    setAuth({
      accessToken: response.accessToken,
      refreshToken: response.refreshToken,
      expiration: response.expiration,
      user: mapGeneralDataToUser(response.generalData),
    });

    return response.accessToken;
  } catch {
    clearAuth();
    return null;
  }
};

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryableRequestConfig | undefined;

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;
      refreshPromise ??= refreshAccessToken().finally(() => {
        refreshPromise = null;
      });

      const newAccessToken = await refreshPromise;

      if (newAccessToken) {
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return axiosInstance(originalRequest);
      }

      window.location.assign('/auth/login');
    }

    const normalizedError = normalizeError(error);

    if (normalizedError.status === 403) {
      normalizedError.message = 'Access denied';
    }

    return Promise.reject(normalizedError);
  },
);
