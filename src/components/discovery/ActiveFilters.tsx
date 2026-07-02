'use client';

import { useTranslations } from 'next-intl';

import { Chip } from '@/components/ui/Chip';

import { FACET_KEYS, useRecipeFilters } from './use-recipe-filters';

const NS: Record<string, string | null> = {
  cuisine: 'cuisine',
  diet: 'diet',
  mealType: 'mealType',
  difficulty: 'difficulty',
  tags: null,
};

export function ActiveFilters() {
  const t = useTranslations();
  const { getList, toggle, maxTime, setParam } = useRecipeFilters();

  const active = FACET_KEYS.flatMap((key) =>
    getList(key).map((value) => ({ key, value })),
  );

  if (active.length === 0 && !maxTime) return null;

  return (
    <ul className="flex flex-wrap gap-2">
      {active.map(({ key, value }) => {
        const ns = NS[key];
        const label = ns ? t(`${ns}.${value}`) : value;
        return (
          <li key={`${key}-${value}`}>
            <Chip
              selected
              onRemove={() => toggle(key, value)}
              removeLabel={`${t('common.clearFilters')}: ${label}`}
            >
              {label}
            </Chip>
          </li>
        );
      })}
      {maxTime && (
        <li>
          <Chip
            selected
            onRemove={() => setParam('maxTime', null)}
            removeLabel={t('filters.maxTime')}
          >
            ≤ {t('filters.minutes', { minutes: Number(maxTime) })}
          </Chip>
        </li>
      )}
    </ul>
  );
}
