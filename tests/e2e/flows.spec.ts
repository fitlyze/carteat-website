import { expect, test, type Page } from '@playwright/test';

async function mockRatings(page: Page) {
  await page.route('**/api/ratings*', async (route) => {
    const method = route.request().method();
    const body = method === 'POST' ? { avg: 5, count: 1 } : { avg: 0, count: 0 };
    await route.fulfill({ json: body });
  });
}

async function mockComments(page: Page, postStatus = 200) {
  await page.route('**/api/comments*', async (route) => {
    if (route.request().method() === 'POST') {
      await route.fulfill({
        status: postStatus,
        json: postStatus === 200 ? { ok: true, status: 'pending' } : { error: 'rate' },
      });
    } else {
      await route.fulfill({ json: { comments: [] } });
    }
  });
}

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

test.describe('engagement', () => {
  test('submitting a rating shows an optimistic thank-you', async ({ page }) => {
    await mockRatings(page);
    await mockComments(page);
    await page.goto('/recipes/thai-green-curry');

    await page.getByRole('radio', { name: '5 stars' }).click();
    await expect(page.getByText('Thanks for rating!')).toBeVisible();
  });

  test('submitting a comment shows a pending-review note', async ({ page }) => {
    await mockRatings(page);
    await mockComments(page);
    await page.goto('/recipes/thai-green-curry');

    await page.getByLabel('Name').fill('Sam');
    await page.getByLabel('Comment', { exact: true }).fill('Loved this recipe, so good!');
    await page.getByRole('button', { name: 'Post comment' }).click();
    await expect(page.getByText(/awaiting review/i)).toBeVisible();
  });

  test('rate-limited comment surfaces a toast', async ({ page }) => {
    await mockRatings(page);
    await mockComments(page, 429);
    await page.goto('/recipes/thai-green-curry');

    await page.getByLabel('Name').fill('Sam');
    await page.getByLabel('Comment', { exact: true }).fill('Loved this recipe, so good!');
    await page.getByRole('button', { name: 'Post comment' }).click();
    await expect(page.getByText(/commenting too quickly/i)).toBeVisible();
  });
});
