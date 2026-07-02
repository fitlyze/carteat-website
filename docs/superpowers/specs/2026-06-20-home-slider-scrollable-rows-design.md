# Design — Home Featured Slider + Scrollable Group Rows

**Date:** 2026-06-20
**Scope:** Home page (`src/app/[locale]/page.tsx`) only. Two UI features. No schema, API, or DB changes.

## Goal

1. Replace the single full-bleed featured hero with a modern auto-scrolling horizontal **slider** (multiple featured recipes, bottom dot indicators, prev/next arrows, hover-pause).
2. Convert the home curated grids ("Latest recipes", "Quick & healthy", "High protein") into **horizontally-scrollable rails** (max 20 latest items per group) with a **"see all" arrow** in each row header that links to the existing `/recipes` listing pre-filtered for that group.

Constraints honored: RSC-first (golden rule 3), token-only styling (rule 4), URL-as-state reuse (rule 7), strings via next-intl (E9-S2 key parity), a11y WCAG 2.1 AA (rule 6), `prefers-reduced-motion`.

---

## Feature 1 — Featured Slider

### Component: `src/components/recipe/FeaturedSlider.tsx` (`'use client'`)

Client island — requires `useState` (active index), `useEffect` (auto-advance timer), pointer/focus handlers. Receives fully-resolved data as props from the server page; does **not** read content at runtime.

**Props**

```ts
interface FeaturedSliderProps {
  slides: Recipe[]; // already selected + ordered by the server
  locale: Locale;
}
```

**Slide content** — same anatomy as the current hero, one per slide:
full-bleed `next/image` (`fill`, `sizes="100vw"`; first slide `priority`, rest lazy) + bottom gradient overlay + "Featured" eyebrow + title (`font-display`) + "View recipe" CTA (`Button variant="accent"` → `/recipes/{slug}`).

**Slide selection** — pure helper in `src/lib/content/query.ts` (exported via `src/lib/content/index.ts`):

```ts
export function selectFeaturedSlides(recipes: Recipe[], cap = 5): Recipe[]
```

- Input: locale-filtered recipes already sorted newest-first.
- Take `featured === true` first (newest-first preserved).
- If result has fewer than 2 slides, pad with latest non-featured recipes (no duplicates) until ≥2 or pool exhausted.
- Cap at `cap` (default 5).
- Pure, no mutation of input. Unit-tested.

**Behavior**

- **Auto-advance:** every **3000ms**, advance to next slide; infinite loop (wraps last → first).
- **Pause:** auto-advance pauses while the pointer is over the slider (`onMouseEnter`/`onMouseLeave`) **or** focus is within it (`onFocus`/`onBlur` via `focus-within` tracking). Resumes on leave/blur.
- **Reduced motion:** when `prefers-reduced-motion: reduce` (matchMedia), **no auto-advance** and slide changes are instant (no transform transition). Manual controls still work.
- **Transition:** horizontal track (`flex` of slides, `translateX(-index * 100%)`), `transition-transform` using a motion-duration token; disabled under reduced motion.

**Controls**

- **Dot indicators:** bottom-center, one `<button>` per slide, `aria-label` = i18n "Go to slide {n}", active dot `bg-primary` + `aria-current="true"`, inactive `bg-fg-muted/border-strong`. Click → jump to slide.
- **Prev / next arrows:** left & right edge icon buttons (`Button` icon variant, lucide `chevron-left` / `chevron-right`), `aria-label` i18n "Previous slide" / "Next slide", wrap-around. 44px touch target.

**A11y**

- Wrapper `<section aria-roledescription="carousel" aria-label={t('home.featuredRegion')}>`.
- Each slide container `aria-roledescription="slide"`, `aria-label="{n} of {total}"`, inactive slides `aria-hidden` + not focusable (CTA `tabIndex=-1` when off-screen).
- Controls keyboard-reachable; focus-visible ring from tokens.
- Single `<h1>` (page title) lives on the **active slide's** title to preserve one-h1-per-page; non-active titles use a non-heading element or `aria-hidden`. (Implementation: render slide titles as `<h2>` and keep a visually-hidden page `<h1>` in the section, OR mark active title `<h1>`. Chosen: visually-hidden `<h1>{t('home.title')}</h1>` at section top; slide titles are `<p>`/`<h2>` — avoids dynamic heading swaps.)

### Home page wiring

```ts
const slides = selectFeaturedSlides(recipes); // recipes already newest-first
// render <FeaturedSlider slides={slides} locale={l} /> in place of the hero <section>
```

If `slides.length === 0` (no recipes) → render nothing (same as today's `featured &&` guard).

---

## Feature 2 — Scrollable Group Rows + "See all"

### Component: `src/components/recipe/RecipeRow.tsx` (Server Component)

Pure CSS scroll-snap rail — no JS, stays a Server Component. Replaces the inline `Row` in `page.tsx`.

**Props**

```ts
interface RecipeRowProps {
  title: string;
  href: string;        // locale-aware path to /recipes filtered
  viewAllLabel: string; // i18n aria-label, e.g. "View all Quick & healthy"
  recipes: Recipe[];
  locale: Locale;
}
```

**Layout**

- **Header row:** `flex items-center justify-between`. Left: title (`font-display text-2xl`). Right: arrow link — `next-intl` `Link` to `href`, lucide `arrow-right` icon, `aria-label={viewAllLabel}`, focus-visible ring, hover color shift via tokens.
- **Rail:** `no-scrollbar -mx-4 flex snap-x gap-6 overflow-x-auto px-4 sm:mx-0 sm:px-0` (same hidden-scrollbar pattern as `CuisineChips`). Applies at **all widths** (no responsive grid fallback).
- **Cards:** each `RecipeCard` wrapped in a fixed-width `shrink-0 snap-start` box (~`w-72`, `sm:w-80`) so the rail scrolls horizontally on every breakpoint.
- Renders nothing if `recipes.length === 0`.

### Group → `/recipes` filter mapping (locale-aware `Link`)

| Group           | href                                     |
| --------------- | ---------------------------------------- |
| Latest recipes  | `/recipes?sort=newest`                   |
| Quick & healthy | `/recipes?maxTime=30&sort=quickest`      |
| High protein    | `/recipes?tags=high-protein`             |

Params confirmed against `use-recipe-filters.ts`: `sort` (`newest`/`quickest`/`highest`), `maxTime`, `tags` (comma list).

### Home page wiring

- Bump group queries from `slice(0, 8)` to `slice(0, 20)` (latest 20 per group).
- Replace each `<Row>` with `<RecipeRow title href viewAllLabel recipes locale>`.

---

## i18n

Add to `src/i18n/messages/en.json` and `es.json` (identical key sets — parity check must pass):

```jsonc
"home": {
  // ...existing
  "featuredRegion": "Featured recipes",   // es: "Recetas destacadas"
  "viewAll": "View all {group}",          // es: "Ver todo: {group}"
  "goToSlide": "Go to slide {n}",         // es: "Ir a la diapositiva {n}"
  "prevSlide": "Previous slide",          // es: "Diapositiva anterior"
  "nextSlide": "Next slide"               // es: "Diapositiva siguiente"
}
```

`viewAll` interpolates the already-translated group title (`home.latest` etc.).

---

## Styling / tokens

- No new hex. Reuse existing hero overlay gradient pattern already in `page.tsx`. Dots/arrows use semantic tokens (`bg-primary`, `bg-surface`, `border-border`, `text-fg`, `shadow-sm`, `--color-ring`).
- Motion via existing motion-duration / ease tokens; all transforms gated behind `prefers-reduced-motion`.

## Testing

- **Unit (Vitest):** `selectFeaturedSlides` — featured-only, padding when <2, no duplicates, cap, no input mutation, empty input.
- **Unit (Vitest+RTL, fake timers):** `FeaturedSlider` — auto-advances after 3s; pauses on `mouseEnter`, resumes on `mouseLeave`; dot click jumps; prev/next wrap; reduced-motion → no auto-advance.
- **Unit (RTL):** `RecipeRow` — renders arrow link with correct `href` + `aria-label`; caps/renders provided recipes; empty → null.
- **A11y (jest-axe):** 0 serious violations on slider + row.
- Gate: `pnpm typecheck && pnpm lint && pnpm test && pnpm build` clean.

## Out of scope

No changes to `/recipes` listing, FilterPanel, schema, API, or other pages. No new routes. Cuisine chip rail unchanged.
```

## Files

| File | Change |
| ---- | ------ |
| `src/components/recipe/FeaturedSlider.tsx` | **new** client island |
| `src/components/recipe/RecipeRow.tsx` | **new** server component |
| `src/lib/content/query.ts` | add `selectFeaturedSlides` |
| `src/lib/content/index.ts` | re-export `selectFeaturedSlides` |
| `src/app/[locale]/page.tsx` | use slider + rows; group slices → 20 |
| `src/i18n/messages/en.json`, `es.json` | new `home.*` keys |
| `tests/unit/...` | new unit + a11y tests |
