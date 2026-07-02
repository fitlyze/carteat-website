'use client';

import { Search, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

import { searchRecipes, type PagefindResultData } from '@/lib/search';
import { cn } from '@/lib/utils/cn';

export interface SearchBarProps {
  variant?: 'header' | 'page';
  autoFocus?: boolean;
  initialQuery?: string;
}

export function SearchBar({
  variant = 'header',
  autoFocus = false,
  initialQuery = '',
}: SearchBarProps) {
  const t = useTranslations('search');
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<PagefindResultData[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const reqId = useRef(0);

  const isPage = variant === 'page';

  useEffect(() => {
    const q = query.trim();
    if (!q) {
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const id = ++reqId.current;
    const handle = setTimeout(async () => {
      try {
        const data = await searchRecipes(q);
        if (id === reqId.current) setResults(data);
      } catch {
        if (id === reqId.current) setResults([]);
      } finally {
        if (id === reqId.current) setLoading(false);
      }
      // Keep the URL shareable on the dedicated search page.
      if (isPage) {
        const next = new URLSearchParams(params.toString());
        next.set('q', q);
        router.replace(`${pathname}?${next.toString()}`, { scroll: false });
      }
    }, 250);
    return () => clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const showPanel = (isPage || open) && query.trim().length > 0;
  const noResults = !loading && query.trim().length > 0 && results.length === 0;

  return (
    <div className={cn('relative', isPage ? 'w-full' : 'w-full max-w-xs')}>
      <div role="search" className="relative">
        <Search
          aria-hidden
          className="pointer-events-none absolute top-1/2 left-3 size-5 -translate-y-1/2 text-fg-muted"
        />
        <input
          type="search"
          value={query}
          // eslint-disable-next-line jsx-a11y/no-autofocus -- intentional on the dedicated search page
          autoFocus={autoFocus}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          aria-label={t('title')}
          placeholder={t('placeholder')}
          className={cn(
            'w-full rounded-full border border-border bg-surface pr-10 pl-10 text-fg shadow-sm transition-[border-color] placeholder:text-fg-subtle focus:border-ring focus:outline-none',
            isPage ? 'h-14 text-lg' : 'h-11 text-base',
          )}
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery('')}
            aria-label={t('title')}
            className="absolute top-1/2 right-3 inline-flex size-6 -translate-y-1/2 items-center justify-center rounded-full text-fg-muted hover:bg-bg-muted"
          >
            <X aria-hidden className="size-4" />
          </button>
        )}
      </div>

      {showPanel && (
        <div
          className={cn(
            'z-[var(--z-dropdown)] mt-2 overflow-hidden rounded-lg border border-border bg-surface shadow-lg',
            isPage ? 'relative' : 'absolute inset-x-0',
          )}
        >
          <ul aria-live="polite" className="max-h-[60vh] overflow-y-auto">
            {results.map((r) => (
              <li key={r.url} className="border-b border-border last:border-0">
                <a
                  href={r.url}
                  className="block px-4 py-3 hover:bg-bg-muted focus:bg-bg-muted focus:outline-none"
                >
                  {r.meta.title && <p className="font-medium text-fg">{r.meta.title}</p>}
                  <p
                    className="mt-1 line-clamp-2 text-sm text-fg-muted"
                    dangerouslySetInnerHTML={{ __html: r.excerpt }}
                  />
                </a>
              </li>
            ))}
            {noResults && (
              <li className="px-4 py-6 text-center">
                <p className="font-display text-lg text-fg">
                  {t('noResults', { query })}
                </p>
                <p className="mt-1 text-sm text-fg-muted">{t('noResultsHint')}</p>
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
