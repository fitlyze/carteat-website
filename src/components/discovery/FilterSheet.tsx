'use client';

import { SlidersHorizontal } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { Button } from '@/components/ui/Button';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/Dialog';

import { FilterPanel, type FilterFacets } from './FilterPanel';
import { useRecipeFilters } from './use-recipe-filters';

/** Mobile filter affordance: a button that opens FilterPanel in a bottom sheet. */
export function FilterSheet({ facets }: { facets: FilterFacets }) {
  const t = useTranslations();
  const [open, setOpen] = useState(false);
  const { clearAll } = useRecipeFilters();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="md">
          <SlidersHorizontal aria-hidden className="size-4" />
          {t('filters.title')}
        </Button>
      </DialogTrigger>
      <DialogContent sheet>
        <DialogTitle className="font-display text-xl font-semibold">
          {t('filters.title')}
        </DialogTitle>
        <div className="mt-4 max-h-[60vh] overflow-y-auto">
          <FilterPanel facets={facets} />
        </div>
        <div className="mt-4 flex items-center justify-between gap-3 border-t border-border pt-4">
          <Button
            variant="ghost"
            onClick={() => {
              clearAll();
            }}
          >
            {t('common.clearAll')}
          </Button>
          <Button variant="primary" onClick={() => setOpen(false)}>
            {t('common.apply')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
