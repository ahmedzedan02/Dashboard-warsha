import { useMemo, useState } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
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
import { useConfirmPaymentMutation, usePaymentsQuery, useVerifyPaymentMutation } from '@/modules/payments/hooks/usePaymentsQuery';
import type { PaymentRecord } from '@/modules/payments/types/payments';

const confirmSchema = z.object({
  requestRef: z.string().min(1),
  transactionId: z.string().min(1),
  isManual: z.boolean(),
});

export const PaymentsPage = () => {
  const { pagination, setPage } = usePagination();
  const { filters, updateFilter } = useTableFilters({ status: '', providerId: '', fromDate: '', toDate: '' });
  const verifyMutation = useVerifyPaymentMutation();
  const confirmMutation = useConfirmPaymentMutation();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
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
      { accessorKey: 'requestRef', header: 'Request Ref' },
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
        cell: ({ row }) =>
          row.original.status === 'Pending' ? (
            <Button size="sm" onClick={() => verifyMutation.mutate(row.original.id)}>
              Verify
            </Button>
          ) : null,
      },
    ],
    [verifyMutation],
  );

  const list = query.data?.data;

  return (
    <div>
      <PageHeader
        breadcrumb={[{ label: 'Home' }, { label: 'Payments' }]}
        title="Payments"
        actions={
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
        }
      />
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
              { label: 'Paid', value: 'Paid' },
              { label: 'Failed', value: 'Failed' },
              { label: 'Cancelled', value: 'Cancelled' },
              { label: 'Expired', value: 'Expired' },
              { label: 'Refunded', value: 'Refunded' },
            ],
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

PaymentsPage.displayName = 'PaymentsPage';
