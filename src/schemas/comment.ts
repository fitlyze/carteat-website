import { z } from 'zod';

import { localeSchema } from './recipe';

// Mirrors the DB constraints in plan §18 (lengths, locale enum). Reused by the
// API handler and the React Hook Form resolver in CommentForm.
export const commentInputSchema = z.object({
  slug: z.string().min(1),
  locale: localeSchema,
  author_name: z.string().trim().min(2).max(50),
  body: z.string().trim().min(10).max(2000),
  // Honeypot — must be empty. Bots that fill it are rejected.
  honeypot: z.string().max(0).optional().default(''),
});

/** Shape returned to clients for an approved comment (no PII beyond name). */
export const commentSchema = z.object({
  id: z.string(),
  author_name: z.string(),
  body: z.string(),
  created_at: z.string(),
});

export type CommentInput = z.infer<typeof commentInputSchema>;
export type Comment = z.infer<typeof commentSchema>;

/** Form-only fields (client). The slug/locale are injected at submit time. */
export const commentFormSchema = commentInputSchema.pick({
  author_name: true,
  body: true,
  honeypot: true,
});
export type CommentFormValues = z.infer<typeof commentFormSchema>;
