import { describe, expect, it } from 'vitest';

import {
  isInternalNavClick,
  type NavClickAnchor,
  type NavClickEvent,
} from '@/lib/utils/link-navigation';

const CURRENT = 'https://example.com/recipes?diet=vegan';

function anchor(overrides: Partial<NavClickAnchor> = {}): NavClickAnchor {
  return { href: 'https://example.com/recipes/thai-green-curry', target: '', hasDownload: false, ...overrides };
}

function click(overrides: Partial<NavClickEvent> = {}): NavClickEvent {
  return {
    button: 0,
    metaKey: false,
    ctrlKey: false,
    shiftKey: false,
    altKey: false,
    defaultPrevented: false,
    ...overrides,
  };
}

describe('isInternalNavClick', () => {
  it('accepts a plain left click on an internal link', () => {
    expect(isInternalNavClick(anchor(), click(), CURRENT)).toBe(true);
  });

  it('accepts a navigation that only changes the query string', () => {
    expect(
      isInternalNavClick(anchor({ href: 'https://example.com/recipes?diet=keto' }), click(), CURRENT),
    ).toBe(true);
  });

  it('rejects clicks with a pressed modifier key (new tab / window intents)', () => {
    for (const key of ['metaKey', 'ctrlKey', 'shiftKey', 'altKey'] as const) {
      expect(isInternalNavClick(anchor(), click({ [key]: true }), CURRENT)).toBe(false);
    }
  });

  it('rejects middle and right clicks', () => {
    expect(isInternalNavClick(anchor(), click({ button: 1 }), CURRENT)).toBe(false);
    expect(isInternalNavClick(anchor(), click({ button: 2 }), CURRENT)).toBe(false);
  });

  it('rejects clicks already handled elsewhere', () => {
    expect(isInternalNavClick(anchor(), click({ defaultPrevented: true }), CURRENT)).toBe(false);
  });

  it('rejects links that open a new tab', () => {
    expect(isInternalNavClick(anchor({ target: '_blank' }), click(), CURRENT)).toBe(false);
  });

  it('accepts an explicit target="_self"', () => {
    expect(isInternalNavClick(anchor({ target: '_self' }), click(), CURRENT)).toBe(true);
  });

  it('rejects downloads', () => {
    expect(isInternalNavClick(anchor({ hasDownload: true }), click(), CURRENT)).toBe(false);
  });

  it('rejects external origins', () => {
    expect(
      isInternalNavClick(anchor({ href: 'https://other.com/recipes' }), click(), CURRENT),
    ).toBe(false);
  });

  it('rejects non-http protocols', () => {
    expect(isInternalNavClick(anchor({ href: 'mailto:hi@example.com' }), click(), CURRENT)).toBe(
      false,
    );
  });

  it('rejects a click on the current page (including hash-only changes)', () => {
    expect(
      isInternalNavClick(anchor({ href: 'https://example.com/recipes?diet=vegan' }), click(), CURRENT),
    ).toBe(false);
    expect(
      isInternalNavClick(
        anchor({ href: 'https://example.com/recipes?diet=vegan#ingredients' }),
        click(),
        CURRENT,
      ),
    ).toBe(false);
  });

  it('rejects malformed current URLs instead of throwing', () => {
    expect(isInternalNavClick(anchor(), click(), 'not-a-url')).toBe(false);
  });
});
