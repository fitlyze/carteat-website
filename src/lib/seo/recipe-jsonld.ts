import type { Locale } from '@/schemas/recipe';
import type { Recipe } from '@/types';

export interface RecipeJsonLdOptions {
  baseUrl: string;
  locale: Locale;
}

/** ISO 8601 duration from minutes, e.g. 90 → "PT1H30M", 45 → "PT45M". */
export function minutesToISODuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `PT${h > 0 ? `${h}H` : ''}${m > 0 || h === 0 ? `${m}M` : ''}`;
}

function localePrefix(locale: Locale): string {
  return locale === 'en' ? '' : `/${locale}`;
}

/** schema.org/Recipe JSON-LD (plan §9). */
export function buildRecipeJsonLd(
  recipe: Recipe,
  { baseUrl, locale }: RecipeJsonLdOptions,
): Record<string, unknown> {
  const url = `${baseUrl}${localePrefix(locale)}/recipes/${recipe.slug}`;

  const jsonLd: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Recipe',
    name: recipe.title,
    image: [`${baseUrl}${recipe.heroImage}`],
    description: recipe.alt,
    author: { '@type': 'Person', name: recipe.author },
    datePublished: recipe.publishedAt,
    dateModified: recipe.updatedAt,
    inLanguage: locale,
    url,
    prepTime: minutesToISODuration(recipe.prepMinutes),
    cookTime: minutesToISODuration(recipe.cookMinutes),
    totalTime: minutesToISODuration(recipe.totalMinutes),
    recipeYield: `${recipe.servings}`,
    recipeCuisine: recipe.cuisine,
    recipeCategory: recipe.mealType,
    keywords: recipe.tags.join(', '),
    recipeIngredient: recipe.ingredients.map((i) =>
      [i.qty, i.unit, i.item].filter(Boolean).join(' '),
    ),
    recipeInstructions: recipe.steps.map((text, i) => ({
      '@type': 'HowToStep',
      position: i + 1,
      text,
    })),
    nutrition: {
      '@type': 'NutritionInformation',
      calories: `${recipe.calories} calories`,
      proteinContent: `${recipe.nutrition.protein} g`,
      carbohydrateContent: `${recipe.nutrition.carbs} g`,
      fatContent: `${recipe.nutrition.fat} g`,
      fiberContent: `${recipe.nutrition.fiber} g`,
      sugarContent: `${recipe.nutrition.sugar} g`,
      sodiumContent: `${recipe.nutrition.sodium} mg`,
    },
  };

  const diets = recipe.diet
    .map((d) => SCHEMA_DIET[d])
    .filter((d): d is string => Boolean(d));
  if (diets.length > 0) {
    jsonLd.suitableForDiet = diets.map((d) => `https://schema.org/${d}`);
  }

  return jsonLd;
}

// Our diet enum → schema.org RestrictedDiet values (only those that exist).
const SCHEMA_DIET: Record<string, string | undefined> = {
  vegan: 'VeganDiet',
  vegetarian: 'VegetarianDiet',
  'gluten-free': 'GlutenFreeDiet',
  'low-carb': 'LowCarbDiet',
};
