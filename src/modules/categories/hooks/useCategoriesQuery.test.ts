import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { queryClient } from '@/shared/lib/queryClient';
import { addCategory, getCategories, getCategoryServices } from '@/modules/categories/api/categoriesApi';
import {
  CATEGORIES_QUERY_KEY,
  CATEGORY_SERVICES_QUERY_KEY,
  useAddCategoryMutation,
  useCategoriesQuery,
  useCategoryServicesQuery,
  useDeleteCategoryMutation,
} from '@/modules/categories/hooks/useCategoriesQuery';

vi.mock('@tanstack/react-query', () => ({
  useQuery: vi.fn(),
  useMutation: vi.fn(),
  QueryClient: vi.fn().mockImplementation(() => ({
    invalidateQueries: vi.fn(),
  })),
}));
vi.mock('react-toastify', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));
vi.mock('@/modules/categories/api/categoriesApi', () => ({
  getCategories: vi.fn(),
  getCategoryServices: vi.fn(),
  addCategory: vi.fn(),
  editCategory: vi.fn(),
  deleteCategory: vi.fn(),
  setCategoryActive: vi.fn(),
}));

describe('category hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(queryClient, 'invalidateQueries').mockResolvedValue(undefined as never);
  });

  it('uses the categories list query', () => {
    (useQuery as unknown as ReturnType<typeof vi.fn>).mockReturnValue('query');

    useCategoriesQuery();

    expect(useQuery).toHaveBeenCalledWith(expect.objectContaining({ queryKey: CATEGORIES_QUERY_KEY, queryFn: getCategories }));
  });

  it('uses the selected category for services query', () => {
    (useQuery as unknown as ReturnType<typeof vi.fn>).mockReturnValue('query');

    useCategoryServicesQuery('cat-1');

    expect(useQuery).toHaveBeenCalledWith(expect.objectContaining({ queryKey: [...CATEGORY_SERVICES_QUERY_KEY, 'cat-1'], enabled: true }));
    expect(getCategoryServices).not.toHaveBeenCalled();
  });

  it('invalidates categories after add', () => {
    let config!: Parameters<typeof useMutation>[0];
    (useMutation as unknown as ReturnType<typeof vi.fn>).mockImplementation((value) => {
      config = value;
      return value;
    });

    useAddCategoryMutation();
    config.onSuccess?.({ success: true, message: 'Added', data: null });

    expect(config.mutationFn).toBe(addCategory);
    expect(toast.success).toHaveBeenCalledWith('Added');
    expect(queryClient.invalidateQueries).toHaveBeenCalledWith({ queryKey: CATEGORIES_QUERY_KEY });
  });

  it('invalidates categories after delete', () => {
    let config!: Parameters<typeof useMutation>[0];
    (useMutation as unknown as ReturnType<typeof vi.fn>).mockImplementation((value) => {
      config = value;
      return value;
    });

    useDeleteCategoryMutation();
    config.onSuccess?.({ success: true, message: 'Deleted', data: null });

    expect(toast.success).toHaveBeenCalledWith('Deleted');
    expect(queryClient.invalidateQueries).toHaveBeenCalledWith({ queryKey: CATEGORIES_QUERY_KEY });
  });
});
