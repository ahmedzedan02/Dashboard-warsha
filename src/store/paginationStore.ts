import { create } from 'zustand';
import type { PaginationParams } from '@/services/api';

interface PaginationSlice extends PaginationParams {
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  setSearch: (search: string) => void;
  setFilter: (fieldname?: string, fieldvalue?: string) => void;
  setSort: (orderby?: string, ordertype?: 'asc' | 'desc') => void;
  reset: () => void;
}

const defaultState: PaginationParams = {
  page: 1,
  limit: 10,
  search: '',
  fieldname: '',
  fieldvalue: '',
  orderby: '',
  ordertype: 'asc',
};

export const createPaginationSlice = (name: string) =>
  create<PaginationSlice>((set) => ({
    ...defaultState,
    setPage: (page) => set({ page }),
    setLimit: (limit) => set({ limit, page: 1 }),
    setSearch: (search) => set({ search, page: 1 }),
    setFilter: (fieldname = '', fieldvalue = '') => set({ fieldname, fieldvalue, page: 1 }),
    setSort: (orderby = '', ordertype = 'asc') => set({ orderby, ordertype, page: 1 }),
    reset: () => set({ ...defaultState }),
  }));

export const providerPaginationStore = createPaginationSlice('providers');
export const userPaginationStore = createPaginationSlice('users');
