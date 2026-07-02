import { describe, expect, it } from 'vitest';

import { buildBreadcrumbJsonLd } from '@/lib/seo/breadcrumbs-jsonld';
import { buildRecipeJsonLd, minutesToISODuration } from '@/lib/seo/recipe-jsonld';

import { makeRecipe } from '../factories';

const baseUrl = 'https://example.com';

describe('minutesToISODuration', () => {
  it('formats minutes and hours', () => {
    expect(minutesToISODuration(45)).toBe('PT45M');
    expect(minutesToISODuration(90)).toBe('PT1H30M');
    expect(minutesToISODuration(120)).toBe('PT2H');
    expect(minutesToISODuration(0)).toBe('PT0M');
  });
});

describe('buildRecipeJsonLd', () => {
  const recipe = makeRecipe({
    slug: 'thai-green-curry',
    prepMinutes: 10,
    cookMinutes: 20,
    totalMinutes: 30,
    ingredients: [{ item: 'flour', qty: 200, unit: 'g' }],
    steps: ['Mix.', 'Bake.'],
    nutrition: { protein: 20, carbs: 30, fat: 15, fiber: 5, sugar: 6, sodium: 500 },
  });

  it('emits a valid Recipe shape', () => {
    const jsonLd = buildRecipeJsonLd(recipe, { baseUrl, locale: 'en' });
    expect(jsonLd['@type']).toBe('Recipe');
    expect(jsonLd.recipeIngredient).toContain('200 g flour');
    expect(jsonLd.recipeInstructions).toEqual([
      { '@type': 'HowToStep', position: 1, text: 'Mix.' },
      { '@type': 'HowToStep', position: 2, text: 'Bake.' },
    ]);
    expect(jsonLd.prepTime).toBe('PT10M');
    expect(jsonLd.totalTime).toBe('PT30M');
    expect((jsonLd.nutrition as Record<string, string>).proteinContent).toBe('20 g');
    expect(jsonLd.url).toBe('https://example.com/recipes/thai-green-curry');
  });

  it('prefixes the URL for non-default locales', () => {
    const jsonLd = buildRecipeJsonLd(recipe, { baseUrl, locale: 'es' });
    expect(jsonLd.url).toBe('https://example.com/es/recipes/thai-green-curry');
    expect(jsonLd.inLanguage).toBe('es');
  });

  it('omits aggregateRating when there are no ratings', () => {
    expect(buildRecipeJsonLd(recipe, { baseUrl, locale: 'en' })).not.toHaveProperty(
      'aggregateRating',
    );
    expect(
      buildRecipeJsonLd(recipe, { baseUrl, locale: 'en', rating: { avg: 0, count: 0 } }),
    ).not.toHaveProperty('aggregateRating');
  });

  it('includes aggregateRating only when count > 0', () => {
    const jsonLd = buildRecipeJsonLd(recipe, {
      baseUrl,
      locale: 'en',
      rating: { avg: 4.63, count: 12 },
    });
    expect(jsonLd.aggregateRating).toEqual({
      '@type': 'AggregateRating',
      ratingValue: 4.6,
      reviewCount: 12,
    });
  });
});

describe('buildBreadcrumbJsonLd', () => {
  it('emits positioned ListItems', () => {
    const jsonLd = buildBreadcrumbJsonLd([
      { name: 'Home', url: 'https://example.com/' },
      { name: 'Recipes', url: 'https://example.com/recipes' },
    ]);
    expect(jsonLd['@type']).toBe('BreadcrumbList');
    expect(jsonLd.itemListElement).toEqual([
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://example.com/' },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Recipes',
        item: 'https://example.com/recipes',
      },
    ]);
  });
});
