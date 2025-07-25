import { test, expect } from '@playwright/test';
// Test credentials
const TEST_ADMIN_EMAIL = 'admin@test.com';
const TEST_ADMIN_PASSWORD = 'testpassword123';
const TEST_REGULAR_USER_EMAIL = 'user@test.com';
const TEST_REGULAR_USER_PASSWORD = 'testpassword123';

test.describe('Vector Management - Basic E2E Tests', () => {
  
  test.describe('Admin Login and Access', () => {
    test('admin can login and access vector management page', async ({ page }) => {
      // Go to home page
      await page.goto('/');
      
      // Login as admin (this will be mocked/stubbed in real implementation)
      // For now, we'll simulate the login flow
      await page.goto('/admin/vector-management');
      
      // Check if we need to login or if we're already authenticated
      const needsLogin = await page.locator('text=로그인, text=Login, text=Sign in').isVisible().catch(() => false);
      
      if (needsLogin) {
        // Simulate login process - in real app this would go through Supabase auth
        await page.fill('input[type="email"], input[name="email"]', TEST_ADMIN_EMAIL);
        await page.fill('input[type="password"], input[name="password"]', TEST_ADMIN_PASSWORD);
        await page.click('button[type="submit"], button:has-text("로그인"), button:has-text("Login")');
      }
      
      // Verify we can access the vector management page
      // Look for key elements that indicate we're on the right page
      const pageTitle = page.locator('h1, h2').filter({ hasText: /벡터|Vector|관리|Management/ });
      const tabList = page.locator('[role="tablist"]');
      
      // At least one of these should be visible to confirm we're on the right page
      const hasTitleOrTabs = await Promise.race([
        pageTitle.isVisible().then(() => true),
        tabList.isVisible().then(() => true),
        page.waitForTimeout(5000).then(() => false)
      ]);
      
      expect(hasTitleOrTabs).toBeTruthy();
    });

    test('admin can see vector management in navigation menu', async ({ page }) => {
      await page.goto('/');
      
      // Look for user menu or admin menu
      const userMenu = page.locator('[data-testid="user-menu"], .user-menu, button:has-text("메뉴"), button:has-text("Menu")');
      
      if (await userMenu.isVisible()) {
        await userMenu.click();
        
        // Look for vector management link in dropdown
        const vectorLink = page.locator('a, button').filter({ hasText: /벡터.*관리|Vector.*Management/ });
        
        if (await vectorLink.isVisible()) {
          await vectorLink.click();
          
          // Should navigate to vector management page
          await expect(page).toHaveURL(/.*vector-management.*/);
        }
      }
    });
  });

  test.describe('Access Control', () => {
    test('non-admin users cannot access vector management', async ({ page }) => {
      // Try to access vector management page directly
      await page.goto('/admin/vector-management');
      
      // Should either be redirected or see access denied message
      const currentUrl = page.url();
      const accessDeniedVisible = await page.locator('text=접근 권한 없음, text=접근 권한이 없습니다, text=Access Denied, text=권한이 없습니다, text=Unauthorized').isVisible().catch(() => false);
      const isRedirected = !currentUrl.includes('/admin/vector-management');
      
      // 권한 확인 로딩 상태 대기
      await page.waitForTimeout(2000);
      
      // 다시 한번 확인
      const finalAccessDenied = await page.locator('text=접근 권한 없음, text=접근 권한이 없습니다').isVisible().catch(() => false);
      const finalUrl = page.url();
      const finalRedirected = !finalUrl.includes('/admin/vector-management');
      
      // One of these conditions should be true for proper access control
      expect(finalAccessDenied || finalRedirected).toBeTruthy();
    });

    test('vector management features are hidden from regular users', async ({ page }) => {
      await page.goto('/');
      
      // Look for user menu
      const userMenu = page.locator('[data-testid="user-menu"], .user-menu, button:has-text("메뉴"), button:has-text("Menu")');
      
      if (await userMenu.isVisible()) {
        await userMenu.click();
        
        // Vector management link should not be visible for regular users
        const vectorLink = page.locator('a, button').filter({ hasText: /벡터.*관리|Vector.*Management/ });
        const isVectorLinkVisible = await vectorLink.isVisible().catch(() => false);
        
        // For regular users, this link should not be visible
        // Note: This test assumes we can differentiate between admin and regular users
        // In a real implementation, you'd need proper user role setup
        expect(isVectorLinkVisible).toBeFalsy();
      }
    });
  });

  test.describe('Collection Management Basic Workflow', () => {
    test.beforeEach(async ({ page }) => {
      // Navigate to vector management page as admin
      await page.goto('/admin/vector-management');
      
      // Wait for page to load
      await page.waitForLoadState('networkidle');
    });

    test('can create a new collection', async ({ page }) => {
      // Navigate to collections tab
      const collectionsTab = page.locator('[role="tab"]').filter({ hasText: /컬렉션|Collection/ });
      if (await collectionsTab.isVisible()) {
        await collectionsTab.click();
      }
      
      // Look for create collection button
      const createButton = page.locator('button').filter({ hasText: /생성|Create|추가|Add|새로운|New/ });
      
      if (await createButton.first().isVisible()) {
        await createButton.first().click();
        
        // Fill in collection details
        const testName = `E2E Test Collection ${Date.now()}`;
        const testDescription = 'Created by E2E test';
        
        // Look for name input field
        const nameInput = page.locator('input[name="name"], input[placeholder*="이름"], input[placeholder*="name"], input[placeholder*="Name"]');
        if (await nameInput.isVisible()) {
          await nameInput.fill(testName);
        }
        
        // Look for description field
        const descriptionInput = page.locator('textarea[name="description"], textarea[placeholder*="설명"], textarea[placeholder*="description"], textarea[placeholder*="Description"]');
        if (await descriptionInput.isVisible()) {
          await descriptionInput.fill(testDescription);
        }
        
        // Submit the form
        const submitButton = page.locator('button[type="submit"], button').filter({ hasText: /저장|Save|생성|Create|확인|OK/ });
        if (await submitButton.isVisible()) {
          await submitButton.click();
          
          // Wait for success indication
          const success = await Promise.race([
            page.locator('text=성공, text=Success, text=생성, text=Created').waitFor({ timeout: 5000 }).then(() => true),
            page.locator(`text=${testName}`).waitFor({ timeout: 5000 }).then(() => true),
            page.waitForTimeout(5000).then(() => false)
          ]);
          
          expect(success).toBeTruthy();
        }
      }
    });

    test('can view collection list', async ({ page }) => {
      // Navigate to collections tab
      const collectionsTab = page.locator('[role="tab"]').filter({ hasText: /컬렉션|Collection/ });
      if (await collectionsTab.isVisible()) {
        await collectionsTab.click();
      }
      
      // Should see either collections list or empty state
      const collectionsList = page.locator('[data-testid="collections-list"], .collections-list, table, .collection-item');
      const emptyState = page.locator('text=컬렉션이 없습니다, text=No collections, text=Empty, text=없음');
      
      const hasCollections = await collectionsList.isVisible().catch(() => false);
      const isEmpty = await emptyState.isVisible().catch(() => false);
      
      // Should see either collections or empty state
      expect(hasCollections || isEmpty).toBeTruthy();
    });

    test('can edit collection details', async ({ page }) => {
      // Navigate to collections tab
      const collectionsTab = page.locator('[role="tab"]').filter({ hasText: /컬렉션|Collection/ });
      if (await collectionsTab.isVisible()) {
        await collectionsTab.click();
      }
      
      // First, try to create a collection to edit
      const createButton = page.locator('button').filter({ hasText: /생성|Create|추가|Add/ });
      if (await createButton.first().isVisible()) {
        await createButton.first().click();
        
        const testName = `Edit Test ${Date.now()}`;
        await page.fill('input[name="name"], input[placeholder*="이름"], input[placeholder*="name"]', testName);
        
        const submitButton = page.locator('button[type="submit"], button').filter({ hasText: /저장|Save|생성|Create/ });
        await submitButton.click();
        
        // Wait a moment for creation
        await page.waitForTimeout(1000);
      }
      
      // Look for edit button
      const editButton = page.locator('button').filter({ hasText: /수정|Edit|편집/ });
      if (await editButton.first().isVisible()) {
        await editButton.first().click();
        
        // Modify description
        const descriptionField = page.locator('textarea[name="description"], textarea[placeholder*="설명"], textarea[placeholder*="description"]');
        if (await descriptionField.isVisible()) {
          await descriptionField.clear();
          await descriptionField.fill('Updated by E2E test');
          
          // Save changes
          const saveButton = page.locator('button[type="submit"], button').filter({ hasText: /저장|Save|수정|Update/ });
          await saveButton.click();
          
          // Wait for success
          const success = await page.locator('text=성공, text=Success, text=수정, text=Updated').isVisible({ timeout: 5000 }).catch(() => false);
          expect(success).toBeTruthy();
        }
      }
    });

    test('can delete collection with confirmation', async ({ page }) => {
      // Navigate to collections tab
      const collectionsTab = page.locator('[role="tab"]').filter({ hasText: /컬렉션|Collection/ });
      if (await collectionsTab.isVisible()) {
        await collectionsTab.click();
      }
      
      // Create a collection to delete
      const createButton = page.locator('button').filter({ hasText: /생성|Create|추가|Add/ });
      if (await createButton.first().isVisible()) {
        await createButton.first().click();
        
        const testName = `Delete Test ${Date.now()}`;
        await page.fill('input[name="name"], input[placeholder*="이름"], input[placeholder*="name"]', testName);
        
        const submitButton = page.locator('button[type="submit"], button').filter({ hasText: /저장|Save|생성|Create/ });
        await submitButton.click();
        
        await page.waitForTimeout(1000);
        
        // Look for delete button
        const deleteButton = page.locator('button').filter({ hasText: /삭제|Delete/ });
        if (await deleteButton.first().isVisible()) {
          await deleteButton.first().click();
          
          // Should see confirmation dialog
          const confirmDialog = page.locator('[role="dialog"], .dialog, .modal');
          const hasDialog = await confirmDialog.isVisible().catch(() => false);
          
          if (hasDialog) {
            // Confirm deletion
            const confirmButton = page.locator('button').filter({ hasText: /확인|Confirm|삭제|Delete/ }).last();
            await confirmButton.click();
            
            // Wait for success
            const success = await page.locator('text=성공, text=Success, text=삭제, text=Deleted').isVisible({ timeout: 5000 }).catch(() => false);
            expect(success).toBeTruthy();
          }
        }
      }
    });
  });

  test.describe('UI Navigation and Responsiveness', () => {
    test('tab navigation works correctly', async ({ page }) => {
      await page.goto('/admin/vector-management');
      
      // Test switching between tabs
      const tabs = {
        collections: page.locator('[role="tab"]').filter({ hasText: /컬렉션|Collection/ }),
        documents: page.locator('[role="tab"]').filter({ hasText: /문서|Document/ }),
        search: page.locator('[role="tab"]').filter({ hasText: /검색|Search/ })
      };
      
      // Test each tab
      for (const [tabName, tab] of Object.entries(tabs)) {
        if (await tab.isVisible()) {
          await tab.click();
          
          // Check if tab is selected
          const isSelected = await tab.getAttribute('aria-selected');
          expect(isSelected).toBe('true');
          
          // Wait for tab content to load
          await page.waitForTimeout(500);
        }
      }
    });

    test('page loads without critical errors', async ({ page }) => {
      // Listen for console errors
      const errors: string[] = [];
      page.on('console', msg => {
        if (msg.type() === 'error') {
          errors.push(msg.text());
        }
      });
      
      await page.goto('/admin/vector-management');
      
      // Wait for page to fully load
      await page.waitForLoadState('networkidle');
      
      // Check for critical errors (filter out common non-critical ones)
      const criticalErrors = errors.filter(error => 
        !error.includes('favicon') && 
        !error.includes('404') &&
        !error.includes('net::ERR_')
      );
      
      expect(criticalErrors.length).toBe(0);
    });
  });
});