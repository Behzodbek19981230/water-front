'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { queryKeys } from '@/lib/query-keys';
import { couriersService } from '@/services/couriers.service';
import { ordersService } from '@/services/orders.service';
import type { Courier, Order, OrderStatus } from '@/lib/types';
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';

const STATUS_COLOR: Record<OrderStatus, 'default' | 'warning' | 'info' | 'success' | 'error'> = {
  PENDING: 'warning',
  ASSIGNED: 'info',
  ON_THE_WAY: 'info',
  DELIVERED: 'success',
  CANCELLED: 'error',
};

export default function AdminOrdersPage() {
  const [status, setStatus] = useState<OrderStatus | ''>('');
  const qc = useQueryClient();

  const orders = useQuery({
    queryKey: queryKeys.orders.admin(status || undefined),
    queryFn: () => ordersService.adminAll(status || undefined),
  });

  return (
    <Box>
      <Paper sx={{ p: 2.5, borderRadius: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, gap: 2 }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Orderlar
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Barcha buyurtmalar — status bo&apos;yicha filtr
            </Typography>
          </Box>
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Status</InputLabel>
            <Select
              label="Status"
              value={status || 'all'}
              onChange={(e) =>
                setStatus(e.target.value === 'all' ? '' : (e.target.value as OrderStatus))
              }
            >
              <MenuItem value="all">Barchasi</MenuItem>
              <MenuItem value="PENDING">PENDING</MenuItem>
              <MenuItem value="ASSIGNED">ASSIGNED</MenuItem>
              <MenuItem value="ON_THE_WAY">ON_THE_WAY</MenuItem>
              <MenuItem value="DELIVERED">DELIVERED</MenuItem>
              <MenuItem value="CANCELLED">CANCELLED</MenuItem>
            </Select>
          </FormControl>
        </Box>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Client</TableCell>
                <TableCell>Kompaniya</TableCell>
                <TableCell>Mahsulotlar</TableCell>
                <TableCell align="right">Jami</TableCell>
                <TableCell>Courier</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Sana</TableCell>
                <TableCell>Amal</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
                {orders.data?.map((o) => (
                  <TableRow key={o.id} hover>
                    <TableCell sx={{ color: 'text.secondary', fontFamily: 'monospace' }}>#{o.id}</TableCell>
                    <TableCell>
                      <Typography sx={{ fontWeight: 600, fontSize: 14 }}>
                        {o.client?.firstName} {o.client?.lastName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {o.client?.phone}
                      </Typography>
                    </TableCell>
                    <TableCell>{o.organization?.name}</TableCell>
                    <TableCell sx={{ maxWidth: 220, color: 'text.secondary' }}>
                      {o.items.map((i) => `${i.product?.name} ×${i.quantity}`).join(', ')}
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>
                      {Number(o.totalPrice).toLocaleString()} soʻm
                    </TableCell>
                    <TableCell>
                      {o.courier
                        ? `${o.courier.user.firstName} ${o.courier.user.lastName}`
                        : '—'}
                    </TableCell>
                    <TableCell>
                      <Chip size="small" color={STATUS_COLOR[o.status]} label={o.status} />
                    </TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap', fontSize: 12, color: 'text.secondary' }}>
                      {new Date(o.createdAt).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      {o.status === 'PENDING' && (
                        <AssignDialog
                          order={o}
                          onDone={() => {
                            void qc.invalidateQueries({ queryKey: queryKeys.orders.all });
                          }}
                        />
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {orders.data?.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={9} sx={{ py: 6, textAlign: 'center', color: 'text.secondary' }}>
                      Orderlar yo'q
                    </TableCell>
                  </TableRow>
                )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
}

function AssignDialog({
  order,
  onDone,
}: {
  order: Order;
  onDone: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [courierId, setCourierId] = useState<string>('');

  const couriers = useQuery({
    queryKey: queryKeys.couriers.adminAll(order.organizationId),
    enabled: open,
    queryFn: () => couriersService.listAdminAll(order.organizationId),
  });

  const assign = useMutation({
    mutationFn: () => ordersService.assign(order.id, Number(courierId)),
    onSuccess: () => {
      toast.success('Courier tayinlandi');
      setOpen(false);
      onDone();
    },
  });

  const orgCouriers =
    couriers.data?.filter((c: Courier) => c.organizationId === order.organizationId) ?? [];

  return (
    <>
      <Button size="small" variant="contained" onClick={() => setOpen(true)}>
        Tayinlash
      </Button>
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Order #{order.id} — courier tanlang</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 1 }}>
            <InputLabel>Kurier</InputLabel>
            <Select
              label="Kurier"
              value={courierId}
              onChange={(e) => setCourierId(String(e.target.value))}
            >
              {orgCouriers.map((c: Courier) => (
                <MenuItem key={c.id} value={String(c.id)}>
                  #{c.id} {c.user?.firstName} {c.isOnline ? '🟢' : '⚫'}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" onClick={() => setOpen(false)}>
            Bekor
          </Button>
          <Button disabled={!courierId || assign.isPending} onClick={() => assign.mutate()}>
            Saqlash
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
