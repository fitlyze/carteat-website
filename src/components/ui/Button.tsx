import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';
import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';

import { cn } from '@/lib/utils/cn';

export const buttonVariants = cva(
  'inline-flex select-none items-center justify-center gap-2 whitespace-nowrap rounded-md font-sans font-medium transition-[background-color,box-shadow,transform] duration-[--duration-fast] ease-[--ease-out] active:translate-y-px disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary: 'bg-primary text-primary-fg hover:bg-primary-hover',
        secondary: 'bg-bg-muted text-fg hover:bg-surface-hover',
        outline: 'border border-border bg-transparent text-fg hover:bg-bg-muted',
        ghost: 'bg-transparent text-fg hover:bg-bg-muted',
        accent: 'bg-accent text-accent-fg hover:bg-accent-hover',
        destructive: 'bg-danger text-danger-fg hover:opacity-90',
      },
      size: {
        sm: 'h-9 px-3 text-sm',
        md: 'h-11 px-4 text-base',
        lg: 'h-13 px-5 text-lg',
      },
      iconOnly: {
        true: 'aspect-square px-0',
        false: '',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md', iconOnly: false },
  },
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    className,
    variant,
    size,
    iconOnly,
    asChild = false,
    loading = false,
    leftIcon,
    rightIcon,
    children,
    disabled,
    ...props
  },
  ref,
) {
  const classes = cn(buttonVariants({ variant, size, iconOnly }), className);

  // Slot requires a single child — when composing (asChild) we pass children
  // through untouched (e.g. wrapping a locale-aware Link).
  if (asChild) {
    return (
      <Slot ref={ref} className={classes} {...props}>
        {children}
      </Slot>
    );
  }

  return (
    <button
      ref={ref}
      className={classes}
      disabled={disabled ?? loading}
      aria-busy={loading || undefined}
      data-loading={loading || undefined}
      {...props}
    >
      {loading ? <Loader2 aria-hidden className="size-4 animate-spin" /> : leftIcon}
      {children}
      {!loading && rightIcon}
    </button>
  );
});
