import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

/**
 * Single source of truth for environment variables (plan §17).
 * Validated at boot/build via Zod — a missing required var fails fast.
 * Never read `process.env` directly anywhere else (CLAUDE.md golden rule 5).
 */
export const env = createEnv({
  server: {
    SENTRY_DSN: z.string().optional().default(''),
    // CI-only — optional locally.
    SENTRY_AUTH_TOKEN: z.string().optional(),
  },
  client: {
    NEXT_PUBLIC_SITE_URL: z.string().url(),
    NEXT_PUBLIC_SENTRY_DSN: z.string().optional().default(''),
  },
  runtimeEnv: {
    SENTRY_DSN: process.env.SENTRY_DSN,
    SENTRY_AUTH_TOKEN: process.env.SENTRY_AUTH_TOKEN,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
  },
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  emptyStringAsUndefined: false,
});
