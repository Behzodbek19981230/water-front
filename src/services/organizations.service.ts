import { api } from '@/lib/api/client';
import { endpoints } from '@/lib/api/endpoints';
import type { Organization } from '@/lib/types';

export interface OrganizationAdmin extends Organization {
  region?: { id: number; name: string };
  district?: { id: number; name: string };
}

export const organizationsService = {
  listByLocation: (regionId: number, districtId: number) =>
    api
      .get<Organization[]>(endpoints.organizations.byLocation, {
        params: { regionId, districtId },
      })
      .then((r) => r.data),

  listAdminAll: () =>
    api.get<OrganizationAdmin[]>(endpoints.organizations.adminAll).then((r) => r.data),

  create: (payload: { name: string; regionId: number; districtId: number }) =>
    api.post<Organization>(endpoints.organizations.byLocation, payload).then((r) => r.data),

  softDelete: (id: number) => api.delete(endpoints.organizations.detail(id)).then((r) => r.data),
};
