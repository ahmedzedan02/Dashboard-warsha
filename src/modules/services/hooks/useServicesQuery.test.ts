import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { queryClient } from '@/shared/lib/queryClient';
import { addService, getActiveServicePriceList } from '@/modules/services/api/servicesApi';
import {
  SERVICE_PRICE_LIST_QUERY_KEY,
  SERVICES_QUERY_KEY,
  useAddServiceMutation,
  useServicePriceListQuery,
  useServicesQuery,
  useSetEmergencyMutation,
} from '@/modules/services/hooks/useServicesQuery';

vi.mock('@tanstack/react-query', () => ({ useQuery: vi.fn(), useMutation: vi.fn() }));
vi.mock('react-toastify', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));
vi.mock('@/modules/services/api/servicesApi', () => ({
  getServices: vi.fn(),
  getActiveServicePriceList: vi.fn(),
  addService: vi.fn(),
  editService: vi.fn(),
  setServiceEmergency: vi.fn(),
}));

describe('service hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(queryClient, 'invalidateQueries').mockResolvedValue(undefined as never);
  });

  it('builds the service list query', () => {
    const filters = { page: 1, pageSize: 20 };
    (useQuery as unknown as ReturnType<typeof vi.fn>).mockReturnValue('query');

    useServicesQuery(filters);

    expect(useQuery).toHaveBeenCalledWith(expect.objectContaining({ queryKey: [...SERVICES_QUERY_KEY, filters], queryFn: expect.any(Function) }));
  });

  it('uses the active price list query key', () => {
    (useQuery as unknown as ReturnType<typeof vi.fn>).mockReturnValue('query');

    useServicePriceListQuery();

    expect(useQuery).toHaveBeenCalledWith(expect.objectContaining({ queryKey: SERVICE_PRICE_LIST_QUERY_KEY, queryFn: getActiveServicePriceList }));
  });

  it('invalidates service list after add', () => {
    let config!: Parameters<typeof useMutation>[0];
    (useMutation as unknown as ReturnType<typeof vi.fn>).mockImplementation((value) => {
      config = value;
      return value;
    });

    useAddServiceMutation();
    config.onSuccess?.({ success: true, message: 'Saved', data: null });

    expect(config.mutationFn).toBe(addService);
    expect(toast.success).toHaveBeenCalledWith('Saved');
    expect(queryClient.invalidateQueries).toHaveBeenCalledWith({ queryKey: SERVICES_QUERY_KEY });
  });

  it('invalidates service list after emergency toggle', () => {
    let config!: Parameters<typeof useMutation>[0];
    (useMutation as unknown as ReturnType<typeof vi.fn>).mockImplementation((value) => {
      config = value;
      return value;
    });

    useSetEmergencyMutation();
    config.onSuccess?.({ success: true, message: 'Updated', data: null });

    expect(toast.success).toHaveBeenCalledWith('Updated');
    expect(queryClient.invalidateQueries).toHaveBeenCalledWith({ queryKey: SERVICES_QUERY_KEY });
  });
});
