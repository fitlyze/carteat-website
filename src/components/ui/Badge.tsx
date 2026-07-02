import { cva, type VariantProps } from 'class-variance-authority';
import { forwardRef, type HTMLAttributes } from 'react';

import { cn } from '@/lib/utils/cn';

export const badgeVariants = cva(
  'inline-flex items-center rounded-xs px-2 py-0.5 text-xs font-semibold',
  {
    variants: {
      variant: {
        // diet labels
        tonal: 'bg-primary-subtle text-on-primary-subtle',
        // tag labels
        neutral: 'bg-bg-muted text-fg-muted',
      },
      uppercase: { true: 'uppercase tracking-wide', false: '' },
    },
    defaultVariants: { variant: 'neutral', uppercase: false },
  },
);

export interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(function Badge(
  { className, variant, uppercase, ...props },
  ref,
) {
  return (
    <span
      ref={ref}
      className={cn(badgeVariants({ variant, uppercase }), className)}
      {...props}
    />
  );
});
