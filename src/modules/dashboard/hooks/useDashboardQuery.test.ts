import { useQuery } from '@tanstack/react-query';
import { getDashboardStats } from '@/modules/dashboard/api/dashboardApi';
import { DASHBOARD_QUERY_KEY, useDashboardQuery } from '@/modules/dashboard/hooks/useDashboardQuery';

vi.mock('@tanstack/react-query', () => ({ useQuery: vi.fn() }));
vi.mock('@/modules/dashboard/api/dashboardApi', () => ({ getDashboardStats: vi.fn() }));

describe('useDashboardQuery', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('uses the dashboard query key', () => {
    (useQuery as unknown as ReturnType<typeof vi.fn>).mockReturnValue('query');

    const result = useDashboardQuery();

    expect(result).toBe('query');
    expect(useQuery).toHaveBeenCalledWith(expect.objectContaining({ queryKey: DASHBOARD_QUERY_KEY }));
  });

  it('uses the dashboard api function', () => {
    (useQuery as unknown as ReturnType<typeof vi.fn>).mockReturnValue('query');

    useDashboardQuery();

    expect(useQuery).toHaveBeenCalledWith(expect.objectContaining({ queryFn: getDashboardStats }));
  });

  it('enables zero stale time and sixty second refresh', () => {
    (useQuery as unknown as ReturnType<typeof vi.fn>).mockReturnValue('query');

    useDashboardQuery();

    expect(useQuery).toHaveBeenCalledWith(expect.objectContaining({ staleTime: 0, refetchInterval: 60_000 }));
  });
});
