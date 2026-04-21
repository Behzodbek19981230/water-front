'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth.store';

/**
 * Root page — tokenga qarab yo'naltiradi:
 *   - ADMIN  → /admin
 *   - CLIENT → /shop
 *   - yo'q   → /login
 */
export default function Home() {
  const router = useRouter();
  const { user, hydrated } = useAuthStore();

  useEffect(() => {
    if (!hydrated) return;
    if (!user) router.replace('/login');
    else if (user.role === 'ADMIN') router.replace('/admin');
    else if (user.role === 'CLIENT') router.replace('/shop');
    else router.replace('/login');
  }, [user, hydrated, router]);

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="text-slate-500">Yuklanmoqda...</div>
    </div>
  );
}
