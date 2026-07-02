'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { Button } from '@/components/ui/Button';
import { FieldHint, Input, Label, Textarea } from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';
import { commentFormSchema, type CommentFormValues } from '@/schemas/comment';
import type { Locale } from '@/schemas/recipe';

export function CommentForm({ slug, locale }: { slug: string; locale: Locale }) {
  const t = useTranslations('comments');
  const tc = useTranslations('common');
  const { toast } = useToast();
  const qc = useQueryClient();
  const [pending, setPending] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CommentFormValues>({
    resolver: zodResolver(commentFormSchema),
    defaultValues: { author_name: '', body: '', honeypot: '' },
  });

  const bodyLength = watch('body')?.length ?? 0;

  async function onSubmit(values: CommentFormValues) {
    setPending(false);
    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...values, slug, locale }),
      });
      if (res.status === 429) {
        toast({
          message: t('rateLimited'),
          tone: 'warning',
          actionLabel: tc('retry'),
          onAction: () => void onSubmit(values),
        });
        return;
      }
      if (!res.ok) {
        toast({ message: t('error'), tone: 'danger' });
        return;
      }
      setPending(true);
      reset();
      // Approved comments are moderated later; refresh the list opportunistically.
      void qc.invalidateQueries({ queryKey: ['comments', slug, locale] });
    } catch {
      toast({ message: t('error'), tone: 'danger' });
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-[var(--measure)] space-y-4">
      <div>
        <Label htmlFor="comment-name">{t('name')}</Label>
        <Input
          id="comment-name"
          autoComplete="name"
          placeholder={t('namePlaceholder')}
          error={!!errors.author_name}
          aria-describedby={errors.author_name ? 'comment-name-error' : undefined}
          {...register('author_name')}
        />
        {errors.author_name && (
          <FieldHint error id="comment-name-error">
            {t('nameError')}
          </FieldHint>
        )}
      </div>

      <div>
        <Label htmlFor="comment-body">{t('comment')}</Label>
        <Textarea
          id="comment-body"
          maxLength={2000}
          placeholder={t('commentPlaceholder')}
          error={!!errors.body}
          aria-describedby={errors.body ? 'comment-body-error' : undefined}
          {...register('body')}
        />
        <div className="flex items-center justify-between">
          {errors.body ? (
            <FieldHint error id="comment-body-error">
              {t('bodyError')}
            </FieldHint>
          ) : (
            <span />
          )}
          <span className="mt-1.5 text-xs text-fg-subtle tabular-nums">
            {bodyLength}/2000
          </span>
        </div>
      </div>

      {/* Honeypot — hidden from users + assistive tech; bots that fill it are rejected. */}
      <div aria-hidden className="sr-only">
        <label htmlFor="comment-website">Website</label>
        <input
          id="comment-website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          {...register('honeypot')}
        />
      </div>

      <div className="flex items-center gap-3">
        <Button type="submit" loading={isSubmitting}>
          {t('submit')}
        </Button>
        <p aria-live="polite" className="text-sm">
          {pending && <span className="text-info">{t('pending')}</span>}
        </p>
      </div>
    </form>
  );
}
