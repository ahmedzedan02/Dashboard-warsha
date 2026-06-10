import { useState } from 'react';

export const useTableFilters = <TFilters extends Record<string, unknown>>(initialFilters: TFilters) => {
  const [filters, setFilters] = useState<TFilters>(initialFilters);

  const updateFilter = <TKey extends keyof TFilters>(key: TKey, value: TFilters[TKey]) => {
    setFilters((current) => ({ ...current, [key]: value }));
  };

  return {
    filters,
    setFilters,
    updateFilter,
  };
};
