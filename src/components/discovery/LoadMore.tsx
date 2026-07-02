'use client';

import { useTranslations } from 'next-intl';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useTransition } from 'react';

import { Button } from '@/components/ui/Button';

/**
 * Reveals the next page of listing results by bumping the `page` URL param
 * (URL is the source of truth — CLAUDE.md rule 7). `useTransition` keeps the
 * current results on screen and shows a pending spinner during the server
 * round-trip, so the action never feels unresponsive.
 */
export function LoadMore({ page }: { page: number }) {
  const t = useTranslations('filters');
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();

  const onClick = () => {
    const next = new URLSearchParams(params.toString());
    next.set('page', String(page + 1));
    startTransition(() => {
      router.replace(`${pathname}?${next.toString()}`, { scroll: false });
    });
  };

  return (
    <Button variant="outline" onClick={onClick} loading={pending} disabled={pending}>
      {t('loadMore')}
    </Button>
  );
}
