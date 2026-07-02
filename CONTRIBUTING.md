# Contributing

## Authoring a recipe (MDX)

Recipes are MDX files validated at build by Velite against
[`src/schemas/recipe.ts`](src/schemas/recipe.ts). **Invalid frontmatter fails
`pnpm build`** — that is intentional.

1. Create `content/recipes/<locale>/<slug>.mdx` where `<locale>` is `en` (default)
   or `es`. A translation **reuses the same `slug`** as its English source.
2. `slug` MUST equal the filename (without `.mdx`) and be unique per locale.
3. Fill the frontmatter (all required unless noted). Per-serving where noted:

```yaml
---
title: 'Thai Green Curry'
slug: 'thai-green-curry'
locale: 'en'
cuisine: 'thai' # enum — see schema
mealType: ['dinner', 'lunch'] # enum[]
diet: ['gluten-free', 'dairy-free'] # enum[]
difficulty: 'medium' # easy | medium | hard
prepMinutes: 20
cookMinutes: 30
servings: 4
calories: 420 # per serving
nutrition: { protein: 22, carbs: 18, fat: 28, fiber: 5, sugar: 6, sodium: 640 } # per serving
ingredients:
  - { item: 'coconut milk', qty: 400, unit: 'ml' }
steps:
  - 'Blend curry paste with aromatics.'
heroImage: '/images/thai-green-curry.jpg'
alt: 'A bowl of green curry with rice' # REQUIRED (a11y + SEO)
tags: ['spicy', 'quick']
author: 'Mammad'
publishedAt: '2026-06-19' # ISO YYYY-MM-DD
updatedAt: '2026-06-19'
featured: false # optional
---
Narrative, tips, and inline photos go in the MDX body — **not** structured data.
```

4. **Images** live committed under `public/images/`: hero `{slug}.jpg`, body
   `{slug}-{n}.jpg`. No remote URLs. `alt` is required.
5. **Enums** (`cuisine`, `diet`, `mealType`, `difficulty`) must use values defined
   in the schema. Need a new value? Add it to the schema first, then add an i18n
   label in `src/i18n/messages/{en,es}.json`.

### Translations & fallback

To leave a recipe untranslated, simply omit the locale file. It is hidden from
that locale's listing/search; a direct URL renders the `en` body with a "not yet
translated" banner.

## Commits

Conventional Commits, enforced by commitlint. Reference the backlog story id:
`feat(E2-S4): add seed recipes`. Pre-commit runs lint + format + typecheck.
