# Implementation Plan — Health Recipe Website (All Cuisines)

## Context

You want a **production-ready frontend** to publish health recipes across all cuisines. This is a greenfield project (empty `/Users/mammad/Documents/amazon`). The goal is a fast, SEO-strong, content-first site you (a small team) author, with discovery (search + filter), per-recipe nutrition, multi-language UI, and a dynamic engagement layer (ratings + comments).

**Locked decisions (from clarification):**

- Content lives as **MDX files in the repo** (git-versioned, no CMS).
- **Next.js (App Router)** for SSG/ISR + best-in-class SEO (Google Recipe rich results).
- v1 features: **search + filter**, **ratings + comments**, **nutrition facts**, **i18n**.
- Authoring is **you / small team** — no public submission flow.

**Key architectural tension & resolution:** MDX content is static, but ratings + comments are dynamic user-generated content (UGC). The site is therefore a **hybrid**: statically generated recipe pages (build-time MDX) + a thin serverless dynamic layer for UGC. This keeps the content pipeline simple and free while still allowing live engagement. See [Dynamic Layer](#7-dynamic-layer-ratings--comments).

---

## 1. Tech Stack

| Concern                | Choice                                                        | Why                                                                     |
| ---------------------- | ------------------------------------------------------------- | ----------------------------------------------------------------------- |
| Framework              | **Next.js 15 (App Router) + React 19**                        | SSG/ISR, file routing, image optimization, first-class SEO/metadata API |
| Language               | **TypeScript (strict)**                                       | Type safety end-to-end, frontmatter typing                              |
| Content                | **MDX** compiled via **Velite**                               | Typed data + Zod frontmatter validation at build                        |
| Frontmatter validation | **Zod**                                                       | Single source of truth for recipe schema; fail build on bad data        |
| Styling                | **Tailwind CSS v4** + **CSS variables (design tokens)**       | Utility speed + themeable token layer (light/dark)                      |
| Component primitives   | **Radix UI** (headless) + **shadcn/ui** pattern               | Accessible, unstyled primitives you own and style                       |
| Search                 | **Pagefind** (static index, client-side)                      | No backend; scales to thousands of pages                                |
| i18n                   | **next-intl**                                                 | App Router-native, locale routing, message catalogs                     |
| Dynamic UGC            | **Serverless (Next Route Handlers) + managed store**          | Ratings/comments without running own server                             |
| UGC store              | **Supabase (Postgres)**                                       | RLS, moderation, future auth path                                       |
| Rate limiting          | **Upstash Ratelimit (Redis)**                                 | IP-based throttle on UGC writes                                         |
| Forms/validation       | **React Hook Form + Zod**                                     | Comment/rating submission                                               |
| Data fetching (client) | **TanStack Query**                                            | Cache, retries, optimistic UI for ratings                               |
| State                  | **RSC + URL state** (no Zustand in v1)                        | Server state + URL params for filters; `next-themes` for theme          |
| Testing                | **Vitest + RTL** (unit), **Playwright** (e2e), **axe** (a11y) | Standard, fast                                                          |
| Linting                | **ESLint (flat config) + Prettier + TypeScript**              | Consistency                                                             |
| Git hooks              | **Husky + lint-staged + commitlint**                          | Enforce quality + Conventional Commits pre-commit                       |
| CI/CD                  | **GitHub Actions → Vercel**                                   | PR previews, build gates                                                |
| Analytics              | **Vercel Analytics + Speed Insights**                         | Zero-config on Vercel, cookieless                                       |
| Runtime/pkg mgr        | **Node 20 LTS + pnpm 9**                                      | Pinned via `.nvmrc` + `packageManager` field                            |
| Error monitoring       | **Sentry**                                                    | Frontend + serverless error tracking                                    |

**Locked:** **Velite** (content layer — Zod-validated MDX → typed JSON), **Pagefind** (search), **Supabase** (UGC: Postgres + RLS + future auth), **Upstash Ratelimit** (abuse control). All forks resolved — see [§16 Locked v1 Decisions](#16-locked-v1-decisions). No alternatives carried into v1; do not re-evaluate at build time.

---

## 2. Architecture Overview

```
                ┌─────────────────────────────────────────┐
                │  Build time (SSG/ISR)                     │
                │                                           │
   MDX files ──▶│  Velite/Contentlayer  ──▶ typed content   │
   (content/)   │   (Zod-validated)         JSON + search   │
                │                            index (Pagefind)│
                └───────────────┬───────────────────────────┘
                                │ static pages
                                ▼
        ┌──────────────────────────────────────────────┐
        │  Next.js App Router (RSC-first)                │
        │  - Recipe pages (static)                       │
        │  - Listing/filter pages (static + URL state)   │
        │  - Locale routing (next-intl)                  │
        └───────┬────────────────────────────┬──────────┘
                │ client islands              │ Route Handlers (/api)
                ▼                             ▼
        Ratings/Comments UI  ◀────▶  Serverless (UGC) ──▶ Supabase/Upstash
        (TanStack Query)                                   (Postgres)
```

**Principles:**

- **RSC-first**: render on the server by default; ship JS only for interactive islands (search box, rating widget, comment form, filter controls, theme toggle).
- **Static content, dynamic engagement**: recipe body is fully static; only ratings/comments hit the network.
- **Content as data**: MDX → validated typed objects; UI never reads raw files at runtime.
- **URL is state**: filters/search/locale encoded in URL for shareable, SSR-friendly, back-button-correct pages.

---

## 3. Project Structure

```
amazon/
├─ content/
│  └─ recipes/
│     ├─ en/
│     │  └─ thai-green-curry.mdx        # frontmatter + body
│     └─ es/
│        └─ thai-green-curry.mdx        # localized variant (same slug)
├─ src/
│  ├─ app/
│  │  ├─ [locale]/
│  │  │  ├─ layout.tsx                  # locale provider, fonts, theme
│  │  │  ├─ page.tsx                    # home
│  │  │  ├─ recipes/
│  │  │  │  ├─ page.tsx                 # listing + filters (search params)
│  │  │  │  └─ [slug]/page.tsx          # recipe detail (generateStaticParams)
│  │  │  ├─ cuisines/[cuisine]/page.tsx
│  │  │  └─ search/page.tsx
│  │  ├─ api/
│  │  │  ├─ ratings/route.ts            # GET aggregate, POST vote
│  │  │  └─ comments/route.ts           # GET list, POST create
│  │  ├─ sitemap.ts                     # dynamic sitemap
│  │  ├─ robots.ts
│  │  └─ opengraph-image.tsx            # dynamic OG images
│  ├─ components/
│  │  ├─ ui/                            # design-system primitives (Button, Card, Badge…)
│  │  ├─ recipe/                        # RecipeCard, IngredientList, NutritionTable, StepList
│  │  ├─ discovery/                     # SearchBar, FilterPanel, CuisineChips, SortSelect
│  │  ├─ engagement/                    # RatingWidget, CommentList, CommentForm
│  │  └─ layout/                        # Header, Footer, LocaleSwitcher, ThemeToggle
│  ├─ lib/
│  │  ├─ content/                       # content query helpers (getRecipe, listRecipes, related)
│  │  ├─ search/                        # search index access
│  │  ├─ seo/                           # JSON-LD builders (Recipe schema), metadata helpers
│  │  ├─ db/                            # supabase/upstash client + UGC queries
│  │  └─ utils/                         # formatting (time, servings), cn()
│  ├─ schemas/                          # Zod schemas: recipe frontmatter, comment, rating
│  ├─ styles/                           # globals.css, tokens.css (CSS vars)
│  ├─ i18n/                             # next-intl config, messages/en.json, messages/es.json
│  └─ types/                            # shared TS types
├─ tests/
│  ├─ unit/                             # Vitest + RTL
│  ├─ e2e/                              # Playwright specs
│  └─ a11y/                             # axe assertions
├─ public/                             # static assets, recipe images (or use next/image + remote)
├─ .github/workflows/ci.yml
├─ velite.config.ts (or contentlayer.config.ts)
├─ next.config.mjs
├─ tailwind.config.ts
├─ vitest.config.ts
├─ playwright.config.ts
├─ eslint.config.mjs
└─ tsconfig.json
```

---

## 4. Content Model (MDX Frontmatter Schema)

Single Zod schema in `src/schemas/recipe.ts` drives types + build validation. Example frontmatter:

```yaml
---
title: 'Thai Green Curry'
slug: 'thai-green-curry'
locale: 'en'
cuisine: 'thai' # enum
mealType: ['dinner', 'lunch'] # enum[]
diet: ['gluten-free', 'dairy-free'] # enum[]
difficulty: 'medium' # easy|medium|hard
prepMinutes: 20
cookMinutes: 30
servings: 4
calories: 420 # per serving
nutrition: # per serving — drives NutritionTable + JSON-LD
  protein: 22
  carbs: 18
  fat: 28
  fiber: 5
  sugar: 6
  sodium: 640
ingredients: # structured (not freeform) → enables filtering + JSON-LD
  - { item: 'coconut milk', qty: 400, unit: 'ml' }
  - { item: 'chicken breast', qty: 500, unit: 'g' }
steps: # can also live in MDX body; structured preferred for schema.org
  - 'Blend curry paste with aromatics.'
  - 'Simmer coconut milk, add protein...'
heroImage: '/images/thai-green-curry.jpg'
tags: ['spicy', 'quick', 'high-protein']
author: 'Mammad'
publishedAt: '2026-06-19'
updatedAt: '2026-06-19'
featured: false
---
```

**Why structured ingredients/steps/nutrition (not just prose):** enables (a) faceted filtering, (b) the **Recipe JSON-LD** that earns Google rich results, (c) the nutrition table component — all from one source. MDX body holds narrative/tips/photos.

**Validation:** build fails if a recipe violates the schema (missing nutrition, bad enum, duplicate slug). Enforced in `velite.config.ts`.

---

## 5. UI System Design

**Design tokens** (`styles/tokens.css`, exposed to Tailwind v4 via `@theme`):

- Color: semantic tokens (`--color-bg`, `--color-fg`, `--color-primary`, `--color-muted`, `--color-accent`, `--color-success/warn/danger`) with light + dark sets. Health theme → fresh greens + warm neutrals.
- Typography scale: fluid `clamp()` sizes; one display font (headings) + readable body font; `next/font` self-hosted (no layout shift).
- Spacing/radius/shadow: 4px base scale; consistent radius + elevation tokens.
- Breakpoints: mobile-first (sm/md/lg/xl).

**Component tiers (atomic-ish):**

1. **Primitives** (`components/ui/`): Button, Input, Card, Badge, Dialog, Tabs, Tooltip, Skeleton — Radix-backed, token-styled, fully a11y.
2. **Domain components** (`components/recipe/`, `discovery/`, `engagement/`): RecipeCard, NutritionTable, IngredientList (with serving scaler), StepList, RatingWidget, FilterPanel, SearchBar.
3. **Layout/pages**: Header, Footer, listing grids, detail layout.

**Key UX patterns:**

- **Serving scaler**: adjust servings → ingredient quantities recompute (pure util `scaleIngredients()`).
- **Cook mode**: distraction-free step view with wake-lock (optional v1.1).
- **Faceted filter**: cuisine, diet, meal type, time, difficulty as URL params; instant client filter over static index.
- **Skeletons + optimistic UI** for ratings.
- **Dark mode** via token swap + `next-themes`.

**Documentation:** consider **Storybook** for the design system (primitives + domain components) — visual catalog, isolated dev, visual-regression target.

---

## 6. Discovery: Search + Filter

- **Search**: build-time **Pagefind** index over recipe titles/ingredients/tags/body. Client-side, instant, no backend. Build integration: see [§20](#20-build--search-integration).
- **Filter/sort**: faceted UI driven by **URL search params** (`?cuisine=thai&diet=vegan&maxTime=30&sort=rating`). Server reads params in RSC for the initial paint; client refines without full reload.
- **Filterable facets** derived from frontmatter enums: cuisine, diet, mealType, difficulty, max total time, tags.
- **Sort**: newest, quickest, highest-rated (rating from dynamic layer, hydrated client-side).

---

## 7. Dynamic Layer (Ratings + Comments)

Static MDX can't store UGC, so add a thin dynamic layer:

- **Store**: Supabase (Postgres). Exact DDL + RLS in [§18](#18-supabase-schema-ddl--rls).
- **API**: Next Route Handlers under `src/app/api/`, all input Zod-validated server-side:
  - `GET /api/ratings?slug=&locale=` → aggregate `{ avg, count }`; `POST` → upsert vote (one per anon id per recipe; re-vote overwrites).
  - `GET /api/comments?slug=&locale=` → approved comments only; `POST` → create with `status='pending'`.
- **Client**: RatingWidget + CommentList/Form use **TanStack Query** with optimistic updates.
- **Anon identity (no accounts in v1):** random UUID generated client-side, stored in `localStorage` (`anon_id`). Sent with rating POST for dedupe. **No browser fingerprinting** (privacy + GDPR).
- **Abuse control:** Upstash Ratelimit by IP — **ratings: 10/min**, **comments: 3/min** (429 on exceed). Honeypot hidden field on comment form (reject if filled). hCaptcha deferred to v1.1 (add only if spam appears). Comments default `pending`.
- **Moderation (v1):** manual via Supabase dashboard — flip `status` `pending`→`approved`/`rejected`. No admin UI in v1 (tracked as v1.1). Approving a comment triggers on-demand revalidation of the recipe page (see [§19](#19-caching--data-freshness)).
- **Comment content:** plain text only (no Markdown/HTML — escaped on render to prevent XSS). `author_name` 2–50 chars, `body` 10–2000 chars. No email, no threading, no edit/delete in v1.
- **Rating:** integer 1–5 only (no half-stars). One per `anon_id` per recipe; re-submit updates existing row.
- **SEO note:** aggregate rating injected into Recipe JSON-LD (`aggregateRating`) for star rich results — **only when `count > 0`** (Google penalizes fake/empty review markup). Rendered server-side at request time so it isn't stale (see [§19](#19-caching--data-freshness)).

---

## 8. Nutrition + i18n

**Nutrition:** `nutrition` frontmatter → `NutritionTable` component + `nutrition` field in Recipe JSON-LD (`NutritionInformation`). Per-serving; recompute with serving scaler. Show a "values are estimates" disclaimer.

**i18n (next-intl):**

- Locale-prefixed routes: `/[locale]/...`; default locale + `localePrefix` strategy.
- **UI strings**: `i18n/messages/{locale}.json`.
- **Content**: per-locale MDX (`content/recipes/{locale}/slug.mdx`); same `slug` links translations. **Locked fallback:** untranslated recipes are **hidden from non-default locale listings/search**, but a direct URL renders the default-locale (`en`) body with a "not yet translated" banner. Avoids dead links while keeping listings clean.
- **v1 locales:** **`en` (default) + `es`**. `localePrefix: 'as-needed'` (no `/en` prefix; `/es/...` for Spanish).
- `hreflang` alternates + localized metadata for SEO.
- Locale-aware formatting (numbers/units/dates) via `Intl`.

---

## 9. SEO (Critical for Recipe Discovery)

- **Recipe JSON-LD** (`schema.org/Recipe`) on every detail page — builder in `lib/seo/`: name, image, author, prep/cook/total time, recipeYield, recipeIngredient, recipeInstructions, nutrition, aggregateRating, keywords, recipeCuisine. This is what earns Google recipe rich cards.
- **Metadata API**: per-page `generateMetadata` (title, description, canonical, OG/Twitter).
- **Dynamic OG images** via `opengraph-image.tsx`.
- **`sitemap.ts` + `robots.ts`** generated from content (with locale alternates).
- **Performance = ranking**: target green Core Web Vitals (next/image, next/font, RSC, minimal client JS).
- Semantic HTML + breadcrumbs JSON-LD.

---

## 10. Testing Strategy

| Layer              | Tool                                                 | Scope                                                                                        |
| ------------------ | ---------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| Unit               | **Vitest + RTL**                                     | Utils (serving scaler, formatters), components, JSON-LD builders, Zod schema                 |
| Content validation | **Velite/Zod at build**                              | Frontmatter correctness — build fails on bad recipe                                          |
| Integration        | **Vitest + MSW**                                     | API route handlers (ratings/comments) with mocked DB                                         |
| E2E                | **Playwright**                                       | Critical flows: browse → filter → open recipe → submit rating/comment; locale switch; search |
| A11y               | **axe-core** (jest-axe in unit + Playwright axe)     | WCAG 2.1 AA on key pages                                                                     |
| Visual regression  | **Playwright snapshots** (or Chromatic w/ Storybook) | Design-system + recipe page                                                                  |
| Perf budget        | **Lighthouse CI** in GH Actions                      | Fail PR if CWV/score regress                                                                 |
| Type               | **tsc --noEmit**                                     | Strict type gate                                                                             |

**Conventions:** colocate unit tests (`*.test.tsx`) or under `tests/`; coverage gate (e.g. ≥80% on `lib/`). Test data factories for recipes/comments.

---

## 11. Performance & Accessibility

- **Perf**: RSC default; client islands only where needed; `next/image` (AVIF/WebP, responsive); `next/font`; route-level code splitting; static + ISR; prefetch on hover; bundle analyzer in CI; Lighthouse CI budget.
- **A11y (WCAG 2.1 AA)**: Radix primitives, focus management, keyboard nav, color-contrast tokens, semantic landmarks, alt text required in schema, `prefers-reduced-motion`, axe in CI.

---

## 12. Engineering Best Practices

- **TypeScript strict**, no `any`, path aliases (`@/...`).
- **ESLint (flat) + Prettier**, import ordering, Tailwind class sorting.
- **Husky + lint-staged**: lint/format/typecheck pre-commit; **commitlint** (Conventional Commits).
- **Env safety**: `@t3-oss/env-nextjs` + Zod to validate env vars at boot. Full var list in [§17](#17-environment-variables).
- **Security headers**: set in `next.config.mjs` — CSP, `X-Content-Type-Options`, `Referrer-Policy`, `Strict-Transport-Security`, `frame-ancestors 'none'`. Sanitize/escape all UGC on render.
- **Runtime pinned**: `.nvmrc` (Node 20), `packageManager: pnpm@9` in `package.json`, pinned dep versions (no `^` on framework deps — see [§16](#16-locked-v1-decisions)).
- **Error handling**: `error.tsx`/`not-found.tsx` boundaries; Sentry for client + serverless.
- **Feature flags / config** centralized; secrets only in Vercel env (never in repo).
- **Conventional commits + PR template**; branch protection; required CI checks.
- **Docs**: `README` (setup), `CONTRIBUTING` (how to add a recipe MDX), `ARCHITECTURE.md`.

---

## 13. CI/CD

`.github/workflows/ci.yml` on PR:

1. Install (cache) → 2. `tsc --noEmit` → 3. ESLint/Prettier check → 4. Vitest (+coverage) → 5. Build (content validation runs here) → 6. Playwright e2e (preview) → 7. Lighthouse CI budget.

- **Vercel**: auto preview deploy per PR; production on merge to `main`. ISR + on-demand revalidation when content changes.

---

## 14. Implementation Roadmap (Phased)

1. **Foundation**: Next.js + TS + Tailwind v4 + tokens, ESLint/Prettier/Husky, CI skeleton, env validation.
2. **Content pipeline**: Velite + Zod recipe schema, sample MDX recipes, content query helpers, build-time validation.
3. **Design system**: primitives (`components/ui/`) + Storybook, theme/dark mode.
4. **Core pages**: home, recipe listing, recipe detail (NutritionTable, IngredientList + serving scaler, StepList), layout.
5. **SEO**: Recipe JSON-LD, metadata, sitemap/robots, OG images.
6. **Discovery**: Pagefind/Fuse search + URL-driven faceted filters/sort.
7. **i18n**: next-intl, locale routing, message catalogs, localized MDX + hreflang.
8. **Dynamic layer**: Supabase schema, ratings/comments API routes, RatingWidget + comments UI (TanStack Query), moderation + rate-limit/anti-spam.
9. **Testing hardening**: unit + e2e + a11y + Lighthouse budgets to green.
10. **Launch**: analytics, Sentry, perf pass, production deploy.

---

## 15. Verification

Since no code exists yet, verification is defined per milestone:

- **Content**: `pnpm build` fails on invalid frontmatter (test by breaking a recipe's enum) and succeeds on valid set.
- **Pages**: `pnpm dev` → recipe detail renders nutrition, scaled ingredients, steps; listing filters update via URL params.
- **SEO**: paste a rendered recipe URL into Google **Rich Results Test** → valid Recipe schema; `sitemap.xml`/`robots.txt` resolve.
- **Search/filter**: Playwright e2e: search term + apply cuisine/diet/time filters → correct result set; shareable URL reproduces state.
- **i18n**: switch locale → UI strings + localized recipe + `hreflang` present.
- **Dynamic**: submit rating → optimistic update then persisted (check Supabase row); submit comment → appears as `pending`; rate-limit blocks rapid repeats.
- **Quality gates**: `tsc`, ESLint, Vitest (≥ coverage), Playwright, axe (0 serious), Lighthouse CI budget all green in CI.

---

## 16. Locked v1 Decisions

All forks resolved. Junior dev implements these as-is — no "confirm during build".

| Decision         | Locked choice                                                |
| ---------------- | ------------------------------------------------------------ |
| Content layer    | **Velite**                                                   |
| Search           | **Pagefind**                                                 |
| UGC store        | **Supabase (Postgres)**                                      |
| Rate limiting    | **Upstash Ratelimit**                                        |
| Comments         | **Custom (Supabase)** — Giscus rejected                      |
| Client state lib | **None** (URL + `next-themes`) — Zustand dropped             |
| Analytics        | **Vercel Analytics + Speed Insights**                        |
| Locales          | **`en` (default), `es`** — `localePrefix: 'as-needed'`       |
| Anon identity    | **`localStorage` UUID** — no fingerprinting                  |
| Rating model     | **int 1–5**, one per `anon_id`/recipe, re-vote = upsert      |
| Comment model    | plain text, name 2–50, body 10–2000, no email/threading/edit |
| Moderation       | **manual** via Supabase dashboard; admin UI = v1.1           |
| hCaptcha         | **deferred** to v1.1 (honeypot only in v1)                   |
| Cook mode        | **deferred** to v1.1                                         |
| Runtime          | **Node 20 LTS**, **pnpm 9**                                  |
| Hosting          | **Vercel** (prod on `main`, preview per PR)                  |

**Image strategy (locked):** recipe images committed to repo under `public/images/`, served via `next/image` (local optimization, AVIF/WebP, responsive `sizes`). Naming: `{slug}.jpg` (hero) + `{slug}-{n}.jpg` (body). `alt` text required in frontmatter schema. Reassess CDN/remote loader only if repo size becomes a problem (post-v1).

**Dependency pinning:** framework + content + DB deps pinned to exact versions in `package.json` (no `^`): `next@15`, `react@19`, `velite`, `next-intl`, `@supabase/supabase-js`, `pagefind`, `tailwindcss@4`. Renovate/Dependabot can bump via PR later. Exact patch versions chosen at install time, then committed with `pnpm-lock.yaml`.

---

## 17. Environment Variables

Validated at boot via `@t3-oss/env-nextjs` + Zod (`src/env.ts`). Build fails if any required var missing. `.env.example` committed; real values only in Vercel project env.

| Var                                     | Scope  | Required | Source / notes                                                                  |
| --------------------------------------- | ------ | -------- | ------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_SITE_URL`                  | client | yes      | canonical base URL (sitemap, OG, JSON-LD)                                       |
| `NEXT_PUBLIC_SUPABASE_URL`              | client | yes      | Supabase project URL                                                            |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`         | client | yes      | Supabase anon key (RLS-protected)                                               |
| `SUPABASE_SERVICE_ROLE_KEY`             | server | yes      | server-only; moderation/aggregate reads bypassing RLS. **Never `NEXT_PUBLIC_`** |
| `UPSTASH_REDIS_REST_URL`                | server | yes      | rate limiting                                                                   |
| `UPSTASH_REDIS_REST_TOKEN`              | server | yes      | rate limiting                                                                   |
| `SENTRY_DSN` / `NEXT_PUBLIC_SENTRY_DSN` | both   | yes      | error monitoring                                                                |
| `SENTRY_AUTH_TOKEN`                     | CI     | yes      | source map upload in CI only                                                    |

---

## 18. Supabase Schema (DDL + RLS)

```sql
-- ratings: one row per (anon_id, recipe_slug, locale); re-vote = upsert
create table public.ratings (
  id          uuid primary key default gen_random_uuid(),
  recipe_slug text not null,
  locale      text not null check (locale in ('en','es')),
  value       int  not null check (value between 1 and 5),
  anon_id     uuid not null,
  created_at  timestamptz not null default now(),
  unique (anon_id, recipe_slug, locale)
);
create index ratings_slug_locale_idx on public.ratings (recipe_slug, locale);

-- comments: default pending; only approved are publicly readable
create type comment_status as enum ('pending','approved','rejected');
create table public.comments (
  id          uuid primary key default gen_random_uuid(),
  recipe_slug text not null,
  locale      text not null check (locale in ('en','es')),
  author_name text not null check (char_length(author_name) between 2 and 50),
  body        text not null check (char_length(body) between 10 and 2000),
  status      comment_status not null default 'pending',
  created_at  timestamptz not null default now()
);
create index comments_slug_locale_status_idx on public.comments (recipe_slug, locale, status);

alter table public.ratings  enable row level security;
alter table public.comments enable row level security;

-- ratings: anon may read aggregate + insert; updates go through service role (upsert) or add an update policy keyed on anon_id
create policy ratings_read   on public.ratings for select using (true);
create policy ratings_insert on public.ratings for insert with check (value between 1 and 5);

-- comments: anon may read ONLY approved; may insert as pending; cannot update/delete
create policy comments_read   on public.comments for select using (status = 'approved');
create policy comments_insert on public.comments for insert
  with check (status = 'pending'
              and char_length(author_name) between 2 and 50
              and char_length(body) between 10 and 2000);
-- no update/delete policies for anon → moderation only via service role / dashboard
```

Notes: aggregate avg/count computed in the `GET /api/ratings` handler (server, service role) — do not expose raw rows to client. Re-vote upsert uses the `unique (anon_id, recipe_slug, locale)` constraint via service role. Enable Supabase **daily backups** (content is in git, but UGC is not).

---

## 19. Caching & Data Freshness

Resolves the static-vs-dynamic tension explicitly:

- **Recipe page shell + body**: static (SSG), `generateStaticParams` over `[locale] × [slug]`.
- **`aggregateRating` in JSON-LD + visible star summary**: fetched in the RSC at request time with `fetch(..., { next: { revalidate: 3600 } })` (or a tagged cache). Never baked at build → never stale enough to mislead Google. Hidden entirely when `count === 0`.
- **Comments list + live rating widget count**: client-fetched via TanStack Query (always fresh, not part of static HTML).
- **On-demand revalidation**: `revalidateTag`/`revalidatePath` for a recipe when (a) its MDX changes (Vercel deploy hook on push) and (b) a comment is approved.
- **ISR default** for listing/home: `revalidate: 3600`.

---

## 20. Build & Search Integration

Pagefind indexes built static HTML — it is a **post-build step**, not a Next plugin. Document precisely so junior doesn't fight it:

- Build script: `pnpm build` runs `next build`, then a `postbuild` step runs Pagefind against the exported HTML and writes the `pagefind/` bundle into the served output (`public/pagefind` copy for dev; output dir on Vercel).
- Search UI loads the Pagefind bundle lazily on the search route (dynamic import) so it never ships in the main bundle.
- Pagefind only indexes content present in static HTML — ensure recipe body/title/ingredients render server-side (they do, RSC) before the index step.
- **Risk flag:** verify Pagefind + Vercel output path early (spike in Phase 6) — this is the one integration with real friction. Fallback if blocked: Fuse.js over Velite's emitted JSON (smaller catalogs only).

---

## 21. Out of Scope for v1 (explicit)

Deferred so junior doesn't build them speculatively: user accounts/auth, public recipe submission, cook mode + wake-lock, admin/moderation UI, hCaptcha, recipe collections/favorites, print stylesheet, email notifications, >2 locales, remote image CDN. Each is a known v1.1+ candidate.
