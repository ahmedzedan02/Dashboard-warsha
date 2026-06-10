import { useMutation } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { loginAdmin } from '@/modules/auth/api/authApi';
import { authStore } from '@/modules/auth/store/authStore';
import { LOGIN_MUTATION_KEY, useLoginMutation } from '@/modules/auth/hooks/useLoginMutation';

vi.mock('@tanstack/react-query', () => ({ useMutation: vi.fn() }));
vi.mock('react-toastify', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));
vi.mock('@/modules/auth/api/authApi', () => ({ loginAdmin: vi.fn() }));

describe('useLoginMutation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authStore.getState().clearAuth();
  });

  it('configures login mutation with the expected key and api function', () => {
    (useMutation as unknown as ReturnType<typeof vi.fn>).mockReturnValue('mutation');

    const result = useLoginMutation();

    expect(result).toBe('mutation');
    expect(useMutation).toHaveBeenCalledWith(expect.objectContaining({ mutationKey: LOGIN_MUTATION_KEY, mutationFn: loginAdmin }));
  });

  it('stores auth and shows success toast for administrator role', () => {
    let config!: Parameters<typeof useMutation>[0];
    (useMutation as unknown as ReturnType<typeof vi.fn>).mockImplementation((value) => {
      config = value;
      return value;
    });

    useLoginMutation();

    config.onSuccess?.({
      isSuccess: true,
      message: 'Welcome',
      accessToken: 'jwt-token',
      refreshToken: 'refresh-token',
      expiration: '2026-06-16T04:26:28.2675629Z',
      generalData: {
        id: 1,
        provider_type_id: null,
        adminname: 'Admin User',
        adminusername: 'admin',
        adminactive: true,
        usertype: null,
        maintadminType: null,
        mainadminScreens: [],
      },
    });

    expect(authStore.getState().accessToken).toBe('jwt-token');
    expect(toast.success).toHaveBeenCalledWith('Welcome');
  });

  it('shows an error toast when the auth payload is incomplete', () => {
    let config!: Parameters<typeof useMutation>[0];
    (useMutation as unknown as ReturnType<typeof vi.fn>).mockImplementation((value) => {
      config = value;
      return value;
    });

    useLoginMutation();
    config.onSuccess?.({
      isSuccess: true,
      message: 'Login failed',
    });

    expect(authStore.getState().accessToken).toBeNull();
    expect(toast.error).toHaveBeenCalledWith('Login failed');
  });
});
