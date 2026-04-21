'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useQuery } from '@tanstack/react-query';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { getSocket } from '@/lib/socket';
import { queryKeys } from '@/lib/query-keys';
import { ordersService } from '@/services/orders.service';
import type { LocationUpdate, Order } from '@/lib/types';
import { MapPin } from 'lucide-react';

const LiveMap = dynamic(() => import('@/components/LiveMap'), { ssr: false });

export default function AdminDashboard() {
  const [locations, setLocations] = useState<Map<number, LocationUpdate>>(
    new Map(),
  );

  const orders = useQuery({
    queryKey: queryKeys.orders.admin(),
    queryFn: () => ordersService.adminAll(),
    refetchInterval: 10_000,
  });

  useEffect(() => {
    const sock = getSocket();
    if (!sock) return;

    const onLoc = (p: LocationUpdate) => {
      setLocations((prev) => {
        const next = new Map(prev);
        next.set(p.courierId, p);
        return next;
      });
    };

    sock.on('location:update', onLoc);
    return () => {
      sock.off('location:update', onLoc);
    };
  }, []);

  const markers = Array.from(locations.values()).map((l) => ({
    id: l.courierId,
    lat: l.lat,
    lng: l.lng,
    label: `Courier #${l.courierId} · ${new Date(l.at).toLocaleTimeString()}`,
    kind: 'courier' as const,
  }));

  const pending =
    orders.data?.filter((o: Order) => o.status === 'PENDING').length ?? 0;
  const active =
    orders.data?.filter((o: Order) =>
      ['ASSIGNED', 'ON_THE_WAY'].includes(o.status),
    ).length ?? 0;
  const delivered =
    orders.data?.filter((o: Order) => o.status === 'DELIVERED').length ?? 0;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Jonli kurierlar" value={locations.size} />
        <StatCard label="Yangi orderlar" value={pending} />
        <StatCard label="Yetkazilmoqda" value={active} />
        <StatCard label="Yetkazilgan (ro'yxat)" value={delivered} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="size-5" />
            Jonli kurierlar xaritasi
          </CardTitle>
          <CardDescription>
            {locations.size === 0
              ? 'Hozircha kurierlar lokatsiyasi yoki online emas'
              : `${locations.size} ta kurier ko‘rsatilmoqda`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[500px] overflow-hidden rounded-lg border">
            <LiveMap markers={markers} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardDescription>{label}</CardDescription>
        <CardTitle className="text-3xl tabular-nums">{value}</CardTitle>
      </CardHeader>
    </Card>
  );
}
