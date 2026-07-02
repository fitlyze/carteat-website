# Parallax Featured Slider — Design

**Date:** 2026-07-02
**Status:** Approved
**Reference:** [codrops-parallax-slider](https://github.com/rluijten/codrops-parallax-slider) (mechanics only — the open/close overlay feature is explicitly dropped)

## Goal

Replace the current one-slide-at-a-time autoplay hero slider on the home page with a
codrops-style horizontal parallax strip: multiple recipe cards visible at once, moved by
drag / swipe / horizontal wheel with lerp-smoothed inertia, images translating inside
clipped frames for parallax depth, and a thin progress bar.

## Decisions (locked during brainstorming)

| Decision | Choice |
| --- | --- |
| Placement | Replace hero in place — same ~60vh full-bleed section at top of home |
| Scroll input | Drag + touch swipe + horizontal wheel/trackpad deltas + keyboard arrows. Vertical wheel always scrolls the page (no scroll hijack) |
| Carried-over features | Progress bar (replaces dots) · autoplay drift · per-slide "View recipe" CTA |
| Dropped features | Prev/next arrows · dots · open/close expand from the demo |
| Implementation | Vanilla React client island, **zero new dependencies** (no GSAP, no virtual-scroll) |

## Scope

- Rewrite `src/components/recipe/FeaturedSlider.tsx` in place. Same component name,
  same `FeaturedSliderProps { slides: Recipe[] }`, same usage in
  `src/app/[locale]/page.tsx` (no page changes).
- Add `lerp` / `clamp` math helpers in `src/lib/utils/math.ts` (unit-tested).
- Remove now-unused i18n keys: `home.prevSlide`, `home.nextSlide`, `home.goToSlide`
  (en + es).

## Layout

- Section: 60vh, `min-h-[420px]`, full-bleed, `overflow-hidden`. `sr-only` h1 kept.
- Track: horizontal flex row, `container-page`-aligned side padding, gaps on the 4px
  scale. Cards sized so 2–3 are visible on desktop, ~1.2 on mobile.
- Card: `rounded-xl overflow-hidden` image frame. Image rendered ~1.5× frame width to
  give parallax headroom, `next/image` with `alt`, first slide `priority`.
- Text: recipe title in `font-display` + accent "View recipe" Button (CTA) overlaid
  bottom-left on the standard bottom gradient overlay token (design §7 overlay spec).
- Token-only styling throughout; no hex, no arbitrary values.

## Mechanics

All animation runs in a single `requestAnimationFrame` loop inside the client island.

- **Smoothing:** `last = lerp(last, current, 0.1)`; track positioned with
  `translate3d(last, 0, 0)`. `current` clamped to `[-(trackWidth − viewportWidth), 0]`.
  Loop idles (no rAF churn) once `|current − last| < 0.1` and no drift is active.
- **Drag:** pointer events (`pointerdown/move/up/cancel`), drag speed ×1.5, grab/grabbing
  cursor. A drag past a small movement threshold suppresses the click on card links.
  Pointer events unify mouse + touch; `touch-action: pan-y` on the track so vertical
  page scrolling is never blocked on touch devices.
- **Wheel:** handled only when `|deltaX| > |deltaY|` (horizontal trackpad gesture) —
  then `preventDefault` + move `current`. Vertical wheel is untouched and scrolls the
  page normally.
- **Parallax:** per card, compute in-view progress from scroll position and card bounds
  (bounds cached, refreshed on resize); map progress to an image `translateX` between
  0 and −25% of the frame width. Same math as the demo's `render()`.
- **Progress bar:** thin line, `transform: scaleX(progress)` where
  `progress = −last / maxScroll`. Hidden when all slides fit (no overflow).
- **Autoplay drift:** slow constant px-per-frame added to `current` while idle. Pauses
  on hover, focus-within, pointer down, or hidden tab; stops permanently at the end of
  the track (no loop wrap — lerp makes wrap jumps ugly). Skipped entirely under
  reduced motion.

## Accessibility

- Same carousel semantics as today: `aria-roledescription="carousel"` on the section,
  `aria-roledescription="slide"` + positional `aria-label` per card. No `aria-hidden`
  on off-screen slides (all remain reachable; the track scrolls them into view).
- **Keyboard:** the track is focusable (`tabIndex=0`, labelled); ArrowLeft/ArrowRight
  move one card width. Tabbing to a card's CTA link scrolls that card into view (adjust `current`
  on focus).
- **Reduced motion:** no drift, no parallax, no lerp smoothing (positions applied
  directly). Drag, wheel, and keyboard still work.
- CTA meets 44px target; focus-visible rings intact; 0 serious axe on home.

## Error / edge cases

- `slides.length === 0` → render nothing (as today).
- All slides fit in viewport (no overflow) → no drift, no progress bar, inputs no-op
  via the clamp (max scroll = 0).
- Resize → re-measure track + card bounds, re-clamp `current`.

## Testing

- **Vitest:** `lerp`, `clamp`, progress mapping, parallax in-view mapping (pure
  functions in `src/lib/utils/math.ts`).
- **RTL:** renders slides + CTAs; no arrows/dots; carousel aria attributes present.
- **Existing suites:** home axe test and Playwright e2e stay green.
- `pnpm typecheck && pnpm lint && pnpm test` before done.
