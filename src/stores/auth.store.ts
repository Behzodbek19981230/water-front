import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthUser } from '@/lib/types';

/**
 * Auth store.
 *
 * Persist: localStorage'da saqlanadi — page reload'dan omon qoladi.
 * `hydrated` — SSR'da localStorage yo'q, shuning uchun client-da hydrate bo'lishini kutamiz.
 */
interface AuthState {
  user: AuthUser | null;
  hydrated: boolean;
  setUser: (u: AuthUser | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      hydrated: false,
      setUser: (u) => set({ user: u }),
      logout: () => set({ user: null }),
    }),
    {
      name: 'auth-storage',
      onRehydrateStorage: () => (state) => {
        if (state) state.hydrated = true;
      },
    },
  ),
);
