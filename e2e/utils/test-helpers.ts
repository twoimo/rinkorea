import { Page, expect } from '@playwright/test';

/**
 * Helper functions for E2E tests
 */

/**
 * Wait for element to be visible with retry logic
 */
export async function waitForElement(page: Page, selector: string, timeout = 10000) {
  try {
    await page.waitForSelector(selector, { timeout });
    return true;
  } catch {
    return false;
  }
}

/**
 * Check if user is logged in by looking for user menu
 */
export async function isUserLoggedIn(page: Page): Promise<boolean> {
  try {
    return await page.locator('[data-testid="user-menu"]').isVisible();
  } catch {
    return false;
  }
}

/**
 * Login helper function
 */
export async function loginUser(page: Page, email: string, password: string) {
  // Check if already logged in
  if (await isUserLoggedIn(page)) {
    return;
  }

  // Look for login button
  const loginButton = page.locator('button:has-text("로그인"), button:has-text("Login")').first();
  if (await loginButton.isVisible()) {
    await loginButton.click();
  }

  // Fill login form
  await page.fill('input[type="email"], input[name="email"]', email);
  await page.fill('input[type="password"], input[name="password"]', password);
  
  // Submit form
  await page.click('button[type="submit"], button:has-text("로그인"), button:has-text("Login")');
  
  // Wait for login to complete
  await page.waitForSelector('[data-testid="user-menu"]', { timeout: 10000 });
}

/**
 * Navigate to vector management page and verify access
 */
export async function navigateToVectorManagement(page: Page) {
  await page.goto('/admin/vector-management');
  
  // Verify we're on the right page
  await expect(page.locator('h1, h2').filter({ hasText: /벡터|Vector/ })).toBeVisible();
}

/**
 * Switch to a specific tab in vector management
 */
export async function switchToTab(page: Page, tabName: 'collections' | 'documents' | 'search') {
  const tabSelectors = {
    collections: '[role="tab"]',
    documents: '[role="tab"]',
    search: '[role="tab"]'
  };
  
  const tab = page.locator(tabSelectors[tabName]);
  await tab.click();
  await expect(tab).toHaveAttribute('aria-selected', 'true');
}

/**
 * Create a test collection
 */
export async function createTestCollection(page: Page, name?: string, description?: string) {
  const collectionName = name || `Test Collection ${Date.now()}`;
  const collectionDescription = description || 'E2E test collection';
  
  // Click create button
  const createButton = page.locator('button').filter({ hasText: /생성|Create|추가|Add/ });
  await createButton.first().click();
  
  // Fill form
  await page.fill('input[name="name"], input[placeholder*="이름"], input[placeholder*="name"]', collectionName);
  await page.fill('textarea[name="description"], textarea[placeholder*="설명"], textarea[placeholder*="description"]', collectionDescription);
  
  // Submit
  const submitButton = page.locator('button[type="submit"], button').filter({ hasText: /저장|Save|생성|Create/ });
  await submitButton.click();
  
  return { name: collectionName, description: collectionDescription };
}

/**
 * Wait for success message to appear
 */
export async function waitForSuccessMessage(page: Page, timeout = 5000): Promise<boolean> {
  try {
    const successMessage = page.locator('text=성공, text=Success, text=생성되었습니다, text=created, text=수정되었습니다, text=updated, text=삭제되었습니다, text=deleted');
    await successMessage.waitFor({ timeout });
    return true;
  } catch {
    return false;
  }
}

/**
 * Check if element contains any of the given text patterns
 */
export async function hasAnyText(page: Page, selector: string, textPatterns: string[]): Promise<boolean> {
  try {
    for (const pattern of textPatterns) {
      const element = page.locator(selector).filter({ hasText: new RegExp(pattern, 'i') });
      if (await element.isVisible()) {
        return true;
      }
    }
    return false;
  } catch {
    return false;
  }
}

/**
 * Dismiss any modal or dialog that might be open
 */
export async function dismissModal(page: Page) {
  const closeButtons = [
    'button[aria-label="Close"]',
    'button[aria-label="닫기"]',
    '[data-testid="close-button"]',
    '.modal button:has-text("닫기")',
    '.modal button:has-text("Close")',
    '.dialog button:has-text("취소")',
    '.dialog button:has-text("Cancel")'
  ];
  
  for (const selector of closeButtons) {
    const button = page.locator(selector);
    if (await button.isVisible()) {
      await button.click();
      break;
    }
  }
}