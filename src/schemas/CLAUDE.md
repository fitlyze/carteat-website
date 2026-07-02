# src/schemas/ — Zod Schemas (single source of truth)

`recipe.ts`, `comment.ts`, `rating.ts`. Each schema drives **both** the TypeScript type (`z.infer`) **and** runtime validation. Never hand-write a parallel `interface` — derive it.

## recipe.ts (plan §4)

- Defines the enums: `cuisine`, `diet` (array), `mealType` (array), `difficulty` (`easy|medium|hard`). **Adding a value used by a recipe = add it here first** (then add an i18n label + it auto-appears as a filter facet).
- Numeric fields are positive ints: `prepMinutes, cookMinutes, servings, calories`, and `nutrition.{protein,carbs,fat,fiber,sugar,sodium}` (per serving). `ingredients` = array of `{ item: string, qty: number, unit: string }`. `steps` = `string[]`. Dates ISO. `heroImage` + `alt` required.
- Consumed by `velite.config.ts` to validate every recipe's frontmatter at build (fail on violation, incl. duplicate slug per locale).

## comment.ts / rating.ts (plan §7, §18)

- `comment`: `author_name` 2–50, `body` 10–2000 (plain text), `honeypot`, `slug`, `locale`. Used by `app/api/comments` **and** the React Hook Form resolver in `CommentForm`.
- `rating`: `value` int 1–5, `anon_id` (uuid), `slug`, `locale`. Used by `app/api/ratings`.
- **Mirror the DB constraints in plan §18 exactly** so client, server, and Postgres agree (lengths, ranges, locale enum `en|es`).

## Rules

- Export the schema **and** its inferred type. One schema per concept; reuse it across MDX validation, API handlers, and forms. Keep recipe enums in sync with i18n labels and discovery facets.
