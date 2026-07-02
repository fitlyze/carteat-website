import { X } from 'lucide-react';
import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';

import { cn } from '@/lib/utils/cn';

const base =
  'inline-flex h-8 items-center gap-1.5 rounded-full border px-3 text-sm font-medium transition-[background-color,border-color,color] duration-[--duration-fast] ease-spring';

function selectionClasses(selected: boolean): string {
  return selected
    ? 'border-primary bg-primary-subtle text-on-primary-subtle'
    : 'border-border bg-surface text-fg hover:bg-bg-muted';
}

export interface ChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  selected?: boolean;
  leadingIcon?: ReactNode;
  /** When provided, renders a removable chip with a trailing × button. */
  onRemove?: () => void;
  /** Accessible label for the remove button (required when removable). */
  removeLabel?: string;
}

export const Chip = forwardRef<HTMLButtonElement, ChipProps>(function Chip(
  { className, selected = false, leadingIcon, onRemove, removeLabel, children, ...props },
  ref,
) {
  // Removable variant: a static container (no outer button, to avoid nested
  // buttons) with a dedicated remove button.
  if (onRemove) {
    return (
      <span className={cn(base, selectionClasses(selected), className)}>
        {leadingIcon}
        {children}
        <button
          type="button"
          onClick={onRemove}
          aria-label={removeLabel}
          className="-mr-1 inline-flex size-5 items-center justify-center rounded-full hover:bg-bg-muted"
        >
          <X aria-hidden className="size-4" />
        </button>
      </span>
    );
  }

  return (
    <button
      ref={ref}
      type="button"
      aria-pressed={selected}
      className={cn(base, selectionClasses(selected), className)}
      {...props}
    >
      {leadingIcon}
      {children}
    </button>
  );
});
