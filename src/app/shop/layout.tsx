'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import AuthGuard from '@/components/AuthGuard';
import TopBar from '@/components/TopBar';

const NAV = [
  { href: '/shop', label: 'Mahsulotlar' },
  { href: '/shop/orders', label: 'Mening orderlarim' },
];

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  return (
    <AuthGuard allowed={['CLIENT']}>
      <div className="flex min-h-screen flex-col">
        <TopBar title="💧 Water Shop" />
        <nav className="flex gap-1 border-b bg-white px-6">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className={`border-b-2 px-4 py-3 text-sm font-medium transition ${
                path === n.href
                  ? 'border-brand-500 text-brand-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </AuthGuard>
  );
}
