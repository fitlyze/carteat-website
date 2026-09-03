import { describe, expect, it } from 'vitest';

import { cn } from '@/lib/utils/cn';

describe('cn', () => {
  it('merges and dedupes conflicting Tailwind classes', () => {
    expect(cn('px-2', 'px-4')).toBe('px-4');
    expect(cn('text-fg', false && 'hidden', 'font-medium')).toBe('text-fg font-medium');
  });
});
