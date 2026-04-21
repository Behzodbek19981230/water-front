'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { z } from 'zod';
import { queryKeys } from '@/lib/query-keys';
import { organizationsService } from '@/services/organizations.service';
import { productsService } from '@/services/products.service';
import type { Organization, OrgProduct, Product } from '@/lib/types';
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';

const productSchema = z.object({
  name: z.string().min(2),
  volume: z.number().positive(),
});

const priceSchema = z.object({
  productId: z.number().int().positive(),
  price: z.number().min(0),
});

type ProductForm = z.infer<typeof productSchema>;
type PriceForm = z.infer<typeof priceSchema>;

export default function AdminProductsPage() {
  const [tab, setTab] = useState<'global' | 'prices'>('global');

  return (
    <Box sx={{ display: 'grid', gap: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          Mahsulotlar
        </Typography>
        <Box sx={{ display: 'inline-flex', border: '1px solid', borderColor: 'divider', borderRadius: 2, p: 0.5, gap: 0.5 }}>
          <Button
            variant={tab === 'global' ? 'contained' : 'text'}
            size="small"
            onClick={() => setTab('global')}
          >
            Global katalog
          </Button>
          <Button
            variant={tab === 'prices' ? 'contained' : 'text'}
            size="small"
            onClick={() => setTab('prices')}
          >
            Kompaniya narxlari
          </Button>
        </Box>
      </Box>

      {tab === 'global' ? <GlobalCatalog /> : <OrgPrices />}
    </Box>
  );
}

function GlobalCatalog() {
  const qc = useQueryClient();
  const form = useForm<ProductForm>({
    resolver: zodResolver(productSchema),
    defaultValues: { name: '', volume: 19 },
  });

  const products = useQuery({
    queryKey: queryKeys.products.list(),
    queryFn: () => productsService.listGlobal(),
  });

  const create = useMutation({
    mutationFn: (data: ProductForm) => productsService.createGlobal(data),
    onSuccess: () => {
      toast.success('Mahsulot qo‘shildi');
      void qc.invalidateQueries({ queryKey: queryKeys.products.all });
      form.reset({ name: '', volume: 19 });
    },
  });

  const del = useMutation({
    mutationFn: (id: number) => productsService.deactivate(id),
    onSuccess: () => void qc.invalidateQueries({ queryKey: queryKeys.products.all }),
  });

  return (
    <Paper sx={{ p: 2.5, borderRadius: 3 }}>
      <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
        Global katalog
      </Typography>
      <Box component="form" onSubmit={form.handleSubmit((v) => create.mutate(v))} sx={{ display: 'flex', gap: 1.25, mb: 2 }}>
        <Controller control={form.control} name="name" render={({ field }) => (
          <TextField {...field} label="Nomi" size="small" fullWidth />
        )} />
        <Controller control={form.control} name="volume" render={({ field }) => (
          <TextField size="small" type="number" label="Hajm (L)" value={field.value} onChange={(e) => field.onChange(Number(e.target.value))} sx={{ width: 140 }} />
        )} />
        <Button type="submit" variant="contained">Qo‘shish</Button>
      </Box>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>ID</TableCell>
            <TableCell>Nomi</TableCell>
            <TableCell>Hajmi</TableCell>
            <TableCell>Amal</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
              {products.data?.map((p: Product) => (
                <TableRow key={p.id}>
                  <TableCell sx={{ fontFamily: 'monospace' }}>#{p.id}</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>{p.name}</TableCell>
                  <TableCell>{p.volume} L</TableCell>
                  <TableCell>
                    <Button color="error" variant="outlined" size="small" onClick={() => del.mutate(p.id)}>
                      Deaktivatsiya
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
        </TableBody>
      </Table>
    </Paper>
  );
}

function OrgPrices() {
  const qc = useQueryClient();
  const [orgId, setOrgId] = useState(0);

  const form = useForm<PriceForm>({
    resolver: zodResolver(priceSchema),
    defaultValues: { productId: 0, price: 15000 },
  });

  const orgs = useQuery({
    queryKey: queryKeys.organizations.adminAll(),
    queryFn: () => organizationsService.listAdminAll(),
  });

  const products = useQuery({
    queryKey: queryKeys.products.list(),
    queryFn: () => productsService.listGlobal(),
  });

  const orgProducts = useQuery({
    queryKey: queryKeys.products.byOrgAdmin(orgId),
    enabled: orgId > 0,
    queryFn: () => productsService.listByOrgAdmin(orgId),
  });

  const setPriceMut = useMutation({
    mutationFn: (data: PriceForm) =>
      productsService.setOrgPrice(orgId, {
        productId: data.productId,
        price: data.price,
        isAvailable: true,
      }),
    onSuccess: () => {
      toast.success('Narx saqlandi');
      void qc.invalidateQueries({ queryKey: queryKeys.products.byOrgAdmin(orgId) });
    },
  });

  const remove = useMutation({
    mutationFn: (productId: number) => productsService.removeFromOrg(orgId, productId),
    onSuccess: () =>
      void qc.invalidateQueries({ queryKey: queryKeys.products.byOrgAdmin(orgId) }),
  });

  return (
    <Paper sx={{ p: 2.5, borderRadius: 3 }}>
      <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
        Kompaniya narxlari
      </Typography>
      <FormControl sx={{ minWidth: 280, mb: 2 }} size="small">
        <InputLabel>Kompaniya</InputLabel>
        <Select label="Kompaniya" value={orgId || ''} onChange={(e) => setOrgId(Number(e.target.value))}>
          {orgs.data?.map((o: Organization) => (
            <MenuItem key={o.id} value={o.id}>{o.name}</MenuItem>
          ))}
        </Select>
      </FormControl>

        {orgId > 0 && (
          <>
            <Box component="form" onSubmit={form.handleSubmit((v) => setPriceMut.mutate(v))} sx={{ display: 'flex', gap: 1.25, mb: 2 }}>
              <Controller control={form.control} name="productId" render={({ field }) => (
                <FormControl size="small" sx={{ minWidth: 280 }}>
                  <InputLabel>Mahsulot</InputLabel>
                  <Select label="Mahsulot" value={field.value || ''} onChange={(e) => field.onChange(Number(e.target.value))}>
                    {products.data?.map((p: Product) => (
                      <MenuItem key={p.id} value={p.id}>{p.name} ({p.volume}L)</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )} />
              <Controller control={form.control} name="price" render={({ field }) => (
                <TextField size="small" type="number" label="Narx" value={field.value} onChange={(e) => field.onChange(Number(e.target.value))} />
              )} />
              <Button type="submit" variant="contained">Saqlash</Button>
            </Box>

            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Mahsulot</TableCell>
                  <TableCell>Hajmi</TableCell>
                  <TableCell>Narx</TableCell>
                  <TableCell>Mavjud</TableCell>
                  <TableCell>Amal</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                  {orgProducts.data?.map((op: OrgProduct) => (
                    <TableRow key={op.id}>
                      <TableCell sx={{ fontWeight: 600 }}>{op.product.name}</TableCell>
                      <TableCell>{op.product.volume} L</TableCell>
                      <TableCell>
                        {Number(op.price).toLocaleString()} so‘m
                      </TableCell>
                      <TableCell>{op.isAvailable ? '✅' : '⛔'}</TableCell>
                      <TableCell>
                        {op.isAvailable && (
                          <Button variant="outlined" size="small" onClick={() => remove.mutate(op.productId)}>
                            Olib tashlash
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </>
        )}
    </Paper>
  );
}
