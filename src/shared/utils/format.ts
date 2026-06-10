import { format } from 'date-fns';

const DEFAULT_CURRENCY = 'QAR';

const normalizeCurrencyCode = (currency?: string | null): string => {
  if (!currency) {
    return DEFAULT_CURRENCY;
  }

  const normalizedCurrency = currency.trim().toUpperCase();

  return /^[A-Z]{3}$/.test(normalizedCurrency) ? normalizedCurrency : DEFAULT_CURRENCY;
};

export const formatCurrency = (value: number, currency?: string | null): string => {
  const normalizedCurrency = normalizeCurrencyCode(currency);

  try {
    return new Intl.NumberFormat('en-QA', {
      style: 'currency',
      currency: normalizedCurrency,
      maximumFractionDigits: 2,
    }).format(value);
  } catch {
    return new Intl.NumberFormat('en-QA', {
      style: 'currency',
      currency: DEFAULT_CURRENCY,
      maximumFractionDigits: 2,
    }).format(value);
  }
};

export const formatDate = (value?: string | Date | null, dateFormat = 'dd MMM yyyy'): string => {
  if (!value) {
    return '--';
  }

  return format(new Date(value), dateFormat);
};
