# Architecture

A **hybrid**: statically generated recipe pages (build-time MDX) + a thin
serverless layer for user-generated content (ratings & comments). This keeps the
content pipeline simple and free while still allowing live engagement.
(Sources of truth: [plan §2](plan.md), [§7](plan.md), [§19](plan.md).)

```
 MDX (content/) ──Velite+Zod──▶ typed JSON ──▶ lib/content ──▶ pages (app/)
                                                                  │
                              static HTML ──Pagefind──▶ search index
                                                                  │
 client islands (engagement/) ─TanStack Query─▶ app/api/* ─▶ lib/db (Supabase/Upstash)
```

## Principles

- **RSC-first.** Server Components by default; ship JS only for interactive
  islands (search, rating, comment form, filters, theme/locale toggle, stepper).
- **Static content, dynamic engagement.** Recipe body is fully static; only
  ratings/comments hit the network.
- **Content as data.** MDX → Velite-validated typed objects; the UI never reads
  raw files at runtime — only via `lib/content/`.
- **URL is state.** Filters/search/sort/locale live in the URL (shareable,
  back-button-correct). No client state library.

## Modules

| Dir               | Owns                                                                 |
| ----------------- | -------------------------------------------------------------------- |
| `content/`        | recipe MDX (git-versioned)                                           |
| `src/app/`        | routing, pages, layouts, metadata, SEO files, API route handlers     |
| `src/components/` | `ui/` primitives, `recipe/ discovery/ engagement/` domain, `layout/` |
| `src/lib/`        | `content/ search/ seo/ db/ utils/` helpers                           |
| `src/schemas/`    | Zod schemas (single source of truth)                                 |
| `src/i18n/`       | next-intl config + message catalogs                                  |
| `src/styles/`     | design tokens + globals                                              |

## Caching & data freshness (plan §19)

- Recipe page shell + body: static (SSG) via `generateStaticParams`.
- `aggregateRating` in JSON-LD + visible star summary: fetched server-side at
  request time (`revalidate: 3600`); hidden when `count === 0`.
- Comments + live rating count: client-fetched (TanStack Query), always fresh.
- On-demand `revalidateTag`/`revalidatePath` when MDX changes or a comment is
  approved. Listing/home use ISR (`revalidate: 3600`).

## Security

- All UGC input validated server-side with Zod; rate-limited via Upstash by IP
  (ratings 10/min, comments 3/min). Service-role key is server-only.
- Comments stored as plain text, escaped on render. Comments default `pending`.
- Strict security headers (CSP, HSTS, nosniff, frame-ancestors none) in
  `next.config.mjs`.
