import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { GET, POST } from '@/app/api/ratings/route';
import { getAggregateRating, upsertRating } from '@/lib/db/ratings';
import { ratingLimiter } from '@/lib/db/upstash';

vi.mock('@sentry/nextjs', () => ({ captureException: vi.fn() }));
vi.mock('@/lib/db/upstash', () => ({
  ratingLimiter: { limit: vi.fn() },
  commentLimiter: { limit: vi.fn() },
}));
vi.mock('@/lib/db/ratings', () => ({
  getAggregateRating: vi.fn(),
  upsertRating: vi.fn(),
}));

const uuid = '11111111-1111-1111-1111-111111111111';

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(ratingLimiter.limit).mockResolvedValue({ success: true } as never);
});

describe('GET /api/ratings', () => {
  it('400 on missing params', async () => {
    const res = await GET(new NextRequest('http://localhost/api/ratings'));
    expect(res.status).toBe(400);
  });

  it('returns aggregate only', async () => {
    vi.mocked(getAggregateRating).mockResolvedValue({ avg: 4.5, count: 10 });
    const res = await GET(
      new NextRequest('http://localhost/api/ratings?slug=thai&locale=en'),
    );
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ avg: 4.5, count: 10 });
  });
});

describe('POST /api/ratings', () => {
  function post(body: unknown) {
    return new NextRequest('http://localhost/api/ratings', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    });
  }

  it('429 when rate limited', async () => {
    vi.mocked(ratingLimiter.limit).mockResolvedValue({ success: false } as never);
    const res = await POST(post({ slug: 'x', locale: 'en', value: 5, anon_id: uuid }));
    expect(res.status).toBe(429);
    expect(upsertRating).not.toHaveBeenCalled();
  });

  it('400 on invalid body', async () => {
    const res = await POST(post({ slug: 'x', locale: 'en', value: 9, anon_id: uuid }));
    expect(res.status).toBe(400);
  });

  it('upserts and returns the new aggregate', async () => {
    vi.mocked(getAggregateRating).mockResolvedValue({ avg: 5, count: 1 });
    const res = await POST(post({ slug: 'x', locale: 'en', value: 5, anon_id: uuid }));
    expect(res.status).toBe(200);
    expect(upsertRating).toHaveBeenCalledWith({
      slug: 'x',
      locale: 'en',
      value: 5,
      anon_id: uuid,
    });
    expect(await res.json()).toEqual({ avg: 5, count: 1 });
  });
});
