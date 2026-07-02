import 'server-only';

import { createClient } from '@supabase/supabase-js';

import { env } from '@/env';

/**
 * Server-only Supabase client using the SERVICE ROLE key (bypasses RLS for
 * aggregate reads + upserts). NEVER import this into a client component — the
 * `server-only` guard fails the build if you do (api/CLAUDE.md).
 */
export const supabaseAdmin = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false, autoRefreshToken: false } },
);
