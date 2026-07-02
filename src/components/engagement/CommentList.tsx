'use client';

import { useQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';

import { Skeleton } from '@/components/ui/Skeleton';
import { formatRelativeDate } from '@/lib/utils/format';
import type { Comment } from '@/schemas/comment';
import type { Locale } from '@/schemas/recipe';

async function fetchComments(slug: string, locale: Locale): Promise<Comment[]> {
  const res = await fetch(`/api/comments?slug=${slug}&locale=${locale}`);
  if (!res.ok) throw new Error('fetch failed');
  const json = (await res.json()) as { comments: Comment[] };
  return json.comments;
}

export function CommentList({ slug, locale }: { slug: string; locale: Locale }) {
  const t = useTranslations('comments');
  const { data, isLoading } = useQuery({
    queryKey: ['comments', slug, locale],
    queryFn: () => fetchComments(slug, locale),
  });

  if (isLoading) {
    return (
      <ul className="mt-6 space-y-4">
        {Array.from({ length: 3 }, (_, i) => (
          <li key={i} className="flex gap-3">
            <Skeleton className="size-9 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-full" />
            </div>
          </li>
        ))}
      </ul>
    );
  }

  if (!data || data.length === 0) {
    return <p className="mt-6 text-fg-muted">{t('empty')}</p>;
  }

  return (
    <ul className="mt-6 space-y-6">
      {data.map((comment) => (
        <li key={comment.id} className="flex gap-3">
          <span
            aria-hidden
            className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary-subtle font-semibold text-on-primary-subtle"
          >
            {comment.author_name.charAt(0).toUpperCase()}
          </span>
          <div className="min-w-0">
            <div className="flex items-baseline gap-2">
              <span className="font-semibold text-fg">{comment.author_name}</span>
              <time dateTime={comment.created_at} className="text-xs text-fg-subtle">
                {formatRelativeDate(comment.created_at, locale)}
              </time>
            </div>
            {/* Plain text — React escapes it (XSS-safe, no HTML rendering). */}
            <p className="mt-1 max-w-[var(--measure)] text-fg">{comment.body}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}
