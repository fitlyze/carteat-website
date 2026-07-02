import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import type { ReactNode } from 'react';

import { fraunces, inter } from '@/app/fonts';
import { Footer } from '@/components/layout/Footer';
import { Header } from '@/components/layout/Header';
import { NavigationProgress } from '@/components/layout/NavigationProgress';
import { Providers } from '@/components/providers';
import { isLocale, locales } from '@/i18n/config';
import { SITE_URL } from '@/lib/seo/metadata';

import '@/styles/globals.css';

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'common' });
  const brand = t('brand');
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: brand, template: `%s · ${brand}` },
    description: t('brand'),
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  setRequestLocale(locale);
  const messages = await getMessages();
  const t = await getTranslations('common');

  return (
    <html
      lang={locale}
      className={`${fraunces.variable} ${inter.variable}`}
      suppressHydrationWarning
    >
      <body className="flex min-h-dvh flex-col">
        <NextIntlClientProvider messages={messages}>
          <Providers>
            <NavigationProgress />
            <a href="#main" className="skip-link">
              {t('skipToContent')}
            </a>
            <Header />
            <main id="main" className="flex-1">
              {children}
            </main>
            <Footer locale={locale} />
          </Providers>
        </NextIntlClientProvider>
        {/* Cookieless usage + performance analytics (no-op off Vercel). */}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
