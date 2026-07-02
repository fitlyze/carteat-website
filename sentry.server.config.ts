import * as Sentry from '@sentry/nextjs';

import { env } from '@/env';

// Server / route-handler error monitoring. No-op when DSN is empty.
Sentry.init({
  dsn: env.SENTRY_DSN || undefined,
  tracesSampleRate: 0.1,
  enabled: Boolean(env.SENTRY_DSN),
});
