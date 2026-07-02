# src/components/ — UI, Domain & Layout Components

Three tiers (plan §5): `ui/` primitives → `recipe/ discovery/ engagement/` domain → `layout/`. **Every component is specified by name in `design_system.md` §9** — implement to that spec (anatomy, sizes, states, a11y).

## Rules

- **Server Component by default.** Add `'use client'` ONLY when the component needs state/effects/event handlers/browser APIs. Client islands in v1: `RatingWidget`, `CommentForm`, `SearchBar`, `FilterPanel`, `SortSelect`, `serving Stepper` (in `IngredientList`), `ThemeToggle`, `LocaleSwitcher`. Keep islands small; lift static markup to server parents.
- **Token-only styling.** Tailwind utilities mapped to semantic tokens (`bg-surface`, `text-fg`, `border-border`, `rounded-lg`, `shadow-sm`, `font-display`). No hex, no raw ramp step, no arbitrary color/spacing. Spacing on the 4px scale; radius/shadow/motion from tokens (design §1, §3–§5, §8).
- **Primitives (`ui/`) wrap Radix** (shadcn pattern): accessible, unstyled, token-styled, `forwardRef`, accept + merge `className` via `cn()` (`lib/utils`), expose variants. Build `Button, Input, Card, Badge, Dialog, Tabs, Tooltip, Skeleton` to design §9.1–9.13.
- **Compose, don't duplicate.** Domain/layout components are built from `ui/` primitives — never re-implement a Button/Dialog/Select.
- **a11y:** focus-visible rings, correct `aria-*`, keyboard support, 44px touch targets, `prefers-reduced-motion`. Images via `next/image` with required `alt` + correct aspect ratio (design §7).
- **Data:** UGC components use **TanStack Query hooks** hitting `/api/*`. Components **never** import `lib/db` or a Supabase client directly. Static recipe data arrives as props from server pages (sourced via `lib/content`).
- **Strings** via next-intl (props or hooks) — no hard-coded copy.
- **Files:** `PascalCase.tsx`, one component per file, named export, props interface `XxxProps`.
- **Color guard:** `accent-500` is **decorative only** (star fill); for accent text/buttons use the `--color-accent` token (= accent-600), which passes AA (design §1.6).

## Don't

No data fetching inside `ui/` primitives. No global state library. No business logic in components — put it in `lib/`. No inlined design values.
