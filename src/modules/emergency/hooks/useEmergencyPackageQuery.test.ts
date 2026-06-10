import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { queryClient } from '@/shared/lib/queryClient';
import { getEmergencyPackage } from '@/modules/emergency/api/emergencyApi';
import {
  EMERGENCY_PACKAGE_QUERY_KEY,
  useEmergencyPackageQuery,
  useSaveEmergencyPackageMutation,
} from '@/modules/emergency/hooks/useEmergencyPackageQuery';

vi.mock('@tanstack/react-query', () => ({ useQuery: vi.fn(), useMutation: vi.fn() }));
vi.mock('react-toastify', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));
vi.mock('@/modules/emergency/api/emergencyApi', () => ({
  getEmergencyPackage: vi.fn(),
  createEmergencyPackage: vi.fn(),
  updateEmergencyPackage: vi.fn(),
}));

describe('emergency package hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(queryClient, 'invalidateQueries').mockResolvedValue(undefined as never);
  });

  it('uses the emergency package query key', () => {
    (useQuery as unknown as ReturnType<typeof vi.fn>).mockReturnValue('query');

    useEmergencyPackageQuery();

    expect(useQuery).toHaveBeenCalledWith(expect.objectContaining({ queryKey: EMERGENCY_PACKAGE_QUERY_KEY, queryFn: getEmergencyPackage }));
  });

  it('invalidates package query after save success', () => {
    let config!: Parameters<typeof useMutation>[0];
    (useMutation as unknown as ReturnType<typeof vi.fn>).mockImplementation((value) => {
      config = value;
      return value;
    });

    useSaveEmergencyPackageMutation();
    config.onSuccess?.({ success: true, message: 'Saved', data: null });

    expect(toast.success).toHaveBeenCalledWith('Saved');
    expect(queryClient.invalidateQueries).toHaveBeenCalledWith({ queryKey: EMERGENCY_PACKAGE_QUERY_KEY });
  });

  it('surfaces normalized errors with a toast', () => {
    let config!: Parameters<typeof useMutation>[0];
    (useMutation as unknown as ReturnType<typeof vi.fn>).mockImplementation((value) => {
      config = value;
      return value;
    });

    useSaveEmergencyPackageMutation();
    config.onError?.({ message: 'Failure' });

    expect(toast.error).toHaveBeenCalledWith('Failure');
  });
});
