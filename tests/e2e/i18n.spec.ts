import { expect, test } from '@playwright/test';

test.describe('i18n', () => {
  test('switches locale via the switcher and preserves the path', async ({ page }) => {
    await page.goto('/recipes');
    await expect(page.getByRole('heading', { level: 1, name: 'Recipes' })).toBeVisible();

    await page
      .getByRole('banner')
      .getByRole('button', { name: 'Change language' })
      .click();
    await page.getByRole('menuitem', { name: 'Español' }).click();

    await expect(page).toHaveURL(/\/es\/recipes$/);
    await expect(page.getByRole('heading', { level: 1, name: 'Recetas' })).toBeVisible();
  });

  test('renders a localized recipe and a fallback banner when untranslated', async ({
    page,
  }) => {
    // Thai green curry is translated → Spanish title.
    await page.goto('/es/recipes/thai-green-curry');
    await expect(
      page.getByRole('heading', { level: 1, name: 'Curry Verde Tailandés' }),
    ).toBeVisible();

    // Margherita pizza is not translated → English body + "not yet translated".
    await page.goto('/es/recipes/margherita-pizza');
    await expect(page.getByText('Aún no traducida')).toBeVisible();
  });

  test('emits hreflang alternates for a translated recipe', async ({ page }) => {
    await page.goto('/recipes/thai-green-curry');
    await expect(page.locator('link[rel="alternate"][hreflang="es"]')).toHaveCount(1);
    await expect(page.locator('link[rel="alternate"][hreflang="en"]')).toHaveCount(1);
  });
});
