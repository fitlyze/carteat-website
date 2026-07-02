import * as Sentry from '@sentry/nextjs';
import { NextResponse, type NextRequest } from 'next/server';

import { insertPendingComment, listApprovedComments } from '@/lib/db/comments';
import { commentLimiter } from '@/lib/db/upstash';
import { commentInputSchema } from '@/schemas/comment';
import { localeSchema } from '@/schemas/recipe';

export const dynamic = 'force-dynamic';

function clientIp(req: NextRequest): string {
  const fwd = req.headers.get('x-forwarded-for');
  return fwd?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || '127.0.0.1';
}

export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;
  const slug = params.get('slug') ?? '';
  const locale = localeSchema.safeParse(params.get('locale'));
  if (!slug || !locale.success) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
  try {
    const comments = await listApprovedComments(slug, locale.data);
    return NextResponse.json({ comments }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    Sentry.captureException(error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const { success } = await commentLimiter.limit(clientIp(req));
  if (!success) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = commentInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  // Honeypot filled → silently accept without writing (don't tip off bots).
  if (parsed.data.honeypot && parsed.data.honeypot.length > 0) {
    return NextResponse.json({ ok: true, status: 'pending' });
  }

  try {
    await insertPendingComment(parsed.data);
    return NextResponse.json({ ok: true, status: 'pending' });
  } catch (error) {
    Sentry.captureException(error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
