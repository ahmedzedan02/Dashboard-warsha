import { Suspense, lazy } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { AppShell } from '@/shared/components/layout/AppShell';
import { ProtectedRoute } from '@/modules/auth/components/ProtectedRoute';
import { ErrorState } from '@/shared/components/ErrorState';

const LoginPage = lazy(() => import('@/modules/auth/pages/LoginPage').then((module) => ({ default: module.LoginPage })));
const DashboardPage = lazy(() => import('@/modules/dashboard/pages/DashboardPage').then((module) => ({ default: module.DashboardPage })));
const SubscriptionsPage = lazy(() =>
  import('@/modules/subscriptions/pages/SubscriptionsPage').then((module) => ({ default: module.SubscriptionsPage })),
);
const PaymentsPage = lazy(() => import('@/modules/payments/pages/PaymentsPage').then((module) => ({ default: module.PaymentsPage })));
const PendingContractsPage = lazy(() =>
  import('@/modules/subscriptions/pages/PendingContractsPage').then((module) => ({ default: module.PendingContractsPage })),
);
const OrdersPage = lazy(() => import('@/modules/orders/pages/OrdersPage').then((module) => ({ default: module.OrdersPage })));
const RequestsPage = lazy(() => import('@/modules/requests/pages/RequestsPage').then((module) => ({ default: module.RequestsPage })));
const ProvidersPage = lazy(() => import('@/modules/providers/pages/ProvidersPage').then((module) => ({ default: module.ProvidersPage })));
const CustomersPage = lazy(() => import('@/pages/users/UserListPage').then((module) => ({ default: module.UserListPage })));
const ProviderListPage = lazy(() => import('@/pages/providers/ProviderListPage').then((module) => ({ default: module.ProviderListPage })));
const CategoriesPage = lazy(() => import('@/modules/categories/pages/CategoriesPage').then((module) => ({ default: module.CategoriesPage })));
const ServicesPage = lazy(() => import('@/modules/services/pages/ServicesPage').then((module) => ({ default: module.ServicesPage })));
const EmergencyPage = lazy(() => import('@/modules/emergency/pages/EmergencyPackagePage').then((module) => ({ default: module.EmergencyPackagePage })));
const SupportTicketsPage = lazy(() => import('@/modules/support/pages/SupportTicketsPage').then((module) => ({ default: module.SupportTicketsPage })));
const CreateSupportAgentPage = lazy(() =>
  import('@/modules/auth/pages/CreateSupportAgentPage').then((module) => ({ default: module.CreateSupportAgentPage })),
);

const suspenseFallback = (
  <div className="p-6">
    <div className="card-surface p-8 text-center text-brand-light">Loading...</div>
  </div>
);

export const router = createBrowserRouter(
  [
    {
    path: '/auth/login',
    element: (
      <Suspense fallback={suspenseFallback}>
        <LoginPage />
      </Suspense>
    ),
    errorElement: <ErrorState message="Unable to load the login page." />,
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <AppShell />
      </ProtectedRoute>
    ),
    errorElement: <ErrorState message="Unable to load this route." />,
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={suspenseFallback}>
            <DashboardPage />
          </Suspense>
        ),
      },
      {
        path: 'subscriptions',
        element: (
          <Suspense fallback={suspenseFallback}>
            <SubscriptionsPage />
          </Suspense>
        ),
      },
      {
        path: 'payments',
        element: (
          <Suspense fallback={suspenseFallback}>
            <PaymentsPage />
          </Suspense>
        ),
      },
      {
        path: 'pending-contracts',
        element: (
          <Suspense fallback={suspenseFallback}>
            <PendingContractsPage />
          </Suspense>
        ),
      },
      {
        path: 'orders',
        element: (
          <Suspense fallback={suspenseFallback}>
            <OrdersPage />
          </Suspense>
        ),
      },
      {
        path: 'support',
        element: (
          <Suspense fallback={suspenseFallback}>
            <SupportTicketsPage />
          </Suspense>
        ),
      },
      {
        path: 'support-agents',
        element: (
          <Suspense fallback={suspenseFallback}>
            <CreateSupportAgentPage />
          </Suspense>
        ),
      },
      {
        path: 'requests',
        element: (
          <Suspense fallback={suspenseFallback}>
            <RequestsPage />
          </Suspense>
        ),
      },
      {
        path: 'providers',
        element: (
          <Suspense fallback={suspenseFallback}>
            <ProviderListPage />
          </Suspense>
        ),
      },
      {
        path: 'customers',
        element: (
          <Suspense fallback={suspenseFallback}>
            <CustomersPage />
          </Suspense>
        ),
      },
      {
        path: 'categories',
        element: (
          <Suspense fallback={suspenseFallback}>
            <CategoriesPage />
          </Suspense>
        ),
      },
      {
        path: 'services',
        element: (
          <Suspense fallback={suspenseFallback}>
            <ServicesPage />
          </Suspense>
        ),
      },
      {
        path: 'emergency',
        element: (
          <Suspense fallback={suspenseFallback}>
            <EmergencyPage />
          </Suspense>
        ),
      },
    ],
    },
  ],
);
