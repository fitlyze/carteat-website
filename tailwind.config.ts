import type { Config } from 'tailwindcss';

/**
 * Tailwind v4 is CSS-first: the design tokens and `@theme` mapping live in
 * `src/styles/tokens.css` + `src/styles/globals.css`. This file only declares
 * the content sources so utility scanning is explicit and CI-stable.
 */
const config: Config = {
  content: ['./src/**/*.{ts,tsx,mdx}', './content/**/*.mdx'],
};

export default config;
