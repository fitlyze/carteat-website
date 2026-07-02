import { ChevronRight } from 'lucide-react';
import { Fragment } from 'react';

import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/utils/cn';

export interface Crumb {
  label: string;
  href?: string;
}

/** Accessible breadcrumb trail. Pairs with breadcrumb JSON-LD (E7-S2). */
export function Breadcrumbs({
  items,
  label,
  className,
}: {
  items: Crumb[];
  label: string;
  className?: string;
}) {
  return (
    <nav aria-label={label} className={cn('text-sm', className)}>
      <ol className="flex flex-wrap items-center gap-1.5 text-fg-muted">
        {items.map((item, i) => {
          const isLast = i === items.length - 1;
          return (
            <Fragment key={`${item.label}-${i}`}>
              <li>
                {item.href && !isLast ? (
                  <Link href={item.href} className="hover:text-fg">
                    {item.label}
                  </Link>
                ) : (
                  <span aria-current={isLast ? 'page' : undefined} className="text-fg">
                    {item.label}
                  </span>
                )}
              </li>
              {!isLast && (
                <li aria-hidden className="text-fg-subtle">
                  <ChevronRight className="size-4" />
                </li>
              )}
            </Fragment>
          );
        })}
      </ol>
    </nav>
  );
}
