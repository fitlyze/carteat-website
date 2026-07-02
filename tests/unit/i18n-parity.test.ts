import { describe, expect, it } from 'vitest';

import en from '@/i18n/messages/en.json';
import es from '@/i18n/messages/es.json';

function keyPaths(obj: unknown, prefix = ''): string[] {
  if (obj && typeof obj === 'object' && !Array.isArray(obj)) {
    return Object.entries(obj as Record<string, unknown>).flatMap(([k, v]) =>
      keyPaths(v, prefix ? `${prefix}.${k}` : k),
    );
  }
  return [prefix];
}

describe('i18n catalog parity', () => {
  it('en and es have identical key sets', () => {
    const enKeys = keyPaths(en).sort();
    const esKeys = keyPaths(es).sort();
    expect(esKeys).toEqual(enKeys);
  });
});
