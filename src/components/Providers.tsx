'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';
import { Toaster } from '@/components/ui/sonner';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';

const muiTheme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#0284c7' },
    secondary: { main: '#0891b2' },
    background: { default: '#f4f7fb' },
  },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily: 'var(--font-sans), Inter, system-ui, sans-serif',
  },
});

/**
 * Client-side providers: React Query, theme, Sonner toasts.
 */
export default function Providers({ children }: { children: React.ReactNode }) {
  const [qc] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 30_000, retry: 1, refetchOnWindowFocus: false },
        },
      }),
  );

  return (
    <ThemeProvider theme={muiTheme}>
      <QueryClientProvider client={qc}>
        <CssBaseline />
        <Toaster position="top-right" richColors closeButton />
        {children}
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </ThemeProvider>
  );
}
