import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { queryClient } from '@/shared/lib/queryClient';
import { confirmPayment, getPayments, verifyManualPayment } from '@/modules/payments/api/paymentsApi';
import {
  PAYMENTS_QUERY_KEY,
  useConfirmPaymentMutation,
  usePaymentsQuery,
  useVerifyPaymentMutation,
} from '@/modules/payments/hooks/usePaymentsQuery';

vi.mock('@tanstack/react-query', () => ({ useQuery: vi.fn(), useMutation: vi.fn() }));
vi.mock('react-toastify', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));
vi.mock('@/modules/payments/api/paymentsApi', () => ({
  getPayments: vi.fn(),
  verifyManualPayment: vi.fn(),
  confirmPayment: vi.fn(),
}));

describe('payment hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(queryClient, 'invalidateQueries').mockResolvedValue(undefined as never);
  });

  it('creates the payments query from filters', () => {
    const filters = { page: 1, pageSize: 10, status: 'Pending' };
    (useQuery as unknown as ReturnType<typeof vi.fn>).mockReturnValue('query');

    usePaymentsQuery(filters);

    expect(useQuery).toHaveBeenCalledWith(expect.objectContaining({ queryKey: [...PAYMENTS_QUERY_KEY, filters], queryFn: expect.any(Function) }));
    expect(getPayments).not.toHaveBeenCalled();
  });

  it('invalidates the payments list after manual verification', () => {
    let config!: Parameters<typeof useMutation>[0];
    (useMutation as unknown as ReturnType<typeof vi.fn>).mockImplementation((value) => {
      config = value;
      return value;
    });

    useVerifyPaymentMutation();
    config.onSuccess?.({ success: true, message: 'Verified', data: null });

    expect(config.mutationFn).toBe(verifyManualPayment);
    expect(toast.success).toHaveBeenCalledWith('Verified');
    expect(queryClient.invalidateQueries).toHaveBeenCalledWith({ queryKey: PAYMENTS_QUERY_KEY });
  });

  it('invalidates the payments list after confirmation', () => {
    let config!: Parameters<typeof useMutation>[0];
    (useMutation as unknown as ReturnType<typeof vi.fn>).mockImplementation((value) => {
      config = value;
      return value;
    });

    useConfirmPaymentMutation();
    config.onSuccess?.({ success: true, message: 'Confirmed', data: null });

    expect(config.mutationFn).toBe(confirmPayment);
    expect(toast.success).toHaveBeenCalledWith('Confirmed');
    expect(queryClient.invalidateQueries).toHaveBeenCalledWith({ queryKey: PAYMENTS_QUERY_KEY });
  });
});
