import { describe, expect, it } from 'vitest';

import { roundQty, scaleIngredients, servingRatio } from '@/lib/utils/scale-ingredients';
import type { Ingredient } from '@/schemas/recipe';

describe('roundQty', () => {
  it('rounds large amounts to whole numbers', () => {
    expect(roundQty(750)).toBe(750);
    expect(roundQty(200.4)).toBe(200);
    expect(roundQty(12.6)).toBe(13);
  });

  it('rounds small amounts to the nearest quarter', () => {
    expect(roundQty(1.5)).toBe(1.5);
    expect(roundQty(0.74)).toBe(0.75);
    expect(roundQty(0.1)).toBe(0);
    expect(roundQty(4.6)).toBe(4.5);
  });

  it('handles non-positive / non-finite input', () => {
    expect(roundQty(0)).toBe(0);
    expect(roundQty(-5)).toBe(0);
    expect(roundQty(Number.NaN)).toBe(0);
  });
});

describe('servingRatio', () => {
  it('computes target/base', () => {
    expect(servingRatio(8, 4)).toBe(2);
    expect(servingRatio(2, 4)).toBe(0.5);
  });
  it('guards a zero base', () => {
    expect(servingRatio(4, 0)).toBe(1);
  });
});

describe('scaleIngredients', () => {
  const base: Ingredient[] = [
    { item: 'coconut milk', qty: 400, unit: 'ml' },
    { item: 'curry paste', qty: 3, unit: 'tbsp' },
  ];

  it('scales down by 0.5x', () => {
    const out = scaleIngredients(base, 0.5);
    expect(out).toEqual([
      { item: 'coconut milk', qty: 200, unit: 'ml' },
      { item: 'curry paste', qty: 1.5, unit: 'tbsp' },
    ]);
  });

  it('scales up by 3x', () => {
    const out = scaleIngredients(base, 3);
    expect(out[0]!.qty).toBe(1200);
    expect(out[1]!.qty).toBe(9);
  });

  it('does not mutate the input', () => {
    const snapshot = structuredClone(base);
    scaleIngredients(base, 2);
    expect(base).toEqual(snapshot);
  });
});
