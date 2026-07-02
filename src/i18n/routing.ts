import { defineRouting } from 'next-intl/routing';

import { defaultLocale, locales } from './config';

export const routing = defineRouting({
  locales,
  defaultLocale,
  // Locked: no `/en` prefix; Spanish served from `/es/...` (plan §16).
  localePrefix: 'as-needed',
});
