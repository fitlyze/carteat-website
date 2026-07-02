import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const PAGES = ['/', '/recipes', '/recipes/thai-green-curry', '/search'];

for (const scheme of ['light', 'dark'] as const) {
  test.describe(`a11y (${scheme})`, () => {
    test.use({ colorScheme: scheme });

    for (const path of PAGES) {
      test(`no serious axe violations on ${path}`, async ({ page }) => {
        await page.goto(path);
        const results = await new AxeBuilder({ page })
          .withTags(['wcag2a', 'wcag2aa'])
          .analyze();
        const serious = results.violations.filter(
          (v) => v.impact === 'serious' || v.impact === 'critical',
        );
        expect(serious, JSON.stringify(serious, null, 2)).toEqual([]);
      });
    }
  });
}
