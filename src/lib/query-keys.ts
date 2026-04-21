/**
 * React Query cache kalitlari — har servis uchun alohida factory.
 * Nomlash: `['domain', ...params]` — invalidatsiya qulay bo'lishi uchun.
 */
export const queryKeys = {
  auth: {
    all: ['auth'] as const,
  },
  users: {
    all: ['users'] as const,
    me: () => [...queryKeys.users.all, 'me'] as const,
  },
  geo: {
    all: ['geo'] as const,
    regions: () => [...queryKeys.geo.all, 'regions'] as const,
    districts: (regionId: number) => [...queryKeys.geo.all, 'districts', regionId] as const,
  },
  organizations: {
    all: ['organizations'] as const,
    byLocation: (regionId: number, districtId: number) =>
      [...queryKeys.organizations.all, 'byLocation', regionId, districtId] as const,
    adminAll: () => [...queryKeys.organizations.all, 'adminAll'] as const,
  },
  products: {
    all: ['products'] as const,
    list: () => [...queryKeys.products.all, 'list'] as const,
    byOrg: (orgId: number) => [...queryKeys.products.all, 'byOrg', orgId] as const,
    byOrgAdmin: (orgId: number) => [...queryKeys.products.all, 'byOrgAdmin', orgId] as const,
  },
  orders: {
    all: ['orders'] as const,
    my: () => [...queryKeys.orders.all, 'my'] as const,
    admin: (status?: string) => [...queryKeys.orders.all, 'admin', status ?? 'all'] as const,
    detail: (id: number) => [...queryKeys.orders.all, 'detail', id] as const,
  },
  couriers: {
    all: ['couriers'] as const,
    adminAll: (orgId?: number) =>
      [...queryKeys.couriers.all, 'adminAll', orgId ?? 'all'] as const,
  },
} as const;
