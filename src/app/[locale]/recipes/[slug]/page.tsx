import { Clock, Flame, Users } from 'lucide-react';
import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import Image from 'next/image';
import { notFound } from 'next/navigation';

import { CommentsSection } from '@/components/engagement/CommentsSection';
import { RatingControl } from '@/components/engagement/RatingControl';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { IngredientList } from '@/components/recipe/IngredientList';
import { MDXBody } from '@/components/recipe/MDXBody';
import { NutritionTable } from '@/components/recipe/NutritionTable';
import { RelatedRecipes } from '@/components/recipe/RelatedRecipes';
import { StepList } from '@/components/recipe/StepList';
import { JsonLd } from '@/components/seo/JsonLd';
import { Badge } from '@/components/ui/Badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { getRecipe, getRecipeLocales, getRecipeParams, getRelated } from '@/lib/content';
import { getRatingSummarySafe } from '@/lib/db/ratings';
import { buildBreadcrumbJsonLd } from '@/lib/seo/breadcrumbs-jsonld';
import { absoluteUrl, buildMetadata, SITE_URL } from '@/lib/seo/metadata';
import { buildRecipeJsonLd } from '@/lib/seo/recipe-jsonld';
import { formatServings, formatTotalTime } from '@/lib/utils/format';
import type { Locale } from '@/schemas/recipe';

// Only known recipe slugs render (incl. fallback locales); unknown → 404.
export const dynamicParams = false;
// ISR: the page shell is static; the rating summary is refreshed hourly so the
// aggregateRating in JSON-LD never goes stale enough to mislead (plan §19).
export const revalidate = 3600;

export function generateStaticParams() {
  return getRecipeParams();
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const resolved = getRecipe(slug, locale as Locale);
  if (!resolved) return {};
  const { recipe } = resolved;
  return buildMetadata({
    title: recipe.title,
    description: recipe.alt,
    locale: locale as Locale,
    path: `/recipes/${slug}`,
    image: `${SITE_URL}${recipe.heroImage}`,
    availableLocales: getRecipeLocales(slug),
  });
}

export default async function RecipePage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const l = locale as Locale;

  const resolved = getRecipe(slug, l);
  if (!resolved) notFound();
  const { recipe, isFallback } = resolved;

  const t = await getTranslations();
  const related = getRelated(recipe);
  const summary = await getRatingSummarySafe(recipe.slug, l);

  const crumbs = [
    { label: t('breadcrumb.home'), href: '/' },
    { label: t('breadcrumb.recipes'), href: '/recipes' },
    { label: recipe.title },
  ];
  const recipeJsonLd = buildRecipeJsonLd(recipe, {
    baseUrl: SITE_URL,
    locale: l,
    rating: summary.count > 0 ? summary : undefined,
  });
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: t('breadcrumb.home'), url: absoluteUrl(l, '/') },
    { name: t('breadcrumb.recipes'), url: absoluteUrl(l, '/recipes') },
    { name: recipe.title, url: absoluteUrl(l, `/recipes/${recipe.slug}`) },
  ]);

  return (
    <article className="container-page py-6 lg:py-10" data-pagefind-body>
      <JsonLd data={[recipeJsonLd, breadcrumbJsonLd]} />
      <Breadcrumbs label={t('breadcrumb.label')} items={crumbs} />

      {isFallback && (
        <div role="note" className="mt-4 rounded-lg border border-border bg-bg-muted p-4">
          <p className="font-medium text-fg">{t('recipe.notTranslatedTitle')}</p>
          <p className="mt-1 text-sm text-fg-muted">{t('recipe.notTranslatedBody')}</p>
        </div>
      )}

      <header className="mt-4">
        <h1 className="font-display text-4xl font-semibold text-fg">{recipe.title}</h1>
        <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-fg-muted">
          <span className="inline-flex items-center gap-1.5">
            <Clock aria-hidden className="size-4" />
            {formatTotalTime(recipe.totalMinutes, l)}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Flame aria-hidden className="size-4" />
            {t(`difficulty.${recipe.difficulty}`)}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Users aria-hidden className="size-4" />
            {formatServings(recipe.servings, l)} {t('recipe.servings')}
          </span>
        </div>
        {recipe.tags.length > 0 && (
          <ul className="mt-3 flex flex-wrap gap-1.5">
            {recipe.tags.map((tag) => (
              <li key={tag}>
                <Badge variant="neutral">{tag}</Badge>
              </li>
            ))}
          </ul>
        )}
        <div className="mt-4">
          <RatingControl
            slug={recipe.slug}
            locale={l}
            initialAvg={summary.avg}
            initialCount={summary.count}
          />
        </div>
      </header>

      <div className="mt-6 overflow-hidden rounded-xl">
        <div className="relative aspect-[4/3] w-full md:aspect-[16/9]">
          <Image
            src={recipe.heroImage}
            alt={recipe.alt}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 1024px"
            className="object-cover"
          />
        </div>
      </div>

      <MDXBody code={recipe.body} />

      {/* Desktop: 2-column with sticky sidebar */}
      <div className="mt-8 hidden gap-12 lg:grid lg:grid-cols-[1fr_320px]">
        <div>
          <StepList steps={recipe.steps} />
        </div>
        <aside className="lg:sticky lg:top-[88px] lg:space-y-8 lg:self-start">
          <IngredientList
            ingredients={recipe.ingredients}
            baseServings={recipe.servings}
            locale={l}
          />
          <NutritionTable
            nutrition={recipe.nutrition}
            calories={recipe.calories}
            locale={l}
          />
        </aside>
      </div>

      {/* Mobile: tabbed */}
      <div className="mt-8 lg:hidden">
        <Tabs defaultValue="ingredients">
          <TabsList>
            <TabsTrigger value="ingredients">{t('recipe.ingredients')}</TabsTrigger>
            <TabsTrigger value="steps">{t('recipe.steps')}</TabsTrigger>
            <TabsTrigger value="nutrition">{t('recipe.nutrition')}</TabsTrigger>
          </TabsList>
          <TabsContent value="ingredients">
            <IngredientList
              ingredients={recipe.ingredients}
              baseServings={recipe.servings}
              locale={l}
            />
          </TabsContent>
          <TabsContent value="steps">
            <StepList steps={recipe.steps} />
          </TabsContent>
          <TabsContent value="nutrition">
            <NutritionTable
              nutrition={recipe.nutrition}
              calories={recipe.calories}
              locale={l}
            />
          </TabsContent>
        </Tabs>
      </div>

      <CommentsSection slug={recipe.slug} locale={l} />

      <RelatedRecipes recipes={related} locale={l} />
    </article>
  );
}
