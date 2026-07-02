'use client';

import { useTranslations } from 'next-intl';

import type { Locale } from '@/schemas/recipe';

import { CommentForm } from './CommentForm';
import { CommentList } from './CommentList';

export function CommentsSection({ slug, locale }: { slug: string; locale: Locale }) {
  const t = useTranslations('comments');
  return (
    <section aria-labelledby="comments-heading" className="mt-12">
      <h2 id="comments-heading" className="font-display text-2xl font-semibold text-fg">
        {t('title')}
      </h2>
      <div className="mt-6">
        <CommentForm slug={slug} locale={locale} />
      </div>
      <CommentList slug={slug} locale={locale} />
    </section>
  );
}
