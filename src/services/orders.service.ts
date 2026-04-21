import { api } from '@/lib/api/client';
import { endpoints } from '@/lib/api/endpoints';
import type { CreateOrderPayload, Order, OrderStatus } from '@/lib/types';

export const ordersService = {
  create: (payload: CreateOrderPayload) =>
    api.post<Order>(endpoints.orders.create, payload).then((r) => r.data),

  myOrders: () => api.get<Order[]>(endpoints.orders.my).then((r) => r.data),

  adminAll: (status?: OrderStatus) =>
    api
      .get<Order[]>(endpoints.orders.adminAll, {
        params: status ? { status } : undefined,
      })
      .then((r) => r.data),

  getById: (id: number) => api.get<Order>(endpoints.orders.detail(id)).then((r) => r.data),

  assign: (orderId: number, courierId: number) =>
    api.post(endpoints.orders.assign(orderId), { courierId }).then((r) => r.data),

  updateStatus: (
    orderId: number,
    payload: { status: OrderStatus; note?: string },
  ) => api.patch(endpoints.orders.status(orderId), payload).then((r) => r.data),
};
