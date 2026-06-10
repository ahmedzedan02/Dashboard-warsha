import { useMemo } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/shared/components/ui/badge';
import { PageHeader } from '@/shared/components/PageHeader';
import { DataTable } from '@/components/shared/DataTable';
import { PaginationControls } from '@/components/shared/PaginationControls';
import { SearchBar } from '@/components/shared/SearchBar';
import { usePaginatedQuery } from '@/hooks/usePaginatedQuery';
import { providerPaginationStore } from '@/store/paginationStore';
import { toAbsoluteAssetUrl } from '@/shared/utils/asset';

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
        cell: ({ row }) => <Badge variant={row.original.paperok ? 'info' : 'warning'}>{row.original.paperok ? 'Verified' : 'Pending'}</Badge>,
      },
    ],
    [],
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
    </div>
  );
};

ProviderListPage.displayName = 'ProviderListPage';
