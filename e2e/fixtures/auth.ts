import { test as base, expect } from '@playwright/test';

// Test user credentials for E2E testing
export const TEST_ADMIN_EMAIL = 'admin@test.com';
export const TEST_ADMIN_PASSWORD = 'testpassword123';
export const TEST_REGULAR_USER_EMAIL = 'user@test.com';
export const TEST_REGULAR_USER_PASSWORD = 'testpassword123';

type AuthFixtures = {
  adminPage: any;
  regularUserPage: any;
};

export const test = base.extend<AuthFixtures>({
  adminPage: async ({ browser }, use) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    
    // Navigate to login page and login as admin
    await page.goto('/');
    
    // Check if already logged in by looking for logout button or admin features
    const isLoggedIn = await page.locator('[data-testid="user-menu"]').isVisible().catch(() => false);
    
    if (!isLoggedIn) {
      // Look for login button or form
      const loginButton = page.locator('button:has-text("로그인"), button:has-text("Login")').first();
      if (await loginButton.isVisible()) {
        await loginButton.click();
      }
      
      // Fill in login form (adjust selectors based on your actual login form)
      await page.fill('input[type="email"], input[name="email"]', TEST_ADMIN_EMAIL);
      await page.fill('input[type="password"], input[name="password"]', TEST_ADMIN_PASSWORD);
      await page.click('button[type="submit"], button:has-text("로그인"), button:has-text("Login")');
      
      // Wait for login to complete
      await page.waitForSelector('[data-testid="user-menu"]', { timeout: 10000 });
    }
    
    await use(page);
    await context.close();
  },

  regularUserPage: async ({ browser }, use) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    
    // Navigate to login page and login as regular user
    await page.goto('/');
    
    const isLoggedIn = await page.locator('[data-testid="user-menu"]').isVisible().catch(() => false);
    
    if (!isLoggedIn) {
      const loginButton = page.locator('button:has-text("로그인"), button:has-text("Login")').first();
      if (await loginButton.isVisible()) {
        await loginButton.click();
      }
      
      await page.fill('input[type="email"], input[name="email"]', TEST_REGULAR_USER_EMAIL);
      await page.fill('input[type="password"], input[name="password"]', TEST_REGULAR_USER_PASSWORD);
      await page.click('button[type="submit"], button:has-text("로그인"), button:has-text("Login")');
      
      await page.waitForSelector('[data-testid="user-menu"]', { timeout: 10000 });
    }
    
    await use(page);
    await context.close();
  },
});

export { expect } from '@playwright/test';