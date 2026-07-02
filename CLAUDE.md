# CLAUDE.md — Health Recipe Website

Production frontend for publishing health recipes (all cuisines). Greenfield **Next.js App Router** site. Content is git-versioned MDX; ratings/comments are a thin serverless layer.

## Read first (source of truth — these are LOCKED)

- **`plan.md`** — architecture, tech stack, locked decisions (§16), content model (§4), API contracts (§7), caching (§19), DB schema + RLS (§18), env vars (§17). Every decision is final; **do not re-evaluate alternatives** at build time.
- **`design_system.md`** — colors, tokens, type, component specs (§9), page blueprints (§10). Implement values **as-is**.
- **Nested `CLAUDE.md`** in each module dir = local rules. When working in a dir, follow its `CLAUDE.md` over this one if more specific.

## Stack

Next.js 15 (App Router) · React 19 · TypeScript strict · Tailwind v4 (CSS-var tokens) · Radix + shadcn pattern · Velite (MDX) · next-intl (`en` default, `es`) · Pagefind (search) · Supabase (UGC) · Upstash Ratelimit · React Hook Form + Zod · TanStack Query · Vitest/RTL + Playwright + axe. **Node 20 · pnpm 9.**

## Commands (defined in `package.json`)

- `pnpm dev` — dev server
- `pnpm build` — `next build` + Pagefind post-build. **Content validation runs here — build fails on invalid frontmatter.**
- `pnpm typecheck` — `tsc --noEmit`
- `pnpm lint` / `pnpm format`
- `pnpm test` (Vitest) · `pnpm test:e2e` (Playwright) · `pnpm test:a11y` (axe)

Run `pnpm typecheck && pnpm lint && pnpm test` before declaring any task done.

## Golden rules (apply everywhere)

1. **TypeScript strict. No `any`.** Prefer inferred + Zod-derived types (`z.infer`). Shared types from `@/types`.
2. **Path alias `@/` → `src/`.** No deep relative imports (`../../..`).
3. **RSC-first.** Components are Server Components by default. Add `'use client'` ONLY for interactive islands (search, rating, comment form, filters, theme/locale toggle, serving stepper). Never make a page/layout client just to fetch.
4. **Token-only styling.** Tailwind utilities backed by semantic tokens (`bg-surface text-fg border-border rounded-lg shadow-sm font-display`). **Never** hard-code hex / raw ramp steps / arbitrary colors in components. Missing value → add a token in `src/styles`, don't inline.
5. **Env via `@/env` only.** Never read `process.env` directly. Server-only secrets are never prefixed `NEXT_PUBLIC_`.
6. **A11y is non-negotiable (WCAG 2.1 AA):** semantic HTML, labels, focus-visible, keyboard nav, `prefers-reduced-motion`, 44px touch targets. Lean on Radix.
7. **URL is state** for filters/search/sort/locale. No client store for shareable state (no Zustand — dropped in v1).
8. **Validate all external input with Zod** — MDX frontmatter, API request bodies, env vars, form input.
9. **Conventional Commits.** Small PRs. CI must be green: typecheck, lint, test, build, a11y, Lighthouse.
10. **Don't add dependencies or swap locked choices** (plan §16) without explicit sign-off.

## Module map

| Dir               | Owns                                         | Local rules                |
| ----------------- | -------------------------------------------- | -------------------------- |
| `content/`        | recipe MDX                                   | `content/CLAUDE.md`        |
| `src/app/`        | routing, pages, layouts, metadata, SEO files | `src/app/CLAUDE.md`        |
| `src/app/api/`    | UGC route handlers (security-critical)       | `src/app/api/CLAUDE.md`    |
| `src/components/` | UI primitives + domain + layout              | `src/components/CLAUDE.md` |
| `src/lib/`        | content/search/seo/db/utils helpers          | `src/lib/CLAUDE.md`        |
| `src/schemas/`    | Zod schemas (single source of truth)         | `src/schemas/CLAUDE.md`    |
| `src/i18n/`       | locale config + message catalogs             | `src/i18n/CLAUDE.md`       |
| `src/styles/`     | design tokens + globals                      | `src/styles/CLAUDE.md`     |
| `tests/`          | unit / e2e / a11y                            | `tests/CLAUDE.md`          |

## Data flow (how modules communicate)

- **Content:** MDX (`content/`) → Velite validates against `schemas/recipe.ts` → typed objects → consumed only via `lib/content/` → rendered by pages in `app/`. UI never reads MDX/files at runtime.
- **Rendering:** pages (`app/`) compose components (`components/`), styled by tokens (`styles/`), strings from `i18n/`.
- **UGC:** client islands (`components/engagement/`) → TanStack Query → `app/api/*` route handlers → `lib/db/` (Supabase / Upstash). **Components never touch the DB directly** — only through the API.
- **SEO:** pages call `lib/seo/` builders for Recipe/breadcrumb JSON-LD + metadata.

## Definition of done

Typecheck + lint clean · unit tests for new logic/utils · a11y intact (0 serious axe) · tokens only (no hex) · RSC unless it must be an island · matches `plan.md` + `design_system.md`.
