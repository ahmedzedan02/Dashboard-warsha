import { useMemo, useState } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/shared/components/DataTable';
import { FilterBar } from '@/shared/components/FilterBar';
import { PageHeader } from '@/shared/components/PageHeader';
import { StatusBadge } from '@/shared/components/StatusBadge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/shared/components/ui/dialog';
import { usePagination } from '@/shared/hooks/usePagination';
import { useTableFilters } from '@/shared/hooks/useTableFilters';
import { formatCurrency, formatDate } from '@/shared/utils/format';
import { useOrderDetailsQuery, useOrdersQuery } from '@/modules/orders/hooks/useOrdersQuery';
import type { OrderRecord } from '@/modules/orders/types/orders';

export const OrdersPage = () => {
  const { pagination, setPage } = usePagination();
  const { filters, updateFilter } = useTableFilters({ status: '', providerId: '', userId: '', fromDate: '', toDate: '' });
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const query = useOrdersQuery({
    page: pagination.page,
    pageSize: pagination.pageSize,
    providerId: filters.providerId || undefined,
    userId: filters.userId || undefined,
    status: filters.status || undefined,
    fromDate: filters.fromDate || undefined,
    toDate: filters.toDate || undefined,
  });
  const detailQuery = useOrderDetailsQuery(selectedOrderId ?? undefined);

  const columns = useMemo<ColumnDef<OrderRecord>[]>(
    () => [
      { accessorKey: 'orderNumber', header: 'Order #' },
      { accessorKey: 'providerName', header: 'Provider' },
      { accessorKey: 'customerName', header: 'Customer' },
      { accessorKey: 'status', header: 'Status', cell: ({ row }) => <StatusBadge status={row.original.status} /> },
      { accessorKey: 'amount', header: 'Amount', cell: ({ row }) => formatCurrency(row.original.amount) },
      { accessorKey: 'createdAt', header: 'Created', cell: ({ row }) => formatDate(row.original.createdAt, 'dd MMM yyyy p') },
    ],
    [],
  );

  const list = query.data?.data;
  const detail = detailQuery.data?.data;

  return (
    <div>
      <PageHeader breadcrumb={[{ label: 'Home' }, { label: 'Orders' }]} title="Orders" />
      <FilterBar
        fields={[
          {
            key: 'status',
            label: 'Status',
            type: 'select',
            value: filters.status,
            options: [
              { label: 'All', value: '' },
              { label: 'Pending', value: 'Pending' },
              { label: 'Confirmed', value: 'Confirmed' },
              { label: 'InProgress', value: 'InProgress' },
              { label: 'Completed', value: 'Completed' },
              { label: 'Cancelled', value: 'Cancelled' },
            ],
          },
          { key: 'providerId', label: 'Provider ID', type: 'text', value: filters.providerId },
          { key: 'userId', label: 'User ID', type: 'text', value: filters.userId },
          { key: 'fromDate', label: 'From Date', type: 'date', value: filters.fromDate },
          { key: 'toDate', label: 'To Date', type: 'date', value: filters.toDate },
        ]}
        onChange={(key, value) => updateFilter(key as 'status' | 'providerId' | 'userId' | 'fromDate' | 'toDate', value)}
      />
      <DataTable
        columns={columns}
        data={list?.data ?? []}
        isLoading={query.isLoading}
        onRowClick={(row) => setSelectedOrderId(row.id)}
        pagination={{
          page: list?.page ?? pagination.page,
          pageSize: list?.pageSize ?? pagination.pageSize,
          total: list?.total ?? 0,
          onPageChange: setPage,
        }}
      />
      <Dialog open={Boolean(selectedOrderId)} onOpenChange={(open) => !open && setSelectedOrderId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
            <DialogDescription>Operational snapshot for the selected order.</DialogDescription>
          </DialogHeader>
          {detail ? (
            <div className="space-y-3 text-sm">
              <p>Order #: {detail.orderNumber}</p>
              <p>Provider: {detail.providerName}</p>
              <p>Customer: {detail.customerName}</p>
              <p>Status: {detail.status}</p>
              <p>Address: {detail.address}</p>
              {detail.latitude && detail.longitude ? (
                <a className="text-brand underline" href={`https://maps.google.com/?q=${detail.latitude},${detail.longitude}`} rel="noreferrer" target="_blank">
                  Open location
                </a>
              ) : null}
              {detail.cancelReason ? <p>Cancel Reason: {detail.cancelReason}</p> : null}
            </div>
          ) : (
            <p className="text-sm text-brand-light">Loading details...</p>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

OrdersPage.displayName = 'OrdersPage';
