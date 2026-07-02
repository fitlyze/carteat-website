import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { CuisineChips } from '@/components/discovery/CuisineChips';
import { FeaturedSlider } from '@/components/recipe/FeaturedSlider';
import { RecipeRow } from '@/components/recipe/RecipeRow';
import { listCuisines, listRecipes, selectFeaturedSlides } from '@/lib/content';
import { buildMetadata } from '@/lib/seo/metadata';
import type { Locale } from '@/schemas/recipe';

export const revalidate = 3600;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'home' });
  return buildMetadata({
    title: t('title'),
    description: t('subtitle'),
    locale: locale as Locale,
    path: '/',
  });
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const l = locale as Locale;
  const t = await getTranslations();

  const recipes = listRecipes({ locale: l, sort: 'newest' });
  const slides = selectFeaturedSlides(recipes);
  const cuisines = listCuisines(l);
  const latest = recipes.slice(0, 20);
  const quick = listRecipes({
    locale: l,
    filters: { maxMinutes: 30 },
    sort: 'quickest',
  }).slice(0, 20);
  const highProtein = listRecipes({
    locale: l,
    filters: { tags: ['high-protein'] },
  }).slice(0, 20);

  return (
    <div className="pb-16">
      <FeaturedSlider slides={slides} />

      <div className="container-page">
        <section id="cuisines" className="scroll-mt-24 pt-12">
          <h2 className="mb-4 font-display text-2xl font-semibold text-fg">
            {t('home.browseCuisines')}
          </h2>
          <CuisineChips cuisines={cuisines} />
        </section>

        <RecipeRow
          title={t('home.latest')}
          href="/recipes?sort=newest"
          viewAllLabel={t('home.viewAll', { group: t('home.latest') })}
          recipes={latest}
          locale={l}
        />
        <RecipeRow
          title={t('home.quickHealthy')}
          href="/recipes?maxTime=30&sort=quickest"
          viewAllLabel={t('home.viewAll', { group: t('home.quickHealthy') })}
          recipes={quick}
          locale={l}
        />
        <RecipeRow
          title={t('home.highProtein')}
          href="/recipes?tags=high-protein"
          viewAllLabel={t('home.viewAll', { group: t('home.highProtein') })}
          recipes={highProtein}
          locale={l}
        />
      </div>
    </div>
  );
}
