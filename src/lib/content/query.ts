import type { Cuisine, Diet, Difficulty, Locale, MealType } from '@/schemas/recipe';
import type { Recipe } from '#velite';

/**
 * Pure content query logic — operates on a passed-in recipe array so it is fully
 * unit-testable without importing the Velite-generated data (which uses runtime
 * import attributes). `src/lib/content/index.ts` binds these to the real data.
 */

export type SortKey = 'newest' | 'quickest' | 'rating';

export interface RecipeFilters {
  cuisine?: Cuisine[];
  diet?: Diet[];
  mealType?: MealType[];
  difficulty?: Difficulty[];
  tags?: string[];
  maxMinutes?: number;
}

/** Aggregate rating per recipe slug, used to sort by "highest rated". */
export type RatingMap = Record<string, number>;

export interface ResolvedRecipe {
  recipe: Recipe;
  /** True when the requested locale had no translation and we fell back. */
  isFallback: boolean;
}

export function recipesForLocale(recipes: Recipe[], locale: Locale): Recipe[] {
  return recipes.filter((r) => r.locale === locale);
}

export function matchesFilters(recipe: Recipe, filters: RecipeFilters): boolean {
  const { cuisine, diet, mealType, difficulty, tags, maxMinutes } = filters;

  // cuisine / difficulty: OR within the facet.
  if (cuisine?.length && !cuisine.includes(recipe.cuisine)) return false;
  if (difficulty?.length && !difficulty.includes(recipe.difficulty)) return false;

  // mealType: recipe matches if it shares at least one selected meal type.
  if (mealType?.length && !mealType.some((m) => recipe.mealType.includes(m)))
    return false;

  // diet: AND — recipe must satisfy every selected diet.
  if (diet?.length && !diet.every((d) => recipe.diet.includes(d))) return false;

  // tags: OR — recipe matches if it shares at least one selected tag.
  if (tags?.length && !tags.some((t) => recipe.tags.includes(t))) return false;

  if (typeof maxMinutes === 'number' && recipe.totalMinutes > maxMinutes) return false;

  return true;
}

export function filterRecipes(recipes: Recipe[], filters: RecipeFilters): Recipe[] {
  return recipes.filter((r) => matchesFilters(r, filters));
}

export function sortRecipes(
  recipes: Recipe[],
  sort: SortKey,
  ratings?: RatingMap,
): Recipe[] {
  const copy = [...recipes];
  switch (sort) {
    case 'quickest':
      return copy.sort((a, b) => a.totalMinutes - b.totalMinutes);
    case 'rating':
      return copy.sort((a, b) => {
        const ra = ratings?.[a.slug] ?? 0;
        const rb = ratings?.[b.slug] ?? 0;
        if (rb !== ra) return rb - ra;
        return dateDesc(a, b);
      });
    case 'newest':
    default:
      return copy.sort(dateDesc);
  }
}

function dateDesc(a: Recipe, b: Recipe): number {
  return b.publishedAt.localeCompare(a.publishedAt);
}

/**
 * Resolve a recipe by slug + locale with the locked fallback rule (plan §8):
 * a missing non-default translation falls back to the default-locale body.
 */
export function resolveRecipe(
  recipes: Recipe[],
  slug: string,
  locale: Locale,
  defaultLocale: Locale,
): ResolvedRecipe | null {
  const exact = recipes.find((r) => r.slug === slug && r.locale === locale);
  if (exact) return { recipe: exact, isFallback: false };

  if (locale !== defaultLocale) {
    const fallback = recipes.find((r) => r.slug === slug && r.locale === defaultLocale);
    if (fallback) return { recipe: fallback, isFallback: true };
  }
  return null;
}

export function relatedRecipes(recipes: Recipe[], recipe: Recipe, limit = 4): Recipe[] {
  return recipesForLocale(recipes, recipe.locale)
    .filter((r) => r.slug !== recipe.slug)
    .map((r) => ({ r, score: relatedScore(recipe, r) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score || dateDesc(a.r, b.r))
    .slice(0, limit)
    .map(({ r }) => r);
}

function relatedScore(base: Recipe, other: Recipe): number {
  let score = 0;
  if (other.cuisine === base.cuisine) score += 3;
  score += other.diet.filter((d) => base.diet.includes(d)).length;
  score += other.tags.filter((t) => base.tags.includes(t)).length;
  return score;
}

/**
 * Pick the recipes that fill the home featured slider. Input is expected to be
 * locale-scoped and newest-first (order is preserved). Featured recipes come
 * first; if fewer than two exist, the rail is padded with the latest
 * non-featured recipes so the slider never shows a single lonely slide. Pure —
 * never mutates the input.
 */
export function selectFeaturedSlides(recipes: Recipe[], cap = 5): Recipe[] {
  const slides = recipes.filter((r) => r.featured);
  if (slides.length < 2) {
    for (const r of recipes) {
      if (slides.length >= 2) break;
      if (!slides.some((s) => s.slug === r.slug)) slides.push(r);
    }
  }
  return slides.slice(0, cap);
}

export interface CuisineCount {
  cuisine: Cuisine;
  count: number;
}

export function cuisineCounts(recipes: Recipe[], locale: Locale): CuisineCount[] {
  const counts = new Map<Cuisine, number>();
  for (const r of recipesForLocale(recipes, locale)) {
    counts.set(r.cuisine, (counts.get(r.cuisine) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([cuisine, count]) => ({ cuisine, count }))
    .sort((a, b) => b.count - a.count || a.cuisine.localeCompare(b.cuisine));
}
