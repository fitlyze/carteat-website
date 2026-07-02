import { describe, expect, it } from 'vitest';

import {
  formatDate,
  formatNumber,
  formatNutrition,
  formatRelativeDate,
  formatServings,
  formatTotalTime,
} from '@/lib/utils/format';

describe('formatNumber', () => {
  it('is locale-aware', () => {
    expect(formatNumber(10000, 'en')).toBe('10,000');
    expect(formatNumber(10000, 'es')).toBe('10.000');
  });
});

describe('formatTotalTime', () => {
  it('formats minutes only', () => {
    expect(formatTotalTime(45, 'en')).toBe('45 min');
  });
  it('formats hours and minutes', () => {
    expect(formatTotalTime(90, 'en')).toBe('1 h 30 min');
  });
  it('formats whole hours', () => {
    expect(formatTotalTime(120, 'en')).toBe('2 h');
  });
  it('formats zero as 0 min', () => {
    expect(formatTotalTime(0, 'en')).toBe('0 min');
  });
});

describe('formatServings / formatNutrition', () => {
  it('formats servings', () => {
    expect(formatServings(4, 'en')).toBe('4');
  });
  it('formats nutrition with units', () => {
    expect(formatNutrition(22, 'g', 'en')).toBe('22 g');
    expect(formatNutrition(640, 'mg', 'en')).toBe('640 mg');
  });
});

describe('formatDate', () => {
  it('formats an ISO date per locale', () => {
    expect(formatDate('2026-06-19', 'en')).toBe('June 19, 2026');
    expect(formatDate('2026-06-19', 'es')).toContain('2026');
    expect(formatDate('2026-06-19', 'es').toLowerCase()).toContain('junio');
  });
});

describe('formatRelativeDate', () => {
  const now = new Date('2026-06-20T12:00:00Z');
  it('formats days ago', () => {
    expect(formatRelativeDate('2026-06-18T12:00:00Z', 'en', now)).toBe('2 days ago');
  });
  it('formats hours ago', () => {
    expect(formatRelativeDate('2026-06-20T09:00:00Z', 'en', now)).toBe('3 hours ago');
  });
});
