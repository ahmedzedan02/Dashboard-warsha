import { useQuery } from '@tanstack/react-query';
import { getRequestById, getRequests } from '@/modules/requests/api/requestsApi';
import {
  REQUEST_DETAILS_QUERY_KEY,
  REQUESTS_QUERY_KEY,
  useRequestDetailsQuery,
  useRequestsQuery,
} from '@/modules/requests/hooks/useRequestsQuery';

vi.mock('@tanstack/react-query', () => ({ useQuery: vi.fn() }));
vi.mock('@/modules/requests/api/requestsApi', () => ({ getRequests: vi.fn(), getRequestById: vi.fn() }));

describe('request hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('builds the requests query from filters', () => {
    const filters = { page: 1, pageSize: 15, serviceTypeId: '4' };
    (useQuery as unknown as ReturnType<typeof vi.fn>).mockReturnValue('query');

    useRequestsQuery(filters);

    expect(useQuery).toHaveBeenCalledWith(expect.objectContaining({ queryKey: [...REQUESTS_QUERY_KEY, filters], queryFn: expect.any(Function) }));
  });

  it('enables the request details query when an id exists', () => {
    (useQuery as unknown as ReturnType<typeof vi.fn>).mockReturnValue('query');

    useRequestDetailsQuery('req-1');

    expect(useQuery).toHaveBeenCalledWith(expect.objectContaining({ queryKey: [...REQUEST_DETAILS_QUERY_KEY, 'req-1'], enabled: true }));
    expect(getRequestById).not.toHaveBeenCalled();
  });

  it('disables the request details query without an id', () => {
    (useQuery as unknown as ReturnType<typeof vi.fn>).mockReturnValue('query');

    useRequestDetailsQuery(undefined);

    expect(useQuery).toHaveBeenCalledWith(expect.objectContaining({ enabled: false }));
    expect(getRequests).not.toHaveBeenCalled();
  });
});
