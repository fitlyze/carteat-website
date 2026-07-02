'use client';

import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { useEffect, useRef } from 'react';

import { Button } from '@/components/ui/Button';
import { Link } from '@/i18n/navigation';
import { clamp, lerp, parallaxOffset, scrollProgress } from '@/lib/utils/math';
import type { Recipe } from '@/types';

const EASE = 0.1;
const DRAG_SPEED = 1.5;
const DRAG_CLICK_THRESHOLD_PX = 6;
const DRIFT_PX_PER_FRAME = 0.4;
const PARALLAX_SHIFT_RATIO = 0.25;
const IMAGE_SCALE = 1.5;
const SETTLE_EPSILON_PX = 0.1;
const FOCUS_SCROLL_PADDING_PX = 16;

export interface FeaturedSliderProps {
  slides: Recipe[];
}

/**
 * Home featured slider (design §10 home): horizontal parallax strip. Moved by
 * drag/swipe, horizontal wheel deltas, and arrow keys on the focusable track;
 * vertical wheel always scrolls the page. Images translate inside clipped
 * frames for depth; a thin progress bar replaces dots. When idle it drifts
 * slowly toward the end, pausing on hover/focus/hidden tab.
 * `prefers-reduced-motion` disables drift, parallax, and lerp smoothing.
 * Slides are selected server-side via `selectFeaturedSlides`.
 */
export function FeaturedSlider({ slides }: FeaturedSliderProps) {
  const t = useTranslations();
  const count = slides.length;

  const sectionRef = useRef<HTMLElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const progressWrapRef = useRef<HTMLDivElement | null>(null);
  const progressRef = useRef<HTMLDivElement | null>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const imageRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const section = sectionRef.current;
    const track = trackRef.current;
    if (!section || !track || count === 0) return;

    const mq =
      typeof window.matchMedia === 'function'
        ? window.matchMedia('(prefers-reduced-motion: reduce)')
        : null;

    const state = {
      current: 0,
      last: 0,
      maxScroll: 0,
      viewport: 0,
      cards: [] as { left: number; width: number }[],
      dragging: false,
      dragged: false,
      dragStartX: 0,
      dragStartCurrent: 0,
      hovered: false,
      focused: false,
      reduced: mq?.matches ?? false,
      raf: null as number | null,
    };

    const applyFrame = () => {
      track.style.transform = `translate3d(${state.last}px, 0, 0)`;

      state.cards.forEach((card, i) => {
        const img = imageRefs.current[i];
        if (!img) return;
        if (state.reduced) {
          img.style.transform = '';
          return;
        }
        const scrolled = -state.last;
        const inView =
          scrolled + state.viewport >= card.left &&
          scrolled < card.left + card.width;
        if (!inView) return;
        const x = parallaxOffset(
          scrolled,
          card.left,
          card.width,
          state.viewport,
          card.width * PARALLAX_SHIFT_RATIO,
        );
        img.style.transform = `translate3d(${x}px, 0, 0) scale(${IMAGE_SCALE})`;
      });

      if (progressRef.current) {
        progressRef.current.style.transform = `scaleX(${scrollProgress(state.last, state.maxScroll)})`;
      }
    };

    const tick = () => {
      state.last = state.reduced
        ? state.current
        : lerp(state.last, state.current, EASE);
      if (Math.abs(state.current - state.last) < SETTLE_EPSILON_PX) {
        state.last = state.current;
      }

      const drifting =
        !state.reduced &&
        !state.dragging &&
        !state.hovered &&
        !state.focused &&
        !document.hidden &&
        state.maxScroll > 0 &&
        state.current > -state.maxScroll;
      if (drifting) {
        state.current = clamp(
          state.current - DRIFT_PX_PER_FRAME,
          -state.maxScroll,
          0,
        );
      }

      applyFrame();

      // idle the loop once settled so we don't burn rAF frames forever
      if (state.last === state.current && !drifting && !state.dragging) {
        state.raf = null;
        return;
      }
      state.raf = requestAnimationFrame(tick);
    };

    const wake = () => {
      if (state.raf == null) state.raf = requestAnimationFrame(tick);
    };

    const measure = () => {
      state.viewport = section.clientWidth;
      state.maxScroll = Math.max(0, track.scrollWidth - state.viewport);
      state.cards = itemRefs.current.map((el) => ({
        left: el?.offsetLeft ?? 0,
        width: el?.offsetWidth ?? 0,
      }));
      state.current = clamp(state.current, -state.maxScroll, 0);
      if (progressWrapRef.current) {
        progressWrapRef.current.style.visibility =
          state.maxScroll === 0 ? 'hidden' : 'visible';
      }
      wake();
    };

    const cardStep = () =>
      state.cards.length > 1
        ? state.cards[1]!.left - state.cards[0]!.left
        : state.viewport;

    const onPointerDown = (e: PointerEvent) => {
      // stop native image drag / text selection without breaking clicks
      if (e.pointerType === 'mouse') e.preventDefault();
      state.dragging = true;
      state.dragged = false;
      state.dragStartX = e.clientX;
      state.dragStartCurrent = state.current;
      track.dataset.dragging = 'true';
      wake();
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!state.dragging) return;
      const dx = e.clientX - state.dragStartX;
      if (Math.abs(dx) > DRAG_CLICK_THRESHOLD_PX) state.dragged = true;
      state.current = clamp(
        state.dragStartCurrent + dx * DRAG_SPEED,
        -state.maxScroll,
        0,
      );
      wake();
    };

    const onPointerEnd = () => {
      state.dragging = false;
      delete track.dataset.dragging;
      wake();
    };

    const onClickCapture = (e: MouseEvent) => {
      if (!state.dragged) return;
      e.preventDefault();
      e.stopPropagation();
      state.dragged = false;
    };

    const onWheel = (e: WheelEvent) => {
      // only claim horizontal gestures; vertical wheel keeps scrolling the page
      if (state.maxScroll === 0 || Math.abs(e.deltaX) <= Math.abs(e.deltaY))
        return;
      e.preventDefault();
      state.current = clamp(state.current - e.deltaX, -state.maxScroll, 0);
      wake();
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
      e.preventDefault();
      const step = e.key === 'ArrowLeft' ? cardStep() : -cardStep();
      state.current = clamp(state.current + step, -state.maxScroll, 0);
      wake();
    };

    const onFocusIn = (e: FocusEvent) => {
      state.focused = true;
      const item = (e.target as HTMLElement).closest('[data-slide-index]');
      if (!item) return;
      const card = state.cards[Number(item.getAttribute('data-slide-index'))];
      if (!card) return;
      const scrolled = -state.current;
      if (card.left < scrolled) {
        state.current = clamp(
          -card.left + FOCUS_SCROLL_PADDING_PX,
          -state.maxScroll,
          0,
        );
      } else if (card.left + card.width > scrolled + state.viewport) {
        state.current = clamp(
          state.viewport - card.left - card.width - FOCUS_SCROLL_PADDING_PX,
          -state.maxScroll,
          0,
        );
      }
      wake();
    };

    const onFocusOut = () => {
      state.focused = false;
      wake();
    };
    const onPointerEnter = () => {
      state.hovered = true;
    };
    const onPointerLeave = () => {
      state.hovered = false;
      wake();
    };
    const onVisibility = () => wake();
    const onMqChange = (e: MediaQueryListEvent) => {
      state.reduced = e.matches;
      wake();
    };

    measure();

    window.addEventListener('resize', measure, { passive: true });
    document.addEventListener('visibilitychange', onVisibility);
    mq?.addEventListener?.('change', onMqChange);
    section.addEventListener('pointerenter', onPointerEnter);
    section.addEventListener('pointerleave', onPointerLeave);
    section.addEventListener('focusin', onFocusIn);
    section.addEventListener('focusout', onFocusOut);
    section.addEventListener('wheel', onWheel, { passive: false });
    track.addEventListener('pointerdown', onPointerDown);
    track.addEventListener('keydown', onKeyDown);
    track.addEventListener('click', onClickCapture, true);
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerup', onPointerEnd);
    window.addEventListener('pointercancel', onPointerEnd);

    return () => {
      if (state.raf != null) cancelAnimationFrame(state.raf);
      window.removeEventListener('resize', measure);
      document.removeEventListener('visibilitychange', onVisibility);
      mq?.removeEventListener?.('change', onMqChange);
      section.removeEventListener('pointerenter', onPointerEnter);
      section.removeEventListener('pointerleave', onPointerLeave);
      section.removeEventListener('focusin', onFocusIn);
      section.removeEventListener('focusout', onFocusOut);
      section.removeEventListener('wheel', onWheel);
      track.removeEventListener('pointerdown', onPointerDown);
      track.removeEventListener('keydown', onKeyDown);
      track.removeEventListener('click', onClickCapture, true);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerEnd);
      window.removeEventListener('pointercancel', onPointerEnd);
    };
  }, [count]);

  if (count === 0) return null;

  return (
    <section
      ref={sectionRef}
      aria-roledescription="carousel"
      aria-label={t('home.featuredRegion')}
      className="relative h-[60vh] min-h-[420px] w-full overflow-hidden"
    >
      <h1 className="sr-only">{t('home.title')}</h1>

      <div
        ref={trackRef}
        role="group"
        // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
        tabIndex={0}
        aria-label={t('home.featuredRegion')}
        className="flex h-full cursor-grab touch-pan-y items-center gap-4 px-4 select-none will-change-transform data-[dragging=true]:cursor-grabbing sm:gap-6 sm:px-6 lg:px-8"
      >
        {slides.map((recipe, i) => (
          <div
            key={recipe.slug}
            ref={(el) => {
              itemRefs.current[i] = el;
            }}
            data-slide-index={i}
            aria-roledescription="slide"
            aria-label={`${i + 1} / ${count}`}
            className="relative aspect-[3/4] h-4/5 shrink-0 overflow-hidden rounded-xl"
          >
            <div
              ref={(el) => {
                imageRefs.current[i] = el;
              }}
              className="absolute inset-0 will-change-transform"
            >
              <Image
                src={recipe.heroImage}
                alt={recipe.alt}
                fill
                priority={i === 0}
                sizes="(min-width: 640px) 40vw, 75vw"
                className="object-cover"
                draggable={false}
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-[rgb(20_18_16_/_0.65)] to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-5">
              <p className="text-sm font-semibold tracking-wide text-[var(--neutral-50)]/90 uppercase">
                {t('home.featured')}
              </p>
              <h2 className="mt-1 font-display text-2xl font-semibold text-[var(--neutral-0)] drop-shadow">
                {recipe.title}
              </h2>
              <Button variant="accent" className="mt-4" asChild>
                <Link href={`/recipes/${recipe.slug}`}>
                  {t('common.viewRecipe')}
                </Link>
              </Button>
            </div>
          </div>
        ))}
      </div>

      {count > 1 && (
        <div
          ref={progressWrapRef}
          aria-hidden="true"
          className="absolute bottom-5 left-1/2 h-0.5 w-40 -translate-x-1/2 overflow-hidden rounded-full bg-surface/40"
        >
          <div
            ref={progressRef}
            className="h-full w-full origin-left rounded-full bg-primary"
            style={{ transform: 'scaleX(0)' }}
          />
        </div>
      )}
    </section>
  );
}
