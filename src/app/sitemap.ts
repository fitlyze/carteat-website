import type { MetadataRoute } from 'next';

import { getAllRecipes, getRecipeLocales, listCuisines } from '@/lib/content';
import { absoluteUrl } from '@/lib/seo/metadata';
import { locales, type Locale } from '@/schemas/recipe';

function languagesFor(path: string, available: Locale[]) {
  const languages: Record<string, string> = {};
  for (const l of available) languages[l] = absoluteUrl(l, path);
  return languages;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];
  const allLocales = [...locales];

  // Static pages (exist in every locale).
  for (const path of ['/', '/recipes', '/search']) {
    for (const locale of allLocales) {
      entries.push({
        url: absoluteUrl(locale, path),
        alternates: { languages: languagesFor(path, allLocales) },
      });
    }
  }

  // Cuisine pages — only locales that actually have recipes for the cuisine.
  for (const locale of allLocales) {
    for (const { cuisine } of listCuisines(locale)) {
      const path = `/cuisines/${cuisine}`;
      const available = allLocales.filter((l) =>
        listCuisines(l).some((c) => c.cuisine === cuisine),
      );
      entries.push({
        url: absoluteUrl(locale, path),
        alternates: { languages: languagesFor(path, available) },
      });
    }
  }

  // Recipes — one entry per existing locale variant; untranslated locales are
  // excluded (locked fallback rule, plan §8).
  for (const recipe of getAllRecipes()) {
    const path = `/recipes/${recipe.slug}`;
    const available = getRecipeLocales(recipe.slug);
    entries.push({
      url: absoluteUrl(recipe.locale, path),
      lastModified: recipe.updatedAt,
      alternates: { languages: languagesFor(path, available) },
    });
  }

  return entries;
}
