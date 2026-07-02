import type { ReactNode } from 'react';

import { cn } from '@/lib/utils/cn';

/** Centered empty state: icon + Fraunces heading + muted sub + optional CTA (§9.18). */
export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'mx-auto flex max-w-[var(--container-narrow)] flex-col items-center py-20 text-center',
        className,
      )}
    >
      {icon && <div className="mb-4 text-fg-subtle">{icon}</div>}
      <h2 className="font-display text-2xl font-semibold text-fg">{title}</h2>
      {description && <p className="mt-2 text-fg-muted">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
