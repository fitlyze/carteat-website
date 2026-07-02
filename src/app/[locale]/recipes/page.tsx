import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Suspense } from 'react';

import { ActiveFilters } from '@/components/discovery/ActiveFilters';
import { FilterPanel, type FilterFacets } from '@/components/discovery/FilterPanel';
import { FilterSheet } from '@/components/discovery/FilterSheet';
import { LoadMore } from '@/components/discovery/LoadMore';
import { SortSelect } from '@/components/discovery/SortSelect';
import { RecipeCard } from '@/components/recipe/RecipeCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { listRecipes, type SortKey } from '@/lib/content';
import { buildMetadata } from '@/lib/seo/metadata';
import {
  cuisines,
  diets,
  difficulties,
  mealTypes,
  type Cuisine,
  type Diet,
  type Difficulty,
  type Locale,
  type MealType,
} from '@/schemas/recipe';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'nav' });
  return buildMetadata({
    title: t('recipes'),
    description: t('recipes'),
    locale: locale as Locale,
    path: '/recipes',
  });
}

type SP = Record<string, string | string[] | undefined>;

function csv(sp: SP, key: string): string[] {
  const v = sp[key];
  return typeof v === 'string' && v ? v.split(',').filter(Boolean) : [];
}

export default async function RecipesPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<SP>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const l = locale as Locale;
  const sp = await searchParams;
  const t = await getTranslations();

  const cuisine = csv(sp, 'cuisine').filter((v): v is Cuisine =>
    (cuisines as readonly string[]).includes(v),
  );
  const diet = csv(sp, 'diet').filter((v): v is Diet =>
    (diets as readonly string[]).includes(v),
  );
  const mealType = csv(sp, 'mealType').filter((v): v is MealType =>
    (mealTypes as readonly string[]).includes(v),
  );
  const difficulty = csv(sp, 'difficulty').filter((v): v is Difficulty =>
    (difficulties as readonly string[]).includes(v),
  );
  const tags = csv(sp, 'tags');
  const maxMinutes = typeof sp.maxTime === 'string' ? Number(sp.maxTime) : undefined;
  const sortRaw = typeof sp.sort === 'string' ? sp.sort : 'newest';
  const sort = (
    ['newest', 'quickest', 'rating'].includes(sortRaw) ? sortRaw : 'newest'
  ) as SortKey;

  const recipes = listRecipes({
    locale: l,
    filters: { cuisine, diet, mealType, difficulty, tags, maxMinutes },
    sort,
  });

  // Only render the first N cards on the server; "Load more" reveals the rest
  // via the `page` URL param. Keeps the initial paint fast even with a large
  // catalog (otherwise every card + image renders at once).
  const PAGE_SIZE = 24;
  const page = Math.max(1, Number(sp.page) || 1);
  const shown = recipes.slice(0, page * PAGE_SIZE);
  const hasMore = shown.length < recipes.length;

  const all = listRecipes({ locale: l });
  const present = <T,>(arr: readonly T[], values: T[]) =>
    arr.filter((v) => values.includes(v));
  const facets: FilterFacets = {
    cuisine: present(
      cuisines,
      all.map((r) => r.cuisine),
    ),
    diet: present(
      diets,
      all.flatMap((r) => r.diet),
    ),
    mealType: present(
      mealTypes,
      all.flatMap((r) => r.mealType),
    ),
    difficulty: present(
      difficulties,
      all.map((r) => r.difficulty),
    ),
    tags: [...new Set(all.flatMap((r) => r.tags))],
    maxTimeBound: Math.max(
      60,
      Math.ceil(Math.max(...all.map((r) => r.totalMinutes)) / 5) * 5,
    ),
  };

  return (
    <div className="container-page py-10">
      <h1 className="font-display text-4xl font-semibold text-fg">{t('nav.recipes')}</h1>
      <p className="mt-2 text-fg-muted">
        {t('filters.resultCount', { count: recipes.length })}
        {hasMore ? ` · ${t('filters.showing', { shown: shown.length, total: recipes.length })}` : ''}
      </p>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
        <Suspense fallback={null}>
          <ActiveFilters />
        </Suspense>
        <div className="flex items-center gap-3">
          <div className="lg:hidden">
            <Suspense fallback={null}>
              <FilterSheet facets={facets} />
            </Suspense>
          </div>
          <Suspense fallback={null}>
            <SortSelect />
          </Suspense>
        </div>
      </div>

      <div className="mt-6 grid gap-8 lg:grid-cols-[260px_1fr]">
        <aside className="hidden lg:block">
          <Suspense fallback={null}>
            <FilterPanel facets={facets} />
          </Suspense>
        </aside>

        <div>
          {recipes.length === 0 ? (
            <EmptyState
              title={t('states.noRecipesTitle')}
              description={t('states.noRecipesBody')}
            />
          ) : (
            <>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {shown.map((recipe) => (
                  <RecipeCard key={recipe.slug} recipe={recipe} locale={l} />
                ))}
              </div>
              {hasMore && (
                <div className="mt-10 flex justify-center">
                  <LoadMore page={page} />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
