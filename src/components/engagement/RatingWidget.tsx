import { useTranslations } from 'next-intl';

import { cn } from '@/lib/utils/cn';

import { RatingStars } from './RatingStars';

export interface RatingWidgetProps {
  avg: number;
  count: number;
  size?: 'compact' | 'default';
  className?: string;
}

/**
 * Read-only rating summary (design §9.6). Renders "No ratings yet" when
 * count === 0. Interactive submission is a separate client island (E10-S6).
 */
export function RatingWidget({
  avg,
  count,
  size = 'default',
  className,
}: RatingWidgetProps) {
  const t = useTranslations('rating');

  if (count === 0) {
    return (
      <span
        className={cn(
          'text-fg-subtle',
          size === 'compact' ? 'text-xs' : 'text-sm',
          className,
        )}
      >
        {t('noRatings')}
      </span>
    );
  }

  return (
    <span
      className={cn('inline-flex items-center gap-1.5', className)}
      aria-label={t('average', { avg: avg.toFixed(1) })}
    >
      <RatingStars value={avg} size={size} />
      <span
        className={cn(
          'font-semibold text-fg tabular-nums',
          size === 'compact' ? 'text-xs' : 'text-sm',
        )}
      >
        {avg.toFixed(1)}
      </span>
      <span className={cn('text-fg-muted', size === 'compact' ? 'text-xs' : 'text-sm')}>
        ({count})
      </span>
    </span>
  );
}
