'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { useCallback, useEffect, useState } from 'react';

import { Button } from '@/components/ui/Button';
import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/utils/cn';
import type { Recipe } from '@/types';

const AUTO_ADVANCE_MS = 3000;

export interface FeaturedSliderProps {
  slides: Recipe[];
}

/**
 * Home featured slider (design §10 home). Auto-advances every 3s, loops, and
 * pauses while hovered or focused. Honors `prefers-reduced-motion` (no
 * auto-advance, no slide transition). Dots + prev/next arrows are the manual
 * controls. Slides are selected server-side via `selectFeaturedSlides`.
 */
export function FeaturedSlider({ slides }: FeaturedSliderProps) {
  const t = useTranslations();
  const count = slides.length;
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const go = useCallback(
    (to: number) => setIndex(((to % count) + count) % count),
    [count],
  );

  useEffect(() => {
    if (paused || count < 2) return;
    const reduce =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % count), AUTO_ADVANCE_MS);
    return () => clearInterval(id);
  }, [paused, count]);

  if (count === 0) return null;

  return (
    <section
      aria-roledescription="carousel"
      aria-label={t('home.featuredRegion')}
      className="relative h-[60vh] min-h-[420px] w-full overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <h1 className="sr-only">{t('home.title')}</h1>

      <div
        className="flex h-full transition-transform duration-[--duration-base] ease-[--ease-out] motion-reduce:transition-none"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {slides.map((recipe, i) => {
          const active = i === index;
          return (
            <div
              key={recipe.slug}
              aria-roledescription="slide"
              aria-label={`${i + 1} / ${count}`}
              aria-hidden={!active}
              className="relative h-full w-full shrink-0"
            >
              <Image
                src={recipe.heroImage}
                alt={recipe.alt}
                fill
                priority={i === 0}
                sizes="100vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[rgb(20_18_16_/_0.65)] to-transparent" />
              <div className="container-page absolute inset-x-0 bottom-0">
                <div className="max-w-xl pb-14">
                  <p className="text-sm font-semibold tracking-wide text-[var(--neutral-50)]/90 uppercase">
                    {t('home.featured')}
                  </p>
                  <h2 className="mt-2 font-display text-4xl font-semibold text-[var(--neutral-0)] drop-shadow">
                    {recipe.title}
                  </h2>
                  <Button variant="accent" size="lg" className="mt-5" asChild>
                    <Link
                      href={`/recipes/${recipe.slug}`}
                      tabIndex={active ? undefined : -1}
                    >
                      {t('common.viewRecipe')}
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {count > 1 && (
        <>
          <div className="absolute inset-y-0 left-0 flex items-center pl-2 sm:pl-4">
            <Button
              variant="secondary"
              iconOnly
              aria-label={t('home.prevSlide')}
              onClick={() => go(index - 1)}
              className="rounded-full bg-surface/80 backdrop-blur-sm"
            >
              <ChevronLeft aria-hidden className="size-5" />
            </Button>
          </div>
          <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:pr-4">
            <Button
              variant="secondary"
              iconOnly
              aria-label={t('home.nextSlide')}
              onClick={() => go(index + 1)}
              className="rounded-full bg-surface/80 backdrop-blur-sm"
            >
              <ChevronRight aria-hidden className="size-5" />
            </Button>
          </div>

          <div className="absolute inset-x-0 bottom-3 flex justify-center">
            {slides.map((recipe, i) => (
              <button
                key={recipe.slug}
                type="button"
                aria-label={t('home.goToSlide', { n: i + 1 })}
                aria-current={i === index ? 'true' : undefined}
                onClick={() => go(i)}
                className="inline-flex size-11 items-center justify-center"
              >
                <span
                  className={cn(
                    'size-2.5 rounded-full border border-border transition-colors',
                    i === index ? 'bg-primary' : 'bg-surface/70',
                  )}
                />
              </button>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
