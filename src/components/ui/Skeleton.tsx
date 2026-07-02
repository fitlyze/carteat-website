import { type HTMLAttributes } from 'react';

import { cn } from '@/lib/utils/cn';

/**
 * Loading placeholder. Shimmer sweeps via the `.skeleton` class (globals.css)
 * and becomes a static block under `prefers-reduced-motion` (§9.13).
 */
export function Skeleton({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div aria-hidden className={cn('skeleton rounded-md', className)} {...props} />;
}
