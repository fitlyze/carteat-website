# Launch & Operations

## Deployment (Vercel) — E13-S4

- **Hosting:** Vercel. Production deploys on merge to `main`; every PR gets a
  preview deploy automatically (no config needed — Next.js is auto-detected).
- **Environment variables:** set all vars from [`.env.example`](.env.example) in
  the host project (Production + Preview). `SENTRY_DSN` must **not** be prefixed
  `NEXT_PUBLIC_`. `SENTRY_AUTH_TOKEN` is set in CI for source-map upload only.
- **Content updates:** commit MDX and redeploy — there is no revalidation hook
  and no runtime content source.
- **Backups:** everything is in git; there is no database to back up.

## CI (GitHub Actions) — E13-S1/S2/S3

`.github/workflows/ci.yml` runs on PR + push to `main`:
`install → velite (content) → typecheck → lint → format:check → vitest+coverage
→ build → Playwright e2e/a11y → Lighthouse CI`. A failing step fails the PR.

- **Lighthouse budget** (`lighthouserc.json`): perf ≥ 0.9, a11y ≥ 0.95, SEO ≥ 0.95,
  CLS ≤ 0.1 on home + listing + detail. Regressions fail the PR.
- **Bundle:** `pnpm analyze` (ANALYZE=true) opens the analyzer. Pagefind is loaded
  via a runtime dynamic import (`/pagefind/pagefind.js`, `webpackIgnore`) so it is
  **never in the main bundle**; the only sizable client chunks are the interactive
  islands (filters, search, theme/locale toggles).

## Production verification (plan §15) — E13-S6

Run after the first production deploy:

- [ ] **Content:** break a recipe enum on a branch → `pnpm build` fails; valid set passes. _(verified locally: `velite build --strict` exits 1 on a bad enum.)_
- [ ] **SEO:** paste a live recipe URL into Google **Rich Results Test** → valid Recipe + Breadcrumb. `…/sitemap.xml` and `…/robots.txt` resolve. _(JSON-LD + sitemap/robots verified locally.)_
- [ ] **Search/filter:** Playwright flows green; a shareable filtered URL reproduces state. _(verified — `tests/e2e/flows.spec.ts`.)_
- [ ] **i18n:** locale switch updates UI + content; `hreflang` present. _(verified — `tests/e2e/i18n.spec.ts`.)_
- [ ] **Quality gates:** typecheck, lint, vitest (coverage ≥ 80% on `lib/`), Playwright, axe (0 serious), Lighthouse — all green in CI.

## Launch readiness checklist — E13-S7

- [ ] Security headers live (CSP incl. `wasm-unsafe-eval` for Pagefind, HSTS,
      `X-Content-Type-Options`, `frame-ancestors 'none'`) — verify with curl/securityheaders.com.
- [ ] Sentry receiving production events (client + server); source maps uploaded.
- [ ] 404 / error / offline states verified in prod.
- [ ] Favicon / manifest / OG image present (recipe OG renders).
- [ ] Out-of-scope (plan §21) confirmed **not** shipped: accounts/auth, public
      submission, cook mode, admin UI, hCaptcha, favorites, print stylesheet,
      email, >2 locales, remote image CDN. v1.1 candidates logged.
