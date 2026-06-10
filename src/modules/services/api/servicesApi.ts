import { axiosInstance } from '@/shared/lib/axiosInstance';
import type { ServiceFilters, ServiceFormValues, ServiceRecord, ServicesResponseDto } from '@/modules/services/types/services';
import type { ResponseDTONew } from '@/shared/types/common';
import { mapPagedResponse, pickBoolean, pickNumber, pickString } from '@/shared/lib/apiMappers';
import { toAbsoluteAssetUrl } from '@/shared/utils/asset';

const getQatarServicePrice = (value: unknown): number => {
  const record = value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
  const servicePrices = Array.isArray(record.providerserviceTypePrices) ? record.providerserviceTypePrices : [];

  const qatarPrice = servicePrices.find((item) => {
    const itemRecord = item && typeof item === 'object' ? (item as Record<string, unknown>) : {};
    const country = itemRecord.country && typeof itemRecord.country === 'object' ? (itemRecord.country as Record<string, unknown>) : {};
    return country.country_iso_code === 'QAT' || country.currency_iso_code === 'QAR' || itemRecord.country_id === 4;
  });

  if (qatarPrice && typeof qatarPrice === 'object') {
    const price = qatarPrice.price;
    if (typeof price === 'number') {
      return price;
    }
    if (typeof price === 'string' && price.trim() && !Number.isNaN(Number(price))) {
      return Number(price);
    }
  }

  const firstPrice = servicePrices[0];
  if (firstPrice && typeof firstPrice === 'object') {
    const price = (firstPrice as Record<string, unknown>).price;
    if (typeof price === 'number') {
      return price;
    }
    if (typeof price === 'string' && price.trim() && !Number.isNaN(Number(price))) {
      return Number(price);
    }
  }

  return 0;
};

const mapServiceRecord = (value: unknown): ServiceRecord => {
  const nameEn = pickString(value, 'nameEn', 'titleen', 'title_en');
  const nameAr = pickString(value, 'nameAr', 'titlear', 'title_ar');
  const explicitPrice = pickNumber(value, 'countryPrice', 'startingPrice', 'StartingPrice', 'servicePrice', 'service_price', 'price', 'amount');

  return {
    id: pickString(value, 'id', 'serviceId', 'service_id'),
    name: pickString(value, 'name', 'title', 'serviceName', 'service_name') || nameEn || nameAr,
    nameEn: nameEn || undefined,
    nameAr: nameAr || undefined,
    iconUrl: toAbsoluteAssetUrl(pickString(value, 'iconUrl', 'photoURL', 'photoUrl', 'image', 'imageUrl', 'icon', 'logopath', 'photopath')),
    countryPrice: explicitPrice || getQatarServicePrice(value),
    isEmergency: pickBoolean(value, 'isEmergency', 'isemergency', 'emergency'),
  };
};

const buildServiceFormData = (payload: ServiceFormValues): FormData => {
  const formData = new FormData();
  formData.append('titleen', payload.titleEn);
  formData.append('titlear', payload.titleAr);
  formData.append('CategoryId', payload.categoryId);
  formData.append('StartingPrice', payload.startingPrice);
  formData.append('Currency', payload.currency);
  Array.from(payload.images ?? []).forEach((file) => {
    formData.append('Images', file);
  });
  return formData;
};

export const getServices = async (params: ServiceFilters): Promise<ServicesResponseDto> => {
  const response = await axiosInstance.get<ServicesResponseDto>('/api/AdminApp/Providerservicetypes/SearchData', {
    params: {
      search: params.search,
      page: params.page,
      limit: params.pageSize,
    },
  });
  return mapPagedResponse(response.data, params.page, params.pageSize, mapServiceRecord);
};

export const getActiveServicePriceList = async (): Promise<ResponseDTONew<ServiceRecord[]>> => {
  const response = await axiosInstance.get<ResponseDTONew<Array<{ id: string; name: string }>>>('/api/AdminApp/Providerservicetypes/GetAtiveServicePriceList');
  const rawItems = Array.isArray(response.data.data)
    ? response.data.data
    : Array.isArray(response.data.generalData)
      ? response.data.generalData
      : [];

  return {
    code: response.data.code,
    success: response.data.success,
    isSuccess: response.data.isSuccess,
    message: response.data.message,
    data: rawItems.map(mapServiceRecord),
  };
};

export const addService = async (payload: ServiceFormValues): Promise<ResponseDTONew<null>> => {
  const response = await axiosInstance.post<ResponseDTONew<null>>('/api/AdminApp/Providerservicetypes/Add', buildServiceFormData(payload), {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const editService = async (serviceId: string, payload: ServiceFormValues): Promise<ResponseDTONew<null>> => {
  const formData = buildServiceFormData(payload);
  formData.append('id', serviceId);
  const response = await axiosInstance.post<ResponseDTONew<null>>('/api/AdminApp/Providerservicetypes/Edit', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const setServiceEmergency = async (serviceId: string, isEmergency: boolean): Promise<ResponseDTONew<null>> => {
  const response = await axiosInstance.put<ResponseDTONew<null>>(`/api/AdminApp/Providerservicetypes/SetEmergency/${serviceId}`, undefined, {
    params: { isEmergency },
  });
  return response.data;
};
