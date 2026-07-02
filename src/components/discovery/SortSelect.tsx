'use client';

import { useTranslations } from 'next-intl';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select';

import { useRecipeFilters } from './use-recipe-filters';

const OPTIONS = ['newest', 'quickest', 'rating'] as const;

export function SortSelect() {
  const t = useTranslations('sort');
  const { sort, setParam } = useRecipeFilters();

  return (
    <Select
      value={sort}
      onValueChange={(v) => setParam('sort', v === 'newest' ? null : v)}
    >
      <SelectTrigger aria-label={t('label')} className="w-48">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {OPTIONS.map((opt) => (
          <SelectItem key={opt} value={opt}>
            {t(opt)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
