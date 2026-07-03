import { ImageResponse } from 'next/og';

import { getRecipe } from '@/lib/content';
import type { Locale } from '@/schemas/recipe';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const alt = 'Recipe';

// Brand colors (design §1) — OG generation is a standalone render, not a
// token-styled component, so literal values are used here intentionally.
const CREAM = '#FBF8F3';
const INK = '#1F1C19';
const BASIL = '#237043';
const TERRACOTTA = '#BC4A23';

export default async function OgImage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const resolved = getRecipe(slug, locale as Locale);
  const title = resolved?.recipe.title ?? 'Foodlyze';

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: CREAM,
          padding: 80,
          borderBottom: `24px solid ${TERRACOTTA}`,
        }}
      >
        <div
          style={{ display: 'flex', alignItems: 'center', color: BASIL, fontSize: 36 }}
        >
          🌿 Foodlyze
        </div>
        <div
          style={{
            display: 'flex',
            color: INK,
            fontSize: 84,
            fontWeight: 700,
            lineHeight: 1.1,
            maxWidth: 1000,
          }}
        >
          {title}
        </div>
      </div>
    ),
    size,
  );
}
