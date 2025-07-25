import { test, expect } from '@playwright/test';

test.describe('E2E Setup Verification', () => {
  test('playwright is properly configured', async ({ page }) => {
    // Test that Playwright can navigate to a basic page
    await page.goto('https://example.com');
    
    // Should be able to find basic elements
    await expect(page.locator('h1')).toBeVisible();
    
    // Should be able to interact with the page
    const title = await page.title();
    expect(title).toContain('Example');
  });

  test('browser context works correctly', async ({ page, context }) => {
    // Test browser context functionality
    await page.goto('https://httpbin.org/json');
    
    // Should be able to read JSON response
    const content = await page.textContent('pre');
    expect(content).toContain('slideshow');
  });

  test('can handle basic interactions', async ({ page }) => {
    await page.goto('https://httpbin.org/forms/post');
    
    // Should be able to fill forms
    await page.fill('input[name="custname"]', 'Test User');
    await page.fill('input[name="custtel"]', '123-456-7890');
    await page.fill('input[name="custemail"]', 'test@example.com');
    
    // Should be able to select options
    await page.selectOption('select[name="size"]', 'medium');
    
    // Form elements should have the expected values
    await expect(page.locator('input[name="custname"]')).toHaveValue('Test User');
    await expect(page.locator('select[name="size"]')).toHaveValue('medium');
  });
});