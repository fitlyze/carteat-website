import { afterEach, describe, expect, it, vi } from 'vitest';

import { getAnonId } from '@/lib/utils/anon-id';
import { cn } from '@/lib/utils/cn';

describe('cn', () => {
  it('merges and dedupes conflicting Tailwind classes', () => {
    expect(cn('px-2', 'px-4')).toBe('px-4');
    expect(cn('text-fg', false && 'hidden', 'font-medium')).toBe('text-fg font-medium');
  });
});

describe('getAnonId', () => {
  afterEach(() => window.localStorage.clear());

  it('creates and persists a stable UUID', () => {
    const first = getAnonId();
    expect(first).toMatch(/[0-9a-f-]{36}/);
    expect(getAnonId()).toBe(first);
    expect(window.localStorage.getItem('anon_id')).toBe(first);
  });

  it('reuses an existing id', () => {
    window.localStorage.setItem('anon_id', 'existing-id');
    expect(getAnonId()).toBe('existing-id');
    vi.restoreAllMocks();
  });
});
