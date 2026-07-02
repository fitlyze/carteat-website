import { createNavigation } from 'next-intl/navigation';

import { routing } from './routing';

// Locale-aware navigation helpers — always use these instead of next/link or
// next/navigation so the locale prefix is preserved (CLAUDE.md i18n rules).
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
