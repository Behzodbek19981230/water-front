'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Controller, useForm } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { z } from 'zod';
import { connectSocket } from '@/lib/socket';
import { queryKeys } from '@/lib/query-keys';
import { useAuthStore } from '@/stores/auth.store';
import { authService } from '@/services/auth.service';
import { geoService } from '@/services/geo.service';
import { organizationsService } from '@/services/organizations.service';
import { DEFAULT_ADDRESS_POSITION } from '@/lib/map-defaults';
import {
  Box,
  Button,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import { IconDroplet } from '@tabler/icons-react';

const AddressPickerMap = dynamic(
  () => import('@/components/AddressPickerMap').then((m) => m.AddressPickerMap),
  { ssr: false, loading: () => <div className="h-[280px] rounded-lg border bg-muted animate-pulse" /> },
);

const schema = z.object({
  firstName: z.string().min(2, 'Kamida 2 belgi'),
  lastName: z.string().min(2, 'Kamida 2 belgi'),
  phone: z.string().min(10),
  password: z.string().min(8).regex(/\d/, 'Kamida bitta raqam'),
  regionId: z.number().int().positive({ message: 'Viloyatni tanlang' }),
  districtId: z.number().int().positive({ message: 'Tumanni tanlang' }),
  organizationId: z.number().int().positive({ message: 'Kompaniyani tanlang' }),
  addressLine: z.string().min(3),
  lat: z.number(),
  lng: z.number(),
});

type FormValues = z.infer<typeof schema>;

export default function RegisterPage() {
  const router = useRouter();
  const setUser = useAuthStore((s) => s.setUser);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      firstName: '',
      lastName: '',
      phone: '+998',
      password: '',
      regionId: 0,
      districtId: 0,
      organizationId: 0,
      addressLine: '',
      lat: DEFAULT_ADDRESS_POSITION.lat,
      lng: DEFAULT_ADDRESS_POSITION.lng,
    },
  });

  const regionId = form.watch('regionId');
  const districtId = form.watch('districtId');
  const mapLat = form.watch('lat');
  const mapLng = form.watch('lng');

  const regions = useQuery({
    queryKey: queryKeys.geo.regions(),
    queryFn: () => geoService.listRegions(),
  });

  const districts = useQuery({
    queryKey: queryKeys.geo.districts(regionId),
    enabled: regionId > 0,
    queryFn: () => geoService.listDistricts(regionId),
  });

  const orgs = useQuery({
    queryKey: queryKeys.organizations.byLocation(regionId, districtId),
    enabled: regionId > 0 && districtId > 0,
    queryFn: () => organizationsService.listByLocation(regionId, districtId),
  });

  async function onSubmit(values: FormValues) {
    try {
      const data = await authService.register({
        firstName: values.firstName,
        lastName: values.lastName,
        phone: values.phone,
        password: values.password,
        regionId: values.regionId,
        districtId: values.districtId,
        organizationId: values.organizationId,
        addressLine: values.addressLine,
        lat: values.lat,
        lng: values.lng,
      });
      setUser(data);
      connectSocket(data.accessToken);
      toast.success("Ro'yxatdan o'tdingiz!");
      router.replace('/shop');
    } catch {
      /* interceptor */
    }
  }

  return (
    <Box className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-8">
      <Paper elevation={3} sx={{ width: '100%', maxWidth: 860, p: { xs: 2.5, md: 4 }, borderRadius: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, mb: 3 }}>
          <IconDroplet size={34} color="#0284c7" />
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Ro&apos;yxatdan o&apos;tish
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Profil ma&apos;lumotlaringizni kiriting
          </Typography>
        </Box>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
            <Box>
              <Controller
                control={form.control}
                name="firstName"
                render={({ field, fieldState }) => (
                  <TextField {...field} label="Ism" fullWidth error={!!fieldState.error} helperText={fieldState.error?.message} />
                )}
              />
            </Box>
            <Box>
              <Controller
                control={form.control}
                name="lastName"
                render={({ field, fieldState }) => (
                  <TextField {...field} label="Familiya" fullWidth error={!!fieldState.error} helperText={fieldState.error?.message} />
                )}
              />
            </Box>
            <Box>
              <Controller
                control={form.control}
                name="phone"
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    label="Telefon"
                    placeholder="+998901234567"
                    fullWidth
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                  />
                )}
              />
            </Box>
            <Box>
              <Controller
                control={form.control}
                name="password"
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    type="password"
                    label="Parol"
                    fullWidth
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                  />
                )}
              />
            </Box>

            <Box>
              <Controller
                control={form.control}
                name="regionId"
                render={({ field, fieldState }) => (
                  <FormControl fullWidth error={!!fieldState.error}>
                    <InputLabel>Viloyat</InputLabel>
                    <Select
                      label="Viloyat"
                      value={field.value || ''}
                      onChange={(e) => {
                        field.onChange(Number(e.target.value));
                        form.setValue('districtId', 0);
                        form.setValue('organizationId', 0);
                      }}
                    >
                      {regions.data?.map((r) => (
                        <MenuItem key={r.id} value={r.id}>
                          {r.name}
                        </MenuItem>
                      ))}
                    </Select>
                    <FormHelperText>{fieldState.error?.message}</FormHelperText>
                  </FormControl>
                )}
              />
            </Box>

            <Box>
              <Controller
                control={form.control}
                name="districtId"
                render={({ field, fieldState }) => (
                  <FormControl fullWidth error={!!fieldState.error} disabled={!regionId}>
                    <InputLabel>Tuman</InputLabel>
                    <Select
                      label="Tuman"
                      value={field.value || ''}
                      onChange={(e) => {
                        field.onChange(Number(e.target.value));
                        form.setValue('organizationId', 0);
                      }}
                    >
                      {districts.data?.map((d) => (
                        <MenuItem key={d.id} value={d.id}>
                          {d.name}
                        </MenuItem>
                      ))}
                    </Select>
                    <FormHelperText>{fieldState.error?.message}</FormHelperText>
                  </FormControl>
                )}
              />
            </Box>

            <Box sx={{ gridColumn: { xs: '1 / -1', md: '1 / -1' }, display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
              <Box>
              <Controller
                control={form.control}
                name="organizationId"
                render={({ field, fieldState }) => (
                  <FormControl fullWidth error={!!fieldState.error} disabled={!districtId}>
                    <InputLabel>Kompaniya</InputLabel>
                    <Select
                      label="Kompaniya"
                      value={field.value || ''}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    >
                      {orgs.data?.map((o) => (
                        <MenuItem key={o.id} value={o.id}>
                          {o.name}
                        </MenuItem>
                      ))}
                    </Select>
                    <FormHelperText>{fieldState.error?.message}</FormHelperText>
                  </FormControl>
                )}
              />
              </Box>
              <Box>
                <Controller
                  control={form.control}
                  name="addressLine"
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      label="Manzil"
                      placeholder="Chilonzor 5, 42-uy"
                      fullWidth
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                    />
                  )}
                />
              </Box>
            </Box>

            <Box sx={{ gridColumn: '1 / -1' }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Yetkazish joyi (xarita)
              </Typography>
              <AddressPickerMap
                lat={mapLat}
                lng={mapLng}
                onPositionChange={(la, ln) => {
                  form.setValue('lat', la, { shouldValidate: true, shouldDirty: true });
                  form.setValue('lng', ln, { shouldValidate: true, shouldDirty: true });
                }}
              />
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                {mapLat.toFixed(6)}, {mapLng.toFixed(6)}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                Marker boshlang‘ichda Toshkent markazida turadi. Uni sudrang yoki xaritaga bosing.
              </Typography>
            </Box>

            <Box sx={{ gridColumn: '1 / -1' }}>
              <Button type="submit" variant="contained" size="large" fullWidth disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Yaratilyapti...' : "Ro'yxatdan o'tish"}
              </Button>
            </Box>
          </Box>
        </form>

        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mt: 2.5 }}>
          Hisobingiz bormi?{' '}
          <Link href="/login" className="font-semibold text-sky-700 hover:underline">
            Kirish
          </Link>
        </Typography>
      </Paper>
    </Box>
  );
}
