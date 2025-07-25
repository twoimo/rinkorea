import { test, expect } from './fixtures/auth';

test.describe('Vector Management System', () => {
  test.describe('Admin Access and Authentication', () => {
    test('should allow admin to access vector management page', async ({ adminPage }) => {
      // Navigate to vector management page
      await adminPage.goto('/admin/vector-management');
      
      // Should not be redirected to access denied page
      await expect(adminPage).not.toHaveURL(/.*access-denied.*/);
      
      // Should see the vector management interface
      await expect(adminPage.locator('h1, h2').filter({ hasText: /벡터|Vector/ })).toBeVisible();
      
      // Should see the main tabs (Collections, Documents, Search)
      await expect(adminPage.locator('[role="tablist"]')).toBeVisible();
      await expect(adminPage.locator('[role="tab"]').filter({ hasText: /컬렉션|Collection/ })).toBeVisible();
      await expect(adminPage.locator('[role="tab"]').filter({ hasText: /문서|Document/ })).toBeVisible();
      await expect(adminPage.locator('[role="tab"]').filter({ hasText: /검색|Search/ })).toBeVisible();
    });

    test('should show admin menu with vector management link', async ({ adminPage }) => {
      await adminPage.goto('/');
      
      // Click on user menu
      await adminPage.click('[data-testid="user-menu"]');
      
      // Should see admin dropdown menu
      await expect(adminPage.locator('[data-testid="admin-dropdown"]')).toBeVisible();
      
      // Should see vector management link
      const vectorManagementLink = adminPage.locator('a').filter({ hasText: /벡터.*관리|Vector.*Management/ });
      await expect(vectorManagementLink).toBeVisible();
      
      // Click on vector management link
      await vectorManagementLink.click();
      
      // Should navigate to vector management page
      await expect(adminPage).toHaveURL(/.*\/admin\/vector-management.*/);
    });
  });

  test.describe('Unauthorized Access Prevention', () => {
    test('should deny access to non-admin users', async ({ regularUserPage }) => {
      // Try to access vector management page as regular user
      await regularUserPage.goto('/admin/vector-management');
      
      // Should be redirected or show access denied
      const isAccessDenied = await regularUserPage.locator('text=접근 권한이 없습니다, text=Access Denied, text=권한이 없습니다').isVisible();
      const isRedirected = !regularUserPage.url().includes('/admin/vector-management');
      
      expect(isAccessDenied || isRedirected).toBeTruthy();
      
      // Should not see vector management interface
      await expect(regularUserPage.locator('h1, h2').filter({ hasText: /벡터.*관리|Vector.*Management/ })).not.toBeVisible();
    });

    test('should not show admin menu to regular users', async ({ regularUserPage }) => {
      await regularUserPage.goto('/');
      
      // Click on user menu
      await regularUserPage.click('[data-testid="user-menu"]');
      
      // Should not see admin dropdown or vector management link
      const adminDropdown = regularUserPage.locator('[data-testid="admin-dropdown"]');
      const vectorManagementLink = regularUserPage.locator('a').filter({ hasText: /벡터.*관리|Vector.*Management/ });
      
      const hasAdminDropdown = await adminDropdown.isVisible().catch(() => false);
      const hasVectorLink = await vectorManagementLink.isVisible().catch(() => false);
      
      expect(hasAdminDropdown && hasVectorLink).toBeFalsy();
    });
  });

  test.describe('Collection Management Workflow', () => {
    test('should create a new collection', async ({ adminPage }) => {
      await adminPage.goto('/admin/vector-management');
      
      // Make sure we're on the collections tab
      const collectionsTab = adminPage.locator('[role="tab"]').filter({ hasText: /컬렉션|Collection/ });
      await collectionsTab.click();
      
      // Click create collection button
      const createButton = adminPage.locator('button').filter({ hasText: /생성|Create|추가|Add/ });
      await createButton.first().click();
      
      // Fill in collection form
      const testCollectionName = `Test Collection ${Date.now()}`;
      const testCollectionDescription = 'E2E test collection description';
      
      await adminPage.fill('input[name="name"], input[placeholder*="이름"], input[placeholder*="name"]', testCollectionName);
      await adminPage.fill('textarea[name="description"], textarea[placeholder*="설명"], textarea[placeholder*="description"]', testCollectionDescription);
      
      // Submit the form
      const submitButton = adminPage.locator('button[type="submit"], button').filter({ hasText: /저장|Save|생성|Create/ });
      await submitButton.click();
      
      // Should see success message or the new collection in the list
      const successMessage = adminPage.locator('text=성공, text=Success, text=생성되었습니다, text=created');
      const newCollectionInList = adminPage.locator('text=' + testCollectionName);
      
      const hasSuccess = await successMessage.isVisible({ timeout: 5000 }).catch(() => false);
      const hasNewCollection = await newCollectionInList.isVisible({ timeout: 5000 }).catch(() => false);
      
      expect(hasSuccess || hasNewCollection).toBeTruthy();
    });

    test('should display collection list with statistics', async ({ adminPage }) => {
      await adminPage.goto('/admin/vector-management');
      
      // Navigate to collections tab
      const collectionsTab = adminPage.locator('[role="tab"]').filter({ hasText: /컬렉션|Collection/ });
      await collectionsTab.click();
      
      // Should see collections list or empty state
      const collectionsList = adminPage.locator('[data-testid="collections-list"], .collections-list');
      const emptyState = adminPage.locator('text=컬렉션이 없습니다, text=No collections, text=Empty');
      
      const hasCollections = await collectionsList.isVisible().catch(() => false);
      const isEmpty = await emptyState.isVisible().catch(() => false);
      
      expect(hasCollections || isEmpty).toBeTruthy();
      
      // If there are collections, check for statistics
      if (hasCollections) {
        // Should see collection statistics (document count, etc.)
        const statsElements = adminPage.locator('text=/\\d+.*문서|\\d+.*documents|\\d+.*개/');
        const hasStats = await statsElements.first().isVisible().catch(() => false);
        expect(hasStats).toBeTruthy();
      }
    });

    test('should edit an existing collection', async ({ adminPage }) => {
      await adminPage.goto('/admin/vector-management');
      
      // Navigate to collections tab
      const collectionsTab = adminPage.locator('[role="tab"]').filter({ hasText: /컬렉션|Collection/ });
      await collectionsTab.click();
      
      // First create a collection to edit
      const createButton = adminPage.locator('button').filter({ hasText: /생성|Create|추가|Add/ });
      if (await createButton.first().isVisible()) {
        await createButton.first().click();
        
        const testCollectionName = `Edit Test Collection ${Date.now()}`;
        await adminPage.fill('input[name="name"], input[placeholder*="이름"], input[placeholder*="name"]', testCollectionName);
        await adminPage.fill('textarea[name="description"], textarea[placeholder*="설명"], textarea[placeholder*="description"]', 'Original description');
        
        const submitButton = adminPage.locator('button[type="submit"], button').filter({ hasText: /저장|Save|생성|Create/ });
        await submitButton.click();
        
        // Wait for collection to be created
        await adminPage.waitForTimeout(1000);
      }
      
      // Look for edit button on any collection
      const editButton = adminPage.locator('button').filter({ hasText: /수정|Edit/ }).first();
      if (await editButton.isVisible()) {
        await editButton.click();
        
        // Modify the description
        const descriptionField = adminPage.locator('textarea[name="description"], textarea[placeholder*="설명"], textarea[placeholder*="description"]');
        await descriptionField.clear();
        await descriptionField.fill('Updated description via E2E test');
        
        // Save changes
        const saveButton = adminPage.locator('button[type="submit"], button').filter({ hasText: /저장|Save|수정|Update/ });
        await saveButton.click();
        
        // Should see success message
        const successMessage = adminPage.locator('text=성공, text=Success, text=수정되었습니다, text=updated');
        const hasSuccess = await successMessage.isVisible({ timeout: 5000 }).catch(() => false);
        expect(hasSuccess).toBeTruthy();
      }
    });

    test('should delete a collection with confirmation', async ({ adminPage }) => {
      await adminPage.goto('/admin/vector-management');
      
      // Navigate to collections tab
      const collectionsTab = adminPage.locator('[role="tab"]').filter({ hasText: /컬렉션|Collection/ });
      await collectionsTab.click();
      
      // First create a collection to delete
      const createButton = adminPage.locator('button').filter({ hasText: /생성|Create|추가|Add/ });
      if (await createButton.first().isVisible()) {
        await createButton.first().click();
        
        const testCollectionName = `Delete Test Collection ${Date.now()}`;
        await adminPage.fill('input[name="name"], input[placeholder*="이름"], input[placeholder*="name"]', testCollectionName);
        
        const submitButton = adminPage.locator('button[type="submit"], button').filter({ hasText: /저장|Save|생성|Create/ });
        await submitButton.click();
        
        // Wait for collection to be created
        await adminPage.waitForTimeout(1000);
        
        // Look for delete button
        const deleteButton = adminPage.locator('button').filter({ hasText: /삭제|Delete/ }).first();
        if (await deleteButton.isVisible()) {
          await deleteButton.click();
          
          // Should see confirmation dialog
          const confirmDialog = adminPage.locator('[role="dialog"], .dialog');
          await expect(confirmDialog).toBeVisible();
          
          // Confirm deletion
          const confirmButton = adminPage.locator('button').filter({ hasText: /확인|Confirm|삭제|Delete/ }).last();
          await confirmButton.click();
          
          // Should see success message
          const successMessage = adminPage.locator('text=성공, text=Success, text=삭제되었습니다, text=deleted');
          const hasSuccess = await successMessage.isVisible({ timeout: 5000 }).catch(() => false);
          expect(hasSuccess).toBeTruthy();
        }
      }
    });
  });

  test.describe('Navigation and UI Elements', () => {
    test('should have proper tab navigation', async ({ adminPage }) => {
      await adminPage.goto('/admin/vector-management');
      
      // Test tab switching
      const collectionsTab = adminPage.locator('[role="tab"]').filter({ hasText: /컬렉션|Collection/ });
      const documentsTab = adminPage.locator('[role="tab"]').filter({ hasText: /문서|Document/ });
      const searchTab = adminPage.locator('[role="tab"]').filter({ hasText: /검색|Search/ });
      
      // Click on documents tab
      await documentsTab.click();
      await expect(documentsTab).toHaveAttribute('aria-selected', 'true');
      
      // Click on search tab
      await searchTab.click();
      await expect(searchTab).toHaveAttribute('aria-selected', 'true');
      
      // Click back to collections tab
      await collectionsTab.click();
      await expect(collectionsTab).toHaveAttribute('aria-selected', 'true');
    });

    test('should display loading states appropriately', async ({ adminPage }) => {
      await adminPage.goto('/admin/vector-management');
      
      // Should see loading spinner initially or content
      const loadingSpinner = adminPage.locator('[data-testid="loading-spinner"], .loading, .spinner');
      const content = adminPage.locator('[role="tabpanel"]');
      
      const hasLoading = await loadingSpinner.isVisible().catch(() => false);
      const hasContent = await content.isVisible().catch(() => false);
      
      // Either loading or content should be visible
      expect(hasLoading || hasContent).toBeTruthy();
      
      // If loading was visible, content should appear after loading
      if (hasLoading) {
        await expect(content).toBeVisible({ timeout: 10000 });
      }
    });
  });
});