# src/styles/ — Design Tokens & Globals

`tokens.css` (CSS-variable tokens, light + dark) + `globals.css`. **This is the ONLY place raw color/spacing/shadow/type values are allowed to live.** Everything else references tokens. Full values in `design_system.md` §1–§8.

## Rules

- Author the full color ramps + **semantic tokens** from design §1.5 in `tokens.css`, under both `:root` (light) and `[data-theme='dark']` (dark). Use the exact token **names** from design §1.5 / §8.
- Expose tokens to Tailwind v4 via **`@theme`** (design §8.2) so utilities resolve to vars: `bg-surface`, `text-fg`, `border-border`, `rounded-lg`, `shadow-sm`, `font-display`, etc.
- Include radius, shadow, motion (easings/durations), z-index, and the fluid `clamp()` type scale tokens (design §2–§6).
- Wire fonts: `--font-display` (Fraunces) + `--font-sans` (Inter) from `next/font`.
- **Dark mode = token swap** under `[data-theme='dark']` (next-themes `attribute="data-theme"`). Components never change between themes.

## Don't

- Components must not hard-code values. If a needed value is missing, **add a named token here (both themes), then use it** — never inline a hex/px-color in a component.
- Don't rename a token without updating `design_system.md` and every consumer.
