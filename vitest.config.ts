import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

const r = (p: string) => fileURLToPath(new URL(p, import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': r('./src'),
      '#velite': r('./.velite'),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/unit/**/*.{test,spec}.{ts,tsx}', 'src/**/*.{test,spec}.{ts,tsx}'],
    exclude: ['tests/e2e/**', 'tests/a11y/**', 'node_modules/**'],
    env: {
      SKIP_ENV_VALIDATION: '1',
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      include: ['src/lib/**', 'src/schemas/**'],
      // Exclude integration/glue modules tested elsewhere or untestable in jsdom:
      //  - db/*  → server-only (covered by API integration tests, E12-S3)
      //  - search/* → browser dynamic-import of the Pagefind bundle (e2e)
      //  - seo/metadata + content/index → thin env/data-binding glue
      exclude: [
        'src/lib/db/**',
        'src/lib/search/**',
        'src/lib/seo/metadata.ts',
        'src/lib/content/index.ts',
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        statements: 80,
        branches: 70,
      },
    },
  },
});
