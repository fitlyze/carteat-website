import { useTranslations } from 'next-intl';

import { Card } from '@/components/ui/Card';
import { formatNumber, formatNutrition } from '@/lib/utils/format';
import type { Locale } from '@/schemas/recipe';
import type { Nutrition } from '@/types';

/**
 * Per-serving nutrition (design §9.7). Nutrition is per serving by definition,
 * so it is invariant to the serving stepper (which scales ingredients, E5-S3).
 */
export function NutritionTable({
  nutrition,
  calories,
  locale,
}: {
  nutrition: Nutrition;
  calories: number;
  locale: Locale;
}) {
  const t = useTranslations('recipe');

  const macros: { key: keyof Nutrition; unit: 'g' | 'mg' }[] = [
    { key: 'protein', unit: 'g' },
    { key: 'carbs', unit: 'g' },
    { key: 'fat', unit: 'g' },
    { key: 'fiber', unit: 'g' },
    { key: 'sugar', unit: 'g' },
    { key: 'sodium', unit: 'mg' },
  ];

  return (
    <Card className="p-5">
      <h2 className="font-display text-xl font-semibold text-fg">
        {t('nutritionPerServing')}
      </h2>

      <div className="mt-4 inline-flex flex-col border-b-2 border-accent pb-1">
        <span className="text-3xl font-semibold text-fg tabular-nums">
          {formatNumber(calories, locale)}
        </span>
        <span className="text-xs font-medium tracking-wide text-fg-muted uppercase">
          {t('calories')}
        </span>
      </div>

      <dl className="mt-5 grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3">
        {macros.map(({ key, unit }) => (
          <div key={key} className="flex flex-col">
            <dt className="text-sm text-fg-muted">{t(key)}</dt>
            <dd className="text-lg font-medium text-fg tabular-nums">
              {formatNutrition(nutrition[key], unit, locale)}
            </dd>
          </div>
        ))}
      </dl>

      <p className="mt-4 text-xs text-fg-subtle">{t('estimates')}</p>
    </Card>
  );
}
