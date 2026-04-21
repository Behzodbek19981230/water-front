'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { z } from 'zod';
import { queryKeys } from '@/lib/query-keys';
import { geoService } from '@/services/geo.service';
import { organizationsService, type OrganizationAdmin } from '@/services/organizations.service';
import {
  Box,
  Button,
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

const schema = z.object({
  name: z.string().min(2),
  regionId: z.number().int().positive(),
  districtId: z.number().int().positive(),
});

type FormValues = z.infer<typeof schema>;

export default function AdminOrganizationsPage() {
  const [open, setOpen] = useState(false);

  const orgs = useQuery({
    queryKey: queryKeys.organizations.adminAll(),
    queryFn: () => organizationsService.listAdminAll(),
  });

  const qc = useQueryClient();
  const del = useMutation({
    mutationFn: (id: number) => organizationsService.softDelete(id),
    onSuccess: () => {
      toast.success('Kompaniya o‘chirildi');
      void qc.invalidateQueries({ queryKey: queryKeys.organizations.all });
    },
  });

  return (
    <Paper sx={{ p: 2.5, borderRadius: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Kompaniyalar
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Yetkazib beruvchi tashkilotlar
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<IconPlus size={16} />} onClick={() => setOpen(true)}>
          Yangi kompaniya
        </Button>
      </Box>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>ID</TableCell>
            <TableCell>Nomi</TableCell>
            <TableCell>Viloyat</TableCell>
            <TableCell>Tuman</TableCell>
            <TableCell>Amal</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
                {orgs.data?.map((o: OrganizationAdmin) => (
                  <TableRow key={o.id}>
                    <TableCell sx={{ fontFamily: 'monospace' }}>#{o.id}</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>{o.name}</TableCell>
                    <TableCell>{o.region?.name}</TableCell>
                    <TableCell>{o.district?.name}</TableCell>
                    <TableCell>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() =>
                          confirm('O‘chirilsinmi?') ? del.mutate(o.id) : undefined
                        }
                      >
                        O'chirish
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
        </TableBody>
      </Table>
      <CreateOrgDialog open={open} onClose={() => setOpen(false)} />
    </Paper>
  );
}

function CreateOrgDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const qc = useQueryClient();
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', regionId: 0, districtId: 0 },
  });

  const regionId = form.watch('regionId');

  const regions = useQuery({
    queryKey: queryKeys.geo.regions(),
    queryFn: () => geoService.listRegions(),
  });

  const districts = useQuery({
    queryKey: queryKeys.geo.districts(regionId),
    enabled: regionId > 0,
    queryFn: () => geoService.listDistricts(regionId),
  });

  const create = useMutation({
    mutationFn: (data: FormValues) => organizationsService.create(data),
    onSuccess: () => {
      toast.success('Yaratildi');
      void qc.invalidateQueries({ queryKey: queryKeys.organizations.all });
      onClose();
      form.reset();
    },
  });

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Yangi kompaniya</DialogTitle>
      <DialogContent>
        <Box component="form" onSubmit={form.handleSubmit((v) => create.mutate(v))} sx={{ display: 'grid', gap: 2, mt: 1 }}>
          <Controller control={form.control} name="name" render={({ field, fieldState }) => (
            <TextField {...field} label="Nomi" error={!!fieldState.error} helperText={fieldState.error?.message} />
          )} />
          <Controller control={form.control} name="regionId" render={({ field }) => (
            <FormControl fullWidth>
              <InputLabel>Viloyat</InputLabel>
              <Select
                label="Viloyat"
                value={field.value || ''}
                onChange={(e) => {
                  field.onChange(Number(e.target.value));
                  form.setValue('districtId', 0);
                }}
              >
                {regions.data?.map((r) => (
                  <MenuItem key={r.id} value={r.id}>{r.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          )} />
          <Controller control={form.control} name="districtId" render={({ field }) => (
            <FormControl fullWidth disabled={!regionId}>
              <InputLabel>Tuman</InputLabel>
              <Select label="Tuman" value={field.value || ''} onChange={(e) => field.onChange(Number(e.target.value))}>
                {districts.data?.map((d) => (
                  <MenuItem key={d.id} value={d.id}>{d.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
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
