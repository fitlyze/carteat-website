import type { Metadata } from 'next';

import { env } from '@/env';
import { locales, type Locale } from '@/schemas/recipe';

export const SITE_URL = env.NEXT_PUBLIC_SITE_URL;

/** Path with locale prefix applied (`as-needed`: no `/en`). `path` starts `/`. */
export function localePath(locale: Locale, path: string): string {
  const prefix = locale === 'en' ? '' : `/${locale}`;
  return `${prefix}${path === '/' ? '' : path}` || '/';
}

export function absoluteUrl(locale: Locale, path: string): string {
  return `${SITE_URL}${localePath(locale, path)}`;
}

export interface BuildMetadataArgs {
  title: string;
  description: string;
  locale: Locale;
  /** App path without locale prefix, starting with `/`. */
  path: string;
  image?: string;
  /** Locales this page actually exists in (for hreflang). Defaults to all. */
  availableLocales?: Locale[];
}

export function buildMetadata({
  title,
  description,
  locale,
  path,
  image,
  availableLocales = [...locales],
}: BuildMetadataArgs): Metadata {
  const canonical = absoluteUrl(locale, path);
  const languages: Record<string, string> = {};
  for (const l of availableLocales) languages[l] = absoluteUrl(l, path);
  if (availableLocales.includes('en')) {
    languages['x-default'] = absoluteUrl('en', path);
  }

  const images = image ? [{ url: image }] : undefined;

  return {
    title,
    description,
    alternates: { canonical, languages },
    openGraph: {
      title,
      description,
      url: canonical,
      type: 'website',
      locale,
      images,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: image ? [image] : undefined,
    },
  };
}
