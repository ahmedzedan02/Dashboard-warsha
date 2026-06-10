import type { PropsWithChildren } from 'react';
import { useEffect } from 'react';
import { QueryProvider } from '@/app/providers/QueryProvider';
import { ToastProvider } from '@/app/providers/ToastProvider';
import { authStore } from '@/modules/auth/store/authStore';

export const AppProviders = ({ children }: PropsWithChildren) => {
  useEffect(() => {
    authStore.getState().hydrateAuth();
  }, []);

  return (
    <QueryProvider>
      <ToastProvider>{children}</ToastProvider>
    </QueryProvider>
  );
};

AppProviders.displayName = 'AppProviders';
