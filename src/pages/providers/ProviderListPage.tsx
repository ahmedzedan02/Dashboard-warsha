import { useMemo, useState } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { PageHeader } from '@/shared/components/PageHeader';
import { DataTable } from '@/components/shared/DataTable';
import { PaginationControls } from '@/components/shared/PaginationControls';
import { SearchBar } from '@/components/shared/SearchBar';
import { ConfirmDialog } from '@/shared/components/ConfirmDialog';
import { usePaginatedQuery } from '@/hooks/usePaginatedQuery';
import { ProviderDocumentsDialog } from '@/modules/providers/components/ProviderDocumentsDialog';
import { providerPaginationStore } from '@/store/paginationStore';
import { toAbsoluteAssetUrl } from '@/shared/utils/asset';
import { useSetProviderActiveMutation, useSetProviderPaperMutation } from '@/modules/providers/hooks/useProvidersQuery';
import { queryClient } from '@/shared/lib/queryClient';

interface Provider {
  id: number;
  provider_name: string;
  email: string;
  mobileno: string;
  whatsapp: string;
  country_id: number | null;
  city_id: number | null;
  region_id: number | null;
  logoURL: string;
  active: boolean;
  paperok: boolean;
  otp_verification_done: boolean;
  contract_status: number;
  country: {
    id: number;
    country_name_en: string;
    country_name_ar: string;
    mobile_country_code: string;
    currency_iso_code: string;
  } | null;
}

const endpoint = '/api/AdminApp/Provider/SearchData';

export const ProviderListPage = () => {
  const [selectedProvider, setSelectedProvider] = useState<{ id: string; name: string } | null>(null);
  const page = providerPaginationStore((state) => state.page);
  const limit = providerPaginationStore((state) => state.limit);
  const search = providerPaginationStore((state) => state.search);
  const fieldname = providerPaginationStore((state) => state.fieldname);
  const fieldvalue = providerPaginationStore((state) => state.fieldvalue);
  const orderby = providerPaginationStore((state) => state.orderby);
  const ordertype = providerPaginationStore((state) => state.ordertype);
  const setPage = providerPaginationStore((state) => state.setPage);
  const setLimit = providerPaginationStore((state) => state.setLimit);
  const setSearch = providerPaginationStore((state) => state.setSearch);

  const activeMutation = useSetProviderActiveMutation();
  const paperMutation = useSetProviderPaperMutation();

  const [confirmAction, setConfirmAction] = useState<{
    type: 'active' | 'paper';
    id: string;
    value: boolean;
    title: string;
    description: string;
  } | null>(null);

  const query = usePaginatedQuery<Provider>(endpoint, {
    page,
    limit,
    search,
    fieldname,
    fieldvalue,
    orderby,
    ordertype,
  });

  const columns = useMemo<ColumnDef<Provider>[]>(
    () => [
      {
        accessorKey: 'provider_name',
        header: 'Name',
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            {row.original.logoURL ? (
              <img
                alt={row.original.provider_name}
                className="h-8 w-8 rounded-full object-cover"
                src={toAbsoluteAssetUrl(row.original.logoURL)}
              />
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand text-xs text-white">
                {row.original.provider_name.slice(0, 2).toUpperCase()}
              </div>
            )}
            <span>{row.original.provider_name}</span>
          </div>
        ),
      },
      { accessorKey: 'email', header: 'Email' },
      { accessorKey: 'mobileno', header: 'Mobile' },
      {
        id: 'country',
        header: 'Country',
        cell: ({ row }) => row.original.country?.country_name_en ?? '—',
      },
      {
        accessorKey: 'active',
        header: 'Active',
        cell: ({ row }) => <Badge variant={row.original.active ? 'success' : 'danger'}>{row.original.active ? 'Active' : 'Inactive'}</Badge>,
      },
      {
        accessorKey: 'paperok',
        header: 'Paper',
        cell: ({ row }) => (
          <div className="space-y-2">
            <Badge variant={row.original.paperok ? 'info' : 'warning'}>{row.original.paperok ? 'Verified' : 'Pending'}</Badge>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setSelectedProvider({ id: String(row.original.id), name: row.original.provider_name })}
            >
              View Papers
            </Button>
          </div>
        ),
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={row.original.active ? 'outline' : 'default'}
              onClick={() => {
                setConfirmAction({
                  type: 'active',
                  id: String(row.original.id),
                  value: !row.original.active,
                  title: row.original.active ? 'Deactivate Provider' : 'Activate Provider',
                  description: row.original.active
                    ? 'Are you sure you want to deactivate this provider?'
                    : 'Are you sure you want to activate this provider?',
                });
              }}
              disabled={activeMutation.isPending || paperMutation.isPending}
            >
              {row.original.active ? 'Deactivate' : 'Activate'}
            </Button>
            <Button
              size="sm"
              variant={row.original.paperok ? 'outline' : 'default'}
              onClick={() => {
                setConfirmAction({
                  type: 'paper',
                  id: String(row.original.id),
                  value: !row.original.paperok,
                  title: row.original.paperok ? 'Revoke Verification' : 'Verify Papers',
                  description: row.original.paperok
                    ? "Are you sure you want to revoke this provider's paper verification?"
                    : "Are you sure you want to mark this provider's papers as verified?",
                });
              }}
              disabled={activeMutation.isPending || paperMutation.isPending}
            >
              {row.original.paperok ? 'Revoke Papers' : 'Verify Papers'}
            </Button>
          </div>
        ),
      },
    ],
    [activeMutation.isPending, paperMutation.isPending],
  );

  return (
    <div className="space-y-6">
      <PageHeader breadcrumb={[{ label: 'Home' }, { label: 'Providers' }]} title="Providers" />
      <SearchBar placeholder="Search providers..." value={search ?? ''} onChange={setSearch} />
      <DataTable columns={columns} data={query.data?.data ?? []} isFetching={query.isFetching} isLoading={query.isLoading} />
      <PaginationControls
        dataLength={query.data?.data.length ?? 0}
        limit={limit}
        page={page}
        onLimitChange={setLimit}
        onNext={() => setPage(page + 1)}
        onPrevious={() => setPage(Math.max(1, page - 1))}
      />
      <ConfirmDialog
        open={Boolean(confirmAction)}
        title={confirmAction?.title ?? ''}
        description={confirmAction?.description ?? ''}
        isLoading={activeMutation.isPending || paperMutation.isPending}
        onConfirm={async () => {
          if (!confirmAction) return;
          const { type, id, value } = confirmAction;
          if (type === 'active') {
            await activeMutation.mutateAsync(
              { providerId: id, isActive: value },
              {
                onSuccess: () => {
                  queryClient.invalidateQueries({ queryKey: [endpoint] });
                },
              }
            );
          } else {
            await paperMutation.mutateAsync(
              { providerId: id, isPaperOk: value },
              {
                onSuccess: () => {
                  queryClient.invalidateQueries({ queryKey: [endpoint] });
                },
              }
            );
          }
          setConfirmAction(null);
        }}
        onCancel={() => setConfirmAction(null)}
      />
      <ProviderDocumentsDialog
        open={Boolean(selectedProvider)}
        providerId={selectedProvider?.id ?? null}
        providerName={selectedProvider?.name}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedProvider(null);
          }
        }}
      />
    </div>
  );
};

ProviderListPage.displayName = 'ProviderListPage';
