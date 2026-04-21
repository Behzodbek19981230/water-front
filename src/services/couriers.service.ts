import { api } from '@/lib/api/client';
import { endpoints } from '@/lib/api/endpoints';
import type { Courier, LocationUpdate } from '@/lib/types';

export const couriersService = {
  listAdminAll: (organizationId?: number) =>
    api
      .get<Courier[]>(endpoints.couriers.adminAll, {
        params: organizationId ? { organizationId } : undefined,
      })
      .then((r) => r.data),

  create: (payload: {
    firstName: string;
    lastName: string;
    phone: string;
    password: string;
    organizationId: number;
    capacity?: number;
  }) => api.post(endpoints.couriers.create, payload).then((r) => r.data),

  liveAll: () => api.get<LocationUpdate[]>(endpoints.couriers.live).then((r) => r.data),

  liveByOrg: (orgId: number) =>
    api.get<LocationUpdate[]>(endpoints.couriers.liveByOrg(orgId)).then((r) => r.data),
};
