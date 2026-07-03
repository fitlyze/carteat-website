import { getTranslations } from 'next-intl/server';

import { Link } from '@/i18n/navigation';
import { listCuisines } from '@/lib/content';
import type { Locale } from '@/schemas/recipe';

import { LocaleSwitcher } from './LocaleSwitcher';
import { Logo } from './Logo';

export async function Footer({ locale }: { locale: Locale }) {
  const t = await getTranslations();
  const cuisines = listCuisines(locale).slice(0, 6);
  const year = new Date().getFullYear();

  return (
    <footer className="mt-16 bg-bg-muted">
      <div className="container-page grid gap-10 py-16 sm:grid-cols-2 lg:grid-cols-4">
        <div className="max-w-xs">
          <div className="flex items-center gap-2 font-display text-lg font-semibold text-fg">
            <Logo className="size-5" />
            {t('common.brand')}
          </div>
          <p className="mt-3 text-sm text-fg-muted">{t('footer.tagline')}</p>
        </div>

        <nav aria-label={t('footer.categories')}>
          <h2 className="text-sm font-semibold text-fg">{t('footer.categories')}</h2>
          <ul className="mt-3 space-y-2">
            {cuisines.map(({ cuisine }) => (
              <li key={cuisine}>
                <Link
                  href={`/cuisines/${cuisine}`}
                  className="text-sm text-fg-muted hover:text-fg"
                >
                  {t(`cuisine.${cuisine}`)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h2 className="text-sm font-semibold text-fg">{t('footer.language')}</h2>
          <div className="mt-3">
            <LocaleSwitcher />
          </div>
        </div>

        <nav aria-label={t('nav.recipes')}>
          <h2 className="text-sm font-semibold text-fg">{t('nav.recipes')}</h2>
          <ul className="mt-3 space-y-2">
            <li>
              <Link href="/recipes" className="text-sm text-fg-muted hover:text-fg">
                {t('nav.recipes')}
              </Link>
            </li>
            <li>
              <Link href="/search" className="text-sm text-fg-muted hover:text-fg">
                {t('nav.search')}
              </Link>
            </li>
          </ul>
        </nav>
      </div>

      <div className="border-t border-border">
        <div className="container-page flex flex-col gap-2 py-6 text-sm text-fg-muted sm:flex-row sm:items-center sm:justify-between">
          <p>{t('footer.copyright', { year })}</p>
          <p>{t('footer.estimates')}</p>
        </div>
      </div>
    </footer>
  );
}
