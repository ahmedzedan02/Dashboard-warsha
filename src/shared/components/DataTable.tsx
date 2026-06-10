import { useMemo } from 'react';
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from '@tanstack/react-table';
import { useVirtualizer } from '@tanstack/react-virtual';
import { EmptyState } from '@/shared/components/EmptyState';
import { LoadingSkeleton } from '@/shared/components/LoadingSkeleton';
import { Button } from '@/shared/components/ui/button';

interface PaginationProps {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
}

interface DataTableProps<TData> {
  columns: ColumnDef<TData>[];
  data: TData[];
  isLoading?: boolean;
  pagination?: PaginationProps;
  onRowClick?: (row: TData) => void;
}

export const DataTable = <TData,>({ columns, data, isLoading, pagination, onRowClick }: DataTableProps<TData>) => {
  const sorting = useMemo<SortingState>(() => [], []);
  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const rowVirtualizer = useVirtualizer({
    count: data.length,
    getScrollElement: () => document.getElementById('table-scroll-container'),
    estimateSize: () => 56,
    enabled: data.length > 500,
    overscan: 10,
  });

  if (isLoading) {
    return (
      <div className="card-surface space-y-3 p-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <LoadingSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (!data.length) {
    return <EmptyState title="No data found" description="Adjust your filters or try again later." />;
  }

  const virtualItems = rowVirtualizer.getVirtualItems();
  const rows = table.getRowModel().rows;
  const visibleRows = virtualItems.length ? virtualItems.map((item) => rows[item.index]) : rows;
  const totalPages = pagination ? Math.max(1, Math.ceil(pagination.total / pagination.pageSize)) : 1;
  const canGoPrevious = pagination ? pagination.page > 1 : false;
  const canGoNext = pagination ? pagination.page < totalPages : false;

  return (
    <div className="card-surface overflow-hidden">
      <div className="overflow-auto" id="table-scroll-container">
        <table className="min-w-full text-left">
          <thead className="bg-brand-lighter">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-brand-dark" key={header.id}>
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {visibleRows.map((row) => (
              <tr
                className="border-t border-muted/70 hover:bg-brand-lighter/50"
                key={row.id}
                onClick={onRowClick ? () => onRowClick(row.original) : undefined}
              >
                {row.getVisibleCells().map((cell) => (
                  <td className="px-4 py-3 align-top text-sm text-brand-darker" key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {pagination ? (
        <div className="flex items-center justify-between border-t border-muted px-4 py-3 text-sm">
          <div className="flex items-center gap-4">
            <span>
              Page {pagination.page} of {totalPages}
            </span>
            {pagination.onPageSizeChange ? (
              <label className="flex items-center gap-2">
                <span>Rows</span>
                <select
                  className="rounded-xl border border-muted bg-background px-2 py-1"
                  onChange={(event) => pagination.onPageSizeChange?.(Number(event.target.value))}
                  value={pagination.pageSize}
                >
                  {[10, 20, 50, 100].map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}
          </div>
          <div className="flex gap-2">
            <Button disabled={!canGoPrevious} variant="outline" onClick={() => pagination.onPageChange(Math.max(1, pagination.page - 1))}>
              Previous
            </Button>
            <Button
              disabled={!canGoNext}
              variant="outline"
              onClick={() => pagination.onPageChange(Math.min(totalPages, pagination.page + 1))}
            >
              Next
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
};

DataTable.displayName = 'DataTable';
