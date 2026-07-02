import { Search } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

import { Button } from '@/components/ui/Button';
import { Link } from '@/i18n/navigation';

export default async function NotFound() {
  const t = await getTranslations('states');
  const tn = await getTranslations('nav');

  return (
    <div className="container-page flex min-h-[50vh] flex-col items-center justify-center text-center">
      <p className="text-5xl" aria-hidden>
        🍳
      </p>
      <h1 className="mt-4 font-display text-3xl font-semibold text-fg">
        {t('notFoundTitle')}
      </h1>
      <p className="mt-3 max-w-md text-fg-muted">{t('notFoundBody')}</p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <Button variant="primary" asChild>
          <Link href="/">{t('backHome')}</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/search">
            <Search aria-hidden className="size-4" />
            {tn('search')}
          </Link>
        </Button>
      </div>
    </div>
  );
}
