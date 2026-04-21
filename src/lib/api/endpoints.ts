/**
 * Barcha REST endpoint pathlari — bitta joyda.
 * Query parametrlar servis ichida `params` orqali beriladi.
 */
export const endpoints = {
  auth: {
    login: '/auth/login',
    register: '/auth/register',
  },
  users: {
    me: '/users/me',
    myAddress: '/users/me/address',
  },
  geo: {
    regions: '/regions',
    districts: '/districts',
  },
  organizations: {
    byLocation: '/organizations',
    adminAll: '/organizations/admin/all',
    detail: (id: number) => `/organizations/${id}`,
  },
  products: {
    list: '/products',
    detail: (id: number) => `/products/${id}`,
    /** Public: org katalogi */
    byOrg: (orgId: number) => `/organizations/${orgId}/products`,
    /** Admin: org + narxlari */
    byOrgAdmin: (orgId: number) => `/organizations/${orgId}/products/admin`,
    setOrgPrice: (orgId: number) => `/organizations/${orgId}/products`,
    removeOrgProduct: (orgId: number, productId: number) =>
      `/organizations/${orgId}/products/${productId}`,
  },
  orders: {
    create: '/orders',
    my: '/orders/my',
    courierActive: '/orders/courier/active',
    adminAll: '/orders/admin/all',
    detail: (id: number) => `/orders/${id}`,
    assign: (id: number) => `/orders/${id}/assign`,
    status: (id: number) => `/orders/${id}/status`,
  },
  couriers: {
    adminAll: '/couriers/admin/all',
    create: '/couriers',
    live: '/couriers/live',
    liveByOrg: (orgId: number) => `/couriers/live/organization/${orgId}`,
    meOnline: '/couriers/me/online',
    meLocation: '/couriers/me/location',
  },
} as const;
