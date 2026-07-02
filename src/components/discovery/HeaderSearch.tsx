'use client';

import { Search } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { useRouter } from '@/i18n/navigation';

/**
 * Compact header search that expands on focus and routes to the dedicated
 * /search page (which hosts the live Pagefind index). Keeps Pagefind out of
 * the per-page bundle and pages statically renderable.
 */
export function HeaderSearch() {
  const t = useTranslations('search');
  const router = useRouter();
  const [q, setQ] = useState('');

  return (
    <form
      role="search"
      onSubmit={(e) => {
        e.preventDefault();
        const query = q.trim();
        if (query) router.push(`/search?q=${encodeURIComponent(query)}`);
      }}
      className="relative w-44 transition-[width] duration-[--duration-base] ease-out focus-within:w-60"
    >
      <Search
        aria-hidden
        className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-fg-muted"
      />
      <input
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        aria-label={t('title')}
        placeholder={t('placeholder')}
        className="h-10 w-full rounded-full border border-border bg-surface pr-3 pl-9 text-sm text-fg shadow-sm transition-[border-color] placeholder:text-fg-subtle focus:border-ring focus:outline-none"
      />
    </form>
  );
}
