import { revalidatePath } from 'next/cache';
import { NextResponse, type NextRequest } from 'next/server';

import { env } from '@/env';

export const dynamic = 'force-dynamic';

/**
 * On-demand revalidation (plan §19). Called by:
 *  - a Vercel deploy hook when MDX content changes, and
 *  - a Supabase database webhook when a comment is approved.
 * Guarded by the service-role key as a shared secret (sent by the caller).
 */
export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-revalidate-secret');
  if (!secret || secret !== env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: { path?: string };
  try {
    body = (await req.json()) as { path?: string };
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  if (!body.path || !body.path.startsWith('/')) {
    return NextResponse.json({ error: 'Invalid path' }, { status: 400 });
  }

  revalidatePath(body.path);
  return NextResponse.json({ revalidated: true, path: body.path });
}
