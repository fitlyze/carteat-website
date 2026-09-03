import { describe, expect, it } from 'vitest';

import {
  cuisineCounts,
  filterRecipes,
  matchesFilters,
  relatedRecipes,
  resolveRecipe,
  sortRecipes,
} from '@/lib/content/query';

import { makeRecipe } from '../factories';

const thai = makeRecipe({
  slug: 'thai-green-curry',
  cuisine: 'thai',
  diet: ['gluten-free', 'dairy-free'],
  mealType: ['dinner', 'lunch'],
  difficulty: 'medium',
  tags: ['spicy', 'high-protein'],
  totalMinutes: 50,
  publishedAt: '2026-06-19',
});
const thaiEs = makeRecipe({ slug: 'thai-green-curry', locale: 'es', totalMinutes: 50 });
const salad = makeRecipe({
  slug: 'greek-quinoa-salad',
  cuisine: 'greek',
  diet: ['vegetarian', 'gluten-free'],
  mealType: ['lunch', 'side'],
  difficulty: 'easy',
  tags: ['quick'],
  totalMinutes: 15,
  publishedAt: '2026-06-05',
});
const tacos = makeRecipe({
  slug: 'chicken-tinga-tacos',
  cuisine: 'mexican',
  diet: ['gluten-free', 'dairy-free', 'high-protein'],
  mealType: ['dinner'],
  difficulty: 'medium',
  tags: ['high-protein', 'spicy'],
  totalMinutes: 45,
  publishedAt: '2026-06-10',
});

const all = [thai, thaiEs, salad, tacos];

describe('matchesFilters', () => {
  it('cuisine is OR', () => {
    expect(matchesFilters(thai, { cuisine: ['thai', 'greek'] })).toBe(true);
    expect(matchesFilters(thai, { cuisine: ['mexican'] })).toBe(false);
  });
  it('diet is AND (all selected must be present)', () => {
    expect(matchesFilters(thai, { diet: ['gluten-free', 'dairy-free'] })).toBe(true);
    expect(matchesFilters(salad, { diet: ['gluten-free', 'dairy-free'] })).toBe(false);
  });
  it('mealType is OR (intersection)', () => {
    expect(matchesFilters(salad, { mealType: ['breakfast', 'lunch'] })).toBe(true);
    expect(matchesFilters(tacos, { mealType: ['breakfast'] })).toBe(false);
  });
  it('maxMinutes filters by total time', () => {
    expect(matchesFilters(salad, { maxMinutes: 30 })).toBe(true);
    expect(matchesFilters(thai, { maxMinutes: 30 })).toBe(false);
  });
});

describe('filterRecipes', () => {
  it('combines facets with AND across facets', () => {
    const out = filterRecipes(all, { difficulty: ['medium'], tags: ['spicy'] });
    expect(out.map((r) => r.slug)).toEqual(['thai-green-curry', 'chicken-tinga-tacos']);
  });
});

describe('sortRecipes', () => {
  it('sorts newest first', () => {
    const out = sortRecipes([salad, thai, tacos], 'newest');
    expect(out.map((r) => r.slug)).toEqual([
      'thai-green-curry',
      'chicken-tinga-tacos',
      'greek-quinoa-salad',
    ]);
  });
  it('sorts quickest first', () => {
    const out = sortRecipes([thai, salad, tacos], 'quickest');
    expect(out.map((r) => r.totalMinutes)).toEqual([15, 45, 50]);
  });
});

describe('resolveRecipe (fallback rule)', () => {
  it('returns exact match when the locale exists', () => {
    const r = resolveRecipe(all, 'thai-green-curry', 'es', 'en');
    expect(r).toEqual({ recipe: thaiEs, isFallback: false });
  });
  it('falls back to default locale when untranslated', () => {
    const r = resolveRecipe(all, 'greek-quinoa-salad', 'es', 'en');
    expect(r?.isFallback).toBe(true);
    expect(r?.recipe.locale).toBe('en');
  });
  it('returns null for unknown slug', () => {
    expect(resolveRecipe(all, 'nope', 'en', 'en')).toBeNull();
  });
});

describe('relatedRecipes', () => {
  it('excludes self and scores by shared cuisine/diet/tags', () => {
    const out = relatedRecipes(all, thai);
    expect(out.map((r) => r.slug)).not.toContain('thai-green-curry');
    // tacos shares diet (gluten-free, dairy-free, high-protein) + tags (spicy, high-protein)
    expect(out[0]!.slug).toBe('chicken-tinga-tacos');
  });
});

describe('cuisineCounts', () => {
  it('counts distinct cuisines for a locale', () => {
    const out = cuisineCounts(all, 'en');
    const map = Object.fromEntries(out.map((c) => [c.cuisine, c.count]));
    expect(map).toEqual({ thai: 1, greek: 1, mexican: 1 });
  });
});
