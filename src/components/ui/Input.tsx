import {
  forwardRef,
  type InputHTMLAttributes,
  type LabelHTMLAttributes,
  type TextareaHTMLAttributes,
} from 'react';

import { cn } from '@/lib/utils/cn';

const fieldBase =
  'w-full rounded-md border border-border bg-surface px-3 text-base text-fg transition-[border-color,box-shadow] duration-[--duration-fast] placeholder:text-fg-subtle focus:border-ring disabled:bg-bg-muted disabled:text-fg-subtle aria-[invalid=true]:border-danger';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, error, ...props },
  ref,
) {
  return (
    <input
      ref={ref}
      aria-invalid={error || undefined}
      className={cn(fieldBase, 'h-11', className)}
      {...props}
    />
  );
});

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { className, error, ...props },
  ref,
) {
  return (
    <textarea
      ref={ref}
      aria-invalid={error || undefined}
      className={cn(fieldBase, 'min-h-[120px] resize-y py-2', className)}
      {...props}
    />
  );
});

export function Label({ className, ...props }: LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    // Reusable primitive: callers pass `htmlFor`/`id` to associate the control.
    // eslint-disable-next-line jsx-a11y/label-has-associated-control
    <label
      className={cn('mb-1.5 block text-sm font-medium text-fg', className)}
      {...props}
    />
  );
}

export function FieldHint({
  error = false,
  className,
  children,
  id,
}: {
  error?: boolean;
  className?: string;
  children: React.ReactNode;
  id?: string;
}) {
  return (
    <p
      id={id}
      className={cn('mt-1.5 text-xs', error ? 'text-danger' : 'text-fg-muted', className)}
    >
      {children}
    </p>
  );
}
