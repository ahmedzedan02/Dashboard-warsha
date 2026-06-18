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
import { pickBoolean, pickString } from '@/shared/lib/apiMappers';
import { userPaginationStore } from '@/store/paginationStore';
import { toAbsoluteAssetUrl } from '@/shared/utils/asset';
import { useSetCustomerActiveMutation } from '@/modules/customers/hooks/useCustomersQuery';
import { queryClient } from '@/shared/lib/queryClient';

interface RawCustomerCountry {
  country_name_en?: string | null;
  country_name_ar?: string | null;
}

interface RawCustomer {
  id: number | string;
  fullname?: string | null;
  fullName?: string | null;
  userName?: string | null;
  username?: string | null;
  email?: string | null;
  mobileno?: string | null;
  mobileNo?: string | null;
  phoneno?: string | null;
  whatsapp?: string | null;
  user_avater?: string | null;
  logoURL?: string | null;
  isactive?: boolean | null;
  isActive?: boolean | null;
  active?: boolean | null;
  country?: RawCustomerCountry | string | null;
}

interface CustomerRow {
  id: string;
  fullName: string;
  email: string;
  mobileNo: string;
  whatsapp: string;
  avatarUrl?: string;
  isActive: boolean;
  country: string;
}

const endpoint = '/api/AdminApp/Maintusers/SearchData';

const mapCustomer = (customer: RawCustomer): CustomerRow => {
  const fullName = pickString(customer, 'fullName', 'fullname', 'userName', 'username') || 'Unknown';
  const country =
    typeof customer.country === 'string'
      ? customer.country
      : customer.country?.country_name_en || customer.country?.country_name_ar || '-';

  return {
    id: pickString(customer, 'id'),
    fullName,
    email: pickString(customer, 'email') || '-',
    mobileNo: pickString(customer, 'mobileNo', 'mobileno', 'phoneno') || '-',
    whatsapp: pickString(customer, 'whatsapp') || '-',
    avatarUrl: toAbsoluteAssetUrl(customer.user_avater || customer.logoURL),
    isActive: pickBoolean(customer, 'isActive', 'isactive', 'active'),
    country,
  };
};

export const UserListPage = () => {
  const page = userPaginationStore((state) => state.page);
  const limit = userPaginationStore((state) => state.limit);
  const search = userPaginationStore((state) => state.search);
  const fieldname = userPaginationStore((state) => state.fieldname);
  const fieldvalue = userPaginationStore((state) => state.fieldvalue);
  const orderby = userPaginationStore((state) => state.orderby);
  const ordertype = userPaginationStore((state) => state.ordertype);
  const setPage = userPaginationStore((state) => state.setPage);
  const setLimit = userPaginationStore((state) => state.setLimit);
  const setSearch = userPaginationStore((state) => state.setSearch);

  const activeMutation = useSetCustomerActiveMutation();
  const [confirmAction, setConfirmAction] = useState<{
    id: string;
    value: boolean;
    title: string;
    description: string;
  } | null>(null);

  const query = usePaginatedQuery<RawCustomer>(endpoint, {
    page,
    limit,
    search,
    fieldname,
    fieldvalue,
    orderby,
    ordertype,
  });

  const rows = useMemo(() => query.data?.data.map(mapCustomer) ?? [], [query.data?.data]);

  const columns = useMemo<ColumnDef<CustomerRow>[]>(
    () => [
      {
        accessorKey: 'fullName',
        header: 'Name',
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            {row.original.avatarUrl ? (
              <img alt={row.original.fullName} className="h-8 w-8 rounded-full object-cover" src={row.original.avatarUrl} />
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand text-xs text-white">
                {row.original.fullName.slice(0, 2).toUpperCase()}
              </div>
            )}
            <span>{row.original.fullName}</span>
          </div>
        ),
      },
      { accessorKey: 'email', header: 'Email' },
      { accessorKey: 'mobileNo', header: 'Mobile' },
      { accessorKey: 'whatsapp', header: 'WhatsApp' },
      {
        accessorKey: 'isActive',
        header: 'Active',
        cell: ({ row }) => <Badge variant={row.original.isActive ? 'success' : 'danger'}>{row.original.isActive ? 'Active' : 'Inactive'}</Badge>,
      },
      {
        accessorKey: 'country',
        header: 'Country',
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <Button
            size="sm"
            variant={row.original.isActive ? 'outline' : 'default'}
            onClick={() => {
              setConfirmAction({
                id: row.original.id,
                value: !row.original.isActive,
                title: row.original.isActive ? 'Deactivate Customer' : 'Activate Customer',
                description: row.original.isActive
                  ? 'Are you sure you want to deactivate this customer?'
                  : 'Are you sure you want to activate this customer?',
              });
            }}
            disabled={activeMutation.isPending}
          >
            {row.original.isActive ? 'Deactivate' : 'Activate'}
          </Button>
        ),
      },
    ],
    [activeMutation.isPending],
  );

  return (
    <div className="space-y-6">
      <PageHeader breadcrumb={[{ label: 'Home' }, { label: 'Customers' }]} title="Customers" />
      <SearchBar placeholder="Search customers..." value={search ?? ''} onChange={setSearch} />
      <DataTable columns={columns} data={rows} isFetching={query.isFetching} isLoading={query.isLoading} />
      <PaginationControls
        dataLength={rows.length}
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
        isLoading={activeMutation.isPending}
        onConfirm={async () => {
          if (!confirmAction) return;
          const { id, value } = confirmAction;
          await activeMutation.mutateAsync(
            { customerId: id, isActive: value },
            {
              onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: [endpoint] });
              },
            }
          );
          setConfirmAction(null);
        }}
        onCancel={() => setConfirmAction(null)}
      />
    </div>
  );
};

UserListPage.displayName = 'UserListPage';
