import { useMemo } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/shared/components/DataTable';
import { FilterBar } from '@/shared/components/FilterBar';
import { PageHeader } from '@/shared/components/PageHeader';
import { StatusBadge } from '@/shared/components/StatusBadge';
import { usePagination } from '@/shared/hooks/usePagination';
import { useTableFilters } from '@/shared/hooks/useTableFilters';
import { useSubscriptionsQuery } from '@/modules/subscriptions/hooks/useSubscriptionsQuery';
import type { SubscriptionRecord } from '@/modules/subscriptions/types/subscriptions';
import { formatDate } from '@/shared/utils/format';

export const SubscriptionsPage = () => {
  const { pagination, setPage } = usePagination();
  const { filters, updateFilter } = useTableFilters({
    status: '',
    providerId: '',
  });

  const query = useSubscriptionsQuery({
    page: pagination.page,
    pageSize: pagination.pageSize,
    providerId: filters.providerId || undefined,
    status: filters.status || undefined,
  });

  const columns = useMemo<ColumnDef<SubscriptionRecord>[]>(
    () => [
      { accessorKey: 'providerName', header: 'Provider Name' },
      { accessorKey: 'phone', header: 'Phone' },
      { accessorKey: 'service', header: 'Service' },
      { accessorKey: 'paidMonths', header: 'Paid Months' },
      { accessorKey: 'startDate', header: 'Start Date', cell: ({ row }) => formatDate(row.original.startDate) },
      { accessorKey: 'endDate', header: 'End Date', cell: ({ row }) => formatDate(row.original.endDate) },
      { accessorKey: 'status', header: 'Status', cell: ({ row }) => <StatusBadge status={row.original.status} /> },
      { accessorKey: 'createdAt', header: 'Created At', cell: ({ row }) => formatDate(row.original.createdAt, 'dd MMM yyyy p') },
    ],
    [],
  );

  const list = query.data?.data;

  return (
    <div>
      <PageHeader breadcrumb={[{ label: 'Home' }, { label: 'Subscriptions' }]} title="Subscriptions" />
      <FilterBar
        fields={[
          {
            key: 'status',
            label: 'Status',
            type: 'select',
            value: filters.status,
            options: [
              { label: 'All', value: '' },
              { label: 'Not Subscribed', value: 'NotSubscribed' },
              { label: 'Subscribed', value: 'Subscribed' },
            ],
          },
          { key: 'providerId', label: 'Provider ID', type: 'text', value: filters.providerId, placeholder: 'Search provider...' },
        ]}
        onChange={(key, value) => updateFilter(key as 'status' | 'providerId', value)}
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

SubscriptionsPage.displayName = 'SubscriptionsPage';
