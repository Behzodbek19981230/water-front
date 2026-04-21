'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { getSocket } from '@/lib/socket';
import { queryKeys } from '@/lib/query-keys';
import { ordersService } from '@/services/orders.service';
import type { LocationUpdate, Order, OrderStatus } from '@/lib/types';
import { MapPin } from 'lucide-react';

const LiveMap = dynamic(() => import('@/components/LiveMap'), { ssr: false });

const STATUS: Record<OrderStatus, { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive' }> = {
  PENDING: { label: 'Kutilmoqda', variant: 'secondary' },
  ASSIGNED: { label: 'Kurier tayinlandi', variant: 'default' },
  ON_THE_WAY: { label: "Yo'lda", variant: 'default' },
  DELIVERED: { label: 'Yetkazildi', variant: 'outline' },
  CANCELLED: { label: 'Bekor qilindi', variant: 'destructive' },
};

export default function MyOrdersPage() {
  const qc = useQueryClient();
  const [trackingId, setTrackingId] = useState<number | null>(null);
  const [courierLoc, setCourierLoc] = useState<LocationUpdate | null>(null);

  const orders = useQuery({
    queryKey: queryKeys.orders.my(),
    queryFn: () => ordersService.myOrders(),
    refetchInterval: 15_000,
  });

  const cancel = useMutation({
    mutationFn: (id: number) =>
      ordersService.updateStatus(id, { status: 'CANCELLED', note: 'Client bekor qildi' }),
    onSuccess: () => {
      toast.success('Buyurtma bekor qilindi');
      void qc.invalidateQueries({ queryKey: queryKeys.orders.my() });
    },
  });

  useEffect(() => {
    const sock = getSocket();
    if (!sock || !trackingId) return;

    const order = orders.data?.find((o) => o.id === trackingId);
    const cid = order?.courier?.id;
    if (!cid) return;

    const handler = (p: LocationUpdate) => {
      if (p.courierId === cid) setCourierLoc(p);
    };

    sock.on('location:update', handler);
    return () => {
      sock.off('location:update', handler);
    };
  }, [trackingId, orders.data]);

  const trackedOrder = orders.data?.find((o) => o.id === trackingId);

  const markers =
    trackedOrder != null
      ? [
          {
            id: 'me',
            lat: trackedOrder.addressLat,
            lng: trackedOrder.addressLng,
            label: 'Mening manzilim',
            kind: 'client' as const,
          },
          ...(courierLoc
            ? [
                {
                  id: `c-${courierLoc.courierId}`,
                  lat: courierLoc.lat,
                  lng: courierLoc.lng,
                  label: `Kurier #${courierLoc.courierId}`,
                  kind: 'courier' as const,
                },
              ]
            : []),
        ]
      : [];

  return (
    <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1fr_400px]">
      <div className="space-y-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Mening buyurtmalarim</h2>
          <p className="text-sm text-muted-foreground">Status va kurierni kuzating</p>
        </div>

        {orders.data?.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              Hali buyurtma bermagansiz
            </CardContent>
          </Card>
        )}

        {orders.data?.map((o: Order) => {
          const active = ['ASSIGNED', 'ON_THE_WAY'].includes(o.status);
          const st = STATUS[o.status];
          return (
            <Card key={o.id}>
              <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-4 space-y-0">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <CardTitle className="text-lg">#{o.id}</CardTitle>
                    <Badge variant={st.variant}>{st.label}</Badge>
                  </div>
                  <CardDescription>
                    {new Date(o.createdAt).toLocaleString()} ·{' '}
                    {o.paymentType === 'CASH' ? 'Naqd' : 'Nasiya'}
                  </CardDescription>
                </div>
                <p className="text-xl font-bold tabular-nums text-primary">
                  {Number(o.totalPrice).toLocaleString()} so'm
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-1 text-sm">
                  {o.items.map((i) => (
                    <li key={i.id} className="flex justify-between gap-4">
                      <span>
                        {i.product?.name} ({i.product?.volume}L) × {i.quantity}
                      </span>
                      <span className="tabular-nums text-muted-foreground">
                        {(Number(i.priceAtOrder) * i.quantity).toLocaleString()} so'm
                      </span>
                    </li>
                  ))}
                </ul>

                {o.courier && (
                  <div className="rounded-lg border bg-muted/40 px-3 py-2 text-sm">
                    <span className="font-medium">Kurier:</span>{' '}
                    {o.courier.user.firstName} {o.courier.user.lastName} · {o.courier.user.phone}
                  </div>
                )}

                <Separator />

                <div className="flex flex-wrap gap-2">
                  {active && (
                    <Button
                      variant={trackingId === o.id ? 'default' : 'secondary'}
                      size="sm"
                      onClick={() => {
                        setTrackingId(o.id);
                        setCourierLoc(null);
                      }}
                    >
                      <MapPin className="mr-2 size-4" />
                      {trackingId === o.id ? 'Kuzatilmoqda' : 'Kurierni kuzatish'}
                    </Button>
                  )}
                  {(o.status === 'PENDING' || o.status === 'ASSIGNED') && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() =>
                        confirm('Buyurtmani bekor qilasizmi?') ? cancel.mutate(o.id) : undefined
                      }
                    >
                      Bekor qilish
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="lg:sticky lg:top-6 lg:self-start">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Xarita</CardTitle>
            <CardDescription>
              {trackingId && trackedOrder
                ? courierLoc
                  ? `Oxirgi yangilanish: ${new Date(courierLoc.at).toLocaleTimeString()}`
                  : 'Kurier harakati kutilmoqda...'
                : 'Buyurtmani tanlang va kurierni kuzating'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {trackingId && trackedOrder ? (
              <div className="h-[400px] overflow-hidden rounded-lg border">
                <LiveMap
                  markers={markers}
                  center={[trackedOrder.addressLat, trackedOrder.addressLng]}
                  zoom={14}
                  followId={courierLoc ? `c-${courierLoc.courierId}` : undefined}
                />
              </div>
            ) : (
              <div className="flex h-[280px] items-center justify-center rounded-lg border border-dashed text-center text-sm text-muted-foreground">
                Faol buyurtmani tanlang
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
