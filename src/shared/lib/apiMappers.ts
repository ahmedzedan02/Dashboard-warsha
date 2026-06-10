import type { PagedResult, ResponseDTONew } from '@/shared/types/common';

type UnknownRecord = Record<string, unknown>;

const asRecord = (value: unknown): UnknownRecord => ((value && typeof value === 'object') ? (value as UnknownRecord) : {});

const asArray = (value: unknown): unknown[] => (Array.isArray(value) ? value : []);

const normalizeNumericString = (value: string): string =>
  value
    .trim()
    .replace(/[٠-٩]/g, (digit) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(digit)))
    .replace(/[٫،]/g, '.')
    .replace(/,/g, '')
    .replace(/\s+/g, '');

export const pickString = (source: unknown, ...keys: string[]): string => {
  const record = asRecord(source);
  for (const key of keys) {
    const value = record[key];
    if (typeof value === 'string' && value.trim()) {
      return value;
    }
    if (typeof value === 'number') {
      return String(value);
    }
  }
  return '';
};

export const pickNumber = (source: unknown, ...keys: string[]): number => {
  const record = asRecord(source);
  for (const key of keys) {
    const value = record[key];
    if (typeof value === 'number' && Number.isFinite(value)) {
      return value;
    }
    if (typeof value === 'string' && value.trim()) {
      const normalizedValue = normalizeNumericString(value);
      if (normalizedValue && !Number.isNaN(Number(normalizedValue))) {
        return Number(normalizedValue);
      }
    }
  }
  return 0;
};

export const pickBoolean = (source: unknown, ...keys: string[]): boolean => {
  const record = asRecord(source);
  for (const key of keys) {
    const value = record[key];
    if (typeof value === 'boolean') {
      return value;
    }
    if (typeof value === 'number') {
      return value !== 0;
    }
    if (typeof value === 'string') {
      const normalized = value.trim().toLowerCase();
      if (['true', '1', 'yes', 'active'].includes(normalized)) {
        return true;
      }
      if (['false', '0', 'no', 'inactive'].includes(normalized)) {
        return false;
      }
    }
  }
  return false;
};

export const pickArray = (source: unknown, ...keys: string[]): unknown[] => {
  const record = asRecord(source);
  for (const key of keys) {
    const value = record[key];
    if (Array.isArray(value)) {
      return value;
    }
  }
  return [];
};

export const pickObject = (source: unknown, ...keys: string[]): UnknownRecord => {
  const record = asRecord(source);
  for (const key of keys) {
    const value = record[key];
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      return value as UnknownRecord;
    }
  }
  return {};
};

export const mapResponse = <T>(response: ResponseDTONew<unknown>, mapData: (value: unknown) => T): ResponseDTONew<T> => {
  const rawData = response.data ?? response.generalData;
  return {
    code: response.code,
    success: response.success,
    isSuccess: response.isSuccess,
    message: response.message,
    data: mapData(rawData),
  };
};

export const mapPagedResponse = <T>(
  response: ResponseDTONew<unknown>,
  fallbackPage: number,
  fallbackPageSize: number,
  mapItem: (value: unknown) => T,
): ResponseDTONew<PagedResult<T>> => {
  const rawData = response.data ?? response.generalData;
  const firstLevelRecord = asRecord(rawData);
  const nestedPayload = firstLevelRecord.data;
  const dataRecord =
    nestedPayload && typeof nestedPayload === 'object' && !Array.isArray(nestedPayload) ? asRecord(nestedPayload) : firstLevelRecord;
  const items = asArray(
    dataRecord.data ??
      dataRecord.items ??
      dataRecord.list ??
      dataRecord.rows ??
      dataRecord.result ??
      dataRecord.results ??
      dataRecord.records ??
      rawData,
  );

  return {
    code: response.code,
    success: response.success,
    isSuccess: response.isSuccess,
    message: response.message,
    data: {
      page: pickNumber(dataRecord, 'page', 'currentPage', 'pageNumber') || fallbackPage,
      pageSize: pickNumber(dataRecord, 'pageSize', 'pagesize', 'limit', 'perPage') || fallbackPageSize,
      total: pickNumber(dataRecord, 'total', 'totalCount', 'count', 'recordsTotal', 'rowCount') || items.length,
      data: items.map(mapItem),
    },
  };
};

export const mapListResponse = <T>(response: ResponseDTONew<unknown>, mapItem: (value: unknown) => T): ResponseDTONew<T[]> => {
  const rawData = response.data ?? response.generalData;
  const items = asArray(rawData);
  return {
    code: response.code,
    success: response.success,
    isSuccess: response.isSuccess,
    message: response.message,
    data: items.map(mapItem),
  };
};
