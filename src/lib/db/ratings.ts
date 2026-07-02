import 'server-only';

import type { RatingAggregate, RatingInput } from '@/schemas/rating';
import type { Locale } from '@/schemas/recipe';

import { supabaseAdmin } from './supabase';

/** Aggregate avg/count computed server-side — raw rows never leave the server. */
export async function getAggregateRating(
  slug: string,
  locale: Locale,
): Promise<RatingAggregate> {
  const { data, error } = await supabaseAdmin
    .from('ratings')
    .select('value')
    .eq('recipe_slug', slug)
    .eq('locale', locale);

  if (error) throw error;

  const values = (data ?? []) as { value: number }[];
  const count = values.length;
  const avg = count > 0 ? values.reduce((sum, r) => sum + r.value, 0) / count : 0;
  return { avg: Number(avg.toFixed(2)), count };
}

/**
 * Build-safe wrapper for server rendering (JSON-LD + initial summary). Returns
 * an empty aggregate if the store is unreachable so SSG/ISR never fails on a
 * missing DB (e.g. local dev). Real data is fetched live by the client widget.
 */
export async function getRatingSummarySafe(
  slug: string,
  locale: Locale,
): Promise<RatingAggregate> {
  try {
    return await getAggregateRating(slug, locale);
  } catch {
    return { avg: 0, count: 0 };
  }
}

/** Upsert a vote on the unique (anon_id, recipe_slug, locale) constraint. */
export async function upsertRating(input: RatingInput): Promise<void> {
  const { error } = await supabaseAdmin.from('ratings').upsert(
    {
      recipe_slug: input.slug,
      locale: input.locale,
      value: input.value,
      anon_id: input.anon_id,
    },
    { onConflict: 'anon_id,recipe_slug,locale' },
  );
  if (error) throw error;
}
