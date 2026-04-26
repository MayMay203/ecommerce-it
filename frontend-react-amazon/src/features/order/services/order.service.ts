import { api } from '@/shared/lib/axios';
import type { Order, CreateOrderDto, CancelOrderDto } from '../types/order.types';

interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const orderService = {
  createOrder: (dto: CreateOrderDto) =>
    api.post<{ data: Order }>('/orders/checkout', dto).then((r) => r.data.data),

  getOrders: (page: number = 1, limit: number = 10, status?: string) => {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
    });
    if (status) params.append('status', status);
    return api
      .get<PaginatedResponse<Order>>(`/orders?${params}`)
      .then((r) => r.data);
  },

  getOrderDetail: (orderId: number) =>
    api
      .get<{ data: Order }>(`/orders/${orderId}`)
      .then((r) => r.data.data),

  cancelOrder: (orderId: number, dto?: CancelOrderDto) =>
    api
      .patch<{ data: Order }>(`/orders/${orderId}/cancel`, dto || {})
      .then((r) => r.data.data),
};
