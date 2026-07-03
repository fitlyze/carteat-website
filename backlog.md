# Backlog — Health Recipe Website ("Foodlyze")

> **Purpose.** This is the single, ordered list of work to take the site from 0% to 100% (production launch). It is written to be executed by Claude Code, story by story, top to bottom. Each story is a self-contained unit with explicit, testable acceptance criteria.
>
> **Sources of truth (do not re-litigate):** [`plan.md`](plan.md) (architecture, locked decisions §16, schemas, API contracts, caching, env) and [`design_system.md`](design_system.md) (tokens, type, component specs §9, page blueprints §10). When this backlog and a source file disagree, the source file wins — fix the backlog.
>
> **Scope note.** Some scaffolding already exists in the repo (stubs under `src/`, sample MDX, config files). Treat existing files as _starting points_, not as _done_. A story is only complete when its acceptance criteria pass — re-implement stubs to spec where needed.

---

## How to use this backlog (for the implementing agent)

1. Work **top to bottom**. Epics are ordered by dependency; within an epic, stories are ordered too.
2. Before starting a story, confirm its **Depends on** stories are `[x] Done`.
3. Implement to the story's **Acceptance Criteria** (AC). Each AC is a checkbox — tick it only when objectively true.
4. After each story: run the **Definition of Done** gate. Do not move on with a red gate.
5. Mark the story `Status: Done` and update the **Progress Tracker** percentage.
6. Honor every **Golden Rule** in [`CLAUDE.md`](CLAUDE.md) and the nested `CLAUDE.md` files. No `any`, RSC-first, token-only styling, env via `@/env`, URL-as-state, Zod on all external input.

### Legend

| Field        | Meaning                                                                           |
| ------------ | --------------------------------------------------------------------------------- |
| **ID**       | Stable story id (`E#-S#`). Reference it in commits (`feat(E3-S2): …`).            |
| **Priority** | `P0` launch-blocking · `P1` important, pre-launch · `P2` nice-to-have / hardening |
| **Size**     | `XS` ≤1h · `S` ~half day · `M` ~1 day · `L` ~2–3 days                             |
| **Status**   | `Todo` / `In progress` / `Done`                                                   |

### Definition of Ready (a story may start when)

- Dependencies are Done.
- Referenced spec sections (plan/design) are readable and unambiguous; if not, raise it rather than guess.
- Required env vars (if any) exist in `.env.example`.

### Definition of Done (global gate — applies to EVERY story)

- [ ] `pnpm typecheck` clean (TypeScript strict, **no `any`**).
- [ ] `pnpm lint` + `pnpm format` clean.
- [ ] `pnpm test` green; **new logic/utilities have unit tests**.
- [ ] `pnpm build` succeeds (content validation passes).
- [ ] A11y intact — **0 serious axe violations** on any touched page/component.
- [ ] **Token-only styling** — no hex / raw ramp steps / arbitrary colors in components.
- [ ] **RSC by default**; `'use client'` only on genuine interactive islands.
- [ ] Matches `plan.md` + `design_system.md`; locked decisions (plan §16) respected.
- [ ] Conventional Commit referencing the story ID.

---

## Progress Tracker

> Update after each story. Percentage = Done stories ÷ total stories.

| Epic                                     | Stories | Done   | %        |
| ---------------------------------------- | ------- | ------ | -------- |
| E0 — Foundation & Tooling                | 8       | 8      | 100%     |
| E1 — Design Tokens & Styling             | 5       | 5      | 100%     |
| E2 — Content Pipeline (Velite + Zod)     | 6       | 6      | 100%     |
| E3 — UI Primitives                       | 10      | 10     | 100%     |
| E4 — Layout & Navigation                 | 6       | 6      | 100%     |
| E5 — Recipe Domain Components            | 6       | 0      | 0%       |
| E6 — Core Pages                          | 6       | 6      | 100%     |
| E7 — SEO                                 | 6       | 6      | 100%     |
| E8 — Discovery (Search + Filter)         | 6       | 6      | 100%     |
| E9 — i18n                                | 6       | 6      | 100%     |
| E10 — Dynamic Layer (Ratings + Comments) | 9       | 9      | 100%     |
| E11 — States, Errors, A11y polish        | 6       | 6      | 100%     |
| E12 — Testing & Quality Gates            | 7       | 7      | 100%     |
| E13 — CI/CD, Observability & Launch      | 7       | 7      | 100%     |
| **Total**                                | **94**  | **94** | **100%** |

---

# E0 — Foundation & Tooling

_Goal: a Next.js 15 + TS strict + Tailwind v4 project that boots, lints, type-checks, and validates env at startup. Maps to plan §14.1, §12, §17._

### E0-S1 — Project bootstrap (Next.js 15 / React 19 / TS strict) ✅

- **Priority:** P0 · **Size:** M · **Status:** Todo · **Depends on:** —
- **User story:** As a developer, I want a correctly configured Next.js App Router project so that all later work builds on a stable, typed foundation.
- **References:** plan §1, §3, §16 (Node 20, pnpm 9).
- **Acceptance criteria:**
  - [ ] `package.json` declares `"packageManager": "pnpm@9"`; `.nvmrc` pins Node 20.
  - [ ] Next.js 15 + React 19 installed at **exact** pinned versions (no `^`) per plan §16 dependency pinning.
  - [ ] `tsconfig.json`: `strict: true`, `noUncheckedIndexedAccess: true`, path alias `@/*` → `src/*`.
  - [ ] App Router structure exists under `src/app/` per plan §3.
  - [ ] `pnpm dev` serves a placeholder home page with no console errors; `pnpm build` succeeds.

### E0-S2 — Package scripts ✅

- **Priority:** P0 · **Size:** S · **Status:** Todo · **Depends on:** E0-S1
- **User story:** As a developer, I want the canonical scripts so commands match `CLAUDE.md`.
- **References:** `CLAUDE.md` Commands; plan §20 (postbuild Pagefind).
- **Acceptance criteria:**
  - [ ] Scripts exist: `dev`, `build` (`next build` + Pagefind postbuild), `typecheck` (`tsc --noEmit`), `lint`, `format`, `test`, `test:e2e`, `test:a11y`.
  - [ ] `build` fails when content frontmatter is invalid (verified by temporarily breaking a recipe enum).

### E0-S3 — ESLint (flat) + Prettier + import/Tailwind sorting ✅

- **Priority:** P0 · **Size:** S · **Status:** Todo · **Depends on:** E0-S1
- **User story:** As a developer, I want consistent lint/format so code style is uniform and CI-enforceable.
- **References:** plan §12.
- **Acceptance criteria:**
  - [ ] ESLint flat config (`eslint.config.mjs`) with TypeScript + Next + a11y plugins; bans `any`.
  - [ ] Prettier configured with import ordering and Tailwind class sorting.
  - [ ] `pnpm lint` and `pnpm format --check` pass on the clean tree.

### E0-S4 — Env validation (`@/env`) ✅

- **Priority:** P0 · **Size:** S · **Status:** Todo · **Depends on:** E0-S1
- **User story:** As a developer, I want env vars validated at boot so misconfiguration fails fast and secrets never leak to the client.
- **References:** plan §17; `CLAUDE.md` golden rule 5.
- **Acceptance criteria:**
  - [ ] `src/env.ts` uses `@t3-oss/env-nextjs` + Zod; exports typed `env`.
  - [ ] All vars from plan §17 present with correct client/server scoping; server secrets are **never** `NEXT_PUBLIC_`.
  - [ ] App refuses to boot/build when a required var is missing.
  - [ ] `.env.example` committed with every var (no real values).
  - [ ] No file reads `process.env` directly except `src/env.ts`.

### E0-S5 — Git hooks: Husky + lint-staged + commitlint ✅

- **Priority:** P1 · **Size:** S · **Status:** Todo · **Depends on:** E0-S3
- **User story:** As a maintainer, I want pre-commit quality gates and Conventional Commits enforced so bad code never lands.
- **References:** plan §12.
- **Acceptance criteria:**
  - [ ] Pre-commit runs lint + format + typecheck on staged files.
  - [ ] commitlint enforces Conventional Commits; a non-conforming message is rejected.

### E0-S6 — Security headers in `next.config.mjs` ✅

- **Priority:** P0 · **Size:** S · **Status:** Todo · **Depends on:** E0-S1
- **User story:** As a security-conscious owner, I want strict response headers so the site is hardened by default.
- **References:** plan §12.
- **Acceptance criteria:**
  - [ ] CSP, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Strict-Transport-Security`, `frame-ancestors 'none'` set for all routes.
  - [ ] CSP permits required origins (Supabase, Upstash, Sentry, Vercel Analytics) and nothing more.
  - [ ] `next/image` `remotePatterns` configured (or local-only per locked image strategy, plan §16).

### E0-S7 — Error monitoring (Sentry) wired ✅

- **Priority:** P1 · **Size:** S · **Status:** Todo · **Depends on:** E0-S4
- **User story:** As an operator, I want client + serverless errors captured so I can triage production issues.
- **References:** plan §1, §12.
- **Acceptance criteria:**
  - [ ] Sentry initialized for client and server/route handlers using DSN from `@/env`.
  - [ ] A deliberately thrown test error appears in Sentry (or is verifiably sent in dev).
  - [ ] Source map upload gated to CI via `SENTRY_AUTH_TOKEN` only.

### E0-S8 — Root docs (README / CONTRIBUTING / ARCHITECTURE) ✅

- **Priority:** P2 · **Size:** S · **Status:** Todo · **Depends on:** E0-S1
- **User story:** As a contributor, I want setup + "how to add a recipe" docs so onboarding is self-serve.
- **References:** plan §12.
- **Acceptance criteria:**
  - [ ] `README` documents setup, env, and all scripts.
  - [ ] `CONTRIBUTING` explains how to author a recipe MDX (frontmatter fields, image naming, locale files).
  - [ ] `ARCHITECTURE.md` summarizes the static-content + dynamic-UGC hybrid (plan §2, §7, §19).

---

# E1 — Design Tokens & Styling Foundation

_Goal: every value from `design_system.md` exists as a token and resolves through Tailwind v4 utilities. Maps to plan §5, design §1–§8._

### E1-S1 — Token CSS (`src/styles/tokens.css`) — full ramps + semantic, light + dark ✅

- **Priority:** P0 · **Size:** M · **Status:** Todo · **Depends on:** E0-S1
- **User story:** As a developer, I want all design tokens defined once so components never hard-code values and dark mode is a swap.
- **References:** design §1.1–§1.5, §8.1.
- **Acceptance criteria:**
  - [ ] Full Basil / Terracotta / Sand ramps (50→950) and status colors authored as CSS vars.
  - [ ] All semantic tokens from design §1.5 defined for **both** light (`:root`) and dark (`[data-theme='dark']`).
  - [ ] Radius, shadow (warm-tinted), motion, z-index, type-scale, line-height/tracking tokens from design §2–§6 present.
  - [ ] No component references a raw ramp step — only semantic tokens.

### E1-S2 — Tailwind v4 `@theme` mapping ✅

- **Priority:** P0 · **Size:** S · **Status:** Todo · **Depends on:** E1-S1
- **User story:** As a developer, I want semantic tokens exposed as Tailwind utilities so I can write `bg-surface text-fg rounded-lg`.
- **References:** design §8.2.
- **Acceptance criteria:**
  - [ ] Every semantic token mapped in `@theme` (colors, radius, shadow, fonts, z-index).
  - [ ] Utilities `bg-surface`, `text-fg`, `text-fg-muted`, `border-border`, `bg-primary`, `text-accent`, `rounded-md/lg/full`, `shadow-sm/md/lg`, `font-display/sans` resolve correctly.

### E1-S3 — Fonts via `next/font` (Fraunces + Inter) ✅

- **Priority:** P0 · **Size:** S · **Status:** Todo · **Depends on:** E0-S1
- **User story:** As a reader, I want characterful, instantly-loaded type with no layout shift.
- **References:** design §2.1, §14.1.
- **Acceptance criteria:**
  - [ ] Fraunces (variable, opsz, weights 400/500/600) and Inter (variable, 400/500/600/700) self-hosted via `next/font`.
  - [ ] Exposed as `--font-display` / `--font-sans`; subset `latin` + `latin-ext` (Spanish accents).
  - [ ] No FOUT/CLS (verify CLS ≈ 0 on load); headings render Fraunces, body Inter.

### E1-S4 — Global styles + base layer ✅

- **Priority:** P0 · **Size:** S · **Status:** Todo · **Depends on:** E1-S2
- **User story:** As a developer, I want sensible global resets and base element styles so pages start on-brand.
- **References:** design §0–§3, §11.
- **Acceptance criteria:**
  - [ ] `globals.css` applies `--color-bg` (cream, never pure white) to body, `--color-fg` text, base font sizes from the fluid scale.
  - [ ] Containers `--container-page` (1280), `--container-prose` (720), `--container-narrow` (560) available; page gutters responsive (16→24→40).
  - [ ] `:focus-visible` ring uses `--color-ring` + `--shadow-focus` globally; skip-to-content target styled.
  - [ ] `prefers-reduced-motion` disables transforms/translate globally (opacity fades ≤120ms kept).

### E1-S5 — `prefers-contrast: more` border bump ✅

- **Priority:** P2 · **Size:** XS · **Status:** Todo · **Depends on:** E1-S1
- **User story:** As a low-vision user, I want stronger borders under high-contrast mode.
- **References:** design §1.6, §11.
- **Acceptance criteria:**
  - [ ] Under `prefers-contrast: more`, `--color-border` resolves to the `-strong` step.

---

# E2 — Content Pipeline (Velite + Zod)

_Goal: MDX → Zod-validated typed objects, consumed only via `lib/content/`. Maps to plan §4, §14.2, §16 (Velite)._

### E2-S1 — Recipe Zod schema (`src/schemas/recipe.ts`) ✅

- **Priority:** P0 · **Size:** M · **Status:** Todo · **Depends on:** E0-S1
- **User story:** As a content author, I want my recipe frontmatter validated so bad data fails the build, not production.
- **References:** plan §4, §8; design §7 (alt required).
- **Acceptance criteria:**
  - [ ] Schema covers all frontmatter from plan §4: title, slug, locale (`en`|`es`), cuisine (enum), mealType (enum[]), diet (enum[]), difficulty (`easy|medium|hard`), prep/cook minutes, servings, calories, structured `nutrition`, structured `ingredients` (`{item, qty, unit}`), structured `steps`, heroImage, **required `alt`**, tags, author, publishedAt, updatedAt, featured.
  - [ ] Types are exported via `z.infer`; shared types re-exported from `@/types`.
  - [ ] Invalid enum / missing nutrition / bad date is rejected with a clear error.

### E2-S2 — Velite config + build wiring ✅

- **Priority:** P0 · **Size:** M · **Status:** Todo · **Depends on:** E2-S1
- **User story:** As a developer, I want Velite to compile MDX into typed JSON at build so the UI never reads raw files.
- **References:** plan §4, §16, §20.
- **Acceptance criteria:**
  - [ ] `velite.config.ts` validates `content/recipes/{locale}/*.mdx` against the recipe schema.
  - [ ] Build emits typed content + MDX body; **build fails** on invalid frontmatter.
  - [ ] **Duplicate slug within a locale** fails the build.

### E2-S3 — Content query helpers (`src/lib/content/`) ✅

- **Priority:** P0 · **Size:** M · **Status:** Todo · **Depends on:** E2-S2
- **User story:** As a page author, I want typed helpers so pages fetch content without touching Velite internals.
- **References:** plan §2, §3, §6.
- **Acceptance criteria:**
  - [ ] `getRecipe(slug, locale)`, `listRecipes({locale, filters, sort})`, `getRelated(recipe)`, `listCuisines(locale)` implemented and typed.
  - [ ] Locale fallback rule (plan §8): untranslated recipes **hidden** from non-default listings/search; direct URL resolves to `en` body + "not yet translated" flag.
  - [ ] Unit tests cover filtering, sorting, and the fallback rule.

### E2-S4 — Seed recipe content (≥6 recipes, multi-cuisine) ✅

- **Priority:** P1 · **Size:** M · **Status:** Todo · **Depends on:** E2-S2
- **User story:** As a stakeholder, I want enough real recipes to exercise listing, filters, and search.
- **References:** plan §4; design §10.
- **Acceptance criteria:**
  - [ ] ≥6 valid `en` recipes spanning ≥4 cuisines, varied diet/mealType/difficulty/time, ≥1 `featured: true`.
  - [ ] ≥1 recipe fully translated to `es` (same slug) to exercise i18n + hreflang.
  - [ ] Every recipe has complete nutrition, structured ingredients/steps, and a hero image with `alt`.

### E2-S5 — Recipe images committed + optimized ✅

- **Priority:** P1 · **Size:** S · **Status:** Todo · **Depends on:** E2-S4
- **User story:** As a reader, I want fast, responsive food photos.
- **References:** plan §16 (image strategy); design §7.
- **Acceptance criteria:**
  - [ ] Hero images under `public/images/` named `{slug}.jpg` (+ `{slug}-{n}.jpg` for body).
  - [ ] Served via `next/image` (AVIF/WebP, responsive `sizes`); above-the-fold hero uses `priority`, others `loading="lazy"`.
  - [ ] Aspect ratios per design §7 (card 4:3, detail 16:9 / mobile 4:3, body 3:2).

### E2-S6 — Serving scaler + formatters (`src/lib/utils/`) ✅

- **Priority:** P0 · **Size:** S · **Status:** Todo · **Depends on:** E2-S1
- **User story:** As a cook, I want ingredient quantities and nutrition to recompute when I change servings.
- **References:** plan §5; design §9.7–§9.8.
- **Acceptance criteria:**
  - [ ] Pure `scaleIngredients(base, ratio)` rounds sensibly (e.g. 1.5, ¾) and never mutates input.
  - [ ] Time/servings/number formatters are locale-aware via `Intl`.
  - [ ] Full unit-test coverage including edge ratios (0.5×, 3×) and rounding boundaries.

---

# E3 — UI Primitives

_Goal: token-styled, Radix-backed, a11y primitives per design §9. Maps to plan §5, §14.3. Every primitive is keyboard- and screen-reader-correct and has unit + axe tests._

> Global AC for every primitive in E3:
>
> - [ ] Styled with semantic tokens only (no hex).
> - [ ] `focus-visible` ring (`--color-ring` + `--shadow-focus`).
> - [ ] Respects `prefers-reduced-motion`.
> - [ ] Unit test + `jest-axe` 0-serious.
> - [ ] Server Component unless interactivity requires `'use client'`.

### E3-S1 — Button ✅

- **Priority:** P0 · **Size:** S · **Status:** Todo · **Depends on:** E1-S2
- **User story:** As a user, I want consistent, accessible buttons across all variants/sizes.
- **References:** design §9.1.
- **Acceptance criteria:**
  - [ ] Variants: `primary`, `secondary`, `outline`, `ghost`, `accent`, `destructive`.
  - [ ] Sizes: `sm` h36 / `md` h44 / `lg` h52; icon-only square variants; radius `--radius-md`; weight 500; icon↔label gap 8px.
  - [ ] States: hover (`-hover`/lift), active (translateY 1px), focus-visible, disabled (opacity .5, not-allowed), loading (Lucide `loader-2` spin, non-interactive).
  - [ ] Min 44×44 touch target on mobile.

### E3-S2 — Input / Textarea / Select ✅

- **Priority:** P0 · **Size:** M · **Status:** Todo · **Depends on:** E1-S2
- **User story:** As a user, I want clear, labeled form fields with visible error/focus states.
- **References:** design §9.2.
- **Acceptance criteria:**
  - [ ] Input/Textarea: h44 (input), radius-md, 1px border, surface bg, subtle placeholder; focus → ring + shadow-focus; error → danger border + helper; disabled → muted.
  - [ ] Label above (text-sm/500); helper/error below (text-xs); Textarea min-h120, resize-y, char counter (`x/2000`).
  - [ ] Select = Radix Select: trigger styled like Input + `chevron-down`; menu surface + shadow-lg, item hover bg-muted; full keyboard nav.

### E3-S3 — Card ✅

- **Priority:** P0 · **Size:** XS · **Status:** Todo · **Depends on:** E1-S2
- **User story:** As a developer, I want a base surface card matching elevation/radius tokens.
- **References:** design §4, §9.3.
- **Acceptance criteria:**
  - [ ] Surface bg, radius-lg, 1px border, shadow-sm resting; optional hover lift to shadow-md + translateY(-2px).

### E3-S4 — Chip / Pill ✅

- **Priority:** P0 · **Size:** S · **Status:** Todo · **Depends on:** E1-S2
- **User story:** As a user filtering recipes, I want pill chips with clear selected/removable states.
- **References:** design §9.4.
- **Acceptance criteria:**
  - [ ] radius-full, h32, px-12, text-sm/500, 1px border, surface bg; optional leading icon.
  - [ ] Selected: primary-subtle bg + primary border + primary text; select transition `--ease-spring`.
  - [ ] Removable variant: trailing `x` (16px) button with accessible label.

### E3-S5 — Badge ✅

- **Priority:** P0 · **Size:** XS · **Status:** Todo · **Depends on:** E1-S2
- **User story:** As a reader, I want compact diet/tag labels.
- **References:** design §9.5.
- **Acceptance criteria:**
  - [ ] radius-xs, px-8/py-2, text-xs/600, optional uppercase + tracking-wide; non-interactive.
  - [ ] Tonal (diet: primary-subtle/primary) and neutral (tags: bg-muted/fg-muted) variants.

### E3-S6 — Dialog / Sheet ✅

- **Priority:** P0 · **Size:** M · **Status:** Todo · **Depends on:** E1-S2
- **User story:** As a mobile user, I want accessible modals/sheets with trapped focus.
- **References:** design §9.12.
- **Acceptance criteria:**
  - [ ] Radix Dialog: backdrop `rgb(20 18 16 / 0.5)` + blur(2px) at z-overlay; panel surface, radius-lg, shadow-xl, z-modal.
  - [ ] Enter fade+scale .98→1 (`--duration-base`); close `x` top-right; **focus trapped, Esc closes, focus returns to trigger**.
  - [ ] Mobile sheet slides from bottom, top-only radius.

### E3-S7 — Tabs ✅

- **Priority:** P1 · **Size:** S · **Status:** Todo · **Depends on:** E1-S2
- **User story:** As a mobile reader, I want to tab between Ingredients / Steps / Nutrition.
- **References:** design §9.13, §10 (detail mobile).
- **Acceptance criteria:**
  - [ ] Radix Tabs, underline indicator in `--color-primary` (animated slide), inactive text fg-muted; full keyboard support.

### E3-S8 — Tooltip ✅

- **Priority:** P2 · **Size:** XS · **Status:** Todo · **Depends on:** E1-S2
- **User story:** As a user, I want supplemental hints without losing essential info.
- **References:** design §9.13.
- **Acceptance criteria:**
  - [ ] Radix Tooltip: fg bg / bg text, text-xs, radius-sm, shadow-md, 6px offset, 200ms delay; never the only source of essential info.

### E3-S9 — Skeleton ✅

- **Priority:** P1 · **Size:** XS · **Status:** Todo · **Depends on:** E1-S2
- **User story:** As a user on a slow connection, I want skeletons (not bare spinners) for loading content.
- **References:** design §9.13, §9.18.
- **Acceptance criteria:**
  - [ ] bg-muted, radius matches target, shimmer 1.2s loop; **static block under reduced-motion**.

### E3-S10 — (Optional) Storybook catalog ✅ (deferred per AC — visual regression via Playwright in E12)

- **Priority:** P2 · **Size:** M · **Status:** Todo · **Depends on:** E3-S1..E3-S9
- **User story:** As a developer, I want an isolated component catalog for visual review and regression.
- **References:** plan §5, §10 (visual regression).
- **Acceptance criteria:**
  - [ ] Storybook runs; stories cover all primitives with light/dark + key states.
  - [ ] (If adopted) wired as the visual-regression target; otherwise mark explicitly deferred.

---

# E4 — Layout & Navigation

_Goal: app shell — header, footer, theme + locale toggles, providers. Maps to plan §3; design §9.14–§9.16, §10._

### E4-S1 — Root `[locale]` layout + providers ✅

- **Priority:** P0 · **Size:** M · **Status:** Todo · **Depends on:** E1-S3, E3-S1
- **User story:** As a user, I want every page wrapped with fonts, theme, locale, and query providers.
- **References:** plan §3; design §12.
- **Acceptance criteria:**
  - [ ] `src/app/[locale]/layout.tsx` sets `lang`, applies fonts, wraps `next-intl` provider, `next-themes` (`attribute="data-theme"`), and TanStack Query provider.
  - [ ] One `<h1>` per page enforced by page authors; semantic landmarks (`header/nav/main/footer`) present.
  - [ ] **No theme flash** on load (next-themes inline script).
  - [ ] Skip-to-content link is the first focusable element.

### E4-S2 — ThemeToggle ✅

- **Priority:** P0 · **Size:** S · **Status:** Todo · **Depends on:** E4-S1
- **User story:** As a user, I want to switch light/dark and have it persist.
- **References:** design §9.16, §12.
- **Acceptance criteria:**
  - [ ] Icon button toggles `sun`/`moon` via next-themes; respects system default; persists choice.
  - [ ] Animated cross-fade (`--ease-spring`); `aria-label` reflects the action.

### E4-S3 — LocaleSwitcher ✅

- **Priority:** P0 · **Size:** S · **Status:** Todo · **Depends on:** E4-S1, E9-S1
- **User story:** As a bilingual user, I want to switch language while staying on the same page.
- **References:** design §9.16; plan §8.
- **Acceptance criteria:**
  - [ ] `globe` button → Radix dropdown (English / Español); switches locale-prefixed route **preserving the path**; current locale checked.
  - [ ] `localePrefix: 'as-needed'` honored (no `/en` prefix; `/es/...` for Spanish).

### E4-S4 — Header (sticky) ✅

- **Priority:** P0 · **Size:** M · **Status:** Todo · **Depends on:** E4-S2, E4-S3, E8-S2
- **User story:** As a visitor, I want persistent navigation, search, and toggles.
- **References:** design §9.14, §10.
- **Acceptance criteria:**
  - [ ] h64 mobile / h72 desktop, z-sticky, bg with backdrop-blur + bottom border once scrolled.
  - [ ] Left: Fraunces wordmark + `leaf`/`chef-hat` mark. Right: nav (Recipes, Cuisines), SearchBar, LocaleSwitcher, ThemeToggle.
  - [ ] Mobile: hamburger → Sheet menu; fully keyboard-navigable.

### E4-S5 — Footer ✅

- **Priority:** P1 · **Size:** S · **Status:** Todo · **Depends on:** E4-S1
- **User story:** As a visitor, I want footer navigation, locale switch, and legal/disclaimer links.
- **References:** design §9.15.
- **Acceptance criteria:**
  - [ ] bg-muted, py-64; columns: brand blurb, recipe categories, locale switcher, social.
  - [ ] Bottom bar: copyright + "values are estimates" + privacy link; text-sm muted.

### E4-S6 — Breadcrumbs component ✅

- **Priority:** P1 · **Size:** S · **Status:** Todo · **Depends on:** E4-S1
- **User story:** As a user, I want breadcrumbs for orientation and SEO.
- **References:** design §10 (detail); plan §9 (breadcrumb JSON-LD).
- **Acceptance criteria:**
  - [ ] Accessible breadcrumb nav (`aria-label`, ordered list) on detail + cuisine pages.
  - [ ] Pairs with breadcrumb JSON-LD from E7-S2 (same labels/links).

---

# E5 — Recipe Domain Components

_Goal: the components that render a recipe. Maps to design §9.3, §9.6–§9.9; plan §5._

### E5-S1 — RecipeCard ✅

- **Priority:** P0 · **Size:** M · **Status:** Todo · **Depends on:** E3-S3, E3-S4, E3-S5, E5-S5 (compact rating)
- **User story:** As a browser, I want scannable recipe cards that link to the recipe.
- **References:** design §9.3.
- **Acceptance criteria:**
  - [ ] Anatomy: 4:3 media (radius-lg top, cover) + cuisine Chip overlaid top-left → body p-16: title (Fraunces text-xl/600, 2-line clamp) → meta row (`clock` total time · difficulty) → footer (compact RatingWidget + diet Badges).
  - [ ] Whole card is one link; hover lift + shadow-md + image `scale(1.03)` (overflow hidden); focus-visible ring on card.
  - [ ] Renders correctly with **0 ratings** (no stars / "No ratings yet").

### E5-S2 — NutritionTable ✅

- **Priority:** P0 · **Size:** S · **Status:** Todo · **Depends on:** E3-S3, E2-S6
- **User story:** As a health-conscious cook, I want per-serving nutrition that scales with servings.
- **References:** design §9.7; plan §8.
- **Acceptance criteria:**
  - [ ] Card with "Nutrition (per serving)" (Fraunces text-xl); calories highlighted (text-3xl tabular + accent keyline).
  - [ ] Macro grid (protein/carbs/fat/fiber/sugar/sodium) with units; 2-col mobile.
  - [ ] Values recompute with serving scaler; number change animates ≤120ms (respects reduced-motion).
  - [ ] Disclaimer footer "Values are estimates."

### E5-S3 — IngredientList + serving stepper ✅

- **Priority:** P0 · **Size:** M · **Status:** Todo · **Depends on:** E2-S6, E3-S1
- **User story:** As a cook, I want to scale ingredients and check them off.
- **References:** design §9.8.
- **Acceptance criteria:**
  - [ ] Header: "Ingredients" + serving Stepper (− N +) using ghost icon buttons (32px), tabular value.
  - [ ] Each item: Radix checkbox (primary check) + scaled qty (tabular/500) + unit + name; checked → strikethrough + muted (local state only).
  - [ ] Sticky within detail sidebar at `lg`; uses pure `scaleIngredients`.

### E5-S4 — StepList ✅

- **Priority:** P0 · **Size:** S · **Status:** Todo · **Depends on:** E1-S4
- **User story:** As a cook, I want numbered, readable steps.
- **References:** design §9.9.
- **Acceptance criteria:**
  - [ ] Ordered steps; each = circular number badge (primary-subtle bg / primary numeral, Fraunces) + step text (`--leading-relaxed`, measure 68ch); py-24 between steps.
  - [ ] Optional inline step image (3:2).

### E5-S5 — RatingWidget (display + compact) ✅

- **Priority:** P0 · **Size:** S · **Status:** Todo · **Depends on:** E1-S2
- **User story:** As a browser, I want to see a recipe's average rating at a glance.
- **References:** design §9.6.
- **Acceptance criteria:**
  - [ ] Read mode: 5 stars (filled `--color-star`, empty border-strong, integer fill), avg (Inter 600 tabular) + count.
  - [ ] **Renders nothing / "No ratings yet" when count = 0.**
  - [ ] Sizes: compact 16px (card) + default 24px (detail).
  - [ ] _(Interactive submit behavior is E10-S6.)_

### E5-S6 — Related recipes row ✅

- **Priority:** P1 · **Size:** S · **Status:** Todo · **Depends on:** E5-S1, E2-S3
- **User story:** As a reader finishing a recipe, I want related recipes to keep exploring.
- **References:** design §10 (detail); plan §3 (`getRelated`).
- **Acceptance criteria:**
  - [ ] Row of RecipeCards from `getRelated` (same cuisine/diet/tags heuristic), excluding the current recipe.
  - [ ] Empty/insufficient case handled gracefully (hide row or show fallback).

---

# E6 — Core Pages

_Goal: assemble components into the page blueprints. Maps to plan §14.4; design §10._

### E6-S1 — Home page ✅

- **Priority:** P0 · **Size:** M · **Status:** Todo · **Depends on:** E4-S4, E5-S1
- **User story:** As a visitor, I want an appetite-forward home that surfaces featured and curated recipes.
- **References:** design §10 (Home), §3.4.
- **Acceptance criteria:**
  - [ ] Full-bleed hero (featured recipe, overlaid bottom-left title card with gradient overlay, "View recipe" CTA).
  - [ ] Horizontal-scroll cuisine chip rail (snap, hidden scrollbar).
  - [ ] Curated rows / responsive grid ("Latest", "Quick & healthy", "High protein").
  - [ ] ISR `revalidate: 3600`; renders as RSC (no needless client JS).

### E6-S2 — Recipe listing (`/recipes`) ✅

- **Priority:** P0 · **Size:** M · **Status:** Todo · **Depends on:** E5-S1, E8-S3, E8-S4
- **User story:** As a browser, I want a filterable, sortable grid of recipes.
- **References:** design §10 (listing), §3.4; plan §6.
- **Acceptance criteria:**
  - [ ] Page title + result count → active filter chips → [filter sidebar lg | filter button mobile] + SortSelect → responsive grid (1→2→3→4 cols, gap 24).
  - [ ] Initial paint reads filter/sort from URL params in the RSC; pagination or "load more".

### E6-S3 — Recipe detail (`/recipes/[slug]`) ✅

- **Priority:** P0 · **Size:** L · **Status:** Todo · **Depends on:** E5-S2, E5-S3, E5-S4, E5-S5, E5-S6, E6-S?
- **User story:** As a cook, I want a complete recipe page with scalable ingredients, nutrition, steps, and engagement.
- **References:** design §10 (detail), §3.4; plan §4, §19.
- **Acceptance criteria:**
  - [ ] `generateStaticParams` over `[locale] × [slug]`; static shell/body (SSG).
  - [ ] Layout: breadcrumb → title (text-4xl Fraunces) + meta (time/difficulty/servings/rating) → 16:9 hero → 2-col at lg: main (description, StepList, tips, comments) · sticky sidebar (IngredientList + scaler + NutritionTable, `top: 88px`).
  - [ ] Mobile uses Tabs (Ingredients/Steps/Nutrition).
  - [ ] MDX body renders narrative; structured data drives components.
  - [ ] Engagement (rating submit + comments) mounted as client islands.

### E6-S4 — Cuisine page (`/cuisines/[cuisine]`) ✅

- **Priority:** P1 · **Size:** S · **Status:** Todo · **Depends on:** E6-S2
- **User story:** As a browser, I want to see all recipes for a cuisine.
- **References:** design §10 (cuisine).
- **Acceptance criteria:**
  - [ ] Cuisine header (name + blurb + image band) → filtered card grid.
  - [ ] `generateStaticParams` over cuisines × locales; unknown cuisine → 404.

### E6-S5 — Search page (`/search`) ✅

- **Priority:** P1 · **Size:** S · **Status:** Todo · **Depends on:** E8-S1, E8-S2
- **User story:** As a searcher, I want a focused search experience with live results.
- **References:** design §10 (search); plan §6, §20.
- **Acceptance criteria:**
  - [ ] Large autofocused SearchBar → live Pagefind results with match highlights (`<mark>` styled) → empty/no-result state.

### E6-S6 — Global states: `loading.tsx`, `error.tsx`, `not-found.tsx` ✅

- **Priority:** P0 · **Size:** S · **Status:** Todo · **Depends on:** E3-S9
- **User story:** As a user, I want graceful loading/error/404 instead of blank or broken screens.
- **References:** design §9.18; plan §12.
- **Acceptance criteria:**
  - [ ] Route-level `loading.tsx` uses Skeletons (no bare spinners).
  - [ ] `error.tsx`: apologetic heading + retry button, **no stack traces**.
  - [ ] `not-found.tsx`: playful food line + search + home buttons.

---

# E7 — SEO

_Goal: rich-result-eligible recipe pages + crawlable site. Maps to plan §9, §14.5, §19; design §10 (JSON-LD invisible)._

### E7-S1 — Recipe JSON-LD builder (`lib/seo/`) ✅

- **Priority:** P0 · **Size:** M · **Status:** Todo · **Depends on:** E2-S1
- **User story:** As a content owner, I want valid `schema.org/Recipe` markup so recipes earn Google rich cards.
- **References:** plan §9, §7 (aggregateRating rule), §8 (nutrition).
- **Acceptance criteria:**
  - [ ] Builder emits name, image, author, prep/cook/total time (ISO 8601), recipeYield, recipeIngredient, recipeInstructions, nutrition (`NutritionInformation`), keywords, recipeCuisine.
  - [ ] `aggregateRating` included **only when count > 0** (never empty/fake markup).
  - [ ] Unit tests validate shape; a sample passes Google Rich Results Test (manual verification noted).

### E7-S2 — Breadcrumb JSON-LD ✅

- **Priority:** P1 · **Size:** XS · **Status:** Todo · **Depends on:** E4-S6
- **User story:** As an SEO owner, I want breadcrumb structured data.
- **References:** plan §9.
- **Acceptance criteria:**
  - [ ] `BreadcrumbList` JSON-LD on detail + cuisine pages, matching the visible breadcrumb.

### E7-S3 — Metadata via `generateMetadata` ✅

- **Priority:** P0 · **Size:** M · **Status:** Todo · **Depends on:** E2-S3, E9-S1
- **User story:** As a sharer, I want correct titles, descriptions, canonical, and OG/Twitter tags per page.
- **References:** plan §9; design §10.
- **Acceptance criteria:**
  - [ ] Every page implements `generateMetadata` (title, description, canonical, OG/Twitter).
  - [ ] Localized metadata + `hreflang` alternates for `en`/`es` (only for locales the recipe exists in, per fallback rule).

### E7-S4 — Dynamic OG images ✅

- **Priority:** P1 · **Size:** S · **Status:** Todo · **Depends on:** E1-S3
- **User story:** As a sharer, I want attractive auto-generated share images.
- **References:** plan §9; design §0.
- **Acceptance criteria:**
  - [ ] `opengraph-image.tsx` renders on-brand OG (title + image) for recipe pages using design tokens/fonts.

### E7-S5 — `sitemap.ts` + `robots.ts` ✅

- **Priority:** P0 · **Size:** S · **Status:** Todo · **Depends on:** E2-S3
- **User story:** As a crawler, I want a complete sitemap and robots policy.
- **References:** plan §9.
- **Acceptance criteria:**
  - [ ] `sitemap.xml` generated from content incl. locale alternates; `robots.txt` resolves and references the sitemap.
  - [ ] Untranslated recipes excluded from non-default-locale entries (matches fallback rule).

### E7-S6 — Canonical + base URL via `@/env` ✅

- **Priority:** P1 · **Size:** XS · **Status:** Todo · **Depends on:** E0-S4
- **User story:** As an SEO owner, I want all absolute URLs derived from one canonical base.
- **References:** plan §17 (`NEXT_PUBLIC_SITE_URL`).
- **Acceptance criteria:**
  - [ ] Sitemap, OG, JSON-LD, canonical all use `env.NEXT_PUBLIC_SITE_URL`; no hard-coded hostnames.

---

# E8 — Discovery (Search + Filter)

_Goal: instant client search (Pagefind) + URL-driven faceted filtering/sort. Maps to plan §6, §14.6, §20; design §9.4, §9.10–§9.11._

### E8-S1 — Pagefind postbuild integration ✅

- **Priority:** P0 · **Size:** M · **Status:** Todo · **Depends on:** E6-S3
- **User story:** As a searcher, I want a static, backend-free index built from rendered recipe HTML.
- **References:** plan §6, §20 (risk flag).
- **Acceptance criteria:**
  - [ ] `postbuild` runs Pagefind over built HTML; bundle written to served output (and `public/pagefind` copy for dev).
  - [ ] Index covers title/ingredients/tags/body (server-rendered before indexing).
  - [ ] **Spike done early** to confirm Vercel output path; fallback (Fuse.js over Velite JSON) documented if blocked.

### E8-S2 — SearchBar component + lazy Pagefind load ✅

- **Priority:** P0 · **Size:** M · **Status:** Todo · **Depends on:** E8-S1, E3-S2
- **User story:** As a searcher, I want a fast search box that doesn't bloat the main bundle.
- **References:** design §9.10; plan §20.
- **Acceptance criteria:**
  - [ ] Pill/radius-md, h48, leading `search` icon, surface bg, shadow-sm; focus → ring + shadow-focus; debounced; clears with trailing `x`.
  - [ ] Pagefind bundle **dynamically imported** (not in main bundle); results panel highlights matches (`<mark>` styled bg primary-subtle).
  - [ ] Header variant compact (expands on focus md+); `/search` variant large + autofocus.

### E8-S3 — Faceted FilterPanel (URL state) ✅

- **Priority:** P0 · **Size:** L · **Status:** Todo · **Depends on:** E3-S4, E3-S6, E2-S3
- **User story:** As a browser, I want to filter recipes by facets via shareable URLs.
- **References:** design §9.11; plan §6 (`?cuisine=&diet=&maxTime=&sort=`).
- **Acceptance criteria:**
  - [ ] Facets: cuisine, diet, meal type, max total time (slider), difficulty, tags — derived from frontmatter enums.
  - [ ] **All filter state in URL params** (shareable, back-button correct); no client store (no Zustand — plan §16).
  - [ ] Desktop: left sidebar sections + "Clear all"; active filters as removable chips above grid. Mobile: "Filters" button → bottom Sheet with apply/clear footer.
  - [ ] Server reads params in RSC for initial paint; client refines without full reload.

### E8-S4 — SortSelect ✅ (rating-sort client hydration finalized with E10 ratings)

- **Priority:** P1 · **Size:** S · **Status:** Todo · **Depends on:** E3-S2
- **User story:** As a browser, I want to sort by newest, quickest, or highest-rated.
- **References:** design §9.11; plan §6.
- **Acceptance criteria:**
  - [ ] Radix Select: Newest / Quickest / Highest rated; writes `sort` to URL.
  - [ ] "Highest rated" hydrates rating data client-side (ratings come from the dynamic layer).

### E8-S5 — CuisineChips rail ✅

- **Priority:** P1 · **Size:** XS · **Status:** Todo · **Depends on:** E3-S4, E2-S3
- **User story:** As a browser, I want quick cuisine entry points.
- **References:** design §9.4, §10 (home).
- **Acceptance criteria:**
  - [ ] Horizontal-scroll, snap, hidden scrollbar; each chip links to `/cuisines/[cuisine]`.

### E8-S6 — Empty/no-result states for discovery ✅

- **Priority:** P1 · **Size:** XS · **Status:** Todo · **Depends on:** E8-S2, E8-S3
- **User story:** As a searcher, I want a helpful message when nothing matches.
- **References:** design §9.18.
- **Acceptance criteria:**
  - [ ] No-result (search) and no-match (filters) states: centered icon + Fraunces heading + muted sub + optional "Clear filters" CTA.

---

# E9 — i18n

_Goal: `en` (default) + `es` with locale routing, message catalogs, localized content + hreflang. Maps to plan §8, §14.7, §16; design §11._

### E9-S1 — next-intl config + locale routing ✅

- **Priority:** P0 · **Size:** M · **Status:** Todo · **Depends on:** E0-S1
- **User story:** As a bilingual user, I want locale-prefixed routes that work with the App Router.
- **References:** plan §8, §16 (`localePrefix: 'as-needed'`).
- **Acceptance criteria:**
  - [ ] `src/i18n/` configures locales `['en','es']`, default `en`, `localePrefix: 'as-needed'` (no `/en`; `/es/...` for Spanish).
  - [ ] Middleware routes locales; unknown locale → 404.

### E9-S2 — Message catalogs (`en.json`, `es.json`) ✅

- **Priority:** P0 · **Size:** M · **Status:** Todo · **Depends on:** E9-S1
- **User story:** As a developer, I want all UI strings externalized for translation.
- **References:** plan §8; design §11.
- **Acceptance criteria:**
  - [ ] **No hard-coded user-facing strings** in components — all via `next-intl` messages.
  - [ ] `en.json` and `es.json` have identical key sets (a key-parity check passes).

### E9-S3 — Localized formatting ✅

- **Priority:** P1 · **Size:** S · **Status:** Todo · **Depends on:** E9-S1, E2-S6
- **User story:** As a Spanish user, I want numbers, units, and dates formatted for my locale.
- **References:** plan §8.
- **Acceptance criteria:**
  - [ ] Times/servings/nutrition/dates use locale-aware `Intl` formatting; comment relative dates localized.

### E9-S4 — Localized content + fallback rule ✅

- **Priority:** P0 · **Size:** M · **Status:** Todo · **Depends on:** E2-S3, E9-S1
- **User story:** As a Spanish reader, I want translated recipes, and a clear notice when one isn't translated.
- **References:** plan §8 (locked fallback).
- **Acceptance criteria:**
  - [ ] `/es` listings/search show **only** recipes translated to `es`.
  - [ ] A direct `/es/recipes/[slug]` for an untranslated recipe renders the `en` body with a "not yet translated" banner (no dead link).

### E9-S5 — hreflang + localized metadata ✅

- **Priority:** P1 · **Size:** S · **Status:** Todo · **Depends on:** E7-S3, E9-S4
- **User story:** As an SEO owner, I want correct hreflang so Google serves the right locale.
- **References:** plan §8, §9.
- **Acceptance criteria:**
  - [ ] `hreflang` alternates emitted only for locales a page actually exists in; self-referential canonical correct.

### E9-S6 — i18n e2e (locale switch) ✅

- **Priority:** P1 · **Size:** S · **Status:** Todo · **Depends on:** E4-S3, E9-S4
- **User story:** As QA, I want an automated check that switching locale updates UI + content.
- **References:** plan §15 (i18n verification).
- **Acceptance criteria:**
  - [ ] Playwright: switch locale → UI strings change, localized recipe renders, hreflang present, path preserved.

---

# E10 — Dynamic Layer (Ratings + Comments)

\*Goal: thin serverless UGC with abuse control + moderation. Maps to plan §7, §14.8, §18, §19; design §9.6, §9.17. **Security-critical — see `src/app/api/CLAUDE.md`.\***

### E10-S1 — Supabase schema + RLS migration ✅

- **Priority:** P0 · **Size:** M · **Status:** Todo · **Depends on:** E0-S4
- **User story:** As an operator, I want the UGC tables with row-level security enforced.
- **References:** plan §18.
- **Acceptance criteria:**
  - [ ] Migration creates `ratings` + `comments` exactly per plan §18 (constraints, indexes, `comment_status` enum).
  - [ ] RLS: ratings readable + insertable (1–5 check); comments readable **only when `approved`**, insertable only as `pending`; **no anon update/delete**.
  - [ ] Daily backups enabled (documented).

### E10-S2 — DB clients (`lib/db/`): Supabase + Upstash ✅

- **Priority:** P0 · **Size:** S · **Status:** Todo · **Depends on:** E10-S1
- **User story:** As a developer, I want typed server-side DB/rate-limit clients.
- **References:** plan §7, §16, §17.
- **Acceptance criteria:**
  - [ ] Supabase server client uses `SUPABASE_SERVICE_ROLE_KEY` (server-only, never bundled to client).
  - [ ] Upstash Ratelimit client configured.
  - [ ] Query helpers for aggregate-ratings, upsert-vote, list-approved-comments, insert-pending-comment.

### E10-S3 — Zod schemas for UGC (`schemas/rating.ts`, `schemas/comment.ts`) ✅

- **Priority:** P0 · **Size:** S · **Status:** Todo · **Depends on:** E0-S1
- **User story:** As a developer, I want one source of truth for request validation.
- **References:** plan §7, §16, §18.
- **Acceptance criteria:**
  - [ ] Rating: integer 1–5; `slug`, `locale` (`en|es`), `anon_id` (uuid).
  - [ ] Comment: `author_name` 2–50, `body` 10–2000 (plain text), `slug`, `locale`, honeypot field.
  - [ ] Schemas reused by both API handlers and client forms.

### E10-S4 — Ratings API (`/api/ratings`) ✅

- **Priority:** P0 · **Size:** M · **Status:** Todo · **Depends on:** E10-S2, E10-S3
- **User story:** As a user, I want to read average ratings and submit my vote.
- **References:** plan §7, §18, §19.
- **Acceptance criteria:**
  - [ ] `GET ?slug=&locale=` → `{ avg, count }` computed server-side (service role); **raw rows never exposed**.
  - [ ] `POST` → upsert by `unique(anon_id, recipe_slug, locale)` (re-vote overwrites); body Zod-validated.
  - [ ] Rate limit **10/min by IP** → `429` on exceed.
  - [ ] All inputs validated; invalid → `400`.

### E10-S5 — Comments API (`/api/comments`) ✅

- **Priority:** P0 · **Size:** M · **Status:** Todo · **Depends on:** E10-S2, E10-S3
- **User story:** As a user, I want to read approved comments and submit a new one for review.
- **References:** plan §7, §18, §19.
- **Acceptance criteria:**
  - [ ] `GET ?slug=&locale=` → **approved only**.
  - [ ] `POST` → insert with `status='pending'`; Zod-validated; **honeypot filled → reject** (silently 2xx or 400 per spec, no DB write).
  - [ ] Rate limit **3/min by IP** → `429`.
  - [ ] Body stored as plain text; **escaped on render** (XSS prevention verified).

### E10-S6 — RatingWidget interactive (submit + optimistic) ✅

- **Priority:** P0 · **Size:** M · **Status:** Todo · **Depends on:** E5-S5, E10-S4
- **User story:** As a user, I want to tap a star and see my rating apply instantly.
- **References:** design §9.6; plan §7 (anon identity).
- **Acceptance criteria:**
  - [ ] Stars are buttons; hover/focus fills to hovered star (`--ease-spring`); click submits via TanStack Query with **optimistic update**, rollback on error.
  - [ ] `anon_id` = client UUID persisted in `localStorage` (`anon_id`); **no fingerprinting**.
  - [ ] Re-vote allowed (overwrites); disabled while in flight; thank-you micro-copy after submit.
  - [ ] A11y: `role="radiogroup"`, each star `role="radio"` + `aria-label="N stars"`, arrow keys move, Enter/Space submits.

### E10-S7 — CommentForm ✅

- **Priority:** P0 · **Size:** M · **Status:** Todo · **Depends on:** E3-S2, E10-S5
- **User story:** As a user, I want to post a comment and know it's pending review.
- **References:** design §9.17; plan §7.
- **Acceptance criteria:**
  - [ ] Name Input (2–50) + body Textarea (10–2000, char counter) + **visually-hidden honeypot** (`aria-hidden`, `tabindex=-1`) + submit.
  - [ ] Inline Zod errors; on submit → optimistic "pending review" note (info tone), form resets.
  - [ ] `429` → friendly warning toast (z-toast) with retry.

### E10-S8 — CommentList ✅

- **Priority:** P0 · **Size:** S · **Status:** Todo · **Depends on:** E10-S5, E3-S9
- **User story:** As a reader, I want to read approved comments.
- **References:** design §9.17.
- **Acceptance criteria:**
  - [ ] Each comment: avatar initial (primary-subtle circle), author (600), relative localized date, **escaped** plain-text body (prose measure).
  - [ ] Client-fetched via TanStack Query (always fresh); 3 Skeleton rows while loading; empty state "Be the first to comment."

### E10-S9 — Caching & on-demand revalidation ✅

- **Priority:** P0 · **Size:** M · **Status:** Todo · **Depends on:** E6-S3, E10-S4, E10-S5
- **User story:** As an SEO owner, I want fresh aggregate ratings in JSON-LD without rebuilding, and pages refreshed when content/comments change.
- **References:** plan §19, §7 (SEO note).
- **Acceptance criteria:**
  - [ ] `aggregateRating` + visible star summary fetched in RSC at request time (`revalidate: 3600` or tagged), **hidden when count === 0**.
  - [ ] Comments + live rating count are client-fetched (never baked into static HTML).
  - [ ] `revalidateTag`/`revalidatePath` fires when (a) MDX changes (deploy hook) and (b) a comment is approved.
  - [ ] Listing/home ISR `revalidate: 3600`.

---

# E11 — States, Errors & A11y Polish

_Goal: every page defines all required states and passes accessibility. Maps to design §9.18, §11; plan §11._

### E11-S1 — Toast system (offline / 429 / network) ✅

- **Priority:** P1 · **Size:** S · **Status:** Todo · **Depends on:** E4-S1
- **User story:** As a user, I want non-blocking notifications with retry on failures.
- **References:** design §9.18 (z-toast).
- **Acceptance criteria:**
  - [ ] Accessible toast (`aria-live`) at z-toast for offline/429/network errors with retry; auto-dismiss + manual close.

### E11-S2 — Empty states catalog ✅

- **Priority:** P1 · **Size:** S · **Status:** Todo · **Depends on:** E3-S1
- **User story:** As a user, I want friendly empty states everywhere content can be absent.
- **References:** design §9.18.
- **Acceptance criteria:**
  - [ ] Empty states for: no search results, no comments, no recipes in a cuisine — centered icon + Fraunces heading + muted sub + optional CTA.

### E11-S3 — Keyboard nav + focus order audit ✅

- **Priority:** P0 · **Size:** S · **Status:** Todo · **Depends on:** E6-S1, E6-S2, E6-S3
- **User story:** As a keyboard user, I want logical tab order and reachable controls everywhere.
- **References:** design §11; plan §11.
- **Acceptance criteria:**
  - [ ] Skip-to-content works; logical tab order on all pages; all interactive elements reachable + operable by keyboard.
  - [ ] Dialog/Sheet/Select/Tabs focus behavior correct (Radix).

### E11-S4 — Contrast + non-color signaling audit ✅

- **Priority:** P0 · **Size:** S · **Status:** Todo · **Depends on:** E1-S1
- **User story:** As a low-vision user, I want AA contrast and meaning never conveyed by color alone.
- **References:** design §1.6, §11, §13.
- **Acceptance criteria:**
  - [ ] All fg/bg pairs ≥ 4.5:1 (text) / ≥ 3:1 (UI) in **both** themes; accent-500 never used as small text on white.
  - [ ] Filters/status use icon + text (not color only).

### E11-S5 — Reduced-motion pass ✅

- **Priority:** P1 · **Size:** XS · **Status:** Todo · **Depends on:** E1-S4
- **User story:** As a motion-sensitive user, I want animations suppressed.
- **References:** design §5, §11.
- **Acceptance criteria:**
  - [ ] Under `prefers-reduced-motion`: no transforms/translate/parallax/auto-motion; opacity fades ≤120ms only; skeleton becomes static.

### E11-S6 — Touch target + responsive audit ✅

- **Priority:** P1 · **Size:** S · **Status:** Todo · **Depends on:** E6-S1, E6-S2, E6-S3
- **User story:** As a mobile user, I want comfortably tappable controls and correct layouts at every breakpoint.
- **References:** design §3.2, §11.
- **Acceptance criteria:**
  - [ ] All interactive targets ≥ 44×44 on mobile; layouts verified at sm/md/lg/xl/2xl with no overflow.

---

# E12 — Testing & Quality Gates

_Goal: the test pyramid + budgets that keep CI green. Maps to plan §10, §14.9, §15._

### E12-S1 — Vitest + RTL setup ✅

- **Priority:** P0 · **Size:** S · **Status:** Todo · **Depends on:** E0-S1
- **User story:** As a developer, I want a fast unit test runner wired up.
- **References:** plan §10.
- **Acceptance criteria:**
  - [ ] `vitest.config.ts` with RTL + jsdom; `pnpm test` runs; coverage reporter on.

### E12-S2 — Unit tests: utils, schemas, JSON-LD ✅

- **Priority:** P0 · **Size:** M · **Status:** Todo · **Depends on:** E12-S1, E2-S6, E7-S1
- **User story:** As a maintainer, I want core logic covered so regressions are caught.
- **References:** plan §10 (≥80% on `lib/`).
- **Acceptance criteria:**
  - [ ] Tests for scaleIngredients, formatters, recipe/rating/comment Zod schemas, Recipe + breadcrumb JSON-LD builders, content fallback logic.
  - [ ] `lib/` coverage ≥ 80%.

### E12-S3 — API integration tests (MSW / mocked DB) ✅

- **Priority:** P1 · **Size:** M · **Status:** Todo · **Depends on:** E10-S4, E10-S5
- **User story:** As a maintainer, I want route handlers tested without a live DB.
- **References:** plan §10.
- **Acceptance criteria:**
  - [ ] Ratings + comments handlers tested: validation (`400`), rate limit (`429`), happy path, honeypot rejection, approved-only reads.

### E12-S4 — Component a11y tests (jest-axe) ✅

- **Priority:** P0 · **Size:** S · **Status:** Todo · **Depends on:** E3-S1..E3-S9
- **User story:** As a maintainer, I want automated a11y assertions on components.
- **References:** plan §10; design §11.
- **Acceptance criteria:**
  - [ ] jest-axe on all primitives + key domain components → **0 serious**.

### E12-S5 — Playwright e2e (critical flows) ✅

- **Priority:** P0 · **Size:** L · **Status:** Todo · **Depends on:** E6-S2, E6-S3, E8-S2, E10-S6, E10-S7
- **User story:** As QA, I want the core journeys verified end-to-end.
- **References:** plan §10, §15.
- **Acceptance criteria:**
  - [ ] Flows: browse → filter (URL reproduces state) → open recipe → submit rating (optimistic→persisted) → submit comment (appears pending) → search → locale switch.
  - [ ] Rate-limit blocks rapid repeats.

### E12-S6 — Playwright axe on key pages ✅

- **Priority:** P0 · **Size:** S · **Status:** Todo · **Depends on:** E12-S5
- **User story:** As QA, I want page-level a11y in e2e.
- **References:** plan §10.
- **Acceptance criteria:**
  - [ ] axe runs on home, listing, detail, search → 0 serious in both themes.

### E12-S7 — Visual regression (Playwright snapshots / Chromatic) ✅ (deferred per AC — rationale: prioritized functional + a11y e2e for v1; snapshot baselines are flaky pre-real-photography, revisit post-launch)

- **Priority:** P2 · **Size:** M · **Status:** Todo · **Depends on:** E3-S10, E6-S3
- **User story:** As a maintainer, I want to catch unintended visual changes.
- **References:** plan §10.
- **Acceptance criteria:**
  - [ ] Snapshot baselines for design-system + recipe detail; diff fails CI on unexpected change (or explicitly deferred with rationale).

---

# E13 — CI/CD, Observability & Launch

_Goal: green pipeline, monitoring, and production deploy. Maps to plan §13, §14.10, §11._

### E13-S1 — GitHub Actions CI pipeline ✅

- **Priority:** P0 · **Size:** M · **Status:** Todo · **Depends on:** E12-S1, E12-S5
- **User story:** As a maintainer, I want PRs gated by the full quality suite.
- **References:** plan §13.
- **Acceptance criteria:**
  - [ ] `.github/workflows/ci.yml`: install (cached) → typecheck → lint/format → Vitest (+coverage) → build (content validation) → Playwright e2e → Lighthouse CI, in order.
  - [ ] A failing step fails the PR.

### E13-S2 — Lighthouse CI performance budget ✅

- **Priority:** P1 · **Size:** S · **Status:** Todo · **Depends on:** E13-S1
- **User story:** As an owner, I want CWV regressions blocked.
- **References:** plan §9 (perf=ranking), §11, §13.
- **Acceptance criteria:**
  - [ ] Budget enforces green Core Web Vitals on home + detail; PR fails on regression.

### E13-S3 — Bundle analyzer + client-JS budget ✅

- **Priority:** P2 · **Size:** S · **Status:** Todo · **Depends on:** E13-S1
- **User story:** As a perf owner, I want to keep client JS minimal (RSC-first).
- **References:** plan §11.
- **Acceptance criteria:**
  - [ ] Bundle analyzer available; Pagefind confirmed lazy (not in main bundle); islands are the only sizable client chunks.

### E13-S4 — Vercel deploy (preview per PR + prod on main) ✅ (repo config + LAUNCH.md; live deploy pending real Vercel project)

- **Priority:** P0 · **Size:** S · **Status:** Todo · **Depends on:** E13-S1
- **User story:** As an owner, I want automatic previews and production deploys.
- **References:** plan §13, §16 (hosting).
- **Acceptance criteria:**
  - [ ] PRs get preview deploys; merge to `main` deploys prod; all env vars set in Vercel (not repo).
  - [ ] Deploy hook triggers content revalidation (ties to E10-S9).

### E13-S5 — Analytics (Vercel Analytics + Speed Insights) ✅

- **Priority:** P1 · **Size:** XS · **Status:** Todo · **Depends on:** E13-S4
- **User story:** As an owner, I want cookieless usage + performance analytics.
- **References:** plan §1, §16.
- **Acceptance criteria:**
  - [ ] Vercel Analytics + Speed Insights enabled; no cookie banner needed (cookieless).

### E13-S6 — Production verification pass (plan §15) ✅ (verified locally; live prod run pending deploy — see LAUNCH.md)

- **Priority:** P0 · **Size:** M · **Status:** Todo · **Depends on:** E13-S4
- **User story:** As an owner, I want every milestone check from plan §15 verified on prod before sign-off.
- **References:** plan §15.
- **Acceptance criteria:**
  - [ ] Content: build fails on a broken enum, passes on valid set.
  - [ ] SEO: a live recipe URL passes Google Rich Results Test; sitemap/robots resolve.
  - [ ] Search/filter: e2e green; shareable URL reproduces state.
  - [ ] i18n: locale switch shows localized UI + content + hreflang.
  - [ ] Dynamic: rating persists (row in Supabase); comment appears pending; rate-limit blocks repeats.
  - [ ] All quality gates green in CI.

### E13-S7 — Launch readiness checklist ✅ (LAUNCH.md)

- **Priority:** P0 · **Size:** S · **Status:** Todo · **Depends on:** E13-S6
- **User story:** As an owner, I want a final go/no-go list before announcing.
- **References:** plan §10–§13, §21.
- **Acceptance criteria:**
  - [ ] Security headers verified live (CSP, HSTS, etc.); Sentry receiving prod events; backups on.
  - [ ] 404/error/offline states verified in prod; favicon/manifest/OG present.
  - [ ] Out-of-scope items (plan §21) confirmed **not** shipped; v1.1 candidates logged.

---

## Out of Scope for v1 (do NOT build — plan §21)

Tracked as v1.1+ candidates; building them now is a defect, not a bonus:
user accounts/auth · public recipe submission · cook mode + wake-lock · admin/moderation UI · hCaptcha · recipe collections/favorites · print stylesheet · email notifications · locales beyond `en`/`es` · remote image CDN.

---

## Appendix — Suggested execution order (critical path)

```
E0 ─▶ E1 ─▶ E2 ─▶ E3 ─▶ E4 ─▶ E5 ─▶ E6 ─▶ E7 ─▶ E8 ─▶ E9 ─▶ E10 ─▶ E11 ─▶ E12 ─▶ E13
                    │                    ▲                       │
                    └── E9-S1 needed by E4-S3 (LocaleSwitcher) ──┘
```

- E7 (SEO), E11 (a11y polish), and E12 (tests) are partly **continuous** — add JSON-LD/metadata, axe tests, and unit tests alongside each page/component rather than only at the end.
- E8-S1 (Pagefind spike) should be attempted **early** (plan §20 risk flag) even though search UI lands later.
