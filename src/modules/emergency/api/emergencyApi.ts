import { axiosInstance } from '@/shared/lib/axiosInstance';
import type { EmergencyPackagePayload, EmergencyPackageResponseDto } from '@/modules/emergency/types/emergency';
import type { ResponseDTONew } from '@/shared/types/common';
import { mapListResponse, pickNumber, pickString } from '@/shared/lib/apiMappers';

export const getEmergencyPackage = async (): Promise<EmergencyPackageResponseDto> => {
  const response = await axiosInstance.get<EmergencyPackageResponseDto>('/api/AdminApp/Emergency/package');
  return mapListResponse(response.data, (value) => {
    const record = value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
    const services = Array.isArray(record.services) ? record.services : [];

    return {
      id: pickString(record, 'id'),
      name: pickString(record, 'name'),
      price: pickNumber(record, 'price'),
      isActive: typeof record.isActive === 'boolean' ? record.isActive : undefined,
      createdAt: pickString(record, 'createdAt', 'created_at') || undefined,
      serviceIds: services.map((service) => pickString(service, 'id')).filter(Boolean),
      services: services.map((service) => ({
        id: pickString(service, 'id'),
        name: pickString(service, 'name', 'serviceName', 'service_name'),
        price: pickNumber(service, 'price'),
        currency: pickString(service, 'currency', 'currencyCode') || null,
      })),
    };
  });
};

export const createEmergencyPackage = async (payload: EmergencyPackagePayload): Promise<ResponseDTONew<null>> => {
  const response = await axiosInstance.post<ResponseDTONew<null>>('/api/AdminApp/Emergency/package', payload);
  return response.data;
};

export const updateEmergencyPackage = async (packageId: string, payload: EmergencyPackagePayload): Promise<ResponseDTONew<null>> => {
  const response = await axiosInstance.put<ResponseDTONew<null>>(`/api/AdminApp/Emergency/package/${packageId}`, payload);
  return response.data;
};
