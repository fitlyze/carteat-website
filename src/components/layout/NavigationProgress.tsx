'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useRef, useState } from 'react';

import { cn } from '@/lib/utils/cn';
import { isInternalNavClick } from '@/lib/utils/link-navigation';

/** Bail out if the route never resolves (e.g. a navigation error). */
const SAFETY_TIMEOUT_MS = 8000;

function routeKey(pathname: string, search: string): string {
  return search ? `${pathname}?${search}` : pathname;
}

function NavigationProgressInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [active, setActive] = useState(false);
  const currentKey = routeKey(pathname, searchParams.toString());
  const currentKeyRef = useRef(currentKey);
  const safetyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Route (path or query) changed → navigation finished.
  useEffect(() => {
    currentKeyRef.current = currentKey;
    setActive(false);
    if (safetyTimer.current) {
      clearTimeout(safetyTimer.current);
      safetyTimer.current = null;
    }
  }, [currentKey]);

  useEffect(() => {
    const begin = () => {
      setActive(true);
      if (safetyTimer.current) clearTimeout(safetyTimer.current);
      safetyTimer.current = setTimeout(() => setActive(false), SAFETY_TIMEOUT_MS);
    };

    const onClick = (event: MouseEvent) => {
      const anchor =
        event.target instanceof Element ? event.target.closest('a') : null;
      if (!(anchor instanceof HTMLAnchorElement) || !anchor.href) return;
      if (
        isInternalNavClick(
          { href: anchor.href, target: anchor.target, hasDownload: anchor.hasAttribute('download') },
          event,
          window.location.href,
        )
      ) {
        begin();
      }
    };

    // Back/forward: location is already updated when popstate fires.
    const onPopState = () => {
      const next = routeKey(window.location.pathname, window.location.search.slice(1));
      if (next !== currentKeyRef.current) begin();
    };

    document.addEventListener('click', onClick, true);
    window.addEventListener('popstate', onPopState);
    return () => {
      document.removeEventListener('click', onClick, true);
      window.removeEventListener('popstate', onPopState);
      if (safetyTimer.current) clearTimeout(safetyTimer.current);
    };
  }, []);

  return (
    <div
      aria-hidden
      className={cn(
        'pointer-events-none fixed inset-x-0 top-0 z-[var(--z-toast)] h-1 overflow-hidden transition-opacity',
        active ? 'opacity-100' : 'opacity-0',
      )}
    >
      <div className="nav-progress-bar h-full bg-primary" />
    </div>
  );
}

/**
 * Indeterminate top progress bar shown while a route transition is in
 * flight, so slow navigations don't feel frozen. Starts on internal link
 * clicks / history traversal, ends when the pathname or query changes.
 * Purely decorative (`aria-hidden`) — route changes are announced by the
 * Next.js route announcer.
 */
export function NavigationProgress() {
  // useSearchParams() requires a Suspense boundary during prerendering.
  return (
    <Suspense fallback={null}>
      <NavigationProgressInner />
    </Suspense>
  );
}
