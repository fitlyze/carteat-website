# tests/ — Testing

`unit/` (Vitest + RTL), `e2e/` (Playwright), `a11y/` (axe). Strategy in plan §10.

## Rules

- **Unit-test all pure logic:** `scaleIngredients`, formatters, JSON-LD builders, Zod schemas. **Coverage gate ≥80% on `lib/`.**
- **Component tests (RTL)** for stateful islands: FilterPanel ↔ URL sync, serving Stepper recompute.
- **E2E (Playwright):** critical flows — browse → filter → open recipe; locale switch; search. Assert a shareable filtered URL reproduces state.
- **a11y:** jest-axe in unit + Playwright axe on key pages → **0 serious**.
- Use **test data factories** for recipes (don't hand-roll fixtures per test). Co-locate `*.test.tsx` with source or place under `tests/unit`.
- **Mock all network.** Never hit the real Pagefind bundle in tests.
