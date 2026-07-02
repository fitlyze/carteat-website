# src/app/api/ — UGC Route Handlers (SECURITY-CRITICAL)

Thin serverless layer for ratings + comments. Contracts in plan §7; DB schema + RLS in plan §18; env in plan §17. Read carefully — this is the only place untrusted input enters the system.

## Hard rules

- **Validate every request with Zod** (query params + body, from `@/schemas`) before any DB call. Malformed → `400`. Never trust client input.
- **Rate-limit before writes** via Upstash (`lib/db/upstash`), keyed by IP: ratings **10/min**, comments **3/min**. Exceed → `429`.
- **Service-role Supabase key is server-only.** Use it only here / in `lib/db`. Never import it (or the service client) into a client component. Never return it. Read via `@/env` (server scope).
- **Comments:** accept `author_name` (2–50) + `body` (10–2000) + honeypot field. **Reject if honeypot is filled.** Store as `status='pending'`. Body is **plain text** — never store or return HTML; escaping happens at render time.
- **Ratings:** integer 1–5; **upsert** on `(anon_id, recipe_slug, locale)` (re-vote overwrites). `GET` returns aggregate `{ avg, count }` **only** — never raw rows or `anon_id`s to the client.
- `GET /api/comments` returns **approved comments only**.
- After a comment is approved (moderation flow), trigger `revalidatePath` for the affected recipe (plan §19).
- Report exceptions to Sentry; return **generic** error messages (no stack traces, no DB/internal details).

## Endpoints

- `GET /api/ratings?slug=&locale=` → `{ avg, count }` · `POST` → upsert vote `{ value, anon_id, slug, locale }`
- `GET /api/comments?slug=&locale=` → approved comments · `POST` → create pending `{ author_name, body, slug, locale, honeypot }`

## Don't

No business/DB logic inline — delegate to `lib/db/*`. Never skip Zod or rate-limit. Never leak PII or raw rows. No `NEXT_PUBLIC_` for secrets used here.
