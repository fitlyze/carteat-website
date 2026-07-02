'use client';

import * as Sentry from '@sentry/nextjs';
import { useTranslations } from 'next-intl';
import { useEffect } from 'react';

import { Button } from '@/components/ui/Button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations('states');
  const tc = useTranslations('common');

  useEffect(() => {
    // No stack traces shown to users; report to Sentry instead (plan §12).
    Sentry.captureException(error);
  }, [error]);

  return (
    <div className="container-page flex min-h-[50vh] flex-col items-center justify-center text-center">
      <h1 className="font-display text-3xl font-semibold text-fg">{t('errorTitle')}</h1>
      <p className="mt-3 max-w-md text-fg-muted">{t('errorBody')}</p>
      <Button variant="primary" className="mt-6" onClick={reset}>
        {tc('retry')}
      </Button>
    </div>
  );
}
