import { api } from '@/lib/api/client';
import { endpoints } from '@/lib/api/endpoints';
import type { UserMe } from '@/lib/types';

export const usersService = {
  getMe: () => api.get<UserMe>(endpoints.users.me).then((r) => r.data),

  updateAddress: (payload: { addressLine: string; lat: number; lng: number }) =>
    api.put(endpoints.users.myAddress, payload).then((r) => r.data),
};
