// Client-side access to the Pagefind static index (plan §6, §20). The bundle is
// produced by the postbuild step into /public/pagefind and loaded lazily via a
// runtime dynamic import so it never ships in the main bundle.

export interface PagefindResultData {
  url: string;
  excerpt: string;
  meta: { title?: string; image?: string };
}

interface PagefindResult {
  id: string;
  data: () => Promise<PagefindResultData>;
}

interface Pagefind {
  search: (query: string) => Promise<{ results: PagefindResult[] }>;
  options?: (opts: Record<string, unknown>) => Promise<void>;
}

let pagefindPromise: Promise<Pagefind> | null = null;

function loadPagefind(): Promise<Pagefind> {
  if (!pagefindPromise) {
    // webpackIgnore: resolved at runtime from the served output, not bundled.
    // The module only exists in the built /public/pagefind output, so it is not
    // resolvable at compile time.
    pagefindPromise = import(
      /* webpackIgnore: true */
      // @ts-expect-error - runtime-only module produced by the Pagefind postbuild
      '/pagefind/pagefind.js'
    ).then(async (mod) => {
      const pf = mod as unknown as Pagefind;
      await pf.options?.({});
      return pf;
    });
  }
  return pagefindPromise;
}

/** Normalize a Pagefind result URL to a clean route path. */
function normalizeUrl(url: string): string {
  return url.replace(/\.html$/, '').replace(/\/index$/, '') || '/';
}

export async function searchRecipes(query: string): Promise<PagefindResultData[]> {
  if (!query.trim()) return [];
  const pf = await loadPagefind();
  const { results } = await pf.search(query);
  const data = await Promise.all(results.slice(0, 20).map((r) => r.data()));
  return data.map((d) => ({ ...d, url: normalizeUrl(d.url) }));
}
