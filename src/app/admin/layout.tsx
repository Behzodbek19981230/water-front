'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import AuthGuard from '@/components/AuthGuard';
import TopBar from '@/components/TopBar';
import { Box, Typography, ButtonBase } from '@mui/material';
import {
  IconBuildingStore,
  IconChartInfographic,
  IconDroplet,
  IconPackage,
  IconTruckDelivery,
} from '@tabler/icons-react';

const NAV = [
  { href: '/admin', label: 'Dashboard', icon: IconChartInfographic },
  { href: '/admin/orders', label: 'Orderlar', icon: IconPackage },
  { href: '/admin/couriers', label: 'Kurierlar', icon: IconTruckDelivery },
  { href: '/admin/organizations', label: 'Kompaniyalar', icon: IconBuildingStore },
  { href: '/admin/products', label: 'Mahsulotlar', icon: IconDroplet },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const path = usePathname();

  return (
    <AuthGuard allowed={['ADMIN']}>
      <Box sx={{ display: 'flex', height: '100vh', bgcolor: '#f4f7fb' }}>
        <Box
          component="aside"
          sx={{
            width: 260,
            borderRight: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.paper',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Box
            sx={{
              px: 2.5,
              height: 56,
              borderBottom: '1px solid',
              borderColor: 'divider',
              display: 'flex',
              alignItems: 'center',
              gap: 1.25,
            }}
          >
            <IconDroplet size={22} color="#0284c7" />
            <Typography sx={{ fontWeight: 700 }}>Water Admin</Typography>
          </Box>
          <Box sx={{ p: 1.25, flex: 1, display: 'flex', flexDirection: 'column', gap: 0.75 }}>
            {NAV.map((item) => {
              const active = path === item.href;
              const Icon = item.icon;
              return (
                <ButtonBase
                  key={item.href}
                  LinkComponent={Link}
                  href={item.href}
                  sx={{
                    justifyContent: 'flex-start',
                    borderRadius: 2,
                    px: 1.5,
                    py: 1.1,
                    gap: 1.25,
                    bgcolor: active ? 'primary.main' : 'transparent',
                    color: active ? 'primary.contrastText' : 'text.secondary',
                    '&:hover': { bgcolor: active ? 'primary.dark' : 'action.hover' },
                  }}
                >
                  <Icon size={18} />
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {item.label}
                  </Typography>
                </ButtonBase>
              );
            })}
          </Box>
        </Box>

        <Box sx={{ display: 'flex', minWidth: 0, flex: 1, flexDirection: 'column' }}>
          <TopBar title="Admin panel" />
          <Box sx={{ flex: 1, overflow: 'auto', p: 3 }}>{children}</Box>
        </Box>
      </Box>
    </AuthGuard>
  );
}
