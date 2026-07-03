'use client';

import { Menu, Search } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

import { HeaderSearch } from '@/components/discovery/HeaderSearch';
import { Button } from '@/components/ui/Button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/Dialog';
import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/utils/cn';

import { LocaleSwitcher } from './LocaleSwitcher';
import { Logo } from './Logo';
import { ThemeToggle } from './ThemeToggle';

const navItems = [
  { key: 'recipes', href: '/recipes' },
  { key: 'cuisines', href: '/#cuisines' },
] as const;

export function Header() {
  const t = useTranslations();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={cn(
        'sticky top-0 z-[var(--z-sticky)] h-16 bg-bg/80 backdrop-blur-md transition-[border-color,background-color] md:h-[72px]',
        scrolled ? 'border-b border-border' : 'border-b border-transparent',
      )}
    >
      <div className="container-page flex h-full items-center justify-between gap-4">
        <Link
          href="/"
          className="flex items-center gap-2 font-display text-xl font-semibold text-fg"
        >
          <Logo className="size-6" />
          {t('common.brand')}
        </Link>

        <nav aria-label={t('nav.recipes')} className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              className="rounded-md px-3 py-2 text-sm font-medium text-fg-muted hover:text-fg"
            >
              {t(`nav.${item.key}`)}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1">
          <div className="hidden md:block">
            <HeaderSearch />
          </div>
          {/* Mobile: link to the dedicated search page. */}
          <Button variant="ghost" size="md" iconOnly asChild className="md:hidden">
            <Link href="/search" aria-label={t('nav.search')}>
              <Search aria-hidden className="size-5" />
            </Link>
          </Button>
          <div className="hidden md:flex md:items-center md:gap-1">
            <LocaleSwitcher />
            <ThemeToggle />
          </div>

          {/* Mobile menu */}
          <div className="md:hidden">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" size="md" iconOnly aria-label={t('common.menu')}>
                  <Menu aria-hidden className="size-5" />
                </Button>
              </DialogTrigger>
              <DialogContent sheet>
                <DialogTitle className="font-display text-xl font-semibold">
                  {t('common.menu')}
                </DialogTitle>
                <nav className="mt-4 flex flex-col gap-1">
                  {navItems.map((item) => (
                    <DialogClose asChild key={item.key}>
                      <Link
                        href={item.href}
                        className="rounded-md px-3 py-3 text-base font-medium text-fg hover:bg-bg-muted"
                      >
                        {t(`nav.${item.key}`)}
                      </Link>
                    </DialogClose>
                  ))}
                </nav>
                <div className="mt-4 flex items-center gap-2 border-t border-border pt-4">
                  <LocaleSwitcher />
                  <ThemeToggle />
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    </header>
  );
}
