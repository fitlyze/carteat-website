import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { GET, POST } from '@/app/api/comments/route';
import { insertPendingComment, listApprovedComments } from '@/lib/db/comments';
import { commentLimiter } from '@/lib/db/upstash';

vi.mock('@sentry/nextjs', () => ({ captureException: vi.fn() }));
vi.mock('@/lib/db/upstash', () => ({
  ratingLimiter: { limit: vi.fn() },
  commentLimiter: { limit: vi.fn() },
}));
vi.mock('@/lib/db/comments', () => ({
  listApprovedComments: vi.fn(),
  insertPendingComment: vi.fn(),
}));

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(commentLimiter.limit).mockResolvedValue({ success: true } as never);
});

const validBody = {
  slug: 'thai',
  locale: 'en',
  author_name: 'Sam',
  body: 'This was delicious and easy to make.',
};

function post(body: unknown) {
  return new NextRequest('http://localhost/api/comments', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('GET /api/comments', () => {
  it('returns approved comments only', async () => {
    vi.mocked(listApprovedComments).mockResolvedValue([
      { id: '1', author_name: 'Sam', body: 'Great', created_at: '2026-01-01' },
    ]);
    const res = await GET(
      new NextRequest('http://localhost/api/comments?slug=thai&locale=en'),
    );
    expect(res.status).toBe(200);
    const json = (await res.json()) as { comments: unknown[] };
    expect(json.comments).toHaveLength(1);
  });

  it('400 on missing params', async () => {
    const res = await GET(new NextRequest('http://localhost/api/comments'));
    expect(res.status).toBe(400);
  });
});

describe('POST /api/comments', () => {
  it('429 when rate limited', async () => {
    vi.mocked(commentLimiter.limit).mockResolvedValue({ success: false } as never);
    const res = await POST(post(validBody));
    expect(res.status).toBe(429);
    expect(insertPendingComment).not.toHaveBeenCalled();
  });

  it('400 on invalid body', async () => {
    const res = await POST(post({ ...validBody, body: 'short' }));
    expect(res.status).toBe(400);
  });

  it('rejects a filled honeypot without writing', async () => {
    const res = await POST(post({ ...validBody, honeypot: 'bot' }));
    // commentInputSchema enforces honeypot empty → 400, no DB write.
    expect(res.status).toBe(400);
    expect(insertPendingComment).not.toHaveBeenCalled();
  });

  it('inserts a pending comment on the happy path', async () => {
    const res = await POST(post(validBody));
    expect(res.status).toBe(200);
    expect(insertPendingComment).toHaveBeenCalledOnce();
    expect(await res.json()).toEqual({ ok: true, status: 'pending' });
  });
});
