import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Suspense } from 'react';

import { SearchBar } from '@/components/discovery/SearchBar';
import { buildMetadata } from '@/lib/seo/metadata';
import type { Locale } from '@/schemas/recipe';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'search' });
  return buildMetadata({
    title: t('title'),
    description: t('placeholder'),
    locale: locale as Locale,
    path: '/search',
  });
}

export default async function SearchPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const { q = '' } = await searchParams;
  const t = await getTranslations('search');

  return (
    <div className="container-page py-10">
      <div className="mx-auto max-w-2xl">
        <h1 className="font-display text-3xl font-semibold text-fg">{t('title')}</h1>
        <div className="mt-6">
          <Suspense fallback={null}>
            {/* eslint-disable-next-line jsx-a11y/no-autofocus -- dedicated search page */}
            <SearchBar variant="page" autoFocus initialQuery={q} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
