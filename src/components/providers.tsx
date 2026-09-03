'use client';

import { useTranslations } from 'next-intl';
import { ThemeProvider } from 'next-themes';
import type { ReactNode } from 'react';

import { OfflineWatcher, ToastProvider } from '@/components/ui/Toast';
import { TooltipProvider } from '@/components/ui/Tooltip';

/**
 * Client providers shared across the app: theme (next-themes, `data-theme`)
 * and Radix Tooltip. next-intl's provider stays in the server layout so
 * messages are passed from the server tree.
 */
export function Providers({ children }: { children: ReactNode }) {
  const t = useTranslations('states');
  return (
    <ThemeProvider
      attribute="data-theme"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <ToastProvider>
        <OfflineWatcher message={t('offline')} />
        <TooltipProvider delayDuration={200}>{children}</TooltipProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
