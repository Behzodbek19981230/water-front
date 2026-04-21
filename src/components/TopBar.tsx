'use client';

import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth.store';
import { disconnectSocket } from '@/lib/socket';
import { AppBar, Box, Button, Chip, Toolbar, Typography } from '@mui/material';
import { IconLogout } from '@tabler/icons-react';

export default function TopBar({ title }: { title: string }) {
  const router = useRouter();
  const { user, logout } = useAuthStore();

  return (
    <AppBar
      position="static"
      color="inherit"
      elevation={0}
      sx={{ borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}
    >
      <Toolbar sx={{ minHeight: '56px !important', px: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mr: 2 }}>
          {title}
        </Typography>
        <Chip
          size="small"
          label={`${user?.role ?? 'GUEST'} · #${user?.userId ?? '-'}`}
          sx={{ borderRadius: 2 }}
        />
        <Box sx={{ ml: 'auto' }}>
          <Button
            variant="outlined"
            color="inherit"
            size="small"
            startIcon={<IconLogout size={16} />}
            onClick={() => {
              disconnectSocket();
              logout();
              router.replace('/login');
            }}
          >
            Chiqish
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
