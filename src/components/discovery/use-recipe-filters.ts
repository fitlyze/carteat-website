'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';

export const FACET_KEYS = ['cuisine', 'diet', 'mealType', 'difficulty', 'tags'] as const;
export type FacetKey = (typeof FACET_KEYS)[number];

/**
 * URL is the single source of truth for discovery state (CLAUDE.md rule 7).
 * This hook reads/writes filter + sort params; the server reads the same params
 * for the initial paint, so filtered URLs are shareable and back-button correct.
 */
export function useRecipeFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const getList = useCallback(
    (key: FacetKey): string[] => {
      const raw = params.get(key);
      return raw ? raw.split(',').filter(Boolean) : [];
    },
    [params],
  );

  const commit = useCallback(
    (next: URLSearchParams) => {
      const qs = next.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [pathname, router],
  );

  const toggle = useCallback(
    (key: FacetKey, value: string) => {
      const next = new URLSearchParams(params.toString());
      const list = next.get(key)?.split(',').filter(Boolean) ?? [];
      const idx = list.indexOf(value);
      if (idx >= 0) list.splice(idx, 1);
      else list.push(value);
      if (list.length) next.set(key, list.join(','));
      else next.delete(key);
      next.delete('page'); // changing a filter returns to the first page
      commit(next);
    },
    [params, commit],
  );

  const setParam = useCallback(
    (key: string, value: string | null) => {
      const next = new URLSearchParams(params.toString());
      if (value) next.set(key, value);
      else next.delete(key);
      if (key !== 'page') next.delete('page'); // any other change resets paging
      commit(next);
    },
    [params, commit],
  );

  const clearAll = useCallback(() => {
    router.replace(pathname, { scroll: false });
  }, [pathname, router]);

  return {
    params,
    getList,
    toggle,
    setParam,
    clearAll,
    sort: params.get('sort') ?? 'newest',
    maxTime: params.get('maxTime'),
  };
}
