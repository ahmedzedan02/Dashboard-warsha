import { useMemo, useState } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { useForm } from 'react-hook-form';
import { DataTable } from '@/shared/components/DataTable';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { PageHeader } from '@/shared/components/PageHeader';
import { usePagination } from '@/shared/hooks/usePagination';
import { useAddServiceMutation, useServicesQuery, useSetEmergencyMutation } from '@/modules/services/hooks/useServicesQuery';
import type { ServiceFormValues, ServiceRecord } from '@/modules/services/types/services';
import { formatCurrency } from '@/shared/utils/format';
import { useCategoriesQuery } from '@/modules/categories/hooks/useCategoriesQuery';

export const ServicesPage = () => {
  const { pagination, setPage } = usePagination();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const query = useServicesQuery({ page: pagination.page, pageSize: pagination.pageSize });
  const categoriesQuery = useCategoriesQuery();
  const addMutation = useAddServiceMutation();
  const emergencyMutation = useSetEmergencyMutation();
  const form = useForm<ServiceFormValues>({
    defaultValues: {
      titleEn: '',
      titleAr: '',
      categoryId: '',
      startingPrice: '',
      currency: 'QAR',
    },
  });

  const columns = useMemo<ColumnDef<ServiceRecord>[]>(
    () => [
      {
        accessorKey: 'iconUrl',
        header: 'Icon',
        cell: ({ row }) =>
          row.original.iconUrl ? <img alt={row.original.name} className="h-10 w-10 rounded-xl object-cover" src={row.original.iconUrl} /> : null,
      },
      { accessorKey: 'name', header: 'Service' },
      { accessorKey: 'countryPrice', header: 'Price', cell: ({ row }) => formatCurrency(row.original.countryPrice) },
      { accessorKey: 'isEmergency', header: 'Emergency', cell: ({ row }) => (row.original.isEmergency ? 'Enabled' : 'Disabled') },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <Button size="sm" onClick={() => emergencyMutation.mutate({ serviceId: row.original.id, isEmergency: !row.original.isEmergency })}>
            Toggle Emergency
          </Button>
        ),
      },
    ],
    [emergencyMutation],
  );

  const list = query.data?.data;

  return (
    <div>
      <PageHeader
        breadcrumb={[{ label: 'Home' }, { label: 'Services' }]}
        title="Services"
        actions={
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>Add Service</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Service</DialogTitle>
                <DialogDescription>Create a provider service type.</DialogDescription>
              </DialogHeader>
              <form
                className="space-y-4"
                onSubmit={form.handleSubmit(async (values) => {
                  await addMutation.mutateAsync(values);
                  setIsDialogOpen(false);
                })}
              >
                <Input placeholder="Title EN" {...form.register('titleEn')} />
                <Input placeholder="Title AR" {...form.register('titleAr')} />
                <select className="w-full rounded-xl border border-muted bg-background px-3 py-2" {...form.register('categoryId')}>
                  <option value="">Select category</option>
                  {(categoriesQuery.data?.data ?? []).map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.nameEn}
                    </option>
                  ))}
                </select>
                <Input placeholder="Starting price" {...form.register('startingPrice')} />
                <Input placeholder="Currency" {...form.register('currency')} />
                <Input multiple type="file" {...form.register('images')} />
                <Button className="w-full" disabled={addMutation.isPending} type="submit">
                  Save Service
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        }
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

ServicesPage.displayName = 'ServicesPage';
