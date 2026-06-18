import { useMemo, useState } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Users, Wrench, ListOrdered } from 'lucide-react';
import { DataTable } from '@/shared/components/DataTable';
import { FilterBar } from '@/shared/components/FilterBar';
import { PageHeader } from '@/shared/components/PageHeader';
import { StatusBadge } from '@/shared/components/StatusBadge';
import { Button } from '@/shared/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/shared/components/ui/dialog';
import { Input } from '@/shared/components/ui/input';
import { usePagination } from '@/shared/hooks/usePagination';
import { useTableFilters } from '@/shared/hooks/useTableFilters';
import { formatCurrency, formatDate } from '@/shared/utils/format';
import {
  useConfirmPaymentMutation,
  useCustomerPaymentsQuery,
  usePaymentsQuery,
  useProviderPaymentsQuery,
  useVerifyPaymentMutation,
} from '@/modules/payments/hooks/usePaymentsQuery';
import type {
  CustomerPaymentRecord,
  PaymentRecord,
  ProviderPaymentRecord,
} from '@/modules/payments/types/payments';
import { Badge } from '@/shared/components/ui/badge';
import { ConfirmDialog } from '@/shared/components/ConfirmDialog';

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

const confirmSchema = z.object({
  requestRef: z.string().min(1),
  transactionId: z.string().min(1),
  isManual: z.boolean(),
});

type TabId = 'customer' | 'provider' | 'subscriptions';

const TABS: { id: TabId; label: string; icon: typeof Users }[] = [
  { id: 'customer', label: 'Customer Payments', icon: Users },
  { id: 'provider', label: 'Provider Payments', icon: Wrench },
  { id: 'subscriptions', label: 'Subscription Payments', icon: ListOrdered },
];

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
      { accessorKey: 'userName', header: 'Customer Name' },
      { accessorKey: 'userId', header: 'User ID' },
      { accessorKey: 'transactionRef', header: 'Transaction Ref' },
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

  const columns = useMemo<ColumnDef<ProviderPaymentRecord>[]>(
    () => [
      { accessorKey: 'providerName', header: 'Provider Name' },
      { accessorKey: 'providerId', header: 'Provider ID' },
      { accessorKey: 'transactionRef', header: 'Transaction Ref' },
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
    </div>
  );
};

// ─── Subscription Payments Tab (original) ────────────────────────────────────

const SubscriptionPaymentsTab = () => {
  const { pagination, setPage } = usePagination();
  const { filters, updateFilter } = useTableFilters({ status: '', providerId: '', fromDate: '', toDate: '' });
  const verifyMutation = useVerifyPaymentMutation();
  const confirmMutation = useConfirmPaymentMutation();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [verifyId, setVerifyId] = useState<string | null>(null);
  const form = useForm<z.infer<typeof confirmSchema>>({
    resolver: zodResolver(confirmSchema),
    defaultValues: { requestRef: '', transactionId: '', isManual: true },
  });

  const query = usePaymentsQuery({
    page: pagination.page,
    pageSize: pagination.pageSize,
    providerId: filters.providerId || undefined,
    status: filters.status || undefined,
    fromDate: filters.fromDate || undefined,
    toDate: filters.toDate || undefined,
  });

  const columns = useMemo<ColumnDef<PaymentRecord>[]>(
    () => [
      { accessorKey: 'providerName', header: 'Provider' },
      {
        accessorKey: 'requestRef',
        header: 'Request Ref',
        cell: ({ row }) => (
          <div className="flex flex-col gap-1 items-start">
            <span>{row.original.requestRef}</span>
            <div className="flex gap-1">
              {row.original.isServicePayment && (
                <Badge variant="default" className="text-[10px] py-0.5">
                  Service
                </Badge>
              )}
              {row.original.isEmergencyPayment && (
                <Badge variant="warning" className="text-[10px] py-0.5">
                  Emergency
                </Badge>
              )}
            </div>
          </div>
        ),
      },
      { accessorKey: 'transactionRef', header: 'Transaction Ref' },
      {
        accessorKey: 'amount',
        header: 'Amount',
        cell: ({ row }) => formatCurrency(row.original.amount, row.original.currency),
      },
      { accessorKey: 'months', header: 'Months' },
      { accessorKey: 'status', header: 'Status', cell: ({ row }) => <StatusBadge status={row.original.status} /> },
      { accessorKey: 'createdAt', header: 'Created', cell: ({ row }) => formatDate(row.original.createdAt, 'dd MMM yyyy p') },
      { accessorKey: 'paidDate', header: 'Paid Date', cell: ({ row }) => formatDate(row.original.paidDate, 'dd MMM yyyy p') },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => {
          const showVerify = row.original.status === 'Pending' && row.original.canPay === true && !row.original.isEmergencyPayment;
          return showVerify ? (
            <Button size="sm" onClick={() => setVerifyId(row.original.id)} disabled={verifyMutation.isPending}>
              Verify
            </Button>
          ) : null;
        },
      },
    ],
    [verifyMutation],
  );

  const list = query.data?.data;

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>Confirm Payment</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Manual Payment</DialogTitle>
              <DialogDescription>Submit transaction details for a manual confirmation.</DialogDescription>
            </DialogHeader>
            <form
              className="space-y-4"
              onSubmit={form.handleSubmit(async (values) => {
                await confirmMutation.mutateAsync(values);
                setIsDialogOpen(false);
              })}
            >
              <Input placeholder="Request reference" {...form.register('requestRef')} />
              <Input placeholder="Transaction ID" {...form.register('transactionId')} />
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" {...form.register('isManual')} />
                Manual payment
              </label>
              <Button className="w-full" disabled={confirmMutation.isPending} type="submit">
                Submit
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

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
        description="Are you sure you want to manually verify this payment?"
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
      {activeTab === 'subscriptions' && <SubscriptionPaymentsTab />}
    </div>
  );
};

PaymentsPage.displayName = 'PaymentsPage';



