import type { Ingredient } from '@/schemas/recipe';

/**
 * Round a scaled quantity to a sensible cooking value: whole numbers for large
 * amounts, nearest quarter (¼, ½, ¾) for small ones. Pure.
 */
export function roundQty(value: number): number {
  if (!Number.isFinite(value) || value <= 0) return 0;
  if (value >= 10) return Math.round(value);
  return Math.round(value * 4) / 4;
}

/** Ratio to scale a recipe from its base servings to a target serving count. */
export function servingRatio(targetServings: number, baseServings: number): number {
  if (baseServings <= 0) return 1;
  return targetServings / baseServings;
}

/**
 * Scale a list of ingredients by a ratio. Pure — never mutates the input array
 * or its items; returns fresh objects with sensibly rounded quantities.
 */
export function scaleIngredients(
  base: readonly Ingredient[],
  ratio: number,
): Ingredient[] {
  return base.map((ingredient) => ({
    ...ingredient,
    qty: roundQty(ingredient.qty * ratio),
  }));
}
