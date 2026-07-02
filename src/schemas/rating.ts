import { z } from 'zod';

import { localeSchema } from './recipe';

// Mirrors the DB constraints in plan §18 so client, server, and Postgres agree.
export const ratingValueSchema = z.number().int().min(1).max(5);

export const ratingInputSchema = z.object({
  slug: z.string().min(1),
  locale: localeSchema,
  value: ratingValueSchema,
  anon_id: z.string().uuid(),
});

export const ratingAggregateSchema = z.object({
  avg: z.number(),
  count: z.number().int().nonnegative(),
});

export type RatingInput = z.infer<typeof ratingInputSchema>;
export type RatingAggregate = z.infer<typeof ratingAggregateSchema>;
