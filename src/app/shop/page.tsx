'use client';

import { useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { queryKeys } from '@/lib/query-keys';
import { useCartStore } from '@/stores/cart.store';
import { ordersService } from '@/services/orders.service';
import { productsService } from '@/services/products.service';
import { usersService } from '@/services/users.service';
import type { OrgProduct, PaymentType } from '@/lib/types';
import { Minus, Plus, ShoppingCart } from 'lucide-react';

export default function ShopPage() {
  const router = useRouter();
  const qc = useQueryClient();
  const cart = useCartStore();

  const me = useQuery({
    queryKey: queryKeys.users.me(),
    queryFn: () => usersService.getMe(),
  });

  const orgId = me.data?.defaultOrganizationId;

  const products = useQuery({
    queryKey: queryKeys.products.byOrg(orgId ?? 0),
    enabled: !!orgId,
    queryFn: () => productsService.listByOrg(orgId!),
  });

  const createOrder = useMutation({
    mutationFn: (paymentType: PaymentType) =>
      ordersService.create({
        items: cart.items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        paymentType,
      }),
    onSuccess: () => {
      toast.success('Buyurtma qabul qilindi');
      cart.clear();
      void qc.invalidateQueries({ queryKey: queryKeys.orders.my() });
      router.push('/shop/orders');
    },
  });

  if (me.isLoading) {
    return (
      <div className="flex h-40 items-center justify-center text-muted-foreground">
        Yuklanmoqda...
      </div>
    );
  }

  if (!me.data?.defaultOrganizationId) {
    return (
      <Card className="max-w-lg border-amber-200 bg-amber-50/50">
        <CardHeader>
          <CardTitle>Profil to‘liq emas</CardTitle>
          <CardDescription>
            Default kompaniya tanlanmagan. Iltimos, qo‘llab-quvvatlash orqali yangilang.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const total = cart.total();

  return (
    <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1fr_380px]">
      <div>
        <div className="mb-6">
          <h2 className="text-2xl font-semibold tracking-tight">Mahsulotlar</h2>
          <p className="text-sm text-muted-foreground">
            {me.data.defaultOrganization?.name ?? 'Kompaniya'}
          </p>
        </div>

        {products.isLoading && (
          <p className="text-muted-foreground">Mahsulotlar yuklanmoqda...</p>
        )}
        {products.data?.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              Bu kompaniyada mahsulotlar hali qo‘shilmagan
            </CardContent>
          </Card>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          {products.data?.map((p: OrgProduct) => {
            const inCart = cart.items.find((i) => i.productId === p.productId);
            return (
              <Card key={p.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-start gap-3">
                    <div className="flex size-12 items-center justify-center rounded-lg bg-primary/10 text-2xl">
                      💧
                    </div>
                    <div className="min-w-0 flex-1">
                      <CardTitle className="text-base leading-tight">{p.product.name}</CardTitle>
                      <CardDescription>{p.product.volume} L</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pb-3">
                  <p className="text-2xl font-bold tabular-nums text-primary">
                    {Number(p.price).toLocaleString()} so'm
                  </p>
                </CardContent>
                <CardFooter className="border-t bg-muted/30 pt-3">
                  {inCart ? (
                    <div className="flex w-full items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="shrink-0"
                        onClick={() => cart.update(p.productId, inCart.quantity - 1)}
                      >
                        <Minus className="size-4" />
                      </Button>
                      <span className="flex-1 text-center font-medium tabular-nums">
                        {inCart.quantity}
                      </span>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="shrink-0"
                        onClick={() => cart.update(p.productId, inCart.quantity + 1)}
                      >
                        <Plus className="size-4" />
                      </Button>
                    </div>
                  ) : (
                    <Button
                      className="w-full"
                      onClick={() =>
                        cart.add({
                          productId: p.productId,
                          name: p.product.name,
                          volume: p.product.volume,
                          price: Number(p.price),
                        })
                      }
                    >
                      Savatga qo‘shish
                    </Button>
                  )}
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </div>

      <div className="lg:sticky lg:top-6 lg:self-start">
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="size-5" />
              Savat
            </CardTitle>
            <CardDescription>Buyurtmani yakunlang</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {cart.items.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">Savat bo‘sh</p>
            ) : (
              <>
                <ul className="space-y-3">
                  {cart.items.map((i) => (
                    <li
                      key={i.productId}
                      className="flex items-start justify-between gap-2 text-sm"
                    >
                      <span className="min-w-0">
                        <span className="font-medium">{i.name}</span>
                        <span className="block text-xs text-muted-foreground">
                          {i.quantity} × {i.price.toLocaleString()}
                        </span>
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-auto shrink-0 p-0 text-destructive hover:bg-transparent"
                        onClick={() => cart.remove(i.productId)}
                      >
                        olib tashlash
                      </Button>
                    </li>
                  ))}
                </ul>
                <Separator />
                <div className="flex items-center justify-between text-lg font-semibold">
                  <span>Jami</span>
                  <span className="tabular-nums text-primary">{total.toLocaleString()} so'm</span>
                </div>
                <div className="rounded-lg border bg-muted/30 p-3 text-sm">
                  <p className="mb-1 text-xs font-medium text-muted-foreground">Yetkazish manzili</p>
                  <p>{me.data?.addressLine ?? '—'}</p>
                </div>
                <div className="flex flex-col gap-2">
                  <Button
                    disabled={createOrder.isPending}
                    onClick={() => createOrder.mutate('CASH')}
                  >
                    Naqd to‘lov
                  </Button>
                  <Button
                    variant="outline"
                    disabled={createOrder.isPending}
                    onClick={() => createOrder.mutate('CREDIT')}
                  >
                    Nasiyaga
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
