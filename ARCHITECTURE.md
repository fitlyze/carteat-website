# Architecture

Fully static: every page is generated at build time from MDX. No backend, no
database, no user-generated content — the ratings/comments layer described in
[plan §7](plan.md) and [§18](plan.md) was removed.
(Source of truth: [plan §2](plan.md).)

```
 MDX (content/) ──Velite+Zod──▶ typed JSON ──▶ lib/content ──▶ pages (app/)
                                                                  │
                              static HTML ──Pagefind──▶ search index
```

## Principles

- **RSC-first.** Server Components by default; ship JS only for interactive
  islands (search, filters, theme/locale toggle, stepper).
- **No runtime data.** Nothing on the page hits the network after load except
  the lazily-imported Pagefind search index.
- **Content as data.** MDX → Velite-validated typed objects; the UI never reads
  raw files at runtime — only via `lib/content/`.
- **URL is state.** Filters/search/sort/locale live in the URL (shareable,
  back-button-correct). No client state library.

## Modules

| Dir               | Owns                                                                 |
| ----------------- | -------------------------------------------------------------------- |
| `content/`        | recipe MDX (git-versioned)                                           |
| `src/app/`        | routing, pages, layouts, metadata, SEO files                          |
| `src/components/` | `ui/` primitives, `recipe/ discovery/` domain, `layout/`              |
| `src/lib/`        | `content/ search/ seo/ utils/` helpers                                |
| `src/schemas/`    | Zod schemas (single source of truth)                                 |
| `src/i18n/`       | next-intl config + message catalogs                                  |
| `src/styles/`     | design tokens + globals                                              |

## Caching & data freshness

- Every route is prerendered at build time (`generateStaticParams`); there is no
  ISR and no on-demand revalidation.
- Content changes ship by committing MDX and rebuilding.

## Security

- No user input is accepted anywhere, so there is no request-side attack
  surface: no forms, no route handlers, no database.
- Strict security headers (CSP, HSTS, nosniff, frame-ancestors none) in
  `next.config.mjs`.
