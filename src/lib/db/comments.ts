import 'server-only';

import type { Comment, CommentInput } from '@/schemas/comment';
import type { Locale } from '@/schemas/recipe';

import { supabaseAdmin } from './supabase';

/** Approved comments only (RLS also enforces this). Newest first. */
export async function listApprovedComments(
  slug: string,
  locale: Locale,
): Promise<Comment[]> {
  const { data, error } = await supabaseAdmin
    .from('comments')
    .select('id, author_name, body, created_at')
    .eq('recipe_slug', slug)
    .eq('locale', locale)
    .eq('status', 'approved')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []) as Comment[];
}

/** Insert a comment as `pending` (plain text — escaping happens at render). */
export async function insertPendingComment(input: CommentInput): Promise<void> {
  const { error } = await supabaseAdmin.from('comments').insert({
    recipe_slug: input.slug,
    locale: input.locale,
    author_name: input.author_name,
    body: input.body,
    status: 'pending',
  });
  if (error) throw error;
}
