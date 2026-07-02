import { ArrowRight } from 'lucide-react';

import { RecipeCard } from '@/components/recipe/RecipeCard';
import { Link } from '@/i18n/navigation';
import type { Locale } from '@/schemas/recipe';
import type { Recipe } from '@/types';

export interface RecipeRowProps {
  title: string;
  /** Locale-aware path to the pre-filtered `/recipes` listing for this group. */
  href: string;
  /** Accessible label for the "see all" arrow, e.g. "View all Quick & healthy". */
  viewAllLabel: string;
  recipes: Recipe[];
  locale: Locale;
}

/**
 * A home curated group: a horizontally-scrollable rail of RecipeCards (all
 * widths, hidden scrollbar + scroll-snap like CuisineChips) with a "see all"
 * arrow linking to the filtered listing. Pure Server Component — no JS.
 */
export function RecipeRow({ title, href, viewAllLabel, recipes, locale }: RecipeRowProps) {
  if (recipes.length === 0) return null;

  return (
    <section className="pt-12">
      <div className="mb-4 flex items-center justify-between gap-4">
        <h2 className="font-display text-2xl font-semibold text-fg">{title}</h2>
        <Link
          href={href}
          aria-label={viewAllLabel}
          className="inline-flex size-11 shrink-0 items-center justify-center rounded-full text-fg-muted transition-colors hover:bg-bg-muted hover:text-fg"
        >
          <ArrowRight aria-hidden className="size-5" />
        </Link>
      </div>

      <div className="no-scrollbar -mx-4 flex snap-x gap-6 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        {recipes.map((recipe) => (
          <div key={recipe.slug} className="w-72 shrink-0 snap-start sm:w-80">
            <RecipeCard recipe={recipe} locale={locale} />
          </div>
        ))}
      </div>
    </section>
  );
}
