import type { Locale } from '@/schemas/recipe';

/**
 * Locale-aware formatters via `Intl` (plan §8). No manual string concatenation
 * of numbers/dates. Unit *words* (min/h) are kept neutral here; feature-specific
 * copy lives in i18n catalogs.
 */

export function formatNumber(value: number, locale: Locale): string {
  return new Intl.NumberFormat(locale).format(value);
}

/** Total cook time, e.g. "45 min" or "1 h 30 min". Digits are localized. */
export function formatTotalTime(minutes: number, locale: Locale): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  const parts: string[] = [];
  if (hours > 0) parts.push(`${formatNumber(hours, locale)} h`);
  if (mins > 0 || hours === 0) parts.push(`${formatNumber(mins, locale)} min`);
  return parts.join(' ');
}

export function formatServings(servings: number, locale: Locale): string {
  return formatNumber(servings, locale);
}

/** Per-serving nutrition figure with its unit, e.g. "22 g" / "640 mg". */
export function formatNutrition(
  value: number,
  unit: 'g' | 'mg' | 'kcal',
  locale: Locale,
): string {
  return `${formatNumber(value, locale)} ${unit}`;
}

export function formatDate(iso: string, locale: Locale): string {
  const date = new Date(`${iso}T00:00:00Z`);
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  }).format(date);
}

/** Localized relative date (e.g. "2 days ago") for comments. */
export function formatRelativeDate(
  iso: string,
  locale: Locale,
  now: Date = new Date(),
): string {
  const then = new Date(iso).getTime();
  const diffMs = then - now.getTime();
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });

  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ['year', 1000 * 60 * 60 * 24 * 365],
    ['month', 1000 * 60 * 60 * 24 * 30],
    ['day', 1000 * 60 * 60 * 24],
    ['hour', 1000 * 60 * 60],
    ['minute', 1000 * 60],
  ];

  for (const [unit, ms] of units) {
    if (Math.abs(diffMs) >= ms) {
      return rtf.format(Math.round(diffMs / ms), unit);
    }
  }
  return rtf.format(0, 'second');
}
