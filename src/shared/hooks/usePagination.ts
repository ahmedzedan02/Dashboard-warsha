import { useCallback, useState } from 'react';

export interface PaginationState {
  page: number;
  pageSize: number;
}

export const usePagination = (initialState: PaginationState = { page: 1, pageSize: 10 }) => {
  const [pagination, setPagination] = useState<PaginationState>(initialState);

  const setPage = useCallback((page: number) => {
    setPagination((current) => ({ ...current, page }));
  }, []);

  const setPageSize = useCallback((pageSize: number) => {
    setPagination((current) => ({ ...current, pageSize, page: 1 }));
  }, []);

  return {
    pagination,
    setPage,
    setPageSize,
    setPagination,
  };
};
