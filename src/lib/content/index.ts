import { defaultLocale } from '@/i18n/config';
import type { Cuisine, Locale } from '@/schemas/recipe';
import { recipes as allRecipes } from '#velite';
import type { Recipe } from '#velite';

import {
  cuisineCounts,
  filterRecipes,
  recipesForLocale,
  relatedRecipes,
  resolveRecipe,
  selectFeaturedSlides,
  sortRecipes,
  type CuisineCount,
  type RatingMap,
  type RecipeFilters,
  type ResolvedRecipe,
  type SortKey,
} from './query';

export type {
  CuisineCount,
  RatingMap,
  RecipeFilters,
  ResolvedRecipe,
  SortKey,
} from './query';

/** The only module the UI uses to read recipes (never reads MDX at runtime). */

export function getAllRecipes(): Recipe[] {
  return allRecipes;
}

export function getRecipe(slug: string, locale: Locale): ResolvedRecipe | null {
  return resolveRecipe(allRecipes, slug, locale, defaultLocale);
}

export interface ListRecipesOptions {
  locale: Locale;
  filters?: RecipeFilters;
  sort?: SortKey;
  ratings?: RatingMap;
}

export function listRecipes({
  locale,
  filters = {},
  sort = 'newest',
  ratings,
}: ListRecipesOptions): Recipe[] {
  const scoped = recipesForLocale(allRecipes, locale);
  return sortRecipes(filterRecipes(scoped, filters), sort, ratings);
}

export function getRelated(recipe: Recipe, limit = 4): Recipe[] {
  return relatedRecipes(allRecipes, recipe, limit);
}

export { selectFeaturedSlides };

export function listCuisines(locale: Locale): CuisineCount[] {
  return cuisineCounts(allRecipes, locale);
}

export function getRecipesByCuisine(cuisine: Cuisine, locale: Locale): Recipe[] {
  return listRecipes({ locale, filters: { cuisine: [cuisine] } });
}

/** Locales a recipe is actually translated into (for hreflang, plan §8). */
export function getRecipeLocales(slug: string): Locale[] {
  const all: Locale[] = ['en', 'es'];
  return all.filter((locale) =>
    allRecipes.some((r) => r.slug === slug && r.locale === locale),
  );
}

/**
 * Static params for the recipe detail route: every locale × every default-locale
 * slug, so untranslated locales still prerender (with a fallback banner).
 */
export function getRecipeParams(): { locale: Locale; slug: string }[] {
  const defaultSlugs = recipesForLocale(allRecipes, defaultLocale).map((r) => r.slug);
  const locales: Locale[] = ['en', 'es'];
  return locales.flatMap((locale) => defaultSlugs.map((slug) => ({ locale, slug })));
}
