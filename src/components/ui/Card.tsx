import { forwardRef, type HTMLAttributes } from 'react';

import { cn } from '@/lib/utils/cn';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** Adds the hover lift (translateY + shadow-md). design §9.3. */
  hoverable?: boolean;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
  { className, hoverable = false, ...props },
  ref,
) {
  return (
    <div
      ref={ref}
      className={cn(
        'rounded-lg border border-border bg-surface shadow-sm',
        hoverable &&
          'transition-[transform,box-shadow] duration-[--duration-base] ease-[--ease-out] hover:-translate-y-0.5 hover:shadow-md',
        className,
      )}
      {...props}
    />
  );
});
