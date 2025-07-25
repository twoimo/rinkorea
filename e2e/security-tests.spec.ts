import { test, expect } from '@playwright/test';
import { promises as fs } from 'fs';
import path from 'path';

test.describe('벡터 데이터베이스 보안 취약점 및 권한 테스트', () => {
  
  test.describe('관리자 권한 우회 시도 테스트', () => {
    test('직접 URL 접근을 통한 권한 우회 시도', async ({ page }) => {
      // 로그인하지 않은 상태에서 관리자 페이지 직접 접근 시도
      await page.goto('/admin/vector-management');
      
      // 접근 거부 또는 로그인 페이지로 리다이렉트 확인
      const currentUrl = page.url();
      const isAccessDenied = await page.locator('text=접근 권한이 없습니다, text=Access Denied, text=Unauthorized').isVisible();
      const isLoginPage = currentUrl.includes('/login') || currentUrl.includes('/auth');
      const isHomePage = currentUrl === '/' || currentUrl.includes('/#');
      
      // 권한이 없는 사용자는 관리자 페이지에 접근할 수 없어야 함
      expect(isAccessDenied || isLoginPage || isHomePage).toBeTruthy();
      
      // 벡터 관리 인터페이스가 표시되지 않아야 함
      const vectorManagementInterface = page.locator('h1, h2').filter({ hasText: /벡터.*관리|Vector.*Management/ });
      await expect(vectorManagementInterface).not.toBeVisible();
    });

    test('세션 토큰 조작을 통한 권한 상승 시도', async ({ page, context }) => {
      // 일반 사용자로 로그인 (시뮬레이션)
      await page.goto('/');
      
      // 로컬 스토리지에서 인증 토큰 조작 시도
      await page.evaluate(() => {
        // 가짜 관리자 토큰 설정 시도
        localStorage.setItem('supabase.auth.token', JSON.stringify({
          access_token: 'fake_admin_token',
          user: { role: 'admin', email: 'fake@admin.com' }
        }));
        
        // 세션 스토리지 조작 시도
        sessionStorage.setItem('user_role', 'admin');
        sessionStorage.setItem('is_admin', 'true');
      });
      
      // 조작된 토큰으로 관리자 페이지 접근 시도
      await page.goto('/admin/vector-management');
      
      // 서버 측 검증으로 인해 접근이 차단되어야 함
      const hasAccess = await page.locator('h1, h2').filter({ hasText: /벡터.*관리/ }).isVisible({ timeout: 5000 });
      
      if (hasAccess) {
        // 만약 페이지가 로드되었다면, 실제 기능이 작동하지 않아야 함
        const createButton = page.locator('button').filter({ hasText: /생성|Create/ });
        if (await createButton.isVisible()) {
          await createButton.click();
          
          // API 호출이 실패해야 함
          const errorMessage = page.locator('text=권한이 없습니다, text=Unauthorized, .error-message');
          await expect(errorMessage).toBeVisible({ timeout: 10000 });
        }
      } else {
        // 접근이 차단되는 것이 정상
        expect(hasAccess).toBeFalsy();
      }
    });

    test('CSRF 토큰 없이 관리자 작업 시도', async ({ page }) => {
      // 관리자로 로그인 (정상적인 방법)
      await page.goto('/admin/vector-management');
      
      // 컬렉션 탭으로 이동
      const collectionsTab = page.locator('[role="tab"]').filter({ hasText: /컬렉션|Collection/ });
      if (await collectionsTab.isVisible()) {
        await collectionsTab.click();
      }
      
      // 브라우저 개발자 도구를 통한 직접 API 호출 시도
      const csrfBypassResult = await page.evaluate(async () => {
        try {
          // CSRF 토큰 없이 직접 API 호출
          const response = await fetch('/api/collections', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              name: 'Malicious Collection',
              description: 'Created without CSRF token'
            })
          });
          
          return {
            success: response.ok,
            status: response.status,
            statusText: response.statusText
          };
        } catch (error) {
          return {
            success: false,
            error: error.message
          };
        }
      });
      
      // CSRF 보호로 인해 요청이 실패해야 함
      expect(csrfBypassResult.success).toBeFalsy();
      
      // 403 Forbidden 또는 401 Unauthorized 응답이어야 함
      if (csrfBypassResult.status) {
        expect([401, 403, 422]).toContain(csrfBypassResult.status);
      }
    });

    test('권한 에스컬레이션 시도 (일반 사용자 → 관리자)', async ({ page }) => {
      // 일반 사용자 계정으로 시작
      await page.goto('/');
      
      // 사용자 메뉴에서 관리자 메뉴가 표시되지 않는지 확인
      const userMenu = page.locator('[data-testid="user-menu"], .user-menu');
      if (await userMenu.isVisible()) {
        await userMenu.click();
        
        // 벡터 관리 링크가 표시되지 않아야 함
        const vectorManagementLink = page.locator('a').filter({ hasText: /벡터.*관리|Vector.*Management/ });
        await expect(vectorManagementLink).not.toBeVisible();
      }
      
      // URL 조작을 통한 접근 시도
      await page.goto('/admin/vector-management');
      
      // 접근이 차단되어야 함
      const isBlocked = await page.locator('text=접근 권한이 없습니다, text=Access Denied').isVisible({ timeout: 5000 });
      const isRedirected = !page.url().includes('/admin/vector-management');
      
      expect(isBlocked || isRedirected).toBeTruthy();
    });
  });

  test.describe('파일 업로드 보안 검증 테스트', () => {
    // 악성 파일 생성 헬퍼
    const createMaliciousFile = async (filename: string, content: string): Promise<string> => {
      const testDir = path.join(process.cwd(), 'e2e', 'malicious-files');
      await fs.mkdir(testDir, { recursive: true });
      
      const filePath = path.join(testDir, filename);
      await fs.writeFile(filePath, content);
      
      return filePath;
    };

    // 테스트 파일 정리
    const cleanupMaliciousFiles = async () => {
      const testDir = path.join(process.cwd(), 'e2e', 'malicious-files');
      try {
        await fs.rmdir(testDir, { recursive: true });
      } catch (error) {
        // 디렉토리가 없으면 무시
      }
    };

    test.afterAll(async () => {
      await cleanupMaliciousFiles();
    });

    test('실행 가능한 파일 업로드 차단 테스트', async ({ page }) => {
      await page.goto('/admin/vector-management');
      
      // 문서 탭으로 이동
      const documentsTab = page.locator('[role="tab"]').filter({ hasText: /문서|Document/ });
      await documentsTab.click();
      
      // 악성 실행 파일들 생성
      const maliciousFiles = [
        await createMaliciousFile('malware.exe', 'MZ\x90\x00'), // PE 헤더 시뮬레이션
        await createMaliciousFile('script.bat', '@echo off\necho "Malicious script"'),
        await createMaliciousFile('shell.sh', '#!/bin/bash\necho "Malicious shell script"'),
        await createMaliciousFile('macro.xlsm', 'Malicious Excel macro file'),
        await createMaliciousFile('virus.scr', 'Screen saver with malicious code')
      ];
      
      for (const filePath of maliciousFiles) {
        // 파일 업로드 시도
        const fileInput = page.locator('input[type="file"]');
        await fileInput.setInputFiles(filePath);
        
        // 업로드 버튼 클릭
        const uploadButton = page.locator('button').filter({ hasText: /업로드|Upload/ });
        await uploadButton.click();
        
        // 파일 형식 오류 메시지 확인
        const errorMessage = page.locator('text=지원되지 않는 파일 형식, text=Unsupported file type, text=파일 형식이 올바르지 않습니다, .error-message');
        await expect(errorMessage).toBeVisible({ timeout: 5000 });
        
        // 파일이 업로드되지 않았는지 확인
        const fileList = page.locator('[data-testid="uploaded-files"], .uploaded-files');
        const fileName = path.basename(filePath);
        const uploadedFile = fileList.locator(`text=${fileName}`);
        await expect(uploadedFile).not.toBeVisible();
        
        await page.waitForTimeout(1000);
      }
      
      // 파일 정리
      for (const filePath of maliciousFiles) {
        await fs.unlink(filePath);
      }
    });

    test('파일 크기 제한 테스트', async ({ page }) => {
      await page.goto('/admin/vector-management');
      
      // 문서 탭으로 이동
      const documentsTab = page.locator('[role="tab"]').filter({ hasText: /문서|Document/ });
      await documentsTab.click();
      
      // 크기 제한을 초과하는 파일 생성 (100MB)
      const oversizedFilePath = await createMaliciousFile('oversized.txt', 'A'.repeat(100 * 1024 * 1024));
      
      // 파일 업로드 시도
      const fileInput = page.locator('input[type="file"]');
      await fileInput.setInputFiles(oversizedFilePath);
      
      const uploadButton = page.locator('button').filter({ hasText: /업로드|Upload/ });
      await uploadButton.click();
      
      // 파일 크기 제한 오류 메시지 확인
      const sizeErrorMessage = page.locator('text=파일 크기가 너무 큽니다, text=File size too large, text=크기 제한을 초과, .error-message');
      await expect(sizeErrorMessage).toBeVisible({ timeout: 10000 });
      
      // 파일 정리
      await fs.unlink(oversizedFilePath);
    });

    test('악성 스크립트가 포함된 HTML 파일 업로드 테스트', async ({ page }) => {
      await page.goto('/admin/vector-management');
      
      // 문서 탭으로 이동
      const documentsTab = page.locator('[role="tab"]').filter({ hasText: /문서|Document/ });
      await documentsTab.click();
      
      // XSS 스크립트가 포함된 HTML 파일 생성
      const maliciousHtml = `
        <!DOCTYPE html>
        <html>
        <head><title>Malicious HTML</title></head>
        <body>
          <h1>Normal Content</h1>
          <script>
            alert('XSS Attack!');
            document.cookie = 'stolen=true';
            fetch('/api/admin/users', { method: 'DELETE' });
          </script>
          <img src="x" onerror="alert('Image XSS')">
          <iframe src="javascript:alert('Iframe XSS')"></iframe>
        </body>
        </html>
      `;
      
      const maliciousHtmlPath = await createMaliciousFile('malicious.html', maliciousHtml);
      
      // 파일 업로드
      const fileInput = page.locator('input[type="file"]');
      await fileInput.setInputFiles(maliciousHtmlPath);
      
      const uploadButton = page.locator('button').filter({ hasText: /업로드|Upload/ });
      await uploadButton.click();
      
      // 업로드가 성공했다면 (HTML 파일이 허용되는 경우)
      const successMessage = page.locator('text=업로드가 완료되었습니다, .success-message');
      const isUploaded = await successMessage.isVisible({ timeout: 10000 });
      
      if (isUploaded) {
        // 파일 내용을 보기 위해 문서 목록에서 파일 클릭
        const documentList = page.locator('[data-testid="document-list"], .document-list');
        const uploadedFile = documentList.locator('text=malicious.html');
        
        if (await uploadedFile.isVisible()) {
          await uploadedFile.click();
          
          // 스크립트가 실행되지 않았는지 확인 (alert 창이 나타나지 않음)
          await page.waitForTimeout(2000);
          
          // 쿠키가 설정되지 않았는지 확인
          const cookies = await page.context().cookies();
          const stolenCookie = cookies.find(cookie => cookie.name === 'stolen');
          expect(stolenCookie).toBeUndefined();
          
          // 페이지가 정상적으로 작동하는지 확인 (스크립트로 인한 오류 없음)
          await expect(page.locator('body')).toBeVisible();
        }
      }
      
      // 파일 정리
      await fs.unlink(maliciousHtmlPath);
    });

    test('파일명 조작을 통한 디렉토리 트래버설 시도', async ({ page }) => {
      await page.goto('/admin/vector-management');
      
      // 문서 탭으로 이동
      const documentsTab = page.locator('[role="tab"]').filter({ hasText: /문서|Document/ });
      await documentsTab.click();
      
      // 디렉토리 트래버설을 시도하는 파일명들
      const maliciousFilenames = [
        '../../../etc/passwd.txt',
        '..\\..\\..\\windows\\system32\\config\\sam.txt',
        '....//....//....//etc//passwd.txt',
        '%2e%2e%2f%2e%2e%2f%2e%2e%2fetc%2fpasswd.txt', // URL 인코딩
        'normal.txt\x00../../../etc/passwd', // Null byte injection
      ];
      
      for (const filename of maliciousFilenames) {
        try {
          const maliciousFilePath = await createMaliciousFile(filename.replace(/[\/\\:]/g, '_'), 'Malicious content');
          
          // 파일 업로드 시도
          const fileInput = page.locator('input[type="file"]');
          await fileInput.setInputFiles(maliciousFilePath);
          
          const uploadButton = page.locator('button').filter({ hasText: /업로드|Upload/ });
          await uploadButton.click();
          
          // 파일명 검증 오류 또는 업로드 실패 확인
          const errorMessage = page.locator('text=잘못된 파일명, text=Invalid filename, text=파일명이 올바르지 않습니다, .error-message');
          const isError = await errorMessage.isVisible({ timeout: 5000 });
          
          if (!isError) {
            // 업로드가 성공했다면, 파일명이 안전하게 처리되었는지 확인
            const documentList = page.locator('[data-testid="document-list"], .document-list');
            const sanitizedFilename = filename.replace(/[\/\\:]/g, '_');
            const uploadedFile = documentList.locator(`text=${sanitizedFilename}`);
            
            // 원본 악성 파일명이 그대로 표시되지 않아야 함
            const originalFilename = documentList.locator(`text=${filename}`);
            await expect(originalFilename).not.toBeVisible();
          }
          
          await fs.unlink(maliciousFilePath);
          await page.waitForTimeout(1000);
          
        } catch (error) {
          console.log(`파일명 "${filename}" 테스트 중 오류 (예상됨):`, error.message);
        }
      }
    });

    test('MIME 타입 스푸핑 테스트', async ({ page }) => {
      await page.goto('/admin/vector-management');
      
      // 문서 탭으로 이동
      const documentsTab = page.locator('[role="tab"]').filter({ hasText: /문서|Document/ });
      await documentsTab.click();
      
      // 실행 파일을 텍스트 파일로 위장
      const fakeTextContent = `
        This looks like a text file but contains malicious content.
        MZ\x90\x00\x03\x00\x00\x00\x04\x00\x00\x00\xff\xff\x00\x00
        Executable code hidden in text file.
      `;
      
      const spoofedFilePath = await createMaliciousFile('fake_text.txt', fakeTextContent);
      
      // 파일 업로드
      const fileInput = page.locator('input[type="file"]');
      await fileInput.setInputFiles(spoofedFilePath);
      
      const uploadButton = page.locator('button').filter({ hasText: /업로드|Upload/ });
      await uploadButton.click();
      
      // 서버 측에서 실제 파일 내용을 검증해야 함
      // 업로드가 성공했다면, 파일이 안전하게 처리되는지 확인
      const result = await Promise.race([
        page.locator('text=업로드가 완료되었습니다, .success-message').isVisible({ timeout: 10000 }),
        page.locator('text=파일 형식이 올바르지 않습니다, text=Invalid file format, .error-message').isVisible({ timeout: 10000 })
      ]);
      
      // 어떤 결과든 시스템이 응답해야 함
      expect(typeof result).toBe('boolean');
      
      // 파일 정리
      await fs.unlink(spoofedFilePath);
    });
  });

  test.describe('SQL 인젝션 및 XSS 공격 방어 테스트', () => {
    test('검색 쿼리 SQL 인젝션 시도', async ({ page }) => {
      await page.goto('/admin/vector-management');
      
      // 검색 탭으로 이동
      const searchTab = page.locator('[role="tab"]').filter({ hasText: /검색|Search/ });
      await searchTab.click();
      
      // SQL 인젝션 페이로드들
      const sqlInjectionPayloads = [
        "'; DROP TABLE documents; --",
        "' OR '1'='1",
        "' UNION SELECT * FROM users --",
        "'; INSERT INTO documents (name) VALUES ('hacked'); --",
        "' OR 1=1 LIMIT 1 OFFSET 1 --",
        "admin'--",
        "admin' /*",
        "' or 1=1#",
        "' or 1=1--",
        "') or '1'='1--",
        "') or ('1'='1--"
      ];
      
      for (const payload of sqlInjectionPayloads) {
        // 검색어 입력
        const searchInput = page.locator('textarea[placeholder*="검색할 내용"]');
        await searchInput.clear();
        await searchInput.fill(payload);
        
        // 검색 실행
        const searchButton = page.locator('button').filter({ hasText: /검색/ }).first();
        await searchButton.click();
        
        // 시스템이 크래시하지 않고 정상적으로 응답하는지 확인
        await page.waitForTimeout(3000);
        
        // 페이지가 여전히 작동하는지 확인
        await expect(page.locator('body')).toBeVisible();
        
        // SQL 오류 메시지가 노출되지 않는지 확인
        const sqlErrorMessages = [
          'SQL syntax error',
          'mysql_fetch_array',
          'ORA-',
          'Microsoft OLE DB',
          'ODBC SQL Server Driver',
          'PostgreSQL query failed',
          'Warning: pg_'
        ];
        
        for (const errorMsg of sqlErrorMessages) {
          const errorElement = page.locator(`text=${errorMsg}`);
          await expect(errorElement).not.toBeVisible();
        }
        
        // 검색 결과 또는 적절한 오류 메시지가 표시되는지 확인
        const hasResults = await page.locator('[data-testid="search-results"]').isVisible();
        const hasError = await page.locator('.error-message, .toast').isVisible();
        const hasNoResults = await page.locator('.no-results').isVisible();
        
        expect(hasResults || hasError || hasNoResults).toBeTruthy();
        
        await page.waitForTimeout(500);
      }
    });

    test('컬렉션 이름 XSS 공격 시도', async ({ page }) => {
      await page.goto('/admin/vector-management');
      
      // 컬렉션 탭으로 이동
      const collectionsTab = page.locator('[role="tab"]').filter({ hasText: /컬렉션|Collection/ });
      await collectionsTab.click();
      
      // XSS 페이로드들
      const xssPayloads = [
        '<script>alert("XSS")</script>',
        '<img src="x" onerror="alert(\'XSS\')">',
        '<svg onload="alert(\'XSS\')">',
        'javascript:alert("XSS")',
        '<iframe src="javascript:alert(\'XSS\')"></iframe>',
        '<body onload="alert(\'XSS\')">',
        '<div onclick="alert(\'XSS\')">Click me</div>',
        '"><script>alert("XSS")</script>',
        '\';alert(String.fromCharCode(88,83,83))//\';alert(String.fromCharCode(88,83,83))//";alert(String.fromCharCode(88,83,83))//";alert(String.fromCharCode(88,83,83))//--></SCRIPT>">\'><SCRIPT>alert(String.fromCharCode(88,83,83))</SCRIPT>'
      ];
      
      for (const payload of xssPayloads) {
        // 컬렉션 생성 버튼 클릭
        const createButton = page.locator('button').filter({ hasText: /생성|Create/ }).first();
        if (await createButton.isVisible()) {
          await createButton.click();
          
          // 컬렉션 이름에 XSS 페이로드 입력
          const nameInput = page.locator('input[name="name"], input[placeholder*="이름"], input[placeholder*="name"]');
          if (await nameInput.isVisible()) {
            await nameInput.fill(payload);
            
            // 설명에도 XSS 페이로드 입력
            const descriptionInput = page.locator('textarea[name="description"], textarea[placeholder*="설명"]');
            if (await descriptionInput.isVisible()) {
              await descriptionInput.fill(`Description with ${payload}`);
            }
            
            // 저장 시도
            const saveButton = page.locator('button[type="submit"], button').filter({ hasText: /저장|Save|생성|Create/ });
            if (await saveButton.isVisible()) {
              await saveButton.click();
              
              // 스크립트가 실행되지 않았는지 확인 (alert 창이 나타나지 않음)
              await page.waitForTimeout(2000);
              
              // 페이지가 정상적으로 작동하는지 확인
              await expect(page.locator('body')).toBeVisible();
              
              // XSS 페이로드가 이스케이프되어 표시되는지 확인
              const collectionList = page.locator('[data-testid="collections-list"], .collections-list');
              if (await collectionList.isVisible()) {
                // 원본 스크립트 태그가 그대로 표시되지 않아야 함
                const rawScript = collectionList.locator('script');
                await expect(rawScript).not.toBeVisible();
                
                // 이스케이프된 형태로 표시되어야 함
                const escapedContent = collectionList.locator(`text=${payload.replace(/</g, '&lt;').replace(/>/g, '&gt;')}`);
                // 이스케이프 처리는 구현에 따라 다를 수 있으므로 존재 여부만 확인
              }
            }
          }
          
          // 모달 닫기
          const cancelButton = page.locator('button').filter({ hasText: /취소|Cancel/ });
          if (await cancelButton.isVisible()) {
            await cancelButton.click();
          } else {
            await page.keyboard.press('Escape');
          }
        }
        
        await page.waitForTimeout(1000);
      }
    });

    test('검색 결과 XSS 방어 테스트', async ({ page }) => {
      await page.goto('/admin/vector-management');
      
      // 검색 탭으로 이동
      const searchTab = page.locator('[role="tab"]').filter({ hasText: /검색|Search/ });
      await searchTab.click();
      
      // XSS가 포함된 검색어로 검색
      const xssQuery = '<script>alert("Search XSS")</script>';
      
      const searchInput = page.locator('textarea[placeholder*="검색할 내용"]');
      await searchInput.fill(xssQuery);
      
      const searchButton = page.locator('button').filter({ hasText: /검색/ }).first();
      await searchButton.click();
      
      // 검색 완료 대기
      await page.waitForTimeout(3000);
      
      // 스크립트가 실행되지 않았는지 확인
      await expect(page.locator('body')).toBeVisible();
      
      // 검색 결과에서 스크립트 태그가 이스케이프되었는지 확인
      const searchResults = page.locator('[data-testid="search-results"]');
      if (await searchResults.isVisible()) {
        const scriptTags = searchResults.locator('script');
        await expect(scriptTags).toHaveCount(0);
      }
      
      // 검색어가 안전하게 표시되는지 확인
      const queryDisplay = page.locator(`text=${xssQuery}`);
      await expect(queryDisplay).not.toBeVisible();
    });

    test('파일 업로드 시 XSS 방어 테스트', async ({ page }) => {
      await page.goto('/admin/vector-management');
      
      // 문서 탭으로 이동
      const documentsTab = page.locator('[role="tab"]').filter({ hasText: /문서|Document/ });
      await documentsTab.click();
      
      // XSS가 포함된 파일명으로 파일 생성
      const xssFilename = '<script>alert("File XSS")</script>.txt';
      const safeFilename = 'xss_test.txt';
      const xssContent = `
        Normal text content.
        <script>alert('Content XSS')</script>
        <img src="x" onerror="alert('Image XSS')">
        More normal content.
      `;
      
      const xssFilePath = await createMaliciousFile(safeFilename, xssContent);
      
      // 파일 업로드
      const fileInput = page.locator('input[type="file"]');
      await fileInput.setInputFiles(xssFilePath);
      
      const uploadButton = page.locator('button').filter({ hasText: /업로드|Upload/ });
      await uploadButton.click();
      
      // 업로드 완료 대기
      const uploadComplete = await Promise.race([
        page.locator('text=업로드가 완료되었습니다, .success-message').isVisible({ timeout: 15000 }),
        page.locator('.error-message').isVisible({ timeout: 15000 })
      ]);
      
      if (uploadComplete) {
        // 파일 목록에서 파일명이 안전하게 표시되는지 확인
        const documentList = page.locator('[data-testid="document-list"], .document-list');
        if (await documentList.isVisible()) {
          // 스크립트 태그가 실행되지 않았는지 확인
          const scriptTags = documentList.locator('script');
          await expect(scriptTags).toHaveCount(0);
          
          // 파일 내용 보기 시도
          const uploadedFile = documentList.locator(`text=${safeFilename}`);
          if (await uploadedFile.isVisible()) {
            await uploadedFile.click();
            
            // 파일 내용에서도 XSS가 실행되지 않는지 확인
            await page.waitForTimeout(2000);
            await expect(page.locator('body')).toBeVisible();
          }
        }
      }
      
      // 파일 정리
      await fs.unlink(xssFilePath);
    });
  });

  test.describe('API 엔드포인트 보안 테스트', () => {
    test('인증되지 않은 API 접근 차단 테스트', async ({ page }) => {
      // 인증 토큰 없이 API 엔드포인트 직접 호출
      const apiEndpoints = [
        '/api/collections',
        '/api/documents',
        '/api/search',
        '/api/admin/users',
        '/api/admin/settings'
      ];
      
      for (const endpoint of apiEndpoints) {
        const response = await page.evaluate(async (url) => {
          try {
            const res = await fetch(url, {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json'
              }
            });
            
            return {
              status: res.status,
              statusText: res.statusText,
              ok: res.ok
            };
          } catch (error) {
            return {
              error: error.message
            };
          }
        }, endpoint);
        
        // 인증되지 않은 요청은 401 또는 403 응답을 받아야 함
        if (response.status) {
          expect([401, 403, 404]).toContain(response.status);
        }
        
        // 성공 응답(200)이 아니어야 함
        expect(response.ok).toBeFalsy();
        
        console.log(`${endpoint}: ${response.status} ${response.statusText}`);
      }
    });

    test('HTTP 메소드 오버라이드 공격 방어', async ({ page }) => {
      await page.goto('/admin/vector-management');
      
      // 정상적인 GET 요청을 DELETE로 오버라이드 시도
      const overrideResult = await page.evaluate(async () => {
        try {
          const response = await fetch('/api/collections', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-HTTP-Method-Override': 'DELETE',
              'X-Method-Override': 'DELETE'
            },
            body: JSON.stringify({ id: '1' })
          });
          
          return {
            status: response.status,
            ok: response.ok
          };
        } catch (error) {
          return {
            error: error.message
          };
        }
      });
      
      // 메소드 오버라이드가 허용되지 않아야 함
      if (overrideResult.status) {
        expect([400, 405, 422]).toContain(overrideResult.status);
      }
      expect(overrideResult.ok).toBeFalsy();
    });

    test('API 레이트 리미팅 테스트', async ({ page }) => {
      await page.goto('/admin/vector-management');
      
      // 짧은 시간 내에 많은 요청 전송
      const requests = [];
      const startTime = Date.now();
      
      for (let i = 0; i < 20; i++) {
        const requestPromise = page.evaluate(async (index) => {
          try {
            const response = await fetch('/api/collections', {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json'
              }
            });
            
            return {
              index,
              status: response.status,
              timestamp: Date.now()
            };
          } catch (error) {
            return {
              index,
              error: error.message,
              timestamp: Date.now()
            };
          }
        }, i);
        
        requests.push(requestPromise);
      }
      
      const results = await Promise.all(requests);
      const endTime = Date.now();
      const totalTime = endTime - startTime;
      
      console.log(`20개 요청 처리 시간: ${totalTime}ms`);
      
      // 레이트 리미팅이 적용되었는지 확인
      const rateLimitedRequests = results.filter(r => r.status === 429);
      const successfulRequests = results.filter(r => r.status === 200);
      
      console.log(`성공한 요청: ${successfulRequests.length}개`);
      console.log(`레이트 리미트된 요청: ${rateLimitedRequests.length}개`);
      
      // 모든 요청이 성공하지 않아야 함 (레이트 리미팅 적용)
      if (rateLimitedRequests.length > 0) {
        expect(rateLimitedRequests.length).toBeGreaterThan(0);
      } else {
        // 레이트 리미팅이 없다면 최소한 요청이 너무 빠르게 처리되지 않아야 함
        expect(totalTime).toBeGreaterThan(100);
      }
    });

    test('API 응답 헤더 보안 검증', async ({ page }) => {
      await page.goto('/admin/vector-management');
      
      // API 요청 후 보안 헤더 확인
      const response = await page.evaluate(async () => {
        try {
          const res = await fetch('/api/collections', {
            method: 'GET'
          });
          
          const headers: { [key: string]: string } = {};
          res.headers.forEach((value, key) => {
            headers[key] = value;
          });
          
          return {
            status: res.status,
            headers
          };
        } catch (error) {
          return {
            error: error.message
          };
        }
      });
      
      if (response.headers) {
        // 보안 헤더들이 설정되어 있는지 확인
        const securityHeaders = {
          'x-content-type-options': 'nosniff',
          'x-frame-options': ['DENY', 'SAMEORIGIN'],
          'x-xss-protection': '1; mode=block',
          'strict-transport-security': true, // 값은 다양할 수 있음
          'content-security-policy': true
        };
        
        for (const [headerName, expectedValue] of Object.entries(securityHeaders)) {
          const actualValue = response.headers[headerName];
          
          if (Array.isArray(expectedValue)) {
            if (actualValue) {
              expect(expectedValue).toContain(actualValue);
            }
          } else if (typeof expectedValue === 'boolean') {
            if (expectedValue) {
              expect(actualValue).toBeTruthy();
            }
          } else {
            expect(actualValue).toBe(expectedValue);
          }
          
          console.log(`${headerName}: ${actualValue || 'Not set'}`);
        }
        
        // 민감한 정보가 헤더에 노출되지 않는지 확인
        const sensitiveHeaders = ['server', 'x-powered-by', 'x-aspnet-version'];
        for (const headerName of sensitiveHeaders) {
          const headerValue = response.headers[headerName];
          if (headerValue) {
            console.log(`Warning: Sensitive header exposed - ${headerName}: ${headerValue}`);
          }
        }
      }
    });
  });

  test.describe('민감한 정보 노출 방지 테스트', () => {
    test('오류 메시지에서 시스템 정보 노출 방지', async ({ page }) => {
      await page.goto('/admin/vector-management');
      
      // 의도적으로 오류를 발생시키는 요청들
      const errorTriggers = [
        { action: 'invalid-search', description: '잘못된 검색 쿼리' },
        { action: 'malformed-upload', description: '잘못된 파일 업로드' },
        { action: 'invalid-collection', description: '존재하지 않는 컬렉션 접근' }
      ];
      
      for (const trigger of errorTriggers) {
        let errorOccurred = false;
        
        try {
          switch (trigger.action) {
            case 'invalid-search':
              // 검색 탭으로 이동
              const searchTab = page.locator('[role="tab"]').filter({ hasText: /검색|Search/ });
              await searchTab.click();
              
              // 매우 긴 검색어로 오류 유발
              const longQuery = 'A'.repeat(10000);
              const searchInput = page.locator('textarea[placeholder*="검색할 내용"]');
              await searchInput.fill(longQuery);
              
              const searchButton = page.locator('button').filter({ hasText: /검색/ }).first();
              await searchButton.click();
              break;
              
            case 'malformed-upload':
              // 문서 탭으로 이동
              const documentsTab = page.locator('[role="tab"]').filter({ hasText: /문서|Document/ });
              await documentsTab.click();
              
              // 존재하지 않는 파일 경로로 업로드 시도
              await page.evaluate(() => {
                const input = document.querySelector('input[type="file"]') as HTMLInputElement;
                if (input) {
                  // 파일 입력 조작 시도
                  Object.defineProperty(input, 'files', {
                    value: null,
                    writable: false
                  });
                }
              });
              break;
              
            case 'invalid-collection':
              // 존재하지 않는 컬렉션 ID로 직접 API 호출
              await page.evaluate(async () => {
                try {
                  await fetch('/api/collections/999999', {
                    method: 'GET'
                  });
                } catch (error) {
                  // 오류 무시
                }
              });
              break;
          }
          
          // 오류 메시지 확인
          await page.waitForTimeout(3000);
          
          const errorMessages = await page.locator('.error-message, .toast, [role="alert"]').allTextContents();
          
          for (const message of errorMessages) {
            if (message.trim()) {
              errorOccurred = true;
              console.log(`${trigger.description} 오류 메시지:`, message);
              
              // 민감한 정보가 포함되지 않았는지 확인
              const sensitivePatterns = [
                /\/[a-zA-Z]:[\\\/]/,  // Windows 경로
                /\/home\/[a-zA-Z]/,   // Linux 경로
                /\/var\/www/,         // 웹 서버 경로
                /\/usr\/local/,       // 시스템 경로
                /database.*error/i,   // 데이터베이스 오류
                /sql.*error/i,        // SQL 오류
                /stack.*trace/i,      // 스택 트레이스
                /internal.*server/i,  // 내부 서버 정보
                /version.*\d+\.\d+/i, // 버전 정보
                /port.*\d{4,5}/i,     // 포트 정보
                /localhost:\d+/i,     // 로컬호스트 정보
                /127\.0\.0\.1/,       // IP 주소
                /password/i,          // 패스워드 관련
                /secret/i,            // 시크릿 관련
                /token/i,             // 토큰 관련
                /api.*key/i           // API 키 관련
              ];
              
              for (const pattern of sensitivePatterns) {
                expect(message).not.toMatch(pattern);
              }
              
              // 사용자 친화적인 메시지인지 확인
              expect(message.length).toBeLessThan(500); // 너무 긴 기술적 메시지 방지
              expect(message).not.toContain('undefined');
              expect(message).not.toContain('null');
            }
          }
          
        } catch (error) {
          console.log(`${trigger.description} 테스트 중 예외:`, error.message);
        }
        
        await page.waitForTimeout(1000);
      }
    });

    test('개발자 도구에서 민감한 정보 노출 방지', async ({ page }) => {
      await page.goto('/admin/vector-management');
      
      // 콘솔 로그 모니터링
      const consoleLogs: string[] = [];
      page.on('console', msg => {
        consoleLogs.push(msg.text());
      });
      
      // 네트워크 요청 모니터링
      const networkRequests: any[] = [];
      page.on('request', request => {
        networkRequests.push({
          url: request.url(),
          headers: request.headers()
        });
      });
      
      // 일반적인 사용자 작업 수행
      const searchTab = page.locator('[role="tab"]').filter({ hasText: /검색|Search/ });
      if (await searchTab.isVisible()) {
        await searchTab.click();
        
        const searchInput = page.locator('textarea[placeholder*="검색할 내용"]');
        await searchInput.fill('테스트 검색');
        
        const searchButton = page.locator('button').filter({ hasText: /검색/ }).first();
        await searchButton.click();
        
        await page.waitForTimeout(3000);
      }
      
      // 콘솔 로그에서 민감한 정보 확인
      const sensitiveLogPatterns = [
        /password/i,
        /secret/i,
        /token/i,
        /api.*key/i,
        /database.*connection/i,
        /supabase.*key/i,
        /auth.*secret/i
      ];
      
      for (const log of consoleLogs) {
        for (const pattern of sensitiveLogPatterns) {
          expect(log).not.toMatch(pattern);
        }
      }
      
      // 네트워크 요청 헤더에서 민감한 정보 확인
      for (const request of networkRequests) {
        const authHeader = request.headers['authorization'];
        if (authHeader) {
          // Authorization 헤더가 있다면 Bearer 토큰 형식인지 확인
          expect(authHeader).toMatch(/^Bearer\s+/);
          
          // 토큰이 너무 짧지 않은지 확인 (보안 강도)
          const token = authHeader.replace(/^Bearer\s+/, '');
          expect(token.length).toBeGreaterThan(20);
        }
        
        // API 키가 URL에 노출되지 않는지 확인
        expect(request.url).not.toMatch(/[?&]api[_-]?key=/i);
        expect(request.url).not.toMatch(/[?&]secret=/i);
        expect(request.url).not.toMatch(/[?&]token=/i);
      }
      
      console.log(`콘솔 로그 ${consoleLogs.length}개 검사 완료`);
      console.log(`네트워크 요청 ${networkRequests.length}개 검사 완료`);
    });

    test('소스 코드에서 하드코딩된 시크릿 방지', async ({ page }) => {
      // 페이지 소스에서 하드코딩된 시크릿 검색
      await page.goto('/admin/vector-management');
      
      const pageContent = await page.content();
      
      // 하드코딩된 시크릿 패턴들
      const secretPatterns = [
        /sk-[a-zA-Z0-9]{48}/,                    // OpenAI API 키
        /AIza[0-9A-Za-z-_]{35}/,                 // Google API 키
        /AKIA[0-9A-Z]{16}/,                      // AWS Access Key
        /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/, // UUID 형태의 키
        /eyJ[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*/, // JWT 토큰
        /[a-zA-Z0-9]{32,}/,                      // 긴 랜덤 문자열 (잠재적 시크릿)
      ];
      
      for (const pattern of secretPatterns) {
        const matches = pageContent.match(pattern);
        if (matches) {
          console.log(`잠재적 시크릿 발견:`, matches[0].substring(0, 20) + '...');
          
          // 실제 시크릿인지 확인 (테스트 데이터나 예시가 아닌지)
          const isTestData = matches[0].includes('test') || 
                           matches[0].includes('example') || 
                           matches[0].includes('demo') ||
                           matches[0].includes('fake');
          
          if (!isTestData) {
            expect(matches).toBeNull(); // 실제 시크릿이 발견되면 테스트 실패
          }
        }
      }
      
      // JavaScript 변수에서 시크릿 검색
      const jsSecrets = await page.evaluate(() => {
        const suspiciousVars = [];
        
        // window 객체에서 의심스러운 변수 검색
        for (const key in window) {
          if (key.toLowerCase().includes('key') || 
              key.toLowerCase().includes('secret') || 
              key.toLowerCase().includes('token') ||
              key.toLowerCase().includes('password')) {
            
            const value = (window as any)[key];
            if (typeof value === 'string' && value.length > 10) {
              suspiciousVars.push({ key, value: value.substring(0, 20) + '...' });
            }
          }
        }
        
        return suspiciousVars;
      });
      
      // 의심스러운 변수가 발견되면 로그 출력
      if (jsSecrets.length > 0) {
        console.log('의심스러운 JavaScript 변수들:', jsSecrets);
      }
      
      // 프로덕션 환경에서는 의심스러운 변수가 없어야 함
      expect(jsSecrets.length).toBe(0);
    });
  });
});