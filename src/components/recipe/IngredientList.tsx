'use client';

import * as Checkbox from '@radix-ui/react-checkbox';
import { Check, Minus, Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils/cn';
import { formatNumber } from '@/lib/utils/format';
import { scaleIngredients, servingRatio } from '@/lib/utils/scale-ingredients';
import type { Ingredient, Locale } from '@/schemas/recipe';

export function IngredientList({
  ingredients,
  baseServings,
  locale,
  className,
}: {
  ingredients: Ingredient[];
  baseServings: number;
  locale: Locale;
  className?: string;
}) {
  const t = useTranslations('recipe');
  const [servings, setServings] = useState(baseServings);
  const [checked, setChecked] = useState<Set<number>>(new Set());

  const scaled = scaleIngredients(ingredients, servingRatio(servings, baseServings));

  function toggle(i: number) {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  }

  return (
    <div className={className}>
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-semibold text-fg">{t('ingredients')}</h2>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            iconOnly
            size="sm"
            aria-label={t('decreaseServings')}
            onClick={() => setServings((s) => Math.max(1, s - 1))}
            disabled={servings <= 1}
          >
            <Minus aria-hidden className="size-4" />
          </Button>
          <span
            className="min-w-8 text-center text-base font-medium text-fg tabular-nums"
            aria-live="polite"
          >
            {formatNumber(servings, locale)}
          </span>
          <Button
            variant="ghost"
            iconOnly
            size="sm"
            aria-label={t('increaseServings')}
            onClick={() => setServings((s) => s + 1)}
          >
            <Plus aria-hidden className="size-4" />
          </Button>
        </div>
      </div>

      <ul className="mt-4 space-y-1">
        {scaled.map((ingredient, i) => {
          const isChecked = checked.has(i);
          return (
            <li key={`${ingredient.item}-${i}`}>
              <label className="flex cursor-pointer items-center gap-3 rounded-md py-1.5">
                <Checkbox.Root
                  checked={isChecked}
                  onCheckedChange={() => toggle(i)}
                  className="flex size-5 shrink-0 items-center justify-center rounded-sm border border-border-strong bg-surface data-[state=checked]:border-primary data-[state=checked]:bg-primary"
                >
                  <Checkbox.Indicator>
                    <Check aria-hidden className="size-3.5 text-primary-fg" />
                  </Checkbox.Indicator>
                </Checkbox.Root>
                <span
                  className={cn(
                    'text-base text-fg',
                    isChecked && 'text-fg-subtle line-through',
                  )}
                >
                  <span className="font-medium tabular-nums">
                    {formatNumber(ingredient.qty, locale)}
                  </span>{' '}
                  {ingredient.unit && <span>{ingredient.unit} </span>}
                  {ingredient.item}
                </span>
              </label>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
