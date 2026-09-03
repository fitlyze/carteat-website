import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import Image from 'next/image';
import { notFound } from 'next/navigation';

import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { RecipeCard } from '@/components/recipe/RecipeCard';
import { JsonLd } from '@/components/seo/JsonLd';
import { EmptyState } from '@/components/ui/EmptyState';
import { getRecipesByCuisine, listCuisines } from '@/lib/content';
import { buildBreadcrumbJsonLd } from '@/lib/seo/breadcrumbs-jsonld';
import { absoluteUrl, buildMetadata } from '@/lib/seo/metadata';
import { cuisineSchema, locales, type Locale } from '@/schemas/recipe';

// Only known cuisine×locale combos render; anything else is a real 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return locales.flatMap((locale) =>
    listCuisines(locale).map(({ cuisine }) => ({ locale, cuisine })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; cuisine: string }>;
}): Promise<Metadata> {
  const { locale, cuisine } = await params;
  const parsed = cuisineSchema.safeParse(cuisine);
  if (!parsed.success) return {};
  const t = await getTranslations({ locale });
  const name = t(`cuisine.${parsed.data}`);
  const available = locales.filter((l) =>
    listCuisines(l).some((c) => c.cuisine === parsed.data),
  );
  return buildMetadata({
    title: name,
    description: t('home.subtitle'),
    locale: locale as Locale,
    path: `/cuisines/${parsed.data}`,
    availableLocales: available,
  });
}

export default async function CuisinePage({
  params,
}: {
  params: Promise<{ locale: string; cuisine: string }>;
}) {
  const { locale, cuisine } = await params;
  setRequestLocale(locale);
  const l = locale as Locale;

  const parsed = cuisineSchema.safeParse(cuisine);
  if (!parsed.success) notFound();

  const t = await getTranslations();
  const recipes = getRecipesByCuisine(parsed.data, l);
  const name = t(`cuisine.${parsed.data}`);
  const band = recipes[0]?.heroImage;

  return (
    <div className="pb-16">
      <section className="relative h-48 w-full overflow-hidden bg-bg-muted">
        {band && <Image src={band} alt="" fill sizes="100vw" className="object-cover" />}
        <div className="absolute inset-0 bg-gradient-to-t from-[rgb(20_18_16_/_0.6)] to-transparent" />
        <div className="container-page absolute inset-x-0 bottom-0 pb-6">
          <h1 className="font-display text-4xl font-semibold text-[var(--neutral-0)] drop-shadow">
            {name}
          </h1>
        </div>
      </section>

      <div className="container-page pt-6">
        <JsonLd
          data={buildBreadcrumbJsonLd([
            { name: t('breadcrumb.home'), url: absoluteUrl(l, '/') },
            { name, url: absoluteUrl(l, `/cuisines/${parsed.data}`) },
          ])}
        />
        <Breadcrumbs
          label={t('breadcrumb.label')}
          items={[{ label: t('breadcrumb.home'), href: '/' }, { label: name }]}
        />

        {recipes.length === 0 ? (
          <EmptyState
            title={t('states.noRecipesTitle')}
            description={t('states.noRecipesBody')}
          />
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {recipes.map((recipe) => (
              <RecipeCard key={recipe.slug} recipe={recipe} locale={l} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
