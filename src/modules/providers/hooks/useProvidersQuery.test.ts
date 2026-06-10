import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { queryClient } from '@/shared/lib/queryClient';
import {
  PROVIDER_DETAILS_QUERY_KEY,
  PROVIDERS_QUERY_KEY,
  useAddProviderMutation,
  useProviderDetailsQuery,
  useProvidersQuery,
  useSetProviderActiveMutation,
} from '@/modules/providers/hooks/useProvidersQuery';
import { addProvider, getProviderById, getProviders, setProviderActive } from '@/modules/providers/api/providersApi';

vi.mock('@tanstack/react-query', () => ({ useQuery: vi.fn(), useMutation: vi.fn() }));
vi.mock('react-toastify', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));
vi.mock('@/modules/providers/api/providersApi', () => ({
  getProviders: vi.fn(),
  getProviderById: vi.fn(),
  addProvider: vi.fn(),
  editProvider: vi.fn(),
  setProviderActive: vi.fn(),
  setProviderPaperOk: vi.fn(),
}));

describe('provider hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(queryClient, 'invalidateQueries').mockResolvedValue(undefined as never);
  });

  it('builds the providers query from filters', () => {
    const filters = { page: 1, pageSize: 10, search: 'acme' };
    (useQuery as unknown as ReturnType<typeof vi.fn>).mockReturnValue('query');

    useProvidersQuery(filters);

    expect(useQuery).toHaveBeenCalledWith(expect.objectContaining({ queryKey: [...PROVIDERS_QUERY_KEY, filters], queryFn: expect.any(Function) }));
  });

  it('configures provider details with the selected id', () => {
    (useQuery as unknown as ReturnType<typeof vi.fn>).mockReturnValue('query');

    useProviderDetailsQuery('provider-1');

    expect(useQuery).toHaveBeenCalledWith(expect.objectContaining({ queryKey: [...PROVIDER_DETAILS_QUERY_KEY, 'provider-1'], enabled: true }));
    expect(getProviderById).not.toHaveBeenCalled();
  });

  it('invalidates the providers list after add', () => {
    let config!: Parameters<typeof useMutation>[0];
    (useMutation as unknown as ReturnType<typeof vi.fn>).mockImplementation((value) => {
      config = value;
      return value;
    });

    useAddProviderMutation();
    config.onSuccess?.({ success: true, message: 'Saved', data: null });

    expect(config.mutationFn).toBe(addProvider);
    expect(toast.success).toHaveBeenCalledWith('Saved');
    expect(queryClient.invalidateQueries).toHaveBeenCalledWith({ queryKey: PROVIDERS_QUERY_KEY });
  });

  it('invalidates the providers list after active toggle', () => {
    let config!: Parameters<typeof useMutation>[0];
    (useMutation as unknown as ReturnType<typeof vi.fn>).mockImplementation((value) => {
      config = value;
      return value;
    });

    useSetProviderActiveMutation();
    config.onSuccess?.({ success: true, message: 'Updated', data: null });

    expect(config.mutationFn).toBe(setProviderActive);
    expect(toast.success).toHaveBeenCalledWith('Updated');
    expect(queryClient.invalidateQueries).toHaveBeenCalledWith({ queryKey: PROVIDERS_QUERY_KEY });
    expect(getProviders).not.toHaveBeenCalled();
  });
});
