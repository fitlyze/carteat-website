export interface NavClickAnchor {
  /** Fully resolved `anchor.href` (DOM resolves relative hrefs automatically). */
  href: string;
  target: string;
  hasDownload: boolean;
}

export interface NavClickEvent {
  button: number;
  metaKey: boolean;
  ctrlKey: boolean;
  shiftKey: boolean;
  altKey: boolean;
  defaultPrevented: boolean;
}

/**
 * True when a click on an anchor triggers an in-app navigation: an
 * unmodified left click, in the same tab, to a same-origin URL whose
 * path or query differs from the current one (hash-only changes and
 * downloads don't re-render the page, so no progress is shown).
 */
export function isInternalNavClick(
  anchor: NavClickAnchor,
  event: NavClickEvent,
  currentHref: string,
): boolean {
  if (event.defaultPrevented) return false;
  if (event.button !== 0) return false;
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return false;
  if (anchor.target && anchor.target !== '_self') return false;
  if (anchor.hasDownload) return false;

  let destination: URL;
  let current: URL;
  try {
    destination = new URL(anchor.href, currentHref);
    current = new URL(currentHref);
  } catch {
    return false;
  }

  if (destination.origin !== current.origin) return false;
  if (!destination.protocol.startsWith('http')) return false;

  const samePage =
    destination.pathname === current.pathname && destination.search === current.search;
  return !samePage;
}
