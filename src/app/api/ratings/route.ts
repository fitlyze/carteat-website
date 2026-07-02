import * as Sentry from '@sentry/nextjs';
import { NextResponse, type NextRequest } from 'next/server';

import { getAggregateRating, upsertRating } from '@/lib/db/ratings';
import { ratingLimiter } from '@/lib/db/upstash';
import { ratingInputSchema } from '@/schemas/rating';

export const dynamic = 'force-dynamic';

function clientIp(req: NextRequest): string {
  const fwd = req.headers.get('x-forwarded-for');
  return fwd?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || '127.0.0.1';
}

const querySchema = ratingInputSchema.pick({ slug: true, locale: true });

export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;
  const parsed = querySchema.safeParse({
    slug: params.get('slug') ?? '',
    locale: params.get('locale') ?? '',
  });
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
  try {
    const aggregate = await getAggregateRating(parsed.data.slug, parsed.data.locale);
    return NextResponse.json(aggregate, {
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch (error) {
    Sentry.captureException(error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  // Rate limit BEFORE any DB work (10/min by IP).
  const { success } = await ratingLimiter.limit(clientIp(req));
  if (!success) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = ratingInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  try {
    await upsertRating(parsed.data);
    const aggregate = await getAggregateRating(parsed.data.slug, parsed.data.locale);
    return NextResponse.json(aggregate);
  } catch (error) {
    Sentry.captureException(error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
