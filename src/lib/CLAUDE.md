# src/lib/ — Helpers (framework-light, testable)

Subfolders: `content/`, `search/`, `seo/`, `db/`, `utils/`. Keep these as pure, strongly-typed units where possible. UI and route handlers depend on `lib/`, never the reverse.

## content/

Query the **Velite-emitted typed data** (build-time): `getRecipe(slug, locale)`, `listRecipes(filter)`, `getRelated(recipe)`. Pure reads of generated data — **never read MDX/files at runtime**. This is the only module the UI uses to access recipes.

## search/

Pagefind index access (lazy, client-side). Pagefind is a **post-build step** (plan §20) — the bundle is loaded via dynamic import on the search route, never in the main bundle. Fuse.js only as the documented fallback.

## seo/

Pure builders: Recipe JSON-LD (`schema.org/Recipe`: name, image, author, times, recipeYield, recipeIngredient, recipeInstructions, nutrition, aggregateRating, recipeCuisine, keywords), breadcrumb JSON-LD, and metadata helpers. Input = typed recipe → output = schema object. **Include `aggregateRating` only when `count > 0`.** Must have unit tests.

## db/

`supabase.ts` (server client w/ service role), `upstash.ts` (ratelimit), `ratings.ts`, `comments.ts` (queries used by route handlers). **Server-only — add `import 'server-only'`** at the top so a client import fails the build. All secrets via `@/env`. Aggregate ratings here; never return raw rows/PII.

## utils/

Pure helpers: `cn()` (class merge), `format.ts` (time/servings/numbers/dates via `Intl`, locale-aware — no manual string concat), `scaleIngredients(base, ratio)` (serving scaler: pure, sensibly rounded). **Unit-test all of these.**

## Rules

- Pure functions, explicit I/O, no hidden globals. Validate inputs crossing a boundary with Zod (`@/schemas`).
- Server-only modules (`db/`, anything using secrets) must guard with `import 'server-only'`.
- `utils/` + `seo/` builders require unit tests (coverage gate ≥80% on `lib/`).
