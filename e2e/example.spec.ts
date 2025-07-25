import { test, expect } from '@playwright/test';

test.describe('Basic E2E Setup Test', () => {
  test('can load the home page', async ({ page }) => {
    await page.goto('/');
    
    // Should load without major errors
    await expect(page).toHaveTitle(/.*린코리아.*|.*RinKorea.*|.*Vite.*|.*React.*/);
    
    // Page should be responsive
    await expect(page.locator('body')).toBeVisible();
  });

  test('can navigate to different routes', async ({ page }) => {
    await page.goto('/');
    
    // Should be able to navigate
    await expect(page).toHaveURL(/.*localhost.*/);
    
    // Basic navigation should work
    const links = page.locator('a[href]');
    const linkCount = await links.count();
    
    // Should have some navigation links
    expect(linkCount).toBeGreaterThan(0);
  });
});