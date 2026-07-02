import * as Sentry from '@sentry/nextjs';

import { env } from '@/env';

// Client-side error monitoring. With an empty DSN this is a no-op (dev/local).
Sentry.init({
  dsn: env.NEXT_PUBLIC_SENTRY_DSN || undefined,
  tracesSampleRate: 0.1,
  enabled: Boolean(env.NEXT_PUBLIC_SENTRY_DSN),
});
