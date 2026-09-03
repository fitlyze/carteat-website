# content/ — Recipe Content (MDX)

Recipes are MDX files at `content/recipes/{locale}/{slug}.mdx`. Compiled by **Velite**, validated against `src/schemas/recipe.ts`. **Invalid frontmatter fails the build** (`pnpm build`). See plan §4, §8, §16.

## Rules

- Path = `content/recipes/<locale>/<slug>.mdx`. `locale` ∈ `en` (default), `es`. A translation reuses the **same `slug`** as its source.
- `slug` MUST equal the filename (without `.mdx`) and be **unique per locale** (duplicate slug = build fail).
- Frontmatter MUST satisfy the recipe Zod schema. Required keys (per serving where noted): `title, slug, locale, cuisine, mealType[], diet[], difficulty, prepMinutes, cookMinutes, servings, calories, nutrition{protein,carbs,fat,fiber,sugar,sodium}, ingredients[{item,qty,unit}], steps[], heroImage, tags[], author, publishedAt, updatedAt` (`featured` optional).
- **Structured data lives in frontmatter, not prose** — ingredients/steps/nutrition drive filtering, Recipe JSON-LD, and the NutritionTable. The MDX **body** is narrative/tips/photos only.
- `nutrition` + `calories` are **per serving**.
- Enums (`cuisine`, `diet`, `mealType`, `difficulty`) must use values defined in `src/schemas/recipe.ts`. Need a new cuisine/diet/etc.? **Add it to the schema first**, then to i18n labels.
- Images: `heroImage` → `/images/{slug}.jpg`; body images `/images/{slug}-{n}.jpg`. Files live committed under `public/images/`. Provide real `alt` (required by schema). No remote URLs.
- Dates ISO `YYYY-MM-DD`.

## Translations & fallback

- To leave a recipe untranslated, simply **omit** the locale file. It is hidden from that locale's listing/search; a direct URL renders the `en` body with a "not yet translated" banner (handled in `app/`, not here).

## Don't

- Don't change a published `slug` — it breaks live URLs.
- No secrets, no raw HTML that bypasses sanitization, no freeform prose for data that belongs in structured frontmatter.
