import { env } from '@/config/env';

const API_BASE_URL = env.VITE_API_BASE_URL;

export const toAbsoluteAssetUrl = (value?: string | null): string | undefined => {
  if (!value) {
    return undefined;
  }

  const trimmed = value.trim();

  if (!trimmed) {
    return undefined;
  }

  if (/^https?:\/\//i.test(trimmed) || trimmed.startsWith('data:') || trimmed.startsWith('blob:')) {
    return trimmed;
  }

  const normalizedPath = trimmed.replace(/\\/g, '/').replace(/^\.?\//, '');
  const base = API_BASE_URL.endsWith('/') ? API_BASE_URL : `${API_BASE_URL}/`;

  try {
    return new URL(normalizedPath, base).toString();
  } catch {
    return `${base}${normalizedPath}`;
  }
};
