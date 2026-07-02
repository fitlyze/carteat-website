import { Clock } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';

import { RatingWidget } from '@/components/engagement/RatingWidget';
import { Badge } from '@/components/ui/Badge';
import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/utils/cn';
import { formatTotalTime } from '@/lib/utils/format';
import type { Locale } from '@/schemas/recipe';
import type { Recipe } from '@/types';

export interface RecipeCardProps {
  recipe: Recipe;
  locale: Locale;
  rating?: { avg: number; count: number };
  priority?: boolean;
  className?: string;
}

export function RecipeCard({
  recipe,
  locale,
  rating,
  priority = false,
  className,
}: RecipeCardProps) {
  const t = useTranslations();

  return (
    <Link
      href={`/recipes/${recipe.slug}`}
      className={cn(
        'group block h-full overflow-hidden rounded-lg border border-border bg-surface shadow-sm transition-[transform,box-shadow] duration-[--duration-base] ease-out hover:-translate-y-0.5 hover:shadow-md motion-reduce:hover:translate-y-0',
        className,
      )}
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src={recipe.heroImage}
          alt={recipe.alt}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          priority={priority}
          className="object-cover transition-transform duration-[--duration-base] ease-out group-hover:scale-[1.03] motion-reduce:group-hover:scale-100"
        />
        <span className="absolute top-3 left-3 inline-flex h-7 items-center rounded-full bg-surface/90 px-3 text-xs font-medium text-fg shadow-sm backdrop-blur-sm">
          {t(`cuisine.${recipe.cuisine}`)}
        </span>
      </div>

      <div className="p-4">
        <h3 className="line-clamp-2 font-display text-xl font-semibold text-fg">
          {recipe.title}
        </h3>

        <div className="mt-2 flex items-center gap-2 text-sm text-fg-muted">
          <span className="inline-flex items-center gap-1">
            <Clock aria-hidden className="size-4" />
            {formatTotalTime(recipe.totalMinutes, locale)}
          </span>
          <span aria-hidden>·</span>
          <span>{t(`difficulty.${recipe.difficulty}`)}</span>
        </div>

        <div className="mt-3 flex items-center justify-between gap-2">
          <RatingWidget
            avg={rating?.avg ?? 0}
            count={rating?.count ?? 0}
            size="compact"
          />
          <div className="flex flex-wrap justify-end gap-1">
            {recipe.diet.slice(0, 2).map((d) => (
              <Badge key={d} variant="tonal">
                {t(`diet.${d}`)}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </Link>
  );
}
