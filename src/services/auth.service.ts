import { api } from '@/lib/api/client';
import { endpoints } from '@/lib/api/endpoints';
import type { AuthUser, RegisterPayload } from '@/lib/types';

export const authService = {
  login: (phone: string, password: string) =>
    api
      .post<AuthUser>(endpoints.auth.login, { phone, password })
      .then((r) => r.data),

  register: (payload: RegisterPayload) =>
    api.post<AuthUser>(endpoints.auth.register, payload).then((r) => r.data),
};
