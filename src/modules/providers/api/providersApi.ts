import { axiosInstance } from '@/shared/lib/axiosInstance';
import type {
  ProviderDetailsResponseDto,
  ProviderFormValues,
  ProviderSearchFilters,
  ProvidersResponseDto,
} from '@/modules/providers/types/providers';
import type { ResponseDTONew } from '@/shared/types/common';
import { mapPagedResponse, mapResponse, pickArray, pickBoolean, pickNumber, pickString } from '@/shared/lib/apiMappers';
import { toAbsoluteAssetUrl } from '@/shared/utils/asset';

const createProviderFormData = (payload: ProviderFormValues): FormData => {
  const formData = new FormData();
  formData.append('provider_name', payload.provider_name);
  formData.append('email', payload.email);
  if (payload.password) {
    formData.append('password', payload.password);
  }
  formData.append('whatsapp', payload.whatsapp);
  formData.append('mobileno', payload.mobileno);
  formData.append('region_id', payload.region_id);

  if (payload.fcomplogo?.[0]) {
    formData.append('fcomplogo', payload.fcomplogo[0]);
  }

  Array.from(payload.fcompAttachments ?? []).forEach((file) => {
    formData.append('fcompAttachments', file);
  });

  return formData;
};

export const getProviders = async (params: ProviderSearchFilters): Promise<ProvidersResponseDto> => {
  const response = await axiosInstance.get<ProvidersResponseDto>('/api/AdminApp/Provider/SearchData', {
    params: {
      search: params.search,
      page: params.page,
      limit: params.pageSize,
    },
  });
  return mapPagedResponse(response.data, params.page, params.pageSize, (value) => ({
    id: pickString(value, 'id', 'providerId', 'provider_id'),
    providerName: pickString(value, 'providerName', 'provider_name'),
    email: pickString(value, 'email'),
    whatsapp: pickString(value, 'whatsapp'),
    mobileNo: pickString(value, 'mobileNo', 'mobileno', 'phone'),
    regionId: pickString(value, 'regionId', 'region_id'),
    countryName: pickString(value, 'countryName', 'country', 'country_name_en', 'country_name_ar') || undefined,
    logoUrl: toAbsoluteAssetUrl(pickString(value, 'logoUrl', 'logoURL', 'logopath')) || undefined,
    isActive: pickBoolean(value, 'isActive', 'active'),
    isPaperOk: pickBoolean(value, 'isPaperOk', 'paperOk', 'paperok'),
  }));
};

export const getProviderById = async (providerId: string): Promise<ProviderDetailsResponseDto> => {
  const response = await axiosInstance.get<ProviderDetailsResponseDto>(`/api/AdminApp/Provider/GetByID/${providerId}`);
  return mapResponse(response.data, (value) => {
    const record = Array.isArray(value) ? value[0] ?? {} : value;
    const countryRecord = record && typeof record === 'object' && 'country' in (record as Record<string, unknown>)
      ? (((record as Record<string, unknown>).country as Record<string, unknown> | null) ?? {})
      : {};

    return {
      id: pickString(record, 'id', 'providerId', 'provider_id'),
      providerName: pickString(record, 'providerName', 'provider_name'),
      email: pickString(record, 'email'),
      whatsapp: pickString(record, 'whatsapp'),
      mobileNo: pickString(record, 'mobileNo', 'mobileno', 'phone', 'phoneno'),
      regionId: pickString(record, 'regionId', 'region_id'),
      countryName: pickString(countryRecord, 'country_name_en', 'country_name_ar', 'countryvalue') || undefined,
      logoUrl: toAbsoluteAssetUrl(pickString(record, 'logoUrl', 'logoURL', 'logopath')) || undefined,
      isActive: pickBoolean(record, 'isActive', 'active'),
      isPaperOk: pickBoolean(record, 'isPaperOk', 'paperOk', 'paperok'),
      subscriptions: pickArray(record, 'subscriptions', 'servicetypesSelected').map((item) => ({
      id: pickString(item, 'id'),
      serviceName: pickString(item, 'serviceName', 'service', 'service_name'),
      status: pickString(item, 'status'),
    })),
      ratings: pickArray(record, 'ratings').map((item) => ({
      id: pickString(item, 'id'),
      score: pickNumber(item, 'score', 'rate', 'rating'),
      comment: pickString(item, 'comment', 'review'),
    })),
      documents: pickArray(record, 'documents', 'attachments').map((item) => ({
      id: pickString(item, 'id'),
      fileName: pickString(item, 'fileName', 'name', 'filename'),
      url: toAbsoluteAssetUrl(pickString(item, 'url', 'path', 'fileUrl')) ?? '',
    })),
    };
  });
};

export const addProvider = async (payload: ProviderFormValues): Promise<ResponseDTONew<null>> => {
  const response = await axiosInstance.post<ResponseDTONew<null>>('/api/AdminApp/Provider/Add', createProviderFormData(payload), {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const editProvider = async (providerId: string, payload: Omit<ProviderFormValues, 'password' | 'fcomplogo' | 'fcompAttachments'>): Promise<ResponseDTONew<null>> => {
  const response = await axiosInstance.post<ResponseDTONew<null>>(`/api/AdminApp/Provider/EditRecord/${providerId}`, payload);
  return response.data;
};

export const setProviderActive = async (providerId: string, isActive: boolean): Promise<ResponseDTONew<null>> => {
  const response = await axiosInstance.put<ResponseDTONew<null>>(`/api/AdminApp/Provider/SetActive/${providerId}`, undefined, {
    params: { isActive },
  });
  return response.data;
};

export const setProviderPaperOk = async (providerId: string, isPaperOk: boolean): Promise<ResponseDTONew<null>> => {
  const response = await axiosInstance.put<ResponseDTONew<null>>(`/api/AdminApp/Provider/SetPaperOk/${providerId}`, undefined, {
    params: { paperOk: isPaperOk },
  });
  return response.data;
};
