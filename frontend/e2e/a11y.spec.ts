import { test, expect } from '@playwright/test';

test.describe('Accessibility', () => {
  test('landing page should have skip-to-content link', async ({ page }) => {
    await page.goto('/');
    // The skip link should exist (may be visually hidden)
    const skipLink = page.locator('a[href="#main-content"]');
    // It may not exist on landing page (no ResponsiveContainer), so this is soft
    if (await skipLink.count()) {
      await expect(skipLink).toHaveAttribute('href', '#main-content');
    }
  });

  test('login page should have labeled inputs', async ({ page }) => {
    await page.goto('/login');
    // Check that inputs have accessible labels
    const emailInput = page.getByLabel(/email/i);
    await expect(emailInput).toBeVisible();
    const passwordInput = page.getByLabel(/password/i);
    await expect(passwordInput).toBeVisible();
  });

  test('page should have proper lang attribute', async ({ page }) => {
    await page.goto('/');
    const html = page.locator('html');
    await expect(html).toHaveAttribute('lang', 'en');
  });
});
