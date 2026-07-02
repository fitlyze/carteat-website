// Post-build Pagefind index (plan §20). Pagefind indexes the static HTML that
// `next build` prerenders, then writes the bundle to `public/pagefind` so the
// search route can lazily import it. This is a post-build step, not a plugin.
import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import path from 'node:path';

const SITE = path.resolve('.next/server/app');
const OUTPUT = path.resolve('public/pagefind');

if (!existsSync(SITE)) {
  console.warn(`[pagefind] skipped — no build output at ${SITE}`);
  process.exit(0);
}

const bin = path.resolve(
  'node_modules/.bin',
  process.platform === 'win32' ? 'pagefind.cmd' : 'pagefind',
);

const result = spawnSync(bin, ['--site', SITE, '--output-path', OUTPUT], {
  stdio: 'inherit',
});

if (result.status !== 0) {
  // Do not fail the production build on indexing trouble; search degrades
  // gracefully and the issue is surfaced in logs (plan §20 risk flag).
  console.warn('[pagefind] indexing finished with a non-zero status — see logs above.');
}
