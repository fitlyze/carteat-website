-- UGC schema + RLS (plan §18). Ratings and comments for static recipe pages.

-- ratings: one row per (anon_id, recipe_slug, locale); re-vote = upsert
create table public.ratings (
  id          uuid primary key default gen_random_uuid(),
  recipe_slug text not null,
  locale      text not null check (locale in ('en','es')),
  value       int  not null check (value between 1 and 5),
  anon_id     uuid not null,
  created_at  timestamptz not null default now(),
  unique (anon_id, recipe_slug, locale)
);
create index ratings_slug_locale_idx on public.ratings (recipe_slug, locale);

-- comments: default pending; only approved are publicly readable
create type comment_status as enum ('pending', 'approved', 'rejected');
create table public.comments (
  id          uuid primary key default gen_random_uuid(),
  recipe_slug text not null,
  locale      text not null check (locale in ('en','es')),
  author_name text not null check (char_length(author_name) between 2 and 50),
  body        text not null check (char_length(body) between 10 and 2000),
  status      comment_status not null default 'pending',
  created_at  timestamptz not null default now()
);
create index comments_slug_locale_status_idx
  on public.comments (recipe_slug, locale, status);

alter table public.ratings enable row level security;
alter table public.comments enable row level security;

-- ratings: anon may read (aggregate computed server-side) + insert; updates go
-- through the service role (upsert).
create policy ratings_read on public.ratings for select using (true);
create policy ratings_insert on public.ratings for insert
  with check (value between 1 and 5);

-- comments: anon may read ONLY approved; may insert as pending; no update/delete.
create policy comments_read on public.comments for select
  using (status = 'approved');
create policy comments_insert on public.comments for insert
  with check (
    status = 'pending'
    and char_length(author_name) between 2 and 50
    and char_length(body) between 10 and 2000
  );
-- No update/delete policies for anon → moderation only via service role / dashboard.
-- Enable daily backups in the Supabase dashboard (UGC is not in git).
