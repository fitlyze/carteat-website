# src/app/ — Routing, Pages, Layouts, SEO

Next.js App Router. All routes are locale-prefixed under `[locale]`. next-intl `localePrefix: 'as-needed'` (no `/en`; Spanish at `/es/...`). See plan §8, §9, §19; layouts/blueprints in design_system.md §10.

## Rules

- **Server Components by default.** Add `'use client'` only to leaf interactive islands — never to a page or layout. Fetch on the server, pass data down as props.
- **Static generation:** recipe detail + listing use `generateStaticParams` over `[locale] × [slug]`. Read filters/search/sort from `searchParams` (URL is the state — shareable, back-button-correct).
- **Metadata:** every page exports `generateMetadata` (title, description, canonical, OG/Twitter, `hreflang` alternates) via `lib/seo/` helpers. Never hard-code `<title>`/meta.
- **Structured data:** recipe detail injects **Recipe JSON-LD** via `lib/seo/`. Never emit `aggregateRating` — the site has no ratings, and fake review markup is penalized. Add breadcrumb JSON-LD on nested pages.
- **Caching:** every route is fully static — content changes ship via a rebuild. No ISR, no `revalidate`, no on-demand revalidation.
- **Required route files:** `error.tsx`, `not-found.tsx`, `loading.tsx` (Skeletons) per route group — match design §9.18 states.
- `sitemap.ts`, `robots.ts`, `opengraph-image.tsx` are generated from content with locale alternates.
- **Strings come from next-intl** (`getTranslations` in server, `useTranslations` in client islands) — never inline copy. Use next-intl navigation helpers for links (preserve locale prefix).

## Don't

Don't add route handlers or any request-time data fetching — the site is static. Don't bypass `lib/seo` for metadata. Don't make a layout a client component.
