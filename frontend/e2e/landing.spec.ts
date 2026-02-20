import { test, expect } from '@playwright/test';

test.describe('Landing page', () => {
  test('should render headline and CTA', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.getByRole('link', { name: /get started|sign in|начать/i })).toBeVisible();
  });

  test('should navigate to login', async ({ page }) => {
    await page.goto('/');
    await page.click('a[href="/login"]');
    await expect(page).toHaveURL('/login');
  });
});
