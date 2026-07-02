import { describe, expect, it } from 'vitest';

import { commentInputSchema } from '@/schemas/comment';
import { ratingInputSchema } from '@/schemas/rating';

const uuid = '11111111-1111-1111-1111-111111111111';

describe('ratingInputSchema', () => {
  it('accepts a valid vote', () => {
    expect(
      ratingInputSchema.safeParse({ slug: 'x', locale: 'en', value: 5, anon_id: uuid })
        .success,
    ).toBe(true);
  });
  it('rejects out-of-range and non-integer values', () => {
    expect(
      ratingInputSchema.safeParse({ slug: 'x', locale: 'en', value: 6, anon_id: uuid })
        .success,
    ).toBe(false);
    expect(
      ratingInputSchema.safeParse({ slug: 'x', locale: 'en', value: 3.5, anon_id: uuid })
        .success,
    ).toBe(false);
  });
  it('rejects a bad locale or anon_id', () => {
    expect(
      ratingInputSchema.safeParse({ slug: 'x', locale: 'fr', value: 3, anon_id: uuid })
        .success,
    ).toBe(false);
    expect(
      ratingInputSchema.safeParse({ slug: 'x', locale: 'en', value: 3, anon_id: 'nope' })
        .success,
    ).toBe(false);
  });
});

describe('commentInputSchema', () => {
  const base = { slug: 'x', locale: 'en' as const };
  it('accepts a valid comment', () => {
    expect(
      commentInputSchema.safeParse({
        ...base,
        author_name: 'Sam',
        body: 'This was delicious and easy.',
      }).success,
    ).toBe(true);
  });
  it('enforces name + body length bounds', () => {
    expect(
      commentInputSchema.safeParse({
        ...base,
        author_name: 'S',
        body: 'long enough body',
      }).success,
    ).toBe(false);
    expect(
      commentInputSchema.safeParse({ ...base, author_name: 'Sam', body: 'short' })
        .success,
    ).toBe(false);
  });
  it('rejects a filled honeypot', () => {
    expect(
      commentInputSchema.safeParse({
        ...base,
        author_name: 'Sam',
        body: 'This was delicious and easy.',
        honeypot: 'bot',
      }).success,
    ).toBe(false);
  });
});
