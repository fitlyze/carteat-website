import * as runtime from 'react/jsx-runtime';

/**
 * Render a Velite-compiled MDX body (`s.mdx()` emits a function-body string).
 * Runs on the server (RSC) over trusted, build-validated content.
 */
function evaluate(code: string) {
  const fn = new Function(code);
  return fn({ ...runtime }).default as React.ComponentType;
}

export function MDXBody({ code }: { code: string }) {
  const Content = evaluate(code);
  return (
    <div className="prose-recipe max-w-[var(--measure)] leading-relaxed text-fg">
      <Content />
    </div>
  );
}
