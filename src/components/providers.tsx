'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { ThemeProvider } from 'next-themes';
import { useState, type ReactNode } from 'react';

import { OfflineWatcher, ToastProvider } from '@/components/ui/Toast';
import { TooltipProvider } from '@/components/ui/Tooltip';

/**
 * Client providers shared across the app: theme (next-themes, `data-theme`),
 * TanStack Query (UGC fetching), and Radix Tooltip. next-intl's provider stays
 * in the server layout so messages are passed from the server tree.
 */
export function Providers({ children }: { children: ReactNode }) {
  const t = useTranslations('states');
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 60_000, refetchOnWindowFocus: false },
        },
      }),
  );

  return (
    <ThemeProvider
      attribute="data-theme"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <QueryClientProvider client={queryClient}>
        <ToastProvider>
          <OfflineWatcher message={t('offline')} />
          <TooltipProvider delayDuration={200}>{children}</TooltipProvider>
        </ToastProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
