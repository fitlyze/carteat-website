# Foodlyze — Health Recipe Website

Production frontend for publishing health recipes across all cuisines. Static MDX
content + a thin serverless layer for ratings & comments.

**Stack:** Next.js 15 (App Router) · React 19 · TypeScript (strict) · Tailwind v4 ·
Radix + shadcn pattern · Velite (MDX) · next-intl · Pagefind · Supabase · Upstash ·
TanStack Query · Vitest/Playwright. See [`plan.md`](plan.md) for locked decisions.

## Requirements

- Node 20 (`.nvmrc`)
- pnpm 9 (`corepack enable pnpm`)

## Setup

```bash
corepack enable pnpm
pnpm install
cp .env.example .env   # fill values (or use placeholders locally)
pnpm dev               # http://localhost:3000
```

## Environment

All variables are validated at boot via `src/env.ts` (`@t3-oss/env-nextjs` + Zod).
A missing required var fails the build. See [`.env.example`](.env.example) and
[plan §17](plan.md). Server secrets are **never** prefixed `NEXT_PUBLIC_`.

| Var                                                          | Scope  | Purpose                                   |
| ------------------------------------------------------------ | ------ | ----------------------------------------- |
| `NEXT_PUBLIC_SITE_URL`                                       | client | canonical base URL (sitemap, OG, JSON-LD) |
| `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` | client | Supabase (RLS-protected)                  |
| `NEXT_PUBLIC_SENTRY_DSN`                                     | client | client error monitoring                   |
| `SUPABASE_SERVICE_ROLE_KEY`                                  | server | UGC reads/upserts (bypasses RLS)          |
| `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN`        | server | rate limiting                             |
| `SENTRY_DSN`                                                 | server | server error monitoring                   |
| `SENTRY_AUTH_TOKEN`                                          | CI     | source-map upload (CI only)               |

## Scripts

| Command                     | What                                                             |
| --------------------------- | ---------------------------------------------------------------- |
| `pnpm dev`                  | dev server (runs Velite in watch)                                |
| `pnpm build`                | `next build` + Pagefind postbuild (content validation runs here) |
| `pnpm start`                | serve production build                                           |
| `pnpm typecheck`            | `tsc --noEmit`                                                   |
| `pnpm lint` / `pnpm format` | ESLint / Prettier                                                |
| `pnpm test`                 | Vitest unit/component                                            |
| `pnpm test:e2e`             | Playwright e2e                                                   |
| `pnpm test:a11y`            | Playwright + axe                                                 |

Run `pnpm typecheck && pnpm lint && pnpm test` before declaring a task done.

## Project layout

See [`ARCHITECTURE.md`](ARCHITECTURE.md) for the static-content + dynamic-UGC
hybrid, and [`CONTRIBUTING.md`](CONTRIBUTING.md) for how to author a recipe.
