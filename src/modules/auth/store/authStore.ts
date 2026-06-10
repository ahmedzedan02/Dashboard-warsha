import { create } from 'zustand';
import type { AuthGeneralData } from '@/modules/auth/types/auth';

export interface AuthUser {
  id: number;
  name: string;
  username: string;
  isActive: boolean;
  usertype: 'admin' | 'support' | null;
  providerTypeId: number | null;
  maintAdminType: string | null;
  mainadminScreens: Array<{ screenName: string }>;
}

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  expiration: string | null;
  user: AuthUser | null;
  setAuth: (payload: { accessToken: string; refreshToken: string; expiration: string; user: AuthUser }) => void;
  clearAuth: () => void;
  hydrateAuth: () => void;
}

const AUTH_STORAGE_KEY = 'warsha-admin-auth';

const mapGeneralDataToUser = (generalData: AuthGeneralData): AuthUser => ({
  id: generalData.id,
  name: generalData.adminname,
  username: generalData.adminusername,
  isActive: generalData.adminactive,
  usertype: generalData.usertype,
  providerTypeId: generalData.provider_type_id,
  maintAdminType: generalData.maintadminType,
  mainadminScreens: generalData.mainadminScreens ?? [],
});

const persistAuth = (payload: { accessToken: string; refreshToken: string; expiration: string; user: AuthUser } | null) => {
  if (!payload) {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
    return;
  }

  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(payload));
};

export const authStore = create<AuthState>((set) => ({
  accessToken: null,
  refreshToken: null,
  expiration: null,
  user: null,
  setAuth: ({ accessToken, refreshToken, expiration, user }) => {
    persistAuth({ accessToken, refreshToken, expiration, user });
    set({ accessToken, refreshToken, expiration, user });
  },
  clearAuth: () => {
    persistAuth(null);
    set({ accessToken: null, refreshToken: null, expiration: null, user: null });
  },
  hydrateAuth: () => {
    const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) {
      return;
    }

    try {
      const parsed = JSON.parse(raw) as { accessToken: string; refreshToken: string; expiration: string; user: AuthUser };
      set(parsed);
    } catch {
      persistAuth(null);
    }
  },
}));

export { mapGeneralDataToUser };
