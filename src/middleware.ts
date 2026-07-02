import createMiddleware from 'next-intl/middleware';

import { routing } from './i18n/routing';

export default createMiddleware(routing);

export const config = {
  // Match all paths except API routes, Next internals, Pagefind bundle, and
  // files with an extension (static assets, images, etc.).
  matcher: ['/((?!api|_next|_vercel|pagefind|.*\\..*).*)'],
};
