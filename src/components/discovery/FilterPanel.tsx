'use client';

import * as Slider from '@radix-ui/react-slider';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';

import { useRecipeFilters, type FacetKey } from './use-recipe-filters';

export interface FilterFacets {
  cuisine: string[];
  diet: string[];
  mealType: string[];
  difficulty: string[];
  tags: string[];
  maxTimeBound: number;
}

const LABELLED: { key: FacetKey; ns: string }[] = [
  { key: 'cuisine', ns: 'cuisine' },
  { key: 'diet', ns: 'diet' },
  { key: 'mealType', ns: 'mealType' },
  { key: 'difficulty', ns: 'difficulty' },
];

export function FilterPanel({ facets }: { facets: FilterFacets }) {
  const t = useTranslations();
  const { getList, toggle, setParam, maxTime, clearAll } = useRecipeFilters();

  const currentMax = maxTime ? Number(maxTime) : facets.maxTimeBound;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold text-fg">
          {t('filters.title')}
        </h2>
        <Button variant="ghost" size="sm" onClick={clearAll}>
          {t('common.clearAll')}
        </Button>
      </div>

      {LABELLED.map(({ key, ns }) => {
        const values = facets[key];
        if (values.length === 0) return null;
        const selected = getList(key);
        return (
          <fieldset key={key}>
            <legend className="mb-2 text-sm font-medium text-fg">
              {t(`filters.${key}`)}
            </legend>
            <div className="flex flex-wrap gap-2">
              {values.map((value) => (
                <Chip
                  key={value}
                  selected={selected.includes(value)}
                  onClick={() => toggle(key, value)}
                >
                  {t(`${ns}.${value}`)}
                </Chip>
              ))}
            </div>
          </fieldset>
        );
      })}

      {facets.tags.length > 0 && (
        <fieldset>
          <legend className="mb-2 text-sm font-medium text-fg">
            {t('filters.tags')}
          </legend>
          <div className="flex flex-wrap gap-2">
            {facets.tags.map((tag) => (
              <Chip
                key={tag}
                selected={getList('tags').includes(tag)}
                onClick={() => toggle('tags', tag)}
              >
                {tag}
              </Chip>
            ))}
          </div>
        </fieldset>
      )}

      <fieldset>
        <legend className="mb-2 text-sm font-medium text-fg">
          {t('filters.maxTime')}
        </legend>
        <Slider.Root
          className="relative flex h-5 w-full touch-none items-center"
          min={0}
          max={facets.maxTimeBound}
          step={5}
          value={[currentMax]}
          onValueChange={([v]) =>
            setParam('maxTime', v === facets.maxTimeBound ? null : String(v))
          }
          aria-label={t('filters.maxTime')}
        >
          <Slider.Track className="relative h-1.5 grow rounded-full bg-bg-muted">
            <Slider.Range className="absolute h-full rounded-full bg-primary" />
          </Slider.Track>
          <Slider.Thumb
            aria-label={t('filters.maxTime')}
            className="block size-5 rounded-full border-2 border-primary bg-surface shadow-sm focus:outline-none focus-visible:shadow-[var(--shadow-focus)]"
          />
        </Slider.Root>
        <p className="mt-2 text-sm text-fg-muted">
          {t('filters.minutes', { minutes: currentMax })}
        </p>
      </fieldset>
    </div>
  );
}
