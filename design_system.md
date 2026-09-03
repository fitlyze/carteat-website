# Design System — Health Recipe Website

> Visual + interaction spec for implementation. Pairs with `i-would-like-to-ancient-lollipop.md` (§5 UI System). Every value here is final and concrete — a developer implements it as-is. Tokens map 1:1 to `src/styles/tokens.css` + Tailwind v4 `@theme` in `tailwind.config.ts`.

---

## 0. Art Direction

**Vibe:** warm, editorial, appetite-forward — think a modern cooking magazine (NYT Cooking / Smitten Kitchen / Half Baked Harvest), not a clinical "health app". Big food photography, generous whitespace, a fresh green that signals _health/fresh_, and a warm terracotta accent that signals _appetite/food_.

**Pillars**

1. **Warm canvas, not white.** Background is a soft cream (`#FBF8F3`), never pure `#FFFFFF`. Cards sit on cream as clean white surfaces.
2. **Photography is the hero.** Layouts frame food. UI chrome stays quiet so images pop.
3. **Editorial type.** A characterful serif (Fraunces) for headings gives personality; a neutral sans (Inter) keeps body + UI legible.
4. **Soft, rounded, tactile.** Medium-large radii, soft warm-tinted shadows, pill-shaped chips. Friendly, not corporate-sharp.
5. **Calm color, loud food.** Greens/neutrals carry the UI; terracotta + photography carry the energy.

**Theme name:** _CartEat._

---

## 1. Color System

All palettes are full 50→950 ramps so the dev can reach for any step. Semantic tokens below map ramp steps to roles for light + dark.

### 1.1 Primary — "Basil" (brand green)

| Step | Hex       |
| ---- | --------- |
| 50   | `#EEF7F0` |
| 100  | `#D6ECDC` |
| 200  | `#AED9BA` |
| 300  | `#7FC093` |
| 400  | `#52A66E` |
| 500  | `#2F8C52` |
| 600  | `#237043` |
| 700  | `#1D5A37` |
| 800  | `#18472C` |
| 900  | `#123A25` |
| 950  | `#0A2116` |

### 1.2 Accent — "Terracotta" (warm / appetite)

| Step | Hex       |
| ---- | --------- |
| 50   | `#FDF3EE` |
| 100  | `#FAE1D5` |
| 200  | `#F4C2AC` |
| 300  | `#EC9C7B` |
| 400  | `#E37A52` |
| 500  | `#D85F33` |
| 600  | `#BC4A23` |
| 700  | `#9C3A1D` |
| 800  | `#7E311C` |
| 900  | `#682B1B` |
| 950  | `#38130B` |

### 1.3 Neutral — "Sand" (warm-tinted gray; NOT cold gray)

| Step | Hex       | Note                                             |
| ---- | --------- | ------------------------------------------------ |
| 0    | `#FFFFFF` | pure white — card surfaces only                  |
| 50   | `#FBF8F3` | **app background (light)** — cream               |
| 100  | `#F3EEE6` | muted fills, hover backgrounds                   |
| 200  | `#E7DFD3` | borders (light)                                  |
| 300  | `#D5C9B8` | strong borders, dividers                         |
| 400  | `#B3A693` | disabled fg, placeholders                        |
| 500  | `#8C8170` | subtle text                                      |
| 600  | `#6B6253` | muted text (light)                               |
| 700  | `#524B40` | secondary text                                   |
| 800  | `#393430` | surface (dark) borders                           |
| 850  | `#2A2723` | **surface (dark)**                               |
| 900  | `#1F1C19` | **app background (dark)** / primary text (light) |
| 950  | `#141210` | deepest                                          |

### 1.4 Status

| Role    | Hex       | On-color text |
| ------- | --------- | ------------- |
| success | `#2E9E5B` | white         |
| warning | `#E0A52E` | `#1F1C19`     |
| danger  | `#D64545` | white         |
| info    | `#3B82C4` | white         |

### 1.5 Semantic Tokens (the only thing components reference)

> Components use **semantic tokens only** (`--color-bg`, `--color-primary`…), never raw ramp steps. This makes dark mode a token swap.

| Token                        | Light                   | Dark                    |
| ---------------------------- | ----------------------- | ----------------------- |
| `--color-bg`                 | `neutral-50` `#FBF8F3`  | `neutral-900` `#1F1C19` |
| `--color-bg-muted`           | `neutral-100` `#F3EEE6` | `neutral-850` `#2A2723` |
| `--color-surface`            | `#FFFFFF`               | `neutral-850` `#2A2723` |
| `--color-surface-hover`      | `neutral-50` `#FBF8F3`  | `neutral-800` `#393430` |
| `--color-fg`                 | `neutral-900` `#1F1C19` | `neutral-50` `#FBF8F3`  |
| `--color-fg-muted`           | `neutral-600` `#6B6253` | `neutral-400` `#B3A693` |
| `--color-fg-subtle`          | `neutral-500` `#8C8170` | `neutral-500` `#8C8170` |
| `--color-border`             | `neutral-200` `#E7DFD3` | `neutral-800` `#393430` |
| `--color-border-strong`      | `neutral-300` `#D5C9B8` | `neutral-700` `#524B40` |
| `--color-primary`            | `primary-600` `#237043` | `primary-400` `#52A66E` |
| `--color-primary-hover`      | `primary-700` `#1D5A37` | `primary-300` `#7FC093` |
| `--color-primary-fg`         | `#FFFFFF`               | `neutral-950` `#141210` |
| `--color-primary-subtle`     | `primary-50` `#EEF7F0`  | `primary-900` `#123A25` |
| `--color-accent`             | `accent-600` `#BC4A23`  | `accent-400` `#E37A52`  |
| `--color-accent-hover`       | `accent-700` `#9C3A1D`  | `accent-300` `#EC9C7B`  |
| `--color-accent-fg`          | `#FFFFFF`               | `neutral-950` `#141210` |
| `--color-star` (rating fill) | `accent-500` `#D85F33`  | `accent-400` `#E37A52`  |
| `--color-ring` (focus)       | `primary-500` `#2F8C52` | `primary-400` `#52A66E` |
| `--color-success`            | `#2E9E5B`               | `#3CB873`               |
| `--color-warning`            | `#E0A52E`               | `#F0BB4D`               |
| `--color-danger`             | `#D64545`               | `#E86A6A`               |

### 1.6 Contrast rules (WCAG 2.1 AA — non-negotiable)

- Body text on `--color-bg`: ≥ 4.5:1 (fg/bg pairs above pass).
- **Accent as text/button uses step 600+** (`#BC4A23` on white ≈ 5.2:1 ✓). Accent-500 (`#D85F33`) is **decorative only** (star fill, image overlays) — never small text on white (fails AA).
- UI component boundaries / icons: ≥ 3:1.
- Verify every new fg/bg pair with a contrast checker before shipping. `prefers-contrast: more` may bump borders to `-strong`.

---

## 2. Typography

### 2.1 Font families (self-hosted via `next/font`)

| Role                                | Font                                                | Weights            | Fallback stack                                     |
| ----------------------------------- | --------------------------------------------------- | ------------------ | -------------------------------------------------- |
| Display / Headings                  | **Fraunces** (variable, `opsz` 9–144)               | 400, 500, 600      | `Georgia, 'Times New Roman', serif`                |
| Body / UI                           | **Inter** (variable)                                | 400, 500, 600, 700 | `system-ui, -apple-system, 'Segoe UI', sans-serif` |
| Numeric (nutrition figures, timers) | **Inter** with `font-variant-numeric: tabular-nums` | 500, 600           | —                                                  |

- Fraunces: enable optical sizing; for large display use higher `opsz` + a soft, slightly "wonky" feel (`font-optical-sizing: auto`). Headings use weight **500–600**, never 700+ (keeps it editorial, not heavy).
- Inter: UI labels 500, body 400, emphasis 600.
- Self-host both (no FOUT/CLS). Subset to `latin` + `latin-ext` (Spanish locale needs ext for accents).
- CSS vars: `--font-display`, `--font-sans`.

### 2.2 Type scale (fluid `clamp()`, mobile → desktop)

Base = 16px. Ratio ≈ 1.25 (major third). Token → `clamp(min, preferred-vw, max)`.

| Token         | Min  | Max  | clamp()                                    | Use                     |
| ------------- | ---- | ---- | ------------------------------------------ | ----------------------- |
| `--text-xs`   | 12px | 12px | `0.75rem`                                  | captions, badges, legal |
| `--text-sm`   | 14px | 14px | `0.875rem`                                 | meta, helper text       |
| `--text-base` | 16px | 16px | `1rem`                                     | body default            |
| `--text-lg`   | 18px | 18px | `1.125rem`                                 | lead paragraph          |
| `--text-xl`   | 20px | 20px | `1.25rem`                                  | card titles             |
| `--text-2xl`  | 24px | 28px | `clamp(1.5rem, 1.35rem + 0.75vw, 1.75rem)` | section headings        |
| `--text-3xl`  | 30px | 36px | `clamp(1.875rem, 1.6rem + 1.4vw, 2.25rem)` | sub-hero                |
| `--text-4xl`  | 36px | 48px | `clamp(2.25rem, 1.85rem + 2vw, 3rem)`      | recipe title            |
| `--text-5xl`  | 44px | 60px | `clamp(2.75rem, 2.1rem + 3.2vw, 3.75rem)`  | page display            |
| `--text-6xl`  | 52px | 72px | `clamp(3.25rem, 2.3rem + 4.7vw, 4.5rem)`   | home hero               |

### 2.3 Line-height, tracking, weight

| Token               | Value   | Use                                   |
| ------------------- | ------- | ------------------------------------- |
| `--leading-tight`   | 1.1     | display / hero                        |
| `--leading-snug`    | 1.25    | headings                              |
| `--leading-normal`  | 1.55    | body                                  |
| `--leading-relaxed` | 1.7     | recipe body / long-form               |
| `--tracking-tight`  | -0.02em | display headings (Fraunces)           |
| `--tracking-normal` | 0       | body                                  |
| `--tracking-wide`   | 0.04em  | overline / eyebrow labels (uppercase) |

**Headings always Fraunces + `--leading-snug` + `--tracking-tight`. Body always Inter + `--leading-normal`. Recipe instruction body uses `--leading-relaxed`.**

### 2.4 Reading measure

Long-form recipe body + comments capped at **`max-width: 68ch`** (≈ 680–720px) for readability.

---

## 3. Spacing & Layout

### 3.1 Spacing scale (4px base — matches Tailwind default; affirmed)

`0, 1=4, 2=8, 3=12, 4=16, 5=20, 6=24, 7=28, 8=32, 10=40, 12=48, 14=56, 16=64, 20=80, 24=96, 32=128` (px).

- Component internal padding: multiples of 4, usually 8/12/16.
- Section vertical rhythm: 64–96 on desktop, 40–56 on mobile.

### 3.2 Breakpoints (mobile-first)

| Name  | Min width |
| ----- | --------- |
| `sm`  | 640px     |
| `md`  | 768px     |
| `lg`  | 1024px    |
| `xl`  | 1280px    |
| `2xl` | 1536px    |

### 3.3 Containers / max widths

| Token                | Value                                 | Use                            |
| -------------------- | ------------------------------------- | ------------------------------ |
| `--container-page`   | 1280px                                | global max content width       |
| `--container-prose`  | 720px                                 | recipe body / article text     |
| `--container-narrow` | 560px                                 | forms, auth-like, empty states |
| Page gutter          | 16px (mobile) → 24px (md) → 40px (xl) | horizontal padding             |

### 3.4 Key grids

- **Recipe listing grid:** `grid` of RecipeCards. Columns: 1 (mobile) → 2 (sm) → 3 (lg) → 4 (xl). Gap 24px. `auto-fill, minmax(260px, 1fr)` acceptable alternative.
- **Recipe detail:** single column ≤ md; at `lg`, two columns — main body (`1fr`) + **sticky** ingredients/nutrition sidebar (`320px`), gap 48px. Sidebar `position: sticky; top: 88px`.
- **Home hero:** full-bleed featured recipe image with overlaid title card; below, horizontally-scrollable cuisine chips + featured grid.

---

## 4. Radius, Elevation, Borders

### 4.1 Radius

| Token           | px   | Use                                        |
| --------------- | ---- | ------------------------------------------ |
| `--radius-xs`   | 4    | tags, inline badges                        |
| `--radius-sm`   | 6    | inputs (inner), small controls             |
| `--radius-md`   | 10   | **buttons, inputs, selects**               |
| `--radius-lg`   | 14   | **cards, panels, dialogs**                 |
| `--radius-xl`   | 20   | hero cards, media containers               |
| `--radius-2xl`  | 28   | large feature blocks                       |
| `--radius-full` | 9999 | **chips, pills, avatars, stars container** |

### 4.2 Shadows / elevation (warm-tinted, soft, low alpha — uses `neutral-900` @ alpha)

| Token            | Value                                                                         |
| ---------------- | ----------------------------------------------------------------------------- |
| `--shadow-xs`    | `0 1px 2px 0 rgb(31 28 25 / 0.05)`                                            |
| `--shadow-sm`    | `0 1px 3px 0 rgb(31 28 25 / 0.08), 0 1px 2px -1px rgb(31 28 25 / 0.08)`       |
| `--shadow-md`    | `0 4px 12px -2px rgb(31 28 25 / 0.10), 0 2px 6px -2px rgb(31 28 25 / 0.08)`   |
| `--shadow-lg`    | `0 12px 28px -6px rgb(31 28 25 / 0.14), 0 6px 12px -6px rgb(31 28 25 / 0.10)` |
| `--shadow-xl`    | `0 24px 48px -12px rgb(31 28 25 / 0.18)`                                      |
| `--shadow-focus` | `0 0 0 3px rgb(47 140 82 / 0.35)` (focus ring glow; pairs with outline)       |

- **Dark mode:** shadows are nearly invisible on dark bg → rely on `--color-surface` lightness + `--color-border` for separation; keep shadow but it reads subtle.
- Resting cards: `--shadow-sm`. Hover: lift to `--shadow-md` + translateY(-2px). Dialogs/popovers: `--shadow-lg`/`xl`.

### 4.3 Borders

- Default border: `1px solid var(--color-border)`.
- Hairline dividers: `1px solid var(--color-border)`, or use `--color-border-strong` for emphasis.
- Inputs: `1px` border; focus swaps to `--color-ring` + `--shadow-focus`.

---

## 5. Motion

| Token             | Value                                                                  |
| ----------------- | ---------------------------------------------------------------------- |
| `--ease-out`      | `cubic-bezier(0.22, 1, 0.36, 1)`                                       |
| `--ease-in-out`   | `cubic-bezier(0.65, 0, 0.35, 1)`                                       |
| `--ease-spring`   | `cubic-bezier(0.34, 1.56, 0.64, 1)` (playful overshoot — chips, stars) |
| `--duration-fast` | 120ms                                                                  |
| `--duration-base` | 200ms                                                                  |
| `--duration-slow` | 320ms                                                                  |

- Hover/press feedback: `--duration-fast` + `--ease-out`.
- Card hover lift, dialog enter: `--duration-base`.
- Star fill on rate, chip select: `--ease-spring`.
- **`prefers-reduced-motion: reduce`** → disable transforms/translate, keep opacity fades ≤ 120ms, no parallax, no auto-playing motion. Mandatory.

---

## 6. Z-index scale

| Token          | Value | Use                     |
| -------------- | ----- | ----------------------- |
| `--z-base`     | 0     | content                 |
| `--z-sticky`   | 100   | sticky header / sidebar |
| `--z-dropdown` | 200   | selects, menus, sort    |
| `--z-overlay`  | 300   | dialog backdrop         |
| `--z-modal`    | 400   | dialog/sheet            |
| `--z-popover`  | 500   | tooltips, toasts        |
| `--z-toast`    | 600   | notifications           |

---

## 7. Iconography & Imagery

**Icons:** [Lucide](https://lucide.dev) line icons. Stroke `1.75px`, sizes `16 / 20 / 24`. Default color `currentColor` (inherits text token). Common set: `search, sliders-horizontal, star, clock, flame, users, leaf, chef-hat, globe, moon, sun, chevron-down, x, heart`.

**Photography (the brand's biggest visual lever):**

- Style: natural daylight, slightly warm white balance, shallow depth of field, overhead (flat-lay) or 45° angle. Real food, minimal props, lots of negative space.
- **Aspect ratios:** RecipeCard hero `4:3`; recipe detail hero `16:9` (desktop) / `4:3` (mobile); inline body images `3:2`.
- Always `next/image` (AVIF/WebP, responsive `sizes`), `loading="lazy"` except above-the-fold hero (`priority`).
- **Required `alt`** (enforced in frontmatter schema). No text baked into images.
- Image overlay (for text-on-image, e.g. hero title): bottom linear gradient `linear-gradient(to top, rgb(20 18 16 / 0.65), transparent 60%)` so white text stays AA.
- Placeholder while loading: blurred `--color-bg-muted` shimmer (Skeleton), or `next/image` blur placeholder.

---

## 8. Design Tokens — implementation reference

### 8.1 `src/styles/tokens.css`

```css
:root {
  /* color ramps (abbreviated — include full 50–950 from §1) */
  --primary-600: #237043;
  --primary-400: #52a66e; /* … */
  --accent-600: #bc4a23;
  --accent-500: #d85f33;
  --accent-400: #e37a52; /* … */
  --neutral-50: #fbf8f3;
  --neutral-900: #1f1c19; /* … */

  /* semantic — LIGHT (default) */
  --color-bg: var(--neutral-50);
  --color-surface: #ffffff;
  --color-fg: var(--neutral-900);
  --color-fg-muted: #6b6253;
  --color-border: #e7dfd3;
  --color-primary: var(--primary-600);
  --color-primary-fg: #ffffff;
  --color-accent: var(--accent-600);
  --color-star: var(--accent-500);
  --color-ring: #2f8c52;
  /* …rest of §1.5… */

  /* radius / shadow / motion / type — from §2–§6 */
  --radius-md: 10px;
  --radius-lg: 14px;
  --radius-full: 9999px;
  --shadow-sm: 0 1px 3px 0 rgb(31 28 25 / 0.08), 0 1px 2px -1px rgb(31 28 25 / 0.08);
  --font-display: 'Fraunces', Georgia, serif;
  --font-sans: 'Inter', system-ui, sans-serif;
}

[data-theme='dark'] {
  --color-bg: var(--neutral-900);
  --color-surface: #2a2723;
  --color-fg: var(--neutral-50);
  --color-fg-muted: #b3a693;
  --color-border: #393430;
  --color-primary: var(--primary-400);
  --color-primary-fg: #141210;
  --color-accent: var(--accent-400);
  --color-star: var(--accent-400);
  --color-ring: #52a66e;
  /* …rest of dark column from §1.5… */
}
```

> Dark mode toggled by `next-themes` setting `data-theme="dark"` on `<html>`. Use `data-theme` (not `.dark` class) to match this token block; configure `next-themes` with `attribute="data-theme"`.

### 8.2 Tailwind v4 `@theme` (in `tailwind.config.ts` / CSS `@theme`)

```css
@theme {
  --color-bg: var(--color-bg);
  --color-surface: var(--color-surface);
  --color-fg: var(--color-fg);
  --color-primary: var(--color-primary);
  --color-accent: var(--color-accent);
  --radius-md: var(--radius-md);
  --font-display: var(--font-display);
  /* expose every semantic token so utilities like bg-surface, text-fg, rounded-md work */
}
```

Result: developer writes `bg-surface text-fg border-border rounded-lg shadow-sm font-display` etc. No hard-coded hex anywhere in components.

---

## 9. Component Specs

> Built on Radix primitives (shadcn pattern), styled with tokens. Each spec lists anatomy, sizes, states, a11y. Default radius/shadow/colors come from tokens above.

### 9.1 Button

- **Variants:** `primary` (bg `--color-primary`, fg `--color-primary-fg`) · `secondary` (bg `--color-bg-muted`, fg `--color-fg`) · `outline` (transparent, `1px --color-border`, fg `--color-fg`) · `ghost` (transparent, hover bg `--color-bg-muted`) · `accent` (bg `--color-accent`) · `destructive` (bg `--color-danger`).
- **Sizes:** `sm` h36 px-12 text-sm · `md` h44 px-16 text-base · `lg` h52 px-20 text-lg. Radius `--radius-md`. Icon-only: square (36/44/52), centered icon.
- **States:** hover → `-hover` token / lift; active → translateY(1px) + slightly darker; focus-visible → `--shadow-focus` + 2px outline `--color-ring`; disabled → `opacity .5`, `cursor: not-allowed`; loading → spinner (Lucide `loader-2` spin) replaces leading icon, label stays, button non-interactive.
- Min touch target 44×44 on mobile. Gap icon↔label 8px. Font weight 500.

### 9.2 Input / Textarea / Select

- Height 44 (md), px-12, radius `--radius-md`, `1px --color-border`, bg `--color-surface`, text `--color-fg`, placeholder `--color-fg-subtle`.
- Focus: border `--color-ring` + `--shadow-focus`. Error: border `--color-danger` + helper text `--color-danger`. Disabled: bg `--color-bg-muted`, fg `--color-fg-subtle`.
- Label above (text-sm, weight 500). Helper/error text below (text-xs). Textarea (comment) min-h 120, resize-y, char counter bottom-right (`x/2000`).
- Select = Radix Select; trigger styled like Input + `chevron-down`; menu bg `--color-surface`, `--shadow-lg`, radius `--radius-md`, item hover bg `--color-bg-muted`.

### 9.3 RecipeCard (key component)

- **Anatomy:** media (4:3, radius-lg top, `next/image` cover) → cuisine **Chip** overlaid top-left on image → body (p-16): title (Fraunces, text-xl, weight 600, 2-line clamp) → meta row (text-sm `--color-fg-muted`: `clock` total time · `flame`/leaf difficulty) → footer row (RatingWidget compact: ★ avg + count · diet **Badges**).
- Surface `--color-surface`, radius `--radius-lg`, `--shadow-sm`, `1px --color-border`. Whole card is one link.
- **Hover:** lift translateY(-2px) + `--shadow-md` + image subtle `scale(1.03)` (`overflow:hidden`), `--duration-base`. Focus-visible: `--shadow-focus` ring on card.
- Mobile: full-width; respects listing grid (§3.4).

### 9.4 Chip / Pill (filters, cuisine tags)

- Radius `--radius-full`, h32, px-12, text-sm weight 500, `1px --color-border`, bg `--color-surface`.
- **Selected:** bg `--color-primary-subtle`, border `--color-primary`, text `--color-primary` (dark mode adjusts). Optional leading icon (e.g. `leaf` for vegan).
- Removable filter chip: trailing `x` (16px) button. Select transition `--ease-spring`.
- Cuisine chips row on home: horizontal scroll, snap, hide scrollbar.

### 9.5 Badge (diet / tag labels)

- Radius `--radius-xs`, px-8, py-2, text-xs weight 600, uppercase optional, `--tracking-wide`.
- Tonal style: bg `--color-primary-subtle` + text `--color-primary` (diet); neutral variant bg `--color-bg-muted` + text `--color-fg-muted` (tags). Non-interactive (static label).

### 9.6 RatingWidget

- **Display (read):** 5 stars, filled portion in `--color-star`, empty `--color-border-strong`. Integer fill only (no half). Beside: avg (e.g. `4.6`, Inter 600 tabular) + count (`(128)`, text-sm muted). **Render nothing / "No ratings yet" when count = 0.**
- **Interactive (rate):** stars are buttons; hover/focus fills up to hovered star with `--ease-spring` pop; click submits (optimistic). After submit, show user's value + thank-you micro-copy; allow re-vote (overwrites). Disabled state while request in flight.
- Sizes: compact 16px (card), default 24px (detail). Keyboard: arrow keys move selection, Enter/Space submits; `role="radiogroup"`, each star `role="radio"` + `aria-label="N stars"`.

### 9.7 NutritionTable

- Card (`--color-surface`, radius-lg, p-16/20). Heading "Nutrition (per serving)" Fraunces text-xl.
- **Calories** highlighted: large figure (text-3xl, Inter 600 tabular) + `--color-accent` underline/keyline.
- Grid of macros (protein/carbs/fat/fiber/sugar/sodium): label (text-sm muted) + value (text-lg tabular, unit `g`/`mg`). 2 cols mobile, flexible desktop.
- Reflects **serving scaler**: values recompute live when servings change (animate number change ≤120ms, respect reduced-motion).
- Disclaimer footer: text-xs `--color-fg-subtle` — "Values are estimates."

### 9.8 IngredientList (+ serving scaler)

- Header row: "Ingredients" (Fraunces text-xl) + serving **Stepper** (− N + ) on the right. Stepper buttons = icon Buttons (ghost, 32px), value tabular.
- List: each item = checkbox (Radix, custom check in `--color-primary`) + scaled qty (tabular, weight 500) + unit + name. Strikethrough + muted when checked (local state only).
- Scaling via pure `scaleIngredients(base, ratio)`; round sensibly (e.g. 1.5, ¾). Sticky within detail sidebar at `lg`.

### 9.9 StepList

- Ordered steps; each = number badge (circle, `--color-primary-subtle` bg, `--color-primary` numeral, Fraunces) + step text (`--leading-relaxed`, prose measure 68ch). Generous py between steps (24). Optional inline step image (3:2).

### 9.10 SearchBar

- Pill (`--radius-full`) or radius-md, h48, leading `search` icon, bg `--color-surface`, `1px --color-border`, `--shadow-sm`. Focus → `--color-ring` + `--shadow-focus`.
- In header: compact, expands on focus (md+). On `/search`: large, autofocused. Debounced input; clears with trailing `x`. Results (Pagefind) appear in a panel/list below with highlighted matches (`<mark>` styled bg `--color-primary-subtle`).

### 9.11 FilterPanel + SortSelect

- **Desktop (lg+):** left sidebar, sections (Cuisine, Diet, Meal type, Max time slider, Difficulty) as Chip groups / checkboxes. "Clear all" ghost button. Active filters shown as removable chips above the grid.
- **Mobile:** "Filters" Button opens a Radix Dialog/Sheet from bottom; apply/clear footer; sticky.
- All filter state → URL params (shareable). **SortSelect:** Radix Select — Newest / Quickest / Highest rated.

### 9.12 Dialog / Sheet

- Backdrop `rgb(20 18 16 / 0.5)` + subtle blur(2px), `--z-overlay`. Panel `--color-surface`, radius-lg (xl for sheets), `--shadow-xl`, `--z-modal`. Enter: fade + scale .98→1 (`--duration-base`). Close `x` top-right (ghost icon button). Focus trapped (Radix), `Esc` closes, returns focus to trigger. Mobile sheet slides from bottom, radius top only.

### 9.13 Tabs / Tooltip / Skeleton

- **Tabs (Radix):** underline-style active indicator in `--color-primary` (animated slide), inactive text `--color-fg-muted`. Used e.g. recipe detail (Ingredients / Steps / Nutrition on mobile).
- **Tooltip (Radix):** bg `--color-fg`, text `--color-bg`, text-xs, radius-sm, `--shadow-md`, 6px offset, 200ms open delay. Never put essential info tooltip-only.
- **Skeleton:** bg `--color-bg-muted`, radius matches target, shimmer sweep (`--color-surface` highlight) 1.2s loop; static block under reduced-motion. Used for cards, comments, rating while loading.

### 9.14 Header (sticky)

- h64 (mobile) / h72 (desktop), `--z-sticky`, bg `--color-bg` with `backdrop-blur` + bottom `1px --color-border` once scrolled. Left: logo (wordmark in Fraunces + `leaf`/`chef-hat` mark). Center/right: nav links (Recipes, Cuisines), SearchBar, LocaleSwitcher, ThemeToggle. Mobile: hamburger → Sheet menu.

### 9.15 Footer

- bg `--color-bg-muted`, py-64. Columns: brand blurb, recipe categories, locale switcher, social. Bottom bar: copyright + "values are estimates" + privacy link. text-sm muted.

### 9.16 LocaleSwitcher + ThemeToggle

- **LocaleSwitcher:** `globe` icon Button → Radix dropdown (English / Español). Switches locale-prefixed route, preserves path. Current locale checked.
- **ThemeToggle:** icon Button toggling `sun`/`moon` via `next-themes`. Animated icon cross-fade (`--ease-spring`). `aria-label` reflects action. No flash on load (next-themes script).

### 9.17 CommentForm + CommentList

- **Form:** name Input (2–50) + body Textarea (10–2000, char counter) + honeypot (visually hidden, `aria-hidden`, `tabindex=-1`) + submit Button. On submit → optimistic "pending review" note (info tone), form resets. Inline Zod errors. Rate-limit 429 → friendly warning toast.
- **List:** each comment = avatar initial (circle, `--color-primary-subtle`), author (weight 600), relative date (muted, `Intl`), body (escaped plain text, prose measure). Empty state: illustration/icon + "Be the first to comment." Loading: 3 Skeleton rows.

### 9.18 States every page must define (visual)

- **Loading:** Skeletons (never spinners-only for content).
- **Empty:** centered icon + heading (Fraunces) + sub (muted) + optional CTA. (No search results / no comments / no recipes in a cuisine.)
- **Error:** `error.tsx` — apologetic heading, retry Button, no stack traces to users.
- **404:** `not-found.tsx` — playful food line, search + home Buttons.
- **Offline / 429 / network fail:** toast (`--z-toast`) with retry.

---

## 10. Page Layout Blueprints

- **Home:** sticky header → full-bleed hero (featured recipe, overlaid title card bottom-left, primary CTA "View recipe") → horizontal cuisine chip rail → "Latest" / "Quick & healthy" / "High protein" curated card rows (or one responsive grid) → newsletter/footer.
- **Recipe listing (`/recipes`):** page title + result count → active filter chips → [filter sidebar (lg) | filter button (mobile)] + SortSelect → responsive card grid → pagination or "load more".
- **Recipe detail (`/recipes/[slug]`):** breadcrumb → title (text-4xl Fraunces) + meta (time/difficulty/servings/rating) → hero image (16:9) → 2-col: { main = description, StepList, tips, comments } · { sticky sidebar = IngredientList + serving scaler + NutritionTable } → related recipes row. JSON-LD injected (invisible).
- **Search (`/search`):** large SearchBar (autofocus) → live Pagefind results list with match highlights → empty/no-result state.
- **Cuisine (`/cuisines/[cuisine]`):** cuisine header (name + short blurb + image band) → filtered card grid.

---

## 11. Accessibility (WCAG 2.1 AA — enforced)

- Color contrast per §1.6. Never color-only signaling (filters show check + color; status uses icon + text).
- Visible focus on **every** interactive element (`--shadow-focus` + outline). Logical tab order. Skip-to-content link.
- Semantic landmarks (`header/nav/main/footer`), one `h1`/page, ordered headings.
- All images `alt` (required in schema); decorative images `alt=""`.
- Forms: `<label>` linked, errors announced (`aria-live`), `aria-invalid`.
- Radix gives keyboard + ARIA for Dialog/Select/Tabs/Tooltip — don't reinvent.
- `prefers-reduced-motion` honored (§5). `prefers-contrast: more` strengthens borders.
- Min 44×44 touch targets. Hit `axe` 0-serious in CI.

---

## 12. Dark Mode

- Toggle via `next-themes` (`attribute="data-theme"`), respects system default, persists choice, no FOUT (inline script).
- Achieved purely by swapping semantic tokens (§1.5 dark column) — components unchanged.
- Adjustments: brand/accent shift one step lighter for contrast on dark; shadows lean on surface/border separation; image gradient overlays still valid; reduce pure-white text to `--color-fg` (`neutral-50`) to avoid glare.

---

## 13. Do / Don't

**Do:** use semantic tokens only · let photography lead · keep Fraunces for headings + Inter for everything else · generous whitespace · pill chips, rounded cards, soft shadows · animate with restraint.
**Don't:** pure white backgrounds · cold gray neutrals · accent-500 as small text on white · heavy heading weights (>600) · color-only meaning · spinners where skeletons fit · tooltip-only critical info · more than one accent hue.

---

## 14. Handoff Checklist (for the developer)

1. Add `Fraunces` + `Inter` via `next/font` → expose `--font-display`, `--font-sans`.
2. Author full ramps (§1.1–1.4) + semantic tokens (§1.5) in `src/styles/tokens.css`, both themes.
3. Wire Tailwind v4 `@theme` (§8.2) so utilities resolve to tokens.
4. Configure `next-themes` `attribute="data-theme"`.
5. Build primitives (`components/ui/*`) to specs §9.1–9.6, 9.12–9.13 — token-only styling.
6. Build domain components (§9.3, 9.6–9.11, 9.14–9.17).
7. Implement page blueprints §10 + required states §9.18.
8. Verify contrast (§1.6) + a11y (§11) + reduced-motion before merge.
