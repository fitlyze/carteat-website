import { Star } from 'lucide-react';

import { cn } from '@/lib/utils/cn';

/** Presentational 5-star row (integer fill). Shared by display + interactive. */
export function RatingStars({
  value,
  size = 'default',
  className,
}: {
  value: number;
  size?: 'compact' | 'default';
  className?: string;
}) {
  const filled = Math.round(value);
  const starSize = size === 'compact' ? 'size-4' : 'size-6';

  return (
    <span className={cn('inline-flex items-center gap-0.5', className)} aria-hidden>
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={cn(
            starSize,
            i < filled ? 'fill-current text-star' : 'text-border-strong',
          )}
        />
      ))}
    </span>
  );
}
