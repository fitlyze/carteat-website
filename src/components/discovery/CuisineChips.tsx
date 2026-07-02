import { useTranslations } from 'next-intl';

import { Link } from '@/i18n/navigation';
import type { CuisineCount } from '@/lib/content';

/** Horizontal-scroll cuisine entry points (design §9.4, §10 home). */
export function CuisineChips({ cuisines }: { cuisines: CuisineCount[] }) {
  const t = useTranslations();

  if (cuisines.length === 0) return null;

  return (
    <div className="no-scrollbar -mx-4 flex snap-x gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0">
      {cuisines.map(({ cuisine }) => (
        <Link
          key={cuisine}
          href={`/cuisines/${cuisine}`}
          className="inline-flex h-8 shrink-0 snap-start items-center rounded-full border border-border bg-surface px-3 text-sm font-medium text-fg transition-colors hover:bg-bg-muted"
        >
          {t(`cuisine.${cuisine}`)}
        </Link>
      ))}
    </div>
  );
}
