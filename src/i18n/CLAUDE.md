# src/i18n/ — Internationalization (next-intl)

Locales: **`en` (default), `es`**. `localePrefix: 'as-needed'` (no `/en`; Spanish at `/es/...`). Config in `config.ts` + `routing.ts`; UI strings in `messages/{locale}.json`. See plan §8, §16.

## Rules

- **All user-facing copy comes from the message catalogs.** No hard-coded strings in components/pages. Adding a string means adding the key to **both** `en.json` and `es.json`.
- Keep `en.json` and `es.json` **structurally identical** (same keys, same nesting). A missing key = runtime fallback bug.
- Namespace keys by feature: `common`, `home`, `recipe`, `filters`, etc. Mirror across locales.
- Access via `getTranslations` (server components) / `useTranslations` (client islands). Format numbers/dates/units with next-intl / `Intl` — locale-aware, never manual concatenation.
- Use next-intl **navigation helpers** for `Link`/router so the locale prefix is preserved.
- Recipe **content** is localized separately under `content/recipes/{locale}/` — these JSON files are UI chrome only.
- `hreflang` alternates + localized metadata are produced in `app/` via `lib/seo`.

## Don't

- Don't let the two catalogs drift. Don't inline copy. Don't add a 3rd locale (v1 = en/es; more is out of scope — plan §21).
