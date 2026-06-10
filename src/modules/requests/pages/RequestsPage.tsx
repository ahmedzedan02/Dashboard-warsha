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
import { useRequestDetailsQuery, useRequestsQuery } from '@/modules/requests/hooks/useRequestsQuery';
import type { RequestRecord } from '@/modules/requests/types/requests';

export const RequestsPage = () => {
  const { pagination, setPage } = usePagination();
  const { filters, updateFilter } = useTableFilters({ status: '', serviceTypeId: '', fromDate: '', toDate: '' });
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const query = useRequestsQuery({
    page: pagination.page,
    pageSize: pagination.pageSize,
    status: filters.status || undefined,
    serviceTypeId: filters.serviceTypeId || undefined,
    fromDate: filters.fromDate || undefined,
    toDate: filters.toDate || undefined,
  });
  const detailQuery = useRequestDetailsQuery(selectedRequestId ?? undefined);

  const columns = useMemo<ColumnDef<RequestRecord>[]>(
    () => [
      { accessorKey: 'orderNumber', header: 'Order #' },
      { accessorKey: 'userName', header: 'User' },
      { accessorKey: 'service', header: 'Service' },
      { accessorKey: 'budget', header: 'Budget', cell: ({ row }) => formatCurrency(row.original.budget) },
      { accessorKey: 'address', header: 'Address' },
      { accessorKey: 'offers', header: 'Offers' },
      { accessorKey: 'status', header: 'Status', cell: ({ row }) => <StatusBadge status={row.original.status} /> },
      { accessorKey: 'createdAt', header: 'Date', cell: ({ row }) => formatDate(row.original.createdAt, 'dd MMM yyyy p') },
    ],
    [],
  );

  const list = query.data?.data;
  const detail = detailQuery.data?.data;

  return (
    <div>
      <PageHeader breadcrumb={[{ label: 'Home' }, { label: 'Requests' }]} title="Requests" />
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
          { key: 'serviceTypeId', label: 'Service Type', type: 'text', value: filters.serviceTypeId },
          { key: 'fromDate', label: 'From Date', type: 'date', value: filters.fromDate },
          { key: 'toDate', label: 'To Date', type: 'date', value: filters.toDate },
        ]}
        onChange={(key, value) => updateFilter(key as 'status' | 'serviceTypeId' | 'fromDate' | 'toDate', value)}
      />
      <DataTable
        columns={columns}
        data={list?.data ?? []}
        isLoading={query.isLoading}
        onRowClick={(row) => setSelectedRequestId(row.id)}
        pagination={{
          page: list?.page ?? pagination.page,
          pageSize: list?.pageSize ?? pagination.pageSize,
          total: list?.total ?? 0,
          onPageChange: setPage,
        }}
      />
      <Dialog open={Boolean(selectedRequestId)} onOpenChange={(open) => !open && setSelectedRequestId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Details</DialogTitle>
            <DialogDescription>Customer request information and scheduling detail.</DialogDescription>
          </DialogHeader>
          {detail ? (
            <div className="space-y-3 text-sm">
              <p>User: {detail.userName}</p>
              <p>Email: {detail.email}</p>
              <p>Phone: {detail.phone}</p>
              <p>Service: {detail.service}</p>
              <p>Address: {detail.address}</p>
              <p>Expected Start: {formatDate(detail.expectedStartDate)}</p>
            </div>
          ) : (
            <p className="text-sm text-brand-light">Loading details...</p>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

RequestsPage.displayName = 'RequestsPage';
