'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Star } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRef, useState } from 'react';

import { getAnonId } from '@/lib/utils/anon-id';
import { cn } from '@/lib/utils/cn';
import type { RatingAggregate } from '@/schemas/rating';
import type { Locale } from '@/schemas/recipe';

async function fetchAggregate(slug: string, locale: Locale): Promise<RatingAggregate> {
  const res = await fetch(`/api/ratings?slug=${slug}&locale=${locale}`);
  if (!res.ok) throw new Error('fetch failed');
  return res.json() as Promise<RatingAggregate>;
}

export function RatingControl({
  slug,
  locale,
  initialAvg,
  initialCount,
}: {
  slug: string;
  locale: Locale;
  initialAvg: number;
  initialCount: number;
}) {
  const t = useTranslations('rating');
  const qc = useQueryClient();
  const key = ['rating', slug, locale];
  const starRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const [hover, setHover] = useState(0);
  const [voted, setVoted] = useState<number | null>(null);
  const [focusIdx, setFocusIdx] = useState(0);

  const { data } = useQuery({
    queryKey: key,
    queryFn: () => fetchAggregate(slug, locale),
    initialData: { avg: initialAvg, count: initialCount },
  });

  const mutation = useMutation({
    mutationFn: async (value: number) => {
      const res = await fetch('/api/ratings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, locale, value, anon_id: getAnonId() }),
      });
      if (!res.ok) throw new Error('submit failed');
      return res.json() as Promise<RatingAggregate>;
    },
    onMutate: (value) => setVoted(value),
    onSuccess: (aggregate) => qc.setQueryData(key, aggregate),
    onError: () => setVoted(null),
  });

  const displayValue = hover || voted || Math.round(data.count > 0 ? data.avg : 0);

  function onStarKeyDown(e: React.KeyboardEvent, index: number) {
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
      e.preventDefault();
      const next = Math.min(4, index + 1);
      setFocusIdx(next);
      starRefs.current[next]?.focus();
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
      e.preventDefault();
      const prev = Math.max(0, index - 1);
      setFocusIdx(prev);
      starRefs.current[prev]?.focus();
    }
  }

  return (
    <div className="flex flex-col gap-1.5">
      <div
        role="radiogroup"
        aria-label={t('rateThis')}
        tabIndex={-1}
        className="flex items-center gap-1 outline-none"
        onMouseLeave={() => setHover(0)}
      >
        {[1, 2, 3, 4, 5].map((n, i) => (
          <button
            key={n}
            ref={(el) => {
              starRefs.current[i] = el;
            }}
            type="button"
            role="radio"
            aria-checked={voted === n}
            aria-label={t('stars', { count: n })}
            tabIndex={i === focusIdx ? 0 : -1}
            disabled={mutation.isPending}
            onMouseEnter={() => setHover(n)}
            onFocus={() => setFocusIdx(i)}
            onKeyDown={(e) => onStarKeyDown(e, i)}
            onClick={() => mutation.mutate(n)}
            className="rounded-full p-0.5 transition-transform duration-[--duration-fast] ease-spring hover:scale-110 disabled:opacity-50 motion-reduce:hover:scale-100"
          >
            <Star
              aria-hidden
              className={cn(
                'size-6',
                n <= displayValue ? 'fill-current text-star' : 'text-border-strong',
              )}
            />
          </button>
        ))}
      </div>

      <p className="text-sm text-fg-muted" aria-live="polite">
        {voted ? (
          t('thanks')
        ) : data.count > 0 ? (
          <span>
            <span className="font-semibold text-fg tabular-nums">
              {data.avg.toFixed(1)}
            </span>{' '}
            · {t('count', { count: data.count })}
          </span>
        ) : (
          t('noRatings')
        )}
      </p>
    </div>
  );
}
