import { expect, test } from '@playwright/test';

test.describe('discovery', () => {
  test('filters by cuisine via URL and reproduces a shareable state', async ({
    page,
  }) => {
    await page.goto('/recipes');
    await expect(page.getByText('6 recipes')).toBeVisible();

    await page.getByRole('button', { name: 'Thai', exact: true }).click();
    await expect(page).toHaveURL(/cuisine=thai/);
    await expect(
      page.getByRole('heading', { level: 3, name: 'Thai Green Curry' }),
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { level: 3, name: 'Margherita Pizza' }),
    ).toHaveCount(0);

    // Shareable: reloading the URL reproduces the filtered result.
    const url = page.url();
    await page.goto(url);
    await expect(
      page.getByRole('heading', { level: 3, name: 'Thai Green Curry' }),
    ).toBeVisible();
  });

  test('search returns a matching recipe', async ({ page }) => {
    await page.goto('/search');
    await page.getByRole('main').getByRole('searchbox').fill('curry');
    await expect(page.locator('main a[href*="thai-green-curry"]').first()).toBeVisible({
      timeout: 10_000,
    });
  });
});
