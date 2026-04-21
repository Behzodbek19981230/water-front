'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { connectSocket } from '@/lib/socket';
import { useAuthStore } from '@/stores/auth.store';
import { authService } from '@/services/auth.service';
import { Box, Button, Paper, TextField, Typography } from '@mui/material';
import { IconDroplet } from '@tabler/icons-react';

const schema = z.object({
  phone: z.string().min(10, 'Telefonni kiriting'),
  password: z.string().min(1, 'Parol kiriting'),
});

type FormValues = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const setUser = useAuthStore((s) => s.setUser);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { phone: '+998', password: '' },
  });

  async function onSubmit(values: FormValues) {
    try {
      const data = await authService.login(values.phone, values.password);
      setUser(data);
      connectSocket(data.accessToken);
      toast.success('Xush kelibsiz!');
      if (data.role === 'ADMIN') router.replace('/admin');
      else if (data.role === 'CLIENT') router.replace('/shop');
      else router.replace('/');
    } catch {
      /* interceptor toast */
    }
  }

  return (
    <Box className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
      <Paper elevation={3} sx={{ width: '100%', maxWidth: 420, p: 4, borderRadius: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, mb: 3 }}>
          <IconDroplet size={36} color="#0284c7" />
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Water Delivery
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Tizimga kirish
          </Typography>
        </Box>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.2 }}>
            <Controller
              control={form.control}
              name="phone"
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  label="Telefon"
                  placeholder="+998901234567"
                  autoComplete="tel"
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                  fullWidth
                />
              )}
            />
            <Controller
              control={form.control}
              name="password"
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  label="Parol"
                  type="password"
                  autoComplete="current-password"
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                  fullWidth
                />
              )}
            />
            <Button type="submit" variant="contained" size="large" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? 'Kirilyapti...' : 'Kirish'}
            </Button>
          </Box>
        </form>
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mt: 2.5 }}>
          Hisobingiz yo&apos;qmi?{' '}
          <Link href="/register" className="font-semibold text-sky-700 hover:underline">
            Ro&apos;yxatdan o&apos;ting
          </Link>
        </Typography>
      </Paper>
    </Box>
  );
}
