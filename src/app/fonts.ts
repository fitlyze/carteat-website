import { Fraunces, Inter } from 'next/font/google';

// Self-hosted via next/font (no FOUT/CLS). Exposed as CSS vars consumed by the
// token layer: --font-display (headings) + --font-sans (body/UI). design §2.1.
export const fraunces = Fraunces({
  subsets: ['latin', 'latin-ext'],
  display: 'swap',
  variable: '--font-display',
  weight: ['400', '500', '600'],
  style: ['normal'],
  fallback: ['Georgia', 'Times New Roman', 'serif'],
});

export const inter = Inter({
  subsets: ['latin', 'latin-ext'],
  display: 'swap',
  variable: '--font-sans',
  weight: ['400', '500', '600', '700'],
  fallback: ['system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
});
