import { useTranslations } from 'next-intl';

export function StepList({ steps }: { steps: string[] }) {
  const t = useTranslations('recipe');

  return (
    <section aria-labelledby="steps-heading">
      <h2 id="steps-heading" className="font-display text-2xl font-semibold text-fg">
        {t('steps')}
      </h2>
      <ol className="mt-4 divide-y divide-border">
        {steps.map((step, i) => (
          <li key={i} className="flex gap-4 py-6">
            <span
              aria-hidden
              className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary-subtle font-display text-lg font-semibold text-on-primary-subtle"
            >
              {i + 1}
            </span>
            <p className="max-w-[var(--measure)] leading-relaxed text-fg">{step}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
