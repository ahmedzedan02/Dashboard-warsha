import { useQuery } from '@tanstack/react-query';
import { getOrderById, getOrders } from '@/modules/orders/api/ordersApi';
import { ORDER_DETAILS_QUERY_KEY, ORDERS_QUERY_KEY, useOrderDetailsQuery, useOrdersQuery } from '@/modules/orders/hooks/useOrdersQuery';

vi.mock('@tanstack/react-query', () => ({ useQuery: vi.fn() }));
vi.mock('@/modules/orders/api/ordersApi', () => ({ getOrders: vi.fn(), getOrderById: vi.fn() }));

describe('order hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('builds the orders query from filters', () => {
    const filters = { page: 2, pageSize: 25, status: 'Pending' };
    (useQuery as unknown as ReturnType<typeof vi.fn>).mockReturnValue('query');

    useOrdersQuery(filters);

    expect(useQuery).toHaveBeenCalledWith(expect.objectContaining({ queryKey: [...ORDERS_QUERY_KEY, filters], queryFn: expect.any(Function) }));
  });

  it('configures the order details query with the selected id', () => {
    (useQuery as unknown as ReturnType<typeof vi.fn>).mockReturnValue('query');

    useOrderDetailsQuery('order-1');

    expect(useQuery).toHaveBeenCalledWith(expect.objectContaining({ queryKey: [...ORDER_DETAILS_QUERY_KEY, 'order-1'], enabled: true }));
    expect(getOrderById).not.toHaveBeenCalled();
  });

  it('disables the order details query when no id is provided', () => {
    (useQuery as unknown as ReturnType<typeof vi.fn>).mockReturnValue('query');

    useOrderDetailsQuery(undefined);

    expect(useQuery).toHaveBeenCalledWith(expect.objectContaining({ enabled: false }));
    expect(getOrders).not.toHaveBeenCalled();
  });
});
