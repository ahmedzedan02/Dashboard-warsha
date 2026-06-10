import { axiosInstance } from '@/shared/lib/axiosInstance';
import type { OrderDetailsResponseDto, OrderFilters, OrdersResponseDto } from '@/modules/orders/types/orders';
import { mapPagedResponse, mapResponse, pickNumber, pickString } from '@/shared/lib/apiMappers';

const mapOrder = (value: unknown) => ({
  id: pickString(value, 'id', 'orderId', 'order_id'),
  orderNumber: pickString(value, 'orderNumber', 'orderNo', 'orderno', 'order_number', 'requestId', 'request_id'),
  providerId: pickString(value, 'providerId', 'provider_id'),
  providerName: pickString(value, 'providerName', 'providername', 'provider_name'),
  userId: pickString(value, 'userId', 'userid', 'user_id'),
  customerName: pickString(value, 'customerName', 'userName', 'username', 'customer_name'),
  status: pickString(value, 'status'),
  amount: pickNumber(value, 'amount', 'orderPrice', 'order_price', 'total', 'totalAmount', 'total_amount', 'orderTotal', 'order_total', 'price', 'finalPrice', 'final_price'),
  createdAt: pickString(value, 'createdAt', 'createdDate', 'created_at', 'orderDate', 'order_date'),
});

export const getOrders = async (params: OrderFilters): Promise<OrdersResponseDto> => {
  const response = await axiosInstance.get<OrdersResponseDto>('/api/AdminApp/Admin/orders', { params });
  return mapPagedResponse(response.data, params.page, params.pageSize, mapOrder);
};

export const getOrderById = async (orderId: string): Promise<OrderDetailsResponseDto> => {
  const response = await axiosInstance.get<OrderDetailsResponseDto>(`/api/AdminApp/Admin/orders/${orderId}`);
  return mapResponse(response.data, (value) => ({
    ...mapOrder(value),
    address: pickString(value, 'address', 'adress'),
    latitude: pickNumber(value, 'latitude', 'lat', 'locationn_lat') || undefined,
    longitude: pickNumber(value, 'longitude', 'lng', 'locationn_lang') || undefined,
    cancelReason: pickString(value, 'cancelReason', 'cancelreason', 'cancel_reason') || undefined,
  }));
};
