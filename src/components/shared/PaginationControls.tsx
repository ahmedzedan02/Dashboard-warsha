import { Button } from '@/shared/components/ui/button';

interface PaginationControlsProps {
  page: number;
  limit: number;
  dataLength: number;
  onPrevious: () => void;
  onNext: () => void;
  onLimitChange: (limit: number) => void;
  dir?: 'ltr' | 'rtl';
}

export const PaginationControls = ({
  page,
  limit,
  dataLength,
  onPrevious,
  onNext,
  onLimitChange,
  dir = 'ltr',
}: PaginationControlsProps) => (
  <div className="flex flex-col gap-3 rounded-2xl border border-muted bg-white p-4 md:flex-row md:items-center md:justify-between" dir={dir}>
    <div className="flex items-center gap-3">
      <span className="text-sm font-medium text-brand-dark">Page {page}</span>
      <label className="flex items-center gap-2 text-sm text-brand-light">
        <span>Rows</span>
        <select
          className="rounded-xl border border-muted bg-white px-3 py-2 text-sm text-brand-darker outline-none focus-visible:ring-2 focus-visible:ring-brand-light"
          onChange={(event) => onLimitChange(Number(event.target.value))}
          value={limit}
        >
          {[10, 25, 50].map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
      </label>
    </div>
    <div className="flex gap-2">
      <Button disabled={page === 1} type="button" variant="outline" onClick={onPrevious}>
        Previous
      </Button>
      <Button disabled={dataLength < limit} type="button" onClick={onNext}>
        Next
      </Button>
    </div>
  </div>
);
