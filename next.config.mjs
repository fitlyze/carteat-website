import bundleAnalyzer from '@next/bundle-analyzer';
import { withSentryConfig } from '@sentry/nextjs';
import createNextIntlPlugin from 'next-intl/plugin';

// Run Velite in dev (watch) so content regenerates on change. For `build`,
// the `velite build` step runs first via the package.json script.
const isDev = process.argv.includes('dev');
if (isDev && !process.env.VELITE_STARTED) {
  process.env.VELITE_STARTED = '1';
  try {
    const { build } = await import('velite');
    await build({ watch: true, clean: false });
  } catch (error) {
    console.warn('[velite] dev build skipped:', error?.message ?? error);
  }
}

const isProd = process.env.NODE_ENV === 'production';

// Security headers (plan §12, backlog E0-S6). CSP allows only required origins.
const connectSrc = [
  "'self'",
  'https://*.sentry.io',
  'https://*.ingest.sentry.io',
  'https://vitals.vercel-insights.com',
  'https://va.vercel-scripts.com',
];

const csp = [
  "default-src 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "object-src 'none'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  "style-src 'self' 'unsafe-inline'",
  // 'wasm-unsafe-eval' is required for the Pagefind search WASM module.
  `script-src 'self' 'unsafe-inline' 'wasm-unsafe-eval'${isProd ? '' : " 'unsafe-eval'"}`,
  `connect-src ${connectSrc.join(' ')}`,
  'upgrade-insecure-requests',
].join('; ');

const securityHeaders = [
  { key: 'Content-Security-Policy', value: csp },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    formats: ['image/avif', 'image/webp'],
    // Locked image strategy (plan §16): local images under /public only.
    remotePatterns: [],
  },
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },
};

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');
const withBundleAnalyzer = bundleAnalyzer({ enabled: process.env.ANALYZE === 'true' });

// Source-map upload is gated to CI via SENTRY_AUTH_TOKEN only (plan §17).
export default withSentryConfig(withBundleAnalyzer(withNextIntl(nextConfig)), {
  silent: !process.env.CI,
  disableLogger: true,
  widenClientFileUpload: true,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  telemetry: false,
});
