'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth.store';
import { connectSocket, getSocket } from '@/lib/socket';
import type { Role } from '@/lib/types';

/**
 * Client-side auth guard.
 * Har "protected" layout shu komponentda o'raladi.
 * `allowed` — ruxsat berilgan rollar.
 */
export default function AuthGuard({
  allowed,
  children,
}: {
  allowed: Role[];
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, hydrated } = useAuthStore();

  useEffect(() => {
    if (!hydrated) return;
    if (!user) {
      router.replace('/login');
      return;
    }
    if (!allowed.includes(user.role)) {
      router.replace('/');
      return;
    }
    // Tab qayta ochilganda ham socketni ulab qo'yamiz
    if (!getSocket()?.connected) connectSocket(user.accessToken);
  }, [user, hydrated, allowed, router]);

  if (!hydrated || !user) {
    return (
      <div className="flex h-screen items-center justify-center text-slate-500">
        Yuklanmoqda...
      </div>
    );
  }

  if (!allowed.includes(user.role)) return null;
  return <>{children}</>;
}
