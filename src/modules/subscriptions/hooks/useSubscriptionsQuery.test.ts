import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { queryClient } from '@/shared/lib/queryClient';
import {
  PENDING_CONTRACTS_QUERY_KEY,
  SUBSCRIPTIONS_QUERY_KEY,
  useApproveContractMutation,
  usePendingContractsQuery,
  useRejectContractMutation,
  useSubscriptionsQuery,
} from '@/modules/subscriptions/hooks/useSubscriptionsQuery';
import {
  approvePendingContract,
  getPendingContracts,
  getSubscriptions,
  rejectPendingContract,
} from '@/modules/subscriptions/api/subscriptionsApi';

vi.mock('@tanstack/react-query', () => ({ useQuery: vi.fn(), useMutation: vi.fn() }));
vi.mock('react-toastify', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));
vi.mock('@/modules/subscriptions/api/subscriptionsApi', () => ({
  getSubscriptions: vi.fn(),
  getPendingContracts: vi.fn(),
  approvePendingContract: vi.fn(),
  rejectPendingContract: vi.fn(),
}));

describe('subscription hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(queryClient, 'invalidateQueries').mockResolvedValue(undefined as never);
  });

  it('builds the subscriptions list query from filters', () => {
    const filters = { page: 1, pageSize: 20, status: 'Subscribed', providerId: '7' };
    (useQuery as unknown as ReturnType<typeof vi.fn>).mockReturnValue('query');

    useSubscriptionsQuery(filters);

    expect(useQuery).toHaveBeenCalledWith(expect.objectContaining({ queryKey: [...SUBSCRIPTIONS_QUERY_KEY, filters], queryFn: expect.any(Function) }));
    expect(getSubscriptions).not.toHaveBeenCalled();
  });

  it('uses the pending contracts query key', () => {
    (useQuery as unknown as ReturnType<typeof vi.fn>).mockReturnValue('query');

    usePendingContractsQuery();

    expect(useQuery).toHaveBeenCalledWith(expect.objectContaining({ queryKey: PENDING_CONTRACTS_QUERY_KEY, queryFn: getPendingContracts }));
  });

  it('invalidates list queries on approve success', () => {
    let config!: Parameters<typeof useMutation>[0];
    (useMutation as unknown as ReturnType<typeof vi.fn>).mockImplementation((value) => {
      config = value;
      return value;
    });

    useApproveContractMutation();
    config.onSuccess?.({ success: true, message: 'Approved', data: null });

    expect(toast.success).toHaveBeenCalledWith('Approved');
    expect(queryClient.invalidateQueries).toHaveBeenCalledWith({ queryKey: PENDING_CONTRACTS_QUERY_KEY });
    expect(queryClient.invalidateQueries).toHaveBeenCalledWith({ queryKey: SUBSCRIPTIONS_QUERY_KEY });
    expect(config.mutationFn).toBe(approvePendingContract);
  });

  it('invalidates pending contracts on reject success', () => {
    let config!: Parameters<typeof useMutation>[0];
    (useMutation as unknown as ReturnType<typeof vi.fn>).mockImplementation((value) => {
      config = value;
      return value;
    });

    useRejectContractMutation();
    config.onSuccess?.({ success: true, message: 'Rejected', data: null });

    expect(toast.success).toHaveBeenCalledWith('Rejected');
    expect(queryClient.invalidateQueries).toHaveBeenCalledWith({ queryKey: PENDING_CONTRACTS_QUERY_KEY });
    expect(config.mutationFn).toBe(rejectPendingContract);
  });
});
