import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { queryClient } from '@/shared/lib/queryClient';
import { addCustomer, deleteCustomer, getCustomers } from '@/modules/customers/api/customersApi';
import {
  CUSTOMERS_QUERY_KEY,
  useAddCustomerMutation,
  useCustomersQuery,
  useDeleteCustomerMutation,
  useSetCustomerActiveMutation,
} from '@/modules/customers/hooks/useCustomersQuery';

vi.mock('@tanstack/react-query', () => ({ useQuery: vi.fn(), useMutation: vi.fn() }));
vi.mock('react-toastify', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));
vi.mock('@/modules/customers/api/customersApi', () => ({
  getCustomers: vi.fn(),
  addCustomer: vi.fn(),
  editCustomer: vi.fn(),
  deleteCustomer: vi.fn(),
  setCustomerActive: vi.fn(),
}));

describe('customer hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(queryClient, 'invalidateQueries').mockResolvedValue(undefined as never);
  });

  it('builds the customers query from filters', () => {
    const filters = { page: 3, pageSize: 10, search: 'mona' };
    (useQuery as unknown as ReturnType<typeof vi.fn>).mockReturnValue('query');

    useCustomersQuery(filters);

    expect(useQuery).toHaveBeenCalledWith(expect.objectContaining({ queryKey: [...CUSTOMERS_QUERY_KEY, filters], queryFn: expect.any(Function) }));
  });

  it('invalidates the list after adding a customer', () => {
    let config!: Parameters<typeof useMutation>[0];
    (useMutation as unknown as ReturnType<typeof vi.fn>).mockImplementation((value) => {
      config = value;
      return value;
    });

    useAddCustomerMutation();
    config.onSuccess?.({ success: true, message: 'Saved', data: null });

    expect(config.mutationFn).toBe(addCustomer);
    expect(toast.success).toHaveBeenCalledWith('Saved');
    expect(queryClient.invalidateQueries).toHaveBeenCalledWith({ queryKey: CUSTOMERS_QUERY_KEY });
  });

  it('invalidates the list after deleting a customer', () => {
    let config!: Parameters<typeof useMutation>[0];
    (useMutation as unknown as ReturnType<typeof vi.fn>).mockImplementation((value) => {
      config = value;
      return value;
    });

    useDeleteCustomerMutation();
    config.onSuccess?.({ success: true, message: 'Deleted', data: null });

    expect(config.mutationFn).toBe(deleteCustomer);
    expect(toast.success).toHaveBeenCalledWith('Deleted');
    expect(queryClient.invalidateQueries).toHaveBeenCalledWith({ queryKey: CUSTOMERS_QUERY_KEY });
    expect(getCustomers).not.toHaveBeenCalled();
  });

  it('shows success handling for active toggle', () => {
    let config!: Parameters<typeof useMutation>[0];
    (useMutation as unknown as ReturnType<typeof vi.fn>).mockImplementation((value) => {
      config = value;
      return value;
    });

    useSetCustomerActiveMutation();
    config.onSuccess?.({ success: true, message: 'Active updated', data: null });

    expect(toast.success).toHaveBeenCalledWith('Active updated');
    expect(queryClient.invalidateQueries).toHaveBeenCalledWith({ queryKey: CUSTOMERS_QUERY_KEY });
  });
});
