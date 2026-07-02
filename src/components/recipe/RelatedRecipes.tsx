import { useTranslations } from 'next-intl';

import { RecipeCard } from '@/components/recipe/RecipeCard';
import type { Locale } from '@/schemas/recipe';
import type { Recipe } from '@/types';

export function RelatedRecipes({
  recipes,
  locale,
}: {
  recipes: Recipe[];
  locale: Locale;
}) {
  const t = useTranslations('recipe');

  if (recipes.length === 0) return null;

  return (
    <section aria-labelledby="related-heading" className="mt-12">
      <h2 id="related-heading" className="font-display text-2xl font-semibold text-fg">
        {t('relatedTitle')}
      </h2>
      <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {recipes.map((recipe) => (
          <RecipeCard key={recipe.slug} recipe={recipe} locale={locale} />
        ))}
      </div>
    </section>
  );
}
