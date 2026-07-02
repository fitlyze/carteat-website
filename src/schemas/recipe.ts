import { z } from 'zod';

/**
 * Recipe frontmatter schema (plan §4). Single source of truth for content
 * validation (Velite at build), TypeScript types (`z.infer`), and discovery
 * facets. Adding an enum value here makes it a filter facet + needs an i18n
 * label (see src/schemas/CLAUDE.md).
 */

export const cuisines = [
  'thai',
  'italian',
  'mexican',
  'indian',
  'japanese',
  'mediterranean',
  'american',
  'chinese',
  'french',
  'middle-eastern',
  'korean',
  'vietnamese',
  'greek',
  'spanish',
] as const;

export const diets = [
  'vegetarian',
  'vegan',
  'gluten-free',
  'dairy-free',
  'keto',
  'paleo',
  'low-carb',
  'high-protein',
  'nut-free',
  'pescatarian',
] as const;

export const mealTypes = [
  'breakfast',
  'lunch',
  'dinner',
  'snack',
  'dessert',
  'appetizer',
  'side',
  'drink',
] as const;

export const difficulties = ['easy', 'medium', 'hard'] as const;

export const locales = ['en', 'es'] as const;

export const cuisineSchema = z.enum(cuisines);
export const dietSchema = z.enum(diets);
export const mealTypeSchema = z.enum(mealTypes);
export const difficultySchema = z.enum(difficulties);
export const localeSchema = z.enum(locales);

const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be ISO format YYYY-MM-DD');

export const nutritionSchema = z.object({
  protein: z.number().int().nonnegative(),
  carbs: z.number().int().nonnegative(),
  fat: z.number().int().nonnegative(),
  fiber: z.number().int().nonnegative(),
  sugar: z.number().int().nonnegative(),
  sodium: z.number().int().nonnegative(),
});

export const ingredientSchema = z.object({
  item: z.string().min(1),
  qty: z.number().positive(),
  unit: z.string(), // may be empty string for countable items (e.g. "2 eggs")
});

/** Frontmatter authored in each MDX file. */
export const recipeFrontmatterSchema = z.object({
  title: z.string().min(1),
  slug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'slug must be kebab-case'),
  locale: localeSchema,
  cuisine: cuisineSchema,
  mealType: z.array(mealTypeSchema).min(1),
  diet: z.array(dietSchema),
  difficulty: difficultySchema,
  prepMinutes: z.number().int().nonnegative(),
  cookMinutes: z.number().int().nonnegative(),
  servings: z.number().int().positive(),
  calories: z.number().int().nonnegative(),
  nutrition: nutritionSchema,
  ingredients: z.array(ingredientSchema).min(1),
  steps: z.array(z.string().min(1)).min(1),
  heroImage: z.string().startsWith('/images/'),
  alt: z.string().min(1), // required for a11y + SEO (design §7)
  tags: z.array(z.string()).default([]),
  author: z.string().min(1),
  publishedAt: isoDate,
  updatedAt: isoDate,
  featured: z.boolean().default(false),
});

export type RecipeFrontmatter = z.infer<typeof recipeFrontmatterSchema>;
export type Nutrition = z.infer<typeof nutritionSchema>;
export type Ingredient = z.infer<typeof ingredientSchema>;
export type Cuisine = z.infer<typeof cuisineSchema>;
export type Diet = z.infer<typeof dietSchema>;
export type MealType = z.infer<typeof mealTypeSchema>;
export type Difficulty = z.infer<typeof difficultySchema>;
export type Locale = z.infer<typeof localeSchema>;
