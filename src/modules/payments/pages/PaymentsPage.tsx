import { useMemo, useState } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { Users, Wrench, ListOrdered, ShieldAlert } from 'lucide-react';
import { DataTable } from '@/shared/components/DataTable';
import { FilterBar } from '@/shared/components/FilterBar';
import { PageHeader } from '@/shared/components/PageHeader';
import { StatusBadge } from '@/shared/components/StatusBadge';
import { usePagination } from '@/shared/hooks/usePagination';
import { useTableFilters } from '@/shared/hooks/useTableFilters';
import { formatCurrency, formatDate } from '@/shared/utils/format';
import { Button } from '@/shared/components/ui/button';
import { ConfirmDialog } from '@/shared/components/ConfirmDialog';
import {
  useCustomerPaymentsQuery,
  useProviderPaymentsQuery,
  useVerifyPaymentMutation,
} from '@/modules/payments/hooks/usePaymentsQuery';
import type {
  CustomerPaymentRecord,
  ProviderPaymentRecord,
} from '@/modules/payments/types/payments';
import { Badge } from '@/shared/components/ui/badge';

// ─── Constants ───────────────────────────────────────────────────────────────

const STATUS_OPTIONS = [
  { label: 'All Statuses', value: '' },
  { label: 'Pending', value: 'Pending' },
  { label: 'Paid', value: 'Paid' },
  { label: 'Failed', value: 'Failed' },
  { label: 'Cancelled', value: 'Cancelled' },
  { label: 'Expired', value: 'Expired' },
  { label: 'Refunded', value: 'Refunded' },
];

type TabId = 'customer' | 'provider';

const TABS: { id: TabId; label: string; icon: typeof Users }[] = [
  { id: 'customer', label: 'Customer Payments', icon: Users },
  { id: 'provider', label: 'Provider Payments', icon: Wrench },
];

const renderPaymentTypeBadge = (paymentType?: string) => {
  if (!paymentType) return null;
  const lower = paymentType.toLowerCase();
  if (lower.includes('emergency')) {
    return (
      <Badge variant="warning" className="gap-1 px-1.5 py-0 text-[10px] h-5">
        <ShieldAlert className="h-3 w-3" />
        Emergency
      </Badge>
    );
  }
  if (lower.includes('service')) {
    return (
      <Badge variant="success" className="gap-1 px-1.5 py-0 text-[10px] h-5">
        <Wrench className="h-3 w-3" />
        Service
      </Badge>
    );
  }
  if (lower.includes('order')) {
    return (
      <Badge variant="info" className="gap-1 px-1.5 py-0 text-[10px] h-5">
        <ListOrdered className="h-3 w-3" />
        Order
      </Badge>
    );
  }
  return (
    <Badge variant="default" className="px-1.5 py-0 text-[10px] h-5">
      {paymentType}
    </Badge>
  );
};

// ─── Customer Payments Tab ───────────────────────────────────────────────────

const CustomerPaymentsTab = () => {
  const { pagination, setPage } = usePagination();
  const { filters, updateFilter } = useTableFilters({ status: '', userId: '', fromDate: '', toDate: '' });

  const query = useCustomerPaymentsQuery({
    page: pagination.page,
    pageSize: pagination.pageSize,
    userId: filters.userId || undefined,
    status: filters.status || undefined,
    fromDate: filters.fromDate || undefined,
    toDate: filters.toDate || undefined,
  });

  const columns = useMemo<ColumnDef<CustomerPaymentRecord>[]>(
    () => [
      {
        accessorKey: 'userName',
        header: 'Customer Name',
        cell: ({ row }) => (
          <div className="flex flex-col gap-1 items-start">
            <span className="font-medium text-brand-dark">{row.original.userName}</span>
            {renderPaymentTypeBadge(row.original.paymentType)}
          </div>
        ),
      },
      { accessorKey: 'userId', header: 'User ID' },
      {
        accessorKey: 'transactionRef',
        header: 'Transaction Ref',
        cell: ({ row }) => (
          <div className="flex flex-col gap-1 items-start">
            <span>{row.original.transactionRef || '-'}</span>
            {row.original.requestRef && (
              <span className="text-[10px] text-brand-light">Ref: {row.original.requestRef}</span>
            )}
          </div>
        ),
      },
      {
        accessorKey: 'amount',
        header: 'Amount',
        cell: ({ row }) => formatCurrency(row.original.amount, row.original.currency),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
      {
        accessorKey: 'createdAt',
        header: 'Created',
        cell: ({ row }) => formatDate(row.original.createdAt, 'dd MMM yyyy p'),
      },
      {
        accessorKey: 'paidDate',
        header: 'Paid Date',
        cell: ({ row }) => formatDate(row.original.paidDate, 'dd MMM yyyy p'),
      },
    ],
    [],
  );

  const list = query.data?.data;

  return (
    <div className="space-y-4">
      <FilterBar
        fields={[
          {
            key: 'status',
            label: 'Status',
            type: 'select',
            value: filters.status,
            options: STATUS_OPTIONS,
          },
          { key: 'userId', label: 'User ID', type: 'text', value: filters.userId },
          { key: 'fromDate', label: 'From Date', type: 'date', value: filters.fromDate },
          { key: 'toDate', label: 'To Date', type: 'date', value: filters.toDate },
        ]}
        onChange={(key, value) => updateFilter(key as 'status' | 'userId' | 'fromDate' | 'toDate', value)}
      />
      <DataTable
        columns={columns}
        data={list?.data ?? []}
        isLoading={query.isLoading}
        pagination={{
          page: list?.page ?? pagination.page,
          pageSize: list?.pageSize ?? pagination.pageSize,
          total: list?.total ?? 0,
          onPageChange: setPage,
        }}
      />
    </div>
  );
};

// ─── Provider Payments Tab ───────────────────────────────────────────────────

const ProviderPaymentsTab = () => {
  const { pagination, setPage } = usePagination();
  const { filters, updateFilter } = useTableFilters({ status: '', providerId: '', fromDate: '', toDate: '' });

  const query = useProviderPaymentsQuery({
    page: pagination.page,
    pageSize: pagination.pageSize,
    providerId: filters.providerId || undefined,
    status: filters.status || undefined,
    fromDate: filters.fromDate || undefined,
    toDate: filters.toDate || undefined,
  });

  const verifyMutation = useVerifyPaymentMutation();
  const [verifyId, setVerifyId] = useState<string | null>(null);

  const columns = useMemo<ColumnDef<ProviderPaymentRecord>[]>(
    () => [
      {
        accessorKey: 'providerName',
        header: 'Provider Name',
        cell: ({ row }) => (
          <div className="flex flex-col gap-1 items-start">
            <span className="font-medium text-brand-dark">{row.original.providerName}</span>
            {renderPaymentTypeBadge(row.original.paymentType)}
          </div>
        ),
      },
      { accessorKey: 'providerId', header: 'Provider ID' },
      {
        accessorKey: 'transactionRef',
        header: 'Transaction Ref',
        cell: ({ row }) => (
          <div className="flex flex-col gap-1 items-start">
            <span>{row.original.transactionRef || '-'}</span>
            {row.original.requestRef && (
              <span className="text-[10px] text-brand-light">Ref: {row.original.requestRef}</span>
            )}
          </div>
        ),
      },
      {
        accessorKey: 'amount',
        header: 'Amount',
        cell: ({ row }) => formatCurrency(row.original.amount, row.original.currency),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
      {
        accessorKey: 'createdAt',
        header: 'Created',
        cell: ({ row }) => formatDate(row.original.createdAt, 'dd MMM yyyy p'),
      },
      {
        accessorKey: 'paidDate',
        header: 'Paid Date',
        cell: ({ row }) => formatDate(row.original.paidDate, 'dd MMM yyyy p'),
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => {
          const isPending = row.original.status?.toLowerCase() === 'pending';
          const isServicePayment = row.original.paymentType?.toLowerCase().includes('service');

          if (isPending && isServicePayment) {
            return (
              <Button
                size="sm"
                variant="default"
                className="h-8 px-2 text-xs"
                onClick={() => setVerifyId(row.original.id)}
              >
                Verify Manual
              </Button>
            );
          }
          return null;
        },
      },
    ],
    [],
  );

  const list = query.data?.data;

  return (
    <div className="space-y-4">
      <FilterBar
        fields={[
          {
            key: 'status',
            label: 'Status',
            type: 'select',
            value: filters.status,
            options: STATUS_OPTIONS,
          },
          { key: 'providerId', label: 'Provider ID', type: 'text', value: filters.providerId },
          { key: 'fromDate', label: 'From Date', type: 'date', value: filters.fromDate },
          { key: 'toDate', label: 'To Date', type: 'date', value: filters.toDate },
        ]}
        onChange={(key, value) => updateFilter(key as 'status' | 'providerId' | 'fromDate' | 'toDate', value)}
      />
      <DataTable
        columns={columns}
        data={list?.data ?? []}
        isLoading={query.isLoading}
        pagination={{
          page: list?.page ?? pagination.page,
          pageSize: list?.pageSize ?? pagination.pageSize,
          total: list?.total ?? 0,
          onPageChange: setPage,
        }}
      />
      <ConfirmDialog
        title="Verify Manual Payment"
        description="Are you sure you want to manually verify this payment? This will activate the service subscription for the provider."
        isLoading={verifyMutation.isPending}
        open={Boolean(verifyId)}
        onConfirm={async () => {
          if (verifyId) {
            await verifyMutation.mutateAsync(verifyId);
            setVerifyId(null);
          }
        }}
        onCancel={() => setVerifyId(null)}
      />
    </div>
  );
};


// ─── Main Page ───────────────────────────────────────────────────────────────

export const PaymentsPage = () => {
  const [activeTab, setActiveTab] = useState<TabId>('customer');

  return (
    <div>
      <PageHeader
        breadcrumb={[{ label: 'Home' }, { label: 'Payments' }]}
        title="Payments"
      />

      {/* Tab bar */}
      <div className="mb-6 flex gap-1 rounded-xl border border-muted bg-white p-1 w-fit shadow-sm">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            id={`payments-tab-${id}`}
            type="button"
            onClick={() => setActiveTab(id)}
            className={[
              'flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all',
              activeTab === id
                ? 'bg-brand text-white shadow'
                : 'text-brand-light hover:bg-muted hover:text-brand',
            ].join(' ')}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'customer' && <CustomerPaymentsTab />}
      {activeTab === 'provider' && <ProviderPaymentsTab />}
    </div>
  );
};

PaymentsPage.displayName = 'PaymentsPage';



