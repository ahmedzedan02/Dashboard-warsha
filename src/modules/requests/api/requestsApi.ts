import { axiosInstance } from '@/shared/lib/axiosInstance';
import type { RequestDetailsResponseDto, RequestFilters, RequestsResponseDto } from '@/modules/requests/types/requests';
import { mapPagedResponse, mapResponse, pickNumber, pickString } from '@/shared/lib/apiMappers';

const mapRequest = (value: unknown) => ({
  id: pickString(value, 'id', 'requestId', 'request_id'),
  orderNumber: pickString(value, 'orderNumber', 'requestNumber', 'orderNo'),
  userName: pickString(value, 'userName', 'username', 'customerName', 'customer_name'),
  service: pickString(value, 'service', 'serviceName', 'service_name'),
  budget: pickNumber(value, 'budget', 'budgetPrice', 'budget_price', 'requestBudget', 'request_budget', 'budgetAmount', 'budget_amount', 'amount', 'price'),
  address: pickString(value, 'address', 'adress'),
  offers: pickNumber(value, 'offers', 'offerCount', 'offer_count', 'offersCount', 'offers_count'),
  status: pickString(value, 'status'),
  createdAt: pickString(value, 'createdAt', 'createdDate', 'created_at', 'requestDate', 'request_date'),
});

export const getRequests = async (params: RequestFilters): Promise<RequestsResponseDto> => {
  const response = await axiosInstance.get<RequestsResponseDto>('/api/AdminApp/Admin/requests', { params });
  return mapPagedResponse(response.data, params.page, params.pageSize, mapRequest);
};

export const getRequestById = async (requestId: string): Promise<RequestDetailsResponseDto> => {
  const response = await axiosInstance.get<RequestDetailsResponseDto>(`/api/AdminApp/Admin/requests/${requestId}`);
  return mapResponse(response.data, (value) => ({
    ...mapRequest(value),
    phone: pickString(value, 'phone', 'mobileno', 'mobileNo'),
    email: pickString(value, 'email'),
    expectedStartDate: pickString(value, 'expectedStartDate', 'expected_start_date', 'scheduledDate') || undefined,
    latitude: pickNumber(value, 'latitude', 'lat', 'locationn_lat') || undefined,
    longitude: pickNumber(value, 'longitude', 'lng', 'locationn_lang') || undefined,
  }));
};
