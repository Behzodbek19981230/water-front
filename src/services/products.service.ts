import { api } from '@/lib/api/client';
import { endpoints } from '@/lib/api/endpoints';
import type { OrgProduct, Product } from '@/lib/types';

export const productsService = {
  listGlobal: () => api.get<Product[]>(endpoints.products.list).then((r) => r.data),

  createGlobal: (payload: { name: string; volume: number }) =>
    api.post<Product>(endpoints.products.list, payload).then((r) => r.data),

  deactivate: (id: number) => api.delete(endpoints.products.detail(id)).then((r) => r.data),

  listByOrg: (orgId: number) =>
    api.get<OrgProduct[]>(endpoints.products.byOrg(orgId)).then((r) => r.data),

  listByOrgAdmin: (orgId: number) =>
    api.get<OrgProduct[]>(endpoints.products.byOrgAdmin(orgId)).then((r) => r.data),

  setOrgPrice: (
    orgId: number,
    payload: { productId: number; price: number; isAvailable?: boolean },
  ) => api.post(endpoints.products.setOrgPrice(orgId), payload).then((r) => r.data),

  removeFromOrg: (orgId: number, productId: number) =>
    api.delete(endpoints.products.removeOrgProduct(orgId, productId)).then((r) => r.data),
};
