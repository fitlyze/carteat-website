import path from 'node:path';
import { defineCollection, defineConfig, s } from 'velite';

import { cuisines, diets, difficulties, locales, mealTypes } from './src/schemas/recipe';

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/**
 * Velite collection schema. Built with velite's bundled `s` (zod + mdx/asset
 * helpers) so the MDX body compiles with velite's parse context. Enum arrays are
 * imported from `@/schemas/recipe` to stay DRY with the canonical Zod schema
 * (which drives runtime validation + types + tests).
 */
const recipes = defineCollection({
  name: 'Recipe',
  pattern: 'recipes/**/*.mdx',
  schema: s
    .object({
      title: s.string().min(1),
      slug: s.string().regex(SLUG),
      locale: s.enum(locales),
      cuisine: s.enum(cuisines),
      mealType: s.array(s.enum(mealTypes)).min(1),
      diet: s.array(s.enum(diets)),
      difficulty: s.enum(difficulties),
      prepMinutes: s.number().int().min(0),
      cookMinutes: s.number().int().min(0),
      servings: s.number().int().positive(),
      calories: s.number().int().min(0),
      nutrition: s.object({
        protein: s.number().int().min(0),
        carbs: s.number().int().min(0),
        fat: s.number().int().min(0),
        fiber: s.number().int().min(0),
        sugar: s.number().int().min(0),
        sodium: s.number().int().min(0),
      }),
      ingredients: s
        .array(
          s.object({
            item: s.string().min(1),
            qty: s.number().positive(),
            unit: s.string(),
          }),
        )
        .min(1),
      steps: s.array(s.string().min(1)).min(1),
      heroImage: s.string().regex(/^\/images\//),
      alt: s.string().min(1),
      tags: s.array(s.string()).default([]),
      author: s.string().min(1),
      publishedAt: s.string().regex(ISO_DATE),
      updatedAt: s.string().regex(ISO_DATE),
      featured: s.boolean().default(false),
      body: s.mdx(),
    })
    .transform((data, { meta }) => {
      // Enforce that folder locale + filename match the frontmatter. Filenames
      // are unique per directory, so slug is unique per locale by construction.
      const rel = path.relative(path.resolve('content/recipes'), meta.path);
      const [pathLocale, file] = rel.split(path.sep);
      const fileSlug = file?.replace(/\.mdx$/, '');

      if (pathLocale !== data.locale) {
        throw new Error(
          `Recipe "${rel}": frontmatter locale "${data.locale}" does not match folder "${pathLocale}".`,
        );
      }
      if (fileSlug !== data.slug) {
        throw new Error(
          `Recipe "${rel}": frontmatter slug "${data.slug}" must equal filename "${fileSlug}".`,
        );
      }

      return { ...data, totalMinutes: data.prepMinutes + data.cookMinutes };
    }),
});

export default defineConfig({
  root: 'content',
  output: {
    data: '.velite',
    assets: 'public/static',
    base: '/static/',
    name: '[name]-[hash:6].[ext]',
    clean: true,
  },
  collections: { recipes },
  mdx: { gfm: true },
});
