import { useEffect, useMemo, useState } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { useForm } from 'react-hook-form';
import { DataTable } from '@/shared/components/DataTable';
import { ConfirmDialog } from '@/shared/components/ConfirmDialog';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { PageHeader } from '@/shared/components/PageHeader';
import { useDebounce } from '@/shared/hooks/useDebounce';
import { usePagination } from '@/shared/hooks/usePagination';
import { useAddCustomerMutation, useCustomersQuery, useDeleteCustomerMutation, useSetCustomerActiveMutation } from '@/modules/customers/hooks/useCustomersQuery';
import type { CustomerFormValues, CustomerRecord } from '@/modules/customers/types/customers';

export const CustomersPage = () => {
  const { pagination, setPage, setPageSize } = usePagination();
  const [search, setSearch] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerRecord | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const debouncedSearch = useDebounce(search);
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, setPage]);

  const query = useCustomersQuery({
    page: pagination.page,
    pageSize: pagination.pageSize,
    search: debouncedSearch || undefined,
  });
  const addMutation = useAddCustomerMutation();
  const deleteMutation = useDeleteCustomerMutation();
  const activeMutation = useSetCustomerActiveMutation();
  const form = useForm<CustomerFormValues>({
    defaultValues: {
      fullName: '',
      email: '',
      mobileNo: '',
    },
  });

  const columns = useMemo<ColumnDef<CustomerRecord>[]>(
    () => [
      { accessorKey: 'fullName', header: 'Name' },
      { accessorKey: 'email', header: 'Email' },
      { accessorKey: 'mobileNo', header: 'Mobile' },
      { accessorKey: 'isActive', header: 'Status', cell: ({ row }) => (row.original.isActive ? 'Active' : 'Inactive') },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => activeMutation.mutate({ customerId: row.original.id, isActive: !row.original.isActive })}>
              {row.original.isActive ? 'Deactivate' : 'Activate'}
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setSelectedCustomer(row.original)}>
              View
            </Button>
            <Button size="sm" variant="destructive" onClick={() => setDeleteId(row.original.id)}>
              Delete
            </Button>
          </div>
        ),
      },
    ],
    [activeMutation],
  );

  const list = query.data?.data;

  return (
    <div>
      <PageHeader
        breadcrumb={[{ label: 'Home' }, { label: 'Customers' }]}
        title="Customers"
        actions={
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>Add Customer</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Customer</DialogTitle>
                <DialogDescription>Create a customer profile for the platform.</DialogDescription>
              </DialogHeader>
              <form
                className="space-y-4"
                onSubmit={form.handleSubmit(async (values) => {
                  await addMutation.mutateAsync(values);
                  setIsDialogOpen(false);
                })}
              >
                <Input placeholder="Full name" {...form.register('fullName')} />
                <Input placeholder="Email" {...form.register('email')} />
                <Input placeholder="Mobile number" {...form.register('mobileNo')} />
                <Button className="w-full" disabled={addMutation.isPending} type="submit">
                  Save Customer
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        }
      />
      <div className="card-surface mb-6 p-4">
        <Input placeholder="Search customers..." value={search} onChange={(event) => setSearch(event.target.value)} />
      </div>
      <DataTable
        columns={columns}
        data={list?.data ?? []}
        isLoading={query.isLoading}
        pagination={{
          page: list?.page ?? pagination.page,
          pageSize: list?.pageSize ?? pagination.pageSize,
          total: list?.total ?? 0,
          onPageChange: setPage,
          onPageSizeChange: setPageSize,
        }}
      />
      <ConfirmDialog
        description="This action permanently removes the customer."
        isLoading={deleteMutation.isPending}
        onCancel={() => setDeleteId(null)}
        onConfirm={async () => {
          if (!deleteId) return;
          await deleteMutation.mutateAsync(deleteId);
          setDeleteId(null);
        }}
        open={Boolean(deleteId)}
        title="Delete Customer"
      />
      <Dialog open={Boolean(selectedCustomer)} onOpenChange={(open) => !open && setSelectedCustomer(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Customer Details</DialogTitle>
            <DialogDescription>Customer profile information.</DialogDescription>
          </DialogHeader>
          {selectedCustomer ? (
            <div className="space-y-3 text-sm">
              <p>Name: {selectedCustomer.fullName || '--'}</p>
              <p>Email: {selectedCustomer.email || '--'}</p>
              <p>Mobile: {selectedCustomer.mobileNo || '--'}</p>
              <p>WhatsApp: {selectedCustomer.whatsapp || '--'}</p>
              <p>Country: {selectedCustomer.country || '--'}</p>
              <p>Address: {selectedCustomer.address || '--'}</p>
              <p>Status: {selectedCustomer.isActive ? 'Active' : 'Inactive'}</p>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
};

CustomersPage.displayName = 'CustomersPage';
