import type { Recipe } from '#velite';

/** Test data factory for recipes (tests/CLAUDE.md — don't hand-roll fixtures). */
export function makeRecipe(overrides: Partial<Recipe> = {}): Recipe {
  const base: Recipe = {
    title: 'Test Recipe',
    slug: 'test-recipe',
    locale: 'en',
    cuisine: 'italian',
    mealType: ['dinner'],
    diet: ['vegetarian'],
    difficulty: 'easy',
    prepMinutes: 10,
    cookMinutes: 20,
    servings: 4,
    calories: 400,
    nutrition: { protein: 20, carbs: 30, fat: 15, fiber: 5, sugar: 6, sodium: 500 },
    ingredients: [{ item: 'flour', qty: 200, unit: 'g' }],
    steps: ['Mix.', 'Bake.'],
    heroImage: '/images/test-recipe.jpg',
    alt: 'A test recipe',
    tags: ['quick'],
    author: 'Tester',
    publishedAt: '2026-01-01',
    updatedAt: '2026-01-01',
    featured: false,
    body: '',
    totalMinutes: 30,
  } as Recipe;

  return { ...base, ...overrides };
}
