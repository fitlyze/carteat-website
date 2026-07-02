# Parallax Featured Slider Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the one-slide-at-a-time autoplay home hero with a codrops-style horizontal parallax strip (drag / swipe / horizontal wheel / keyboard, lerp inertia, image parallax, progress bar) with zero new dependencies.

**Architecture:** Pure math (`lerp`, `clamp`, progress + parallax mapping) lives in `src/lib/utils/math.ts` and is unit-tested. `FeaturedSlider.tsx` stays a single client island: one `useEffect` owns an imperative rAF loop that writes `transform` styles directly to refs (no React state per frame). Same public props (`{ slides: Recipe[] }`), so `src/app/[locale]/page.tsx` is untouched.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript strict, Tailwind v4 tokens, next-intl, Vitest + RTL + vitest-axe. **No GSAP, no virtual-scroll.**

**Spec:** `docs/superpowers/specs/2026-07-02-parallax-featured-slider-design.md`

## Global Constraints

- **Zero new dependencies** (CLAUDE.md golden rule 10).
- TypeScript strict, no `any`; path alias `@/` → `src/`.
- Token-only styling — no hex, no raw ramp steps. The existing gradient-overlay idiom `bg-gradient-to-t from-[rgb(20_18_16_/_0.65)] to-transparent` and `text-[var(--neutral-0)]` / `text-[var(--neutral-50)]/90` are the established design §7 overlay pattern (copied from the current component) and stay as-is.
- `'use client'` only on the slider island; page stays RSC.
- A11y: WCAG 2.1 AA, carousel aria semantics, `prefers-reduced-motion`, 0 serious axe.
- Strings via next-intl only.
- Conventional Commits. Husky hooks run on commit — do not use `--no-verify`.
- Node 20, pnpm 9. Test runner: `pnpm test` = `vitest run` (append a path to filter, e.g. `pnpm test tests/unit/math.test.ts`).
- Done gate: `pnpm typecheck && pnpm lint && pnpm test`.

---

### Task 1: Math helpers (`lerp`, `clamp`, `scrollProgress`, `parallaxOffset`)

**Files:**
- Create: `src/lib/utils/math.ts`
- Test: `tests/unit/math.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces (Task 2 imports these exact signatures from `@/lib/utils/math`):
  - `lerp(a: number, b: number, n: number): number`
  - `clamp(value: number, min: number, max: number): number`
  - `scrollProgress(last: number, maxScroll: number): number` — `last ≤ 0` track offset, `maxScroll ≥ 0`; returns 0..1, and 0 when `maxScroll ≤ 0`.
  - `parallaxOffset(scrolled: number, cardLeft: number, cardWidth: number, viewportWidth: number, maxShift: number): number` — returns −maxShift..0.

- [ ] **Step 1: Write the failing test**

Create `tests/unit/math.test.ts`:

```ts
import { describe, expect, it } from 'vitest';

import { clamp, lerp, parallaxOffset, scrollProgress } from '@/lib/utils/math';

describe('lerp', () => {
  it('returns a at n=0 and b at n=1', () => {
    expect(lerp(2, 10, 0)).toBe(2);
    expect(lerp(2, 10, 1)).toBe(10);
  });

  it('interpolates midway', () => {
    expect(lerp(0, 10, 0.5)).toBe(5);
  });
});

describe('clamp', () => {
  it('passes through in-range values', () => {
    expect(clamp(5, 0, 10)).toBe(5);
  });

  it('clamps below min and above max', () => {
    expect(clamp(-1, 0, 10)).toBe(0);
    expect(clamp(11, 0, 10)).toBe(10);
  });

  it('works with a negative range (track offsets)', () => {
    expect(clamp(-500, -300, 0)).toBe(-300);
    expect(clamp(50, -300, 0)).toBe(0);
  });
});

describe('scrollProgress', () => {
  it('is 0 at the start of the track', () => {
    expect(scrollProgress(0, 1000)).toBe(0);
  });

  it('is 1 at the end of the track', () => {
    expect(scrollProgress(-1000, 1000)).toBe(1);
  });

  it('is 0.5 halfway', () => {
    expect(scrollProgress(-500, 1000)).toBe(0.5);
  });

  it('is 0 when there is no overflow', () => {
    expect(scrollProgress(-50, 0)).toBe(0);
  });

  it('clamps overshoot into [0, 1]', () => {
    expect(scrollProgress(-1200, 1000)).toBe(1);
    expect(scrollProgress(200, 1000)).toBe(0);
  });
});

describe('parallaxOffset', () => {
  // viewport 1000px, card at left=1000 width=500, maxShift=125
  it('is -maxShift when the card is about to enter from the right', () => {
    expect(parallaxOffset(0, 1000, 500, 1000, 125)).toBe(-125);
  });

  it('is 0 once the card has fully left on the left', () => {
    expect(parallaxOffset(1500, 1000, 500, 1000, 125)).toBe(0);
  });

  it('is halfway through at the crossing midpoint', () => {
    expect(parallaxOffset(750, 1000, 500, 1000, 125)).toBe(-62.5);
  });

  it('clamps outside the crossing range', () => {
    expect(parallaxOffset(-500, 1000, 500, 1000, 125)).toBe(-125);
    expect(parallaxOffset(9999, 1000, 500, 1000, 125)).toBe(0);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test tests/unit/math.test.ts`
Expected: FAIL — `Cannot find module '@/lib/utils/math'` (or equivalent resolve error).

- [ ] **Step 3: Write minimal implementation**

Create `src/lib/utils/math.ts`:

```ts
/** Linear interpolation from `a` toward `b` by factor `n` in [0, 1]. */
export const lerp = (a: number, b: number, n: number): number =>
  (1 - n) * a + n * b;

/** Clamps `value` into [min, max]. */
export const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max);

/**
 * Progress in [0, 1] of a horizontal track whose rendered offset is
 * `last` (≤ 0) against `maxScroll` (positive overflow width).
 */
export const scrollProgress = (last: number, maxScroll: number): number =>
  maxScroll <= 0 ? 0 : clamp(-last / maxScroll, 0, 1);

/**
 * Horizontal parallax offset for a card's image. Progress runs 0 → 1 while
 * the card crosses the viewport (entering right edge → leaving left edge);
 * the image translates from −maxShift to 0 over that crossing.
 */
export const parallaxOffset = (
  scrolled: number,
  cardLeft: number,
  cardWidth: number,
  viewportWidth: number,
  maxShift: number,
): number => {
  const min = cardLeft - viewportWidth;
  const max = cardLeft + cardWidth;
  const progress = clamp((scrolled - min) / (max - min), 0, 1);
  return (progress - 1) * maxShift;
};
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test tests/unit/math.test.ts`
Expected: PASS — 4 suites, 12 tests.

- [ ] **Step 5: Commit**

```bash
git add src/lib/utils/math.ts tests/unit/math.test.ts
git commit -m "feat: add slider math helpers (lerp, clamp, progress, parallax)"
```

---

### Task 2: Rewrite `FeaturedSlider` as parallax scroll strip

**Files:**
- Modify: `src/components/recipe/FeaturedSlider.tsx` (full rewrite, same file / export / props)
- Modify: `tests/unit/home-featured.test.tsx` (replace only the `describe('FeaturedSlider')` block + trim imports; `selectFeaturedSlides` and `RecipeRow` blocks stay untouched)

**Interfaces:**
- Consumes: `lerp`, `clamp`, `scrollProgress`, `parallaxOffset` from `@/lib/utils/math` (Task 1); existing `Button` (`@/components/ui/Button`), `Link` (`@/i18n/navigation`), `Recipe` (`@/types`).
- Produces: `FeaturedSlider({ slides: Recipe[] })` named export + `FeaturedSliderProps` — unchanged, so `src/app/[locale]/page.tsx` needs no edits.
- i18n keys used: `home.featuredRegion`, `home.title`, `home.featured`, `common.viewRecipe`. Keys `home.prevSlide` / `home.nextSlide` / `home.goToSlide` become unused (removed in Task 3).

- [ ] **Step 1: Replace the `describe('FeaturedSlider')` block in the test file**

In `tests/unit/home-featured.test.tsx`:

1. Replace the import block at the top of the file with:

```tsx
import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { axe } from 'vitest-axe';

import { FeaturedSlider } from '@/components/recipe/FeaturedSlider';
import { RecipeRow } from '@/components/recipe/RecipeRow';
import { selectFeaturedSlides } from '@/lib/content/query';

import { makeRecipe } from '../factories';
import { renderWithIntl } from '../test-utils';
```

(`act`, `userEvent`, `vi`, `afterEach` were only used by the old slider tests.)

2. Replace the entire `describe('FeaturedSlider', ...)` block (including its `activeLabel` helper and `afterEach`) with:

```tsx
describe('FeaturedSlider', () => {
  const slides = [r('alpha', { title: 'Alpha' }), r('beta', { title: 'Beta' })];

  it('renders nothing when there are no slides', () => {
    const { container } = renderWithIntl(<FeaturedSlider slides={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders every slide reachable, with carousel semantics', () => {
    const { container } = renderWithIntl(<FeaturedSlider slides={slides} />);
    const section = screen.getByRole('region', { name: 'Featured recipes' });
    expect(section).toHaveAttribute('aria-roledescription', 'carousel');
    const items = container.querySelectorAll('[aria-roledescription="slide"]');
    expect(items).toHaveLength(2);
    expect(items[0]).toHaveAttribute('aria-label', '1 / 2');
    expect(items[1]).toHaveAttribute('aria-label', '2 / 2');
    // parallax strip keeps every slide in the tree — nothing hidden
    expect(
      container.querySelector('[aria-roledescription="slide"][aria-hidden="true"]'),
    ).toBeNull();
  });

  it('renders a CTA link per slide', () => {
    renderWithIntl(<FeaturedSlider slides={slides} />);
    const links = screen.getAllByRole('link', { name: 'View recipe' });
    expect(links).toHaveLength(2);
    expect(links[0].getAttribute('href')).toContain('/recipes/alpha');
    expect(links[1].getAttribute('href')).toContain('/recipes/beta');
  });

  it('renders no dot or arrow controls', () => {
    renderWithIntl(<FeaturedSlider slides={slides} />);
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('exposes a keyboard-focusable track that accepts arrow keys', () => {
    renderWithIntl(<FeaturedSlider slides={slides} />);
    const track = screen.getByRole('group', { name: 'Featured recipes' });
    expect(track).toHaveAttribute('tabindex', '0');
    // jsdom has no layout, so this only asserts the handlers don't throw
    fireEvent.keyDown(track, { key: 'ArrowRight' });
    fireEvent.keyDown(track, { key: 'ArrowLeft' });
  });

  it('has no serious a11y violations', async () => {
    const { container } = renderWithIntl(<FeaturedSlider slides={slides} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test tests/unit/home-featured.test.tsx`
Expected: FAIL — old component renders dot/arrow `button`s (`renders no dot or arrow controls` fails), has `aria-hidden` slides, and no `group` track (`getByRole('group')` throws). `selectFeaturedSlides` + `RecipeRow` blocks still PASS.

- [ ] **Step 3: Rewrite the component**

Replace the full contents of `src/components/recipe/FeaturedSlider.tsx` with:

```tsx
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
        ? state.cards[1].left - state.cards[0].left
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
```

Implementation notes (for the engineer, not comments to add):

- Per-frame work writes styles directly to refs — no `setState` in the rAF loop, so React never re-renders during scroll.
- The rAF loop self-suspends when `last === current`, nothing is drifting, and no drag is active; every input path calls `wake()`.
- `touch-action: pan-y` (`touch-pan-y`) keeps vertical page scroll native on touch; horizontal pans arrive as pointer events.
- Wheel handler must be attached with `{ passive: false }` via `addEventListener` (React's `onWheel` is passive — `preventDefault` would warn and no-op).
- Global `:focus-visible` outline in `globals.css` covers the focusable track — no extra ring classes needed.
- In jsdom all widths are 0 → `maxScroll` 0 → drift/wheel/keyboard are no-ops via clamp; nothing throws.

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test tests/unit/home-featured.test.tsx`
Expected: PASS — all three describes (`selectFeaturedSlides`, `FeaturedSlider`, `RecipeRow`).

- [ ] **Step 5: Verify the rest of the unit suite and types still hold**

Run: `pnpm typecheck && pnpm test`
Expected: typecheck clean; all unit tests PASS (i18n keys not yet removed, so `i18n-parity` still passes).

- [ ] **Step 6: Commit**

```bash
git add src/components/recipe/FeaturedSlider.tsx tests/unit/home-featured.test.tsx
git commit -m "feat: rewrite featured slider as parallax scroll strip"
```

---

### Task 3: Remove dead i18n keys + full gates

**Files:**
- Modify: `src/i18n/messages/en.json` (home: remove `goToSlide`, `prevSlide`, `nextSlide`)
- Modify: `src/i18n/messages/es.json` (home: remove the same three keys, lines ~40–42)

**Interfaces:**
- Consumes: Task 2 (component no longer references these keys).
- Produces: message catalogs stay key-parity-equal (`tests/unit/i18n-parity.test.ts` enforces this).

- [ ] **Step 1: Verify the keys are unreferenced**

Run: `grep -rn "goToSlide\|prevSlide\|nextSlide" src/ --include='*.ts*'`
Expected: no matches outside `src/i18n/messages/*.json`.

- [ ] **Step 2: Remove the keys from both catalogs**

In `src/i18n/messages/en.json`, delete from the `"home"` object:

```json
"goToSlide": "Go to slide {n}",
"prevSlide": "Previous slide",
"nextSlide": "Next slide"
```

In `src/i18n/messages/es.json`, delete from the `"home"` object:

```json
"goToSlide": "Ir a la diapositiva {n}",
"prevSlide": "Diapositiva anterior",
"nextSlide": "Diapositiva siguiente"
```

Mind trailing commas — `featuredRegion` / `viewAll` becomes the last key in each.

- [ ] **Step 3: Run full gates**

Run: `pnpm typecheck && pnpm lint && pnpm test`
Expected: all clean — parity test passes with both catalogs trimmed.

- [ ] **Step 4: Commit**

```bash
git add src/i18n/messages/en.json src/i18n/messages/es.json
git commit -m "chore: drop unused slider control i18n keys"
```

---

## Out of scope

- `src/app/[locale]/page.tsx` — untouched (same component contract).
- Playwright e2e / a11y specs — none reference slider controls (verified by grep); they run in CI as usual.
- No looping/ping-pong drift, no arrows, no dots, no open/close overlay (spec decisions).
