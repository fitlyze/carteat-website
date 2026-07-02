# tests/ — Testing

`unit/` (Vitest + RTL), `e2e/` (Playwright), `a11y/` (axe). Strategy in plan §10.

## Rules

- **Unit-test all pure logic:** `scaleIngredients`, formatters, JSON-LD builders, Zod schemas. **Coverage gate ≥80% on `lib/`.**
- **Component tests (RTL)** for stateful islands: RatingWidget optimistic flow, CommentForm validation, FilterPanel ↔ URL sync, serving Stepper recompute.
- **API route handlers:** Vitest + MSW with mocked Supabase/Upstash — assert Zod rejection (400), rate-limit (429), comment persisted as `pending`, ratings `GET` returns aggregate-only (no raw rows).
- **E2E (Playwright):** critical flows — browse → filter → open recipe → submit rating/comment; locale switch; search. Assert a shareable filtered URL reproduces state.
- **a11y:** jest-axe in unit + Playwright axe on key pages → **0 serious**.
- Use **test data factories** for recipes/comments (don't hand-roll fixtures per test). Co-locate `*.test.tsx` with source or place under `tests/unit`.
- **Mock all network.** Never hit real Supabase/Upstash/Pagefind in tests.
