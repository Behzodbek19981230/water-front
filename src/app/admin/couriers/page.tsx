'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { z } from 'zod';
import { queryKeys } from '@/lib/query-keys';
import { couriersService } from '@/services/couriers.service';
import { organizationsService } from '@/services/organizations.service';
import type { Courier, Organization } from '@/lib/types';
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
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { IconPlus } from '@tabler/icons-react';

const createSchema = z.object({
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  phone: z.string().min(10),
  password: z.string().min(8).regex(/\d/, 'Kamida bitta raqam'),
  organizationId: z.number().int().positive(),
  capacity: z.number().int().min(0),
});

type CreateForm = z.infer<typeof createSchema>;

export default function AdminCouriersPage() {
  const [open, setOpen] = useState(false);

  const couriers = useQuery({
    queryKey: queryKeys.couriers.adminAll(),
    queryFn: () => couriersService.listAdminAll(),
  });

  return (
    <Paper sx={{ p: 2.5, borderRadius: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Kurierlar
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Barcha yetkazib beruvchilar
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<IconPlus size={16} />} onClick={() => setOpen(true)}>
          Yangi kurier
        </Button>
      </Box>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>ID</TableCell>
            <TableCell>Ism</TableCell>
            <TableCell>Telefon</TableCell>
            <TableCell>Kompaniya</TableCell>
            <TableCell>Sig'im</TableCell>
            <TableCell>Holat</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
                {couriers.data?.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell sx={{ fontFamily: 'monospace' }}>#{c.id}</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>
                      {c.user?.firstName} {c.user?.lastName}
                    </TableCell>
                    <TableCell>{c.user?.phone}</TableCell>
                    <TableCell>{c.organization?.name}</TableCell>
                    <TableCell>{c.capacity}</TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        color={c.isOnline ? 'success' : 'default'}
                        label={c.isOnline ? 'Online' : 'Offline'}
                      />
                    </TableCell>
                  </TableRow>
                ))}
        </TableBody>
      </Table>
      <CreateCourierForm open={open} onClose={() => setOpen(false)} />
    </Paper>
  );
}

function CreateCourierForm({ open, onClose }: { open: boolean; onClose: () => void }) {
  const qc = useQueryClient();
  const orgs = useQuery({
    queryKey: queryKeys.organizations.adminAll(),
    queryFn: () => organizationsService.listAdminAll(),
  });

  const form = useForm<CreateForm>({
    resolver: zodResolver(createSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      phone: '+998',
      password: '',
      organizationId: 0,
      capacity: 20,
    },
  });

  const create = useMutation({
    mutationFn: (data: CreateForm) => couriersService.create(data),
    onSuccess: () => {
      toast.success('Kurier yaratildi');
      void qc.invalidateQueries({ queryKey: queryKeys.couriers.all });
      onClose();
      form.reset();
    },
  });

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Yangi kurier</DialogTitle>
      <DialogContent sx={{ pt: 1 }}>
        <Box component="form" onSubmit={form.handleSubmit((v) => create.mutate(v))} sx={{ display: 'grid', gap: 2, mt: 1 }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
            <Controller control={form.control} name="firstName" render={({ field, fieldState }) => (
              <TextField {...field} label="Ism" error={!!fieldState.error} helperText={fieldState.error?.message} />
            )} />
            <Controller control={form.control} name="lastName" render={({ field, fieldState }) => (
              <TextField {...field} label="Familiya" error={!!fieldState.error} helperText={fieldState.error?.message} />
            )} />
          </Box>
          <Controller control={form.control} name="phone" render={({ field, fieldState }) => (
            <TextField {...field} label="Telefon" error={!!fieldState.error} helperText={fieldState.error?.message} />
          )} />
          <Controller control={form.control} name="password" render={({ field, fieldState }) => (
            <TextField {...field} label="Parol" type="password" error={!!fieldState.error} helperText={fieldState.error?.message} />
          )} />
          <Controller control={form.control} name="organizationId" render={({ field }) => (
            <FormControl fullWidth>
              <InputLabel>Kompaniya</InputLabel>
              <Select label="Kompaniya" value={field.value || ''} onChange={(e) => field.onChange(Number(e.target.value))}>
                {orgs.data?.map((o: Organization) => (
                  <MenuItem key={o.id} value={o.id}>{o.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          )} />
          <Controller control={form.control} name="capacity" render={({ field }) => (
            <TextField type="number" label="Sig'im (bachok)" value={field.value} onChange={(e) => field.onChange(Number(e.target.value))} />
          )} />
          <DialogActions sx={{ px: 0 }}>
            <Button variant="outlined" onClick={onClose}>Bekor</Button>
            <Button type="submit" disabled={create.isPending}>Yaratish</Button>
          </DialogActions>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
