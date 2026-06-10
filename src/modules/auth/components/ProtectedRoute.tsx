import type { ReactNode } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { authStore } from '@/modules/auth/store/authStore';

interface ProtectedRouteProps {
  children?: ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const accessToken = authStore((state) => state.accessToken);
  const user = authStore((state) => state.user);

  if (!accessToken || !user || !user.isActive) {
    return <Navigate to="/auth/login" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};

ProtectedRoute.displayName = 'ProtectedRoute';
