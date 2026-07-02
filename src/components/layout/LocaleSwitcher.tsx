'use client';

import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { Check, Globe } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useTransition } from 'react';

import { Button } from '@/components/ui/Button';
import { locales, type Locale } from '@/i18n/config';
import { usePathname, useRouter } from '@/i18n/navigation';

export function LocaleSwitcher() {
  const t = useTranslations('locale');
  const current = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function switchTo(locale: Locale) {
    if (locale === current) return;
    // Preserve the current path; next-intl applies the locale prefix.
    startTransition(() => router.replace(pathname, { locale }));
  }

  const labels: Record<Locale, string> = {
    en: t('english'),
    es: t('spanish'),
  };

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <Button
          variant="ghost"
          size="md"
          iconOnly
          aria-label={t('switchLanguage')}
          disabled={isPending}
        >
          <Globe aria-hidden className="size-5" />
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={6}
          className="z-[var(--z-dropdown)] min-w-[10rem] rounded-md border border-border bg-surface p-1 shadow-lg"
        >
          {locales.map((locale) => (
            <DropdownMenu.Item
              key={locale}
              onSelect={() => switchTo(locale)}
              className="flex cursor-pointer items-center justify-between rounded-sm px-3 py-2 text-sm text-fg outline-none data-[highlighted]:bg-bg-muted"
            >
              {labels[locale]}
              {locale === current && (
                <Check aria-hidden className="size-4 text-primary" />
              )}
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
