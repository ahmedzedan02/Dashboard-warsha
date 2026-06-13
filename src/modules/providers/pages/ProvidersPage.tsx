import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/shared/components/DataTable';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { PageHeader } from '@/shared/components/PageHeader';
import { Badge } from '@/shared/components/ui/badge';
import { useDebounce } from '@/shared/hooks/useDebounce';
import { usePagination } from '@/shared/hooks/usePagination';
import { ProviderDocumentsDialog } from '@/modules/providers/components/ProviderDocumentsDialog';
import {
  useAddProviderMutation,
  useProviderDetailsQuery,
  useProvidersQuery,
  useSetProviderActiveMutation,
  useSetProviderPaperMutation,
} from '@/modules/providers/hooks/useProvidersQuery';
import { providerFormSchema, type ProviderFormSchema } from '@/modules/providers/utils/providerSchemas';
import type { ProviderRecord } from '@/modules/providers/types/providers';

export const ProvidersPage = () => {
  const { pagination, setPage, setPageSize } = usePagination();
  const [search, setSearch] = useState('');
  const [selectedProviderId, setSelectedProviderId] = useState<string | null>(null);
  const [selectedProviderDocuments, setSelectedProviderDocuments] = useState<{ id: string; name: string } | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const debouncedSearch = useDebounce(search);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, setPage]);

  const query = useProvidersQuery({
    page: pagination.page,
    pageSize: pagination.pageSize,
    search: debouncedSearch || undefined,
  });
  const providerDetailsQuery = useProviderDetailsQuery(selectedProviderId ?? undefined);
  const addMutation = useAddProviderMutation();
  const activeMutation = useSetProviderActiveMutation();
  const paperMutation = useSetProviderPaperMutation();
  const form = useForm<ProviderFormSchema>({
    resolver: zodResolver(providerFormSchema),
    defaultValues: {
      provider_name: '',
      email: '',
      password: '',
      whatsapp: '',
      mobileno: '',
      region_id: '',
    },
  });

  const columns = useMemo<ColumnDef<ProviderRecord>[]>(
    () => [
      { accessorKey: 'providerName', header: 'Provider' },
      { accessorKey: 'email', header: 'Email' },
      { accessorKey: 'whatsapp', header: 'WhatsApp' },
      { accessorKey: 'mobileNo', header: 'Mobile' },
      { accessorKey: 'countryName', header: 'Country' },
      { accessorKey: 'regionId', header: 'Region' },
      {
        accessorKey: 'isActive',
        header: 'Status',
        cell: ({ row }) => (
          <Badge variant={row.original.isActive ? 'success' : 'danger'}>
            {row.original.isActive ? 'Active' : 'Inactive'}
          </Badge>
        ),
      },
      {
        accessorKey: 'isPaperOk',
        header: 'Paper Status',
        cell: ({ row }) => (
          <Badge variant={row.original.isPaperOk ? 'success' : 'warning'}>
            {row.original.isPaperOk ? 'OK' : 'Pending'}
          </Badge>
        ),
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => activeMutation.mutate({ providerId: row.original.id, isActive: !row.original.isActive })}>
              {row.original.isActive ? 'Deactivate' : 'Activate'}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => paperMutation.mutate({ providerId: row.original.id, isPaperOk: !row.original.isPaperOk })}
            >
              {row.original.isPaperOk ? 'Set Pending' : 'Approve Papers'}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setSelectedProviderDocuments({ id: row.original.id, name: row.original.providerName })}
            >
              View Papers
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setSelectedProviderId(row.original.id)}>
              View Details
            </Button>
          </div>
        ),
      },
    ],
    [activeMutation, paperMutation],
  );

  const list = query.data?.data;
  const details = providerDetailsQuery.data?.data;

  return (
    <div>
      <PageHeader
        breadcrumb={[{ label: 'Home' }, { label: 'Providers' }]}
        title="Providers"
        actions={
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>Add Provider</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add Provider</DialogTitle>
                <DialogDescription>Create a provider account and upload company files.</DialogDescription>
              </DialogHeader>
              <form
                className="grid gap-4 md:grid-cols-2"
                onSubmit={form.handleSubmit(async (values) => {
                  await addMutation.mutateAsync(values);
                  setIsDialogOpen(false);
                })}
              >
                <Input placeholder="Provider name" {...form.register('provider_name')} />
                <Input placeholder="Email" {...form.register('email')} />
                <Input placeholder="Password" type="password" {...form.register('password')} />
                <Input placeholder="WhatsApp" {...form.register('whatsapp')} />
                <Input placeholder="Mobile" {...form.register('mobileno')} />
                <Input placeholder="Region ID" {...form.register('region_id')} />
                <Input type="file" {...form.register('fcomplogo')} />
                <Input multiple type="file" {...form.register('fcompAttachments')} />
                <Button className="md:col-span-2" disabled={addMutation.isPending} type="submit">
                  Save Provider
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        }
      />
      <div className="card-surface mb-6 p-4">
        <Input placeholder="Search providers..." value={search} onChange={(event) => setSearch(event.target.value)} />
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
      <ProviderDocumentsDialog
        open={Boolean(selectedProviderDocuments)}
        providerId={selectedProviderDocuments?.id ?? null}
        providerName={selectedProviderDocuments?.name}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedProviderDocuments(null);
          }
        }}
      />
      <Dialog open={Boolean(selectedProviderId)} onOpenChange={(open) => !open && setSelectedProviderId(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Provider Details</DialogTitle>
            <DialogDescription>Subscriptions, ratings, and uploaded documents.</DialogDescription>
          </DialogHeader>
          {details ? (
            <div className="space-y-4 text-sm">
              <div>
                {details.logoUrl ? <img alt={details.providerName} className="mb-3 h-16 w-16 rounded-xl object-cover" src={details.logoUrl} /> : null}
                <p className="font-medium">{details.providerName}</p>
                <p className="text-brand-light">{details.email}</p>
                <p>WhatsApp: {details.whatsapp || '--'}</p>
                <p>Mobile: {details.mobileNo || '--'}</p>
                <p>Country: {details.countryName || '--'}</p>
                <p>Region: {details.regionId || '--'}</p>
                <p>Status: {details.isActive ? 'Active' : 'Inactive'}</p>
                <p>Paper Status: {details.isPaperOk ? 'OK' : 'Pending'}</p>
              </div>
              <div>
                <h4 className="mb-2 font-medium">Subscriptions</h4>
                <div className="space-y-2">
                  {details.subscriptions.length ? (
                    details.subscriptions.map((subscription) => (
                      <div className="rounded-xl bg-brand-lighter p-3" key={subscription.id}>
                        {subscription.serviceName} | {subscription.status}
                      </div>
                    ))
                  ) : (
                    <p className="text-brand-light">No subscriptions available.</p>
                  )}
                </div>
              </div>
              <div>
                <h4 className="mb-2 font-medium">Ratings</h4>
                <div className="space-y-2">
                  {details.ratings.length ? (
                    details.ratings.map((rating) => (
                      <div className="rounded-xl bg-brand-lighter p-3" key={rating.id}>
                        {rating.score}/5 {rating.comment ? `| ${rating.comment}` : ''}
                      </div>
                    ))
                  ) : (
                    <p className="text-brand-light">No ratings available.</p>
                  )}
                </div>
              </div>
              <div>
                <h4 className="mb-2 font-medium">Documents</h4>
                <div className="space-y-2">
                  {details.documents.length ? (
                    details.documents.map((document) => (
                      <a className="block rounded-xl bg-brand-lighter p-3 underline" href={document.url} key={document.id} rel="noreferrer" target="_blank">
                        {document.fileName || 'Open document'}
                      </a>
                    ))
                  ) : (
                    <p className="text-brand-light">No documents available.</p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-brand-light">Loading details...</p>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

ProvidersPage.displayName = 'ProvidersPage';
