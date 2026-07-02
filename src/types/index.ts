// Shared types. The `Recipe` shape is the Velite-emitted object (frontmatter +
// compiled body + computed fields); enum/value types come from the Zod schema.
export type { Recipe } from '#velite';
export type {
  Cuisine,
  Diet,
  Difficulty,
  Ingredient,
  Locale,
  MealType,
  Nutrition,
  RecipeFrontmatter,
} from '@/schemas/recipe';
