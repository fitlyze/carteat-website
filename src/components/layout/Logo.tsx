import { cn } from '@/lib/utils/cn';

export interface LogoProps {
  className?: string;
}

/**
 * CartEat brand mark — a sprout with two-tone basil leaves.
 * A standalone brand asset (mirrors `app/icon.svg`), so the literal brand hex
 * values are intentional here, same exception as `opengraph-image.tsx`. Size it
 * via `className` (e.g. `size-6`); it's decorative — the wordmark carries the label.
 */
export function Logo({ className }: LogoProps) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      className={cn('shrink-0', className)}
    >
      <path
        d="M10 28.5C10.1 21.5 9.8 13 10.8 5.6"
        stroke="#237043"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path d="M11 9.8C13.6 3.2 21 1.6 26.4 4.8C24.4 11 16.6 12.8 11 9.8Z" fill="#52a66e" />
      <path d="M11 18.4C13.2 14 19 13.2 23.2 15.2C21.6 19.6 15 20.8 11 18.4Z" fill="#237043" />
    </svg>
  );
}
