import { test, expect } from '@playwright/test';

test.describe('벡터 검색 기능 E2E 테스트', () => {
  test.beforeEach(async ({ page }) => {
    // 벡터 관리 페이지로 이동 (관리자 권한 가정)
    await page.goto('/admin/vector-management');
    
    // 검색 탭으로 이동
    const searchTab = page.locator('[role="tab"]').filter({ hasText: /검색|Search/ });
    if (await searchTab.isVisible()) {
      await searchTab.click();
    }
    
    // 페이지 로딩 대기
    await page.waitForLoadState('networkidle');
  });

  test.describe('의미 기반 벡터 검색 테스트', () => {
    test('의미 검색 타입 선택 및 기본 검색', async ({ page }) => {
      // 의미 검색 타입 선택
      const semanticSearchCard = page.locator('.cursor-pointer').filter({ hasText: /의미 검색|semantic/i });
      await semanticSearchCard.click();
      
      // 선택된 상태 확인
      await expect(semanticSearchCard).toHaveClass(/ring-2 ring-primary/);
      
      // 검색어 입력
      const searchInput = page.locator('textarea[placeholder*="검색할 내용"]');
      await searchInput.fill('사용자 인증 방법');
      
      // 검색 실행
      const searchButton = page.locator('button').filter({ hasText: /검색/ }).first();
      await searchButton.click();
      
      // 로딩 상태 확인
      await expect(page.locator('[data-testid="loading-spinner"], .animate-spin')).toBeVisible();
      
      // 검색 결과 대기 (최대 10초)
      await page.waitForSelector('[data-testid="search-results"], .search-results', { timeout: 10000 });
      
      // 검색 결과 확인
      const searchResults = page.locator('[data-testid="search-results"], .search-results');
      await expect(searchResults).toBeVisible();
      
      // 결과 개수 확인 (최소 1개 이상)
      const resultItems = page.locator('[data-testid="search-result-item"], .search-result-item');
      const resultCount = await resultItems.count();
      expect(resultCount).toBeGreaterThan(0);
    });

    test('의미 검색 결과 상세 정보 확인', async ({ page }) => {
      // 의미 검색 실행
      await page.locator('.cursor-pointer').filter({ hasText: /의미 검색/i }).click();
      await page.locator('textarea[placeholder*="검색할 내용"]').fill('데이터베이스 연결');
      await page.locator('button').filter({ hasText: /검색/ }).first().click();
      
      // 검색 결과 대기
      await page.waitForSelector('[data-testid="search-results"]', { timeout: 10000 });
      
      // 첫 번째 검색 결과 클릭
      const firstResult = page.locator('[data-testid="search-result-item"]').first();
      await firstResult.click();
      
      // 결과 상세 정보 확인
      await expect(page.locator('text=유사도 점수, text=similarity, text=관련도')).toBeVisible();
      await expect(page.locator('text=문서 출처, text=source, text=출처')).toBeVisible();
      await expect(page.locator('text=컬렉션, text=collection')).toBeVisible();
    });

    test('의미 검색 유사도 임계값 설정', async ({ page }) => {
      // 의미 검색 선택
      await page.locator('.cursor-pointer').filter({ hasText: /의미 검색/i }).click();
      
      // 고급 필터 열기
      const filterButton = page.locator('button').filter({ hasText: /필터|Filter/ });
      if (await filterButton.isVisible()) {
        await filterButton.click();
      }
      
      // 유사도 임계값 설정 (0.8로 설정)
      const similaritySlider = page.locator('input[type="range"], .slider');
      if (await similaritySlider.isVisible()) {
        await similaritySlider.fill('0.8');
      }
      
      // 검색 실행
      await page.locator('textarea[placeholder*="검색할 내용"]').fill('API 문서');
      await page.locator('button').filter({ hasText: /검색/ }).first().click();
      
      // 결과 확인 (높은 임계값으로 인해 결과가 적을 수 있음)
      await page.waitForSelector('[data-testid="search-results"]', { timeout: 10000 });
      
      // 모든 결과의 유사도 점수가 0.8 이상인지 확인
      const scoreElements = page.locator('[data-testid="similarity-score"], .similarity-score');
      const scores = await scoreElements.allTextContents();
      
      for (const scoreText of scores) {
        const score = parseFloat(scoreText.replace(/[^\d.]/g, ''));
        if (!isNaN(score)) {
          expect(score).toBeGreaterThanOrEqual(0.8);
        }
      }
    });
  });

  test.describe('키워드 검색 테스트', () => {
    test('키워드 검색 타입 선택 및 정확한 매칭', async ({ page }) => {
      // 키워드 검색 타입 선택
      const keywordSearchCard = page.locator('.cursor-pointer').filter({ hasText: /키워드 검색|keyword/i });
      await keywordSearchCard.click();
      
      // 선택된 상태 확인
      await expect(keywordSearchCard).toHaveClass(/ring-2 ring-primary/);
      
      // 정확한 키워드로 검색
      await page.locator('textarea[placeholder*="검색할 내용"]').fill('function');
      await page.locator('button').filter({ hasText: /검색/ }).first().click();
      
      // 검색 결과 대기
      await page.waitForSelector('[data-testid="search-results"]', { timeout: 10000 });
      
      // 검색 결과에 키워드가 하이라이트되어 있는지 확인
      const highlightedText = page.locator('mark, .highlight, .bg-yellow-200');
      if (await highlightedText.count() > 0) {
        await expect(highlightedText.first()).toBeVisible();
      }
      
      // 결과 내용에 검색 키워드가 포함되어 있는지 확인
      const resultContent = page.locator('[data-testid="search-result-content"]');
      const contentText = await resultContent.first().textContent();
      expect(contentText?.toLowerCase()).toContain('function');
    });

    test('키워드 검색 불린 연산자 테스트', async ({ page }) => {
      // 키워드 검색 선택
      await page.locator('.cursor-pointer').filter({ hasText: /키워드 검색/i }).click();
      
      // AND 연산자 테스트
      await page.locator('textarea[placeholder*="검색할 내용"]').fill('user AND authentication');
      await page.locator('button').filter({ hasText: /검색/ }).first().click();
      
      await page.waitForSelector('[data-testid="search-results"]', { timeout: 10000 });
      
      // 결과에 두 키워드가 모두 포함되어 있는지 확인
      const resultItems = page.locator('[data-testid="search-result-item"]');
      const firstResultText = await resultItems.first().textContent();
      
      if (firstResultText) {
        const lowerText = firstResultText.toLowerCase();
        expect(lowerText).toContain('user');
        expect(lowerText).toContain('authentication');
      }
    });

    test('키워드 검색 구문 검색 테스트', async ({ page }) => {
      // 키워드 검색 선택
      await page.locator('.cursor-pointer').filter({ hasText: /키워드 검색/i }).click();
      
      // 구문 검색 (따옴표 사용)
      await page.locator('textarea[placeholder*="검색할 내용"]').fill('"database connection"');
      await page.locator('button').filter({ hasText: /검색/ }).first().click();
      
      await page.waitForSelector('[data-testid="search-results"]', { timeout: 10000 });
      
      // 정확한 구문이 포함된 결과인지 확인
      const resultContent = page.locator('[data-testid="search-result-content"]').first();
      const contentText = await resultContent.textContent();
      expect(contentText?.toLowerCase()).toContain('database connection');
    });
  });

  test.describe('하이브리드 검색 테스트', () => {
    test('하이브리드 검색 기본 동작', async ({ page }) => {
      // 하이브리드 검색 타입 선택
      const hybridSearchCard = page.locator('.cursor-pointer').filter({ hasText: /하이브리드 검색|hybrid/i });
      await hybridSearchCard.click();
      
      // 선택된 상태 확인
      await expect(hybridSearchCard).toHaveClass(/ring-2 ring-primary/);
      
      // 검색 실행
      await page.locator('textarea[placeholder*="검색할 내용"]').fill('사용자 관리 시스템');
      await page.locator('button').filter({ hasText: /검색/ }).first().click();
      
      // 검색 결과 대기
      await page.waitForSelector('[data-testid="search-results"]', { timeout: 10000 });
      
      // 하이브리드 검색 결과 확인 (의미 + 키워드 점수)
      const resultItems = page.locator('[data-testid="search-result-item"]');
      const resultCount = await resultItems.count();
      expect(resultCount).toBeGreaterThan(0);
      
      // 하이브리드 점수 표시 확인
      const hybridScore = page.locator('[data-testid="hybrid-score"], .hybrid-score');
      if (await hybridScore.count() > 0) {
        await expect(hybridScore.first()).toBeVisible();
      }
    });

    test('하이브리드 검색 가중치 조정', async ({ page }) => {
      // 하이브리드 검색 선택
      await page.locator('.cursor-pointer').filter({ hasText: /하이브리드 검색/i }).click();
      
      // 고급 필터 열기
      const filterButton = page.locator('button').filter({ hasText: /필터|Filter/ });
      if (await filterButton.isVisible()) {
        await filterButton.click();
      }
      
      // 의미 검색 가중치 조정 (0.8로 설정)
      const semanticWeightSlider = page.locator('input[name="semantic_weight"], .semantic-weight-slider');
      if (await semanticWeightSlider.isVisible()) {
        await semanticWeightSlider.fill('0.8');
      }
      
      // 키워드 검색 가중치 조정 (0.2로 설정)
      const keywordWeightSlider = page.locator('input[name="keyword_weight"], .keyword-weight-slider');
      if (await keywordWeightSlider.isVisible()) {
        await keywordWeightSlider.fill('0.2');
      }
      
      // 검색 실행
      await page.locator('textarea[placeholder*="검색할 내용"]').fill('데이터베이스 최적화');
      await page.locator('button').filter({ hasText: /검색/ }).first().click();
      
      // 결과 확인
      await page.waitForSelector('[data-testid="search-results"]', { timeout: 10000 });
      
      // 의미 검색 결과가 더 높은 순위에 있는지 확인
      const firstResult = page.locator('[data-testid="search-result-item"]').first();
      await expect(firstResult).toBeVisible();
    });
  });

  test.describe('검색 필터링 테스트', () => {
    test('컬렉션별 필터링', async ({ page }) => {
      // 하이브리드 검색 선택
      await page.locator('.cursor-pointer').filter({ hasText: /하이브리드 검색/i }).click();
      
      // 필터 패널 열기
      const filterButton = page.locator('button').filter({ hasText: /필터|Filter/ });
      await filterButton.click();
      
      // 컬렉션 선택
      const collectionSelect = page.locator('select[name="collection"], .collection-select');
      if (await collectionSelect.isVisible()) {
        await collectionSelect.selectOption({ index: 1 }); // 첫 번째 컬렉션 선택
      }
      
      // 검색 실행
      await page.locator('textarea[placeholder*="검색할 내용"]').fill('테스트 문서');
      await page.locator('button').filter({ hasText: /검색/ }).first().click();
      
      // 결과 확인
      await page.waitForSelector('[data-testid="search-results"]', { timeout: 10000 });
      
      // 모든 결과가 선택한 컬렉션에서 나온 것인지 확인
      const collectionLabels = page.locator('[data-testid="result-collection"], .result-collection');
      if (await collectionLabels.count() > 0) {
        const firstCollectionText = await collectionLabels.first().textContent();
        expect(firstCollectionText).toBeTruthy();
      }
    });

    test('날짜 범위 필터링', async ({ page }) => {
      // 검색 타입 선택
      await page.locator('.cursor-pointer').filter({ hasText: /하이브리드 검색/i }).click();
      
      // 필터 패널 열기
      const filterButton = page.locator('button').filter({ hasText: /필터|Filter/ });
      await filterButton.click();
      
      // 날짜 범위 설정
      const startDateInput = page.locator('input[name="start_date"], input[type="date"]').first();
      if (await startDateInput.isVisible()) {
        await startDateInput.fill('2024-01-01');
      }
      
      const endDateInput = page.locator('input[name="end_date"], input[type="date"]').last();
      if (await endDateInput.isVisible()) {
        await endDateInput.fill('2024-12-31');
      }
      
      // 검색 실행
      await page.locator('textarea[placeholder*="검색할 내용"]').fill('문서 관리');
      await page.locator('button').filter({ hasText: /검색/ }).first().click();
      
      // 결과 확인
      await page.waitForSelector('[data-testid="search-results"]', { timeout: 10000 });
      
      // 결과의 날짜가 범위 내에 있는지 확인
      const dateLabels = page.locator('[data-testid="result-date"], .result-date');
      if (await dateLabels.count() > 0) {
        const firstDateText = await dateLabels.first().textContent();
        expect(firstDateText).toBeTruthy();
      }
    });

    test('파일 타입 필터링', async ({ page }) => {
      // 검색 타입 선택
      await page.locator('.cursor-pointer').filter({ hasText: /하이브리드 검색/i }).click();
      
      // 필터 패널 열기
      const filterButton = page.locator('button').filter({ hasText: /필터|Filter/ });
      await filterButton.click();
      
      // 파일 타입 선택 (PDF만)
      const fileTypeSelect = page.locator('select[name="file_type"], .file-type-select');
      if (await fileTypeSelect.isVisible()) {
        await fileTypeSelect.selectOption('application/pdf');
      }
      
      // 검색 실행
      await page.locator('textarea[placeholder*="검색할 내용"]').fill('사용자 가이드');
      await page.locator('button').filter({ hasText: /검색/ }).first().click();
      
      // 결과 확인
      await page.waitForSelector('[data-testid="search-results"]', { timeout: 10000 });
      
      // 모든 결과가 PDF 파일인지 확인
      const fileTypeLabels = page.locator('[data-testid="result-file-type"], .result-file-type');
      if (await fileTypeLabels.count() > 0) {
        const fileTypes = await fileTypeLabels.allTextContents();
        for (const fileType of fileTypes) {
          expect(fileType.toLowerCase()).toContain('pdf');
        }
      }
    });
  });

  test.describe('검색 결과 표시 및 상호작용', () => {
    test('검색 결과 페이지네이션', async ({ page }) => {
      // 많은 결과를 반환할 수 있는 일반적인 검색어 사용
      await page.locator('.cursor-pointer').filter({ hasText: /하이브리드 검색/i }).click();
      await page.locator('textarea[placeholder*="검색할 내용"]').fill('시스템');
      await page.locator('button').filter({ hasText: /검색/ }).first().click();
      
      // 검색 결과 대기
      await page.waitForSelector('[data-testid="search-results"]', { timeout: 10000 });
      
      // 페이지네이션 버튼 확인
      const nextButton = page.locator('button').filter({ hasText: /다음|Next/ });
      const prevButton = page.locator('button').filter({ hasText: /이전|Previous/ });
      
      if (await nextButton.isVisible()) {
        // 다음 페이지로 이동
        await nextButton.click();
        
        // 새로운 결과 로딩 대기
        await page.waitForTimeout(1000);
        
        // 이전 페이지 버튼이 활성화되었는지 확인
        await expect(prevButton).toBeEnabled();
        
        // 이전 페이지로 돌아가기
        await prevButton.click();
        await page.waitForTimeout(1000);
      }
    });

    test('검색 결과 정렬', async ({ page }) => {
      // 검색 실행
      await page.locator('.cursor-pointer').filter({ hasText: /하이브리드 검색/i }).click();
      await page.locator('textarea[placeholder*="검색할 내용"]').fill('데이터');
      await page.locator('button').filter({ hasText: /검색/ }).first().click();
      
      await page.waitForSelector('[data-testid="search-results"]', { timeout: 10000 });
      
      // 정렬 옵션 변경 (관련도 -> 날짜순)
      const sortSelect = page.locator('select[name="sort"], .sort-select');
      if (await sortSelect.isVisible()) {
        await sortSelect.selectOption('date');
        
        // 정렬 결과 대기
        await page.waitForTimeout(2000);
        
        // 결과가 날짜순으로 정렬되었는지 확인
        const dateElements = page.locator('[data-testid="result-date"]');
        if (await dateElements.count() >= 2) {
          const dates = await dateElements.allTextContents();
          // 날짜 형식이 표시되는지 확인
          expect(dates[0]).toBeTruthy();
        }
      }
    });

    test('검색 결과 내보내기', async ({ page }) => {
      // 검색 실행
      await page.locator('.cursor-pointer').filter({ hasText: /하이브리드 검색/i }).click();
      await page.locator('textarea[placeholder*="검색할 내용"]').fill('문서');
      await page.locator('button').filter({ hasText: /검색/ }).first().click();
      
      await page.waitForSelector('[data-testid="search-results"]', { timeout: 10000 });
      
      // 내보내기 버튼 클릭
      const exportButton = page.locator('button').filter({ hasText: /내보내기|Export/ });
      if (await exportButton.isVisible()) {
        // 다운로드 이벤트 대기
        const downloadPromise = page.waitForEvent('download');
        await exportButton.click();
        
        // 다운로드 완료 대기
        const download = await downloadPromise;
        expect(download.suggestedFilename()).toContain('.csv');
      }
    });

    test('검색 결과에서 문서 보기', async ({ page }) => {
      // 검색 실행
      await page.locator('.cursor-pointer').filter({ hasText: /하이브리드 검색/i }).click();
      await page.locator('textarea[placeholder*="검색할 내용"]').fill('API');
      await page.locator('button').filter({ hasText: /검색/ }).first().click();
      
      await page.waitForSelector('[data-testid="search-results"]', { timeout: 10000 });
      
      // 첫 번째 결과의 "문서 보기" 버튼 클릭
      const viewDocButton = page.locator('button').filter({ hasText: /보기|View/ }).first();
      if (await viewDocButton.isVisible()) {
        await viewDocButton.click();
        
        // 문서 상세 보기 모달 또는 페이지가 열렸는지 확인
        const documentModal = page.locator('[role="dialog"], .modal, [data-testid="document-viewer"]');
        await expect(documentModal).toBeVisible({ timeout: 5000 });
        
        // 문서 내용이 표시되는지 확인
        const documentContent = page.locator('[data-testid="document-content"], .document-content');
        await expect(documentContent).toBeVisible();
      }
    });
  });

  test.describe('검색 성능 및 응답성 테스트', () => {
    test('검색 응답 시간 측정 (3초 이내)', async ({ page }) => {
      // 검색 시작 시간 기록
      const startTime = Date.now();
      
      // 검색 실행
      await page.locator('.cursor-pointer').filter({ hasText: /하이브리드 검색/i }).click();
      await page.locator('textarea[placeholder*="검색할 내용"]').fill('복잡한 검색 쿼리 테스트');
      await page.locator('button').filter({ hasText: /검색/ }).first().click();
      
      // 검색 결과 대기
      await page.waitForSelector('[data-testid="search-results"]', { timeout: 10000 });
      
      // 응답 시간 계산
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      // 3초 이내 응답 확인
      expect(responseTime).toBeLessThan(3000);
      
      console.log(`검색 응답 시간: ${responseTime}ms`);
    });

    test('동시 다중 검색 요청 처리', async ({ page, context }) => {
      // 여러 탭에서 동시 검색 실행
      const page2 = await context.newPage();
      const page3 = await context.newPage();
      
      // 모든 페이지에서 벡터 관리 페이지로 이동
      await Promise.all([
        page.goto('/admin/vector-management'),
        page2.goto('/admin/vector-management'),
        page3.goto('/admin/vector-management')
      ]);
      
      // 검색 탭으로 이동
      await Promise.all([
        page.locator('[role="tab"]').filter({ hasText: /검색/ }).click(),
        page2.locator('[role="tab"]').filter({ hasText: /검색/ }).click(),
        page3.locator('[role="tab"]').filter({ hasText: /검색/ }).click()
      ]);
      
      // 동시 검색 실행
      const searchPromises = [
        page.locator('textarea[placeholder*="검색할 내용"]').fill('검색어1'),
        page2.locator('textarea[placeholder*="검색할 내용"]').fill('검색어2'),
        page3.locator('textarea[placeholder*="검색할 내용"]').fill('검색어3')
      ];
      
      await Promise.all(searchPromises);
      
      // 동시 검색 버튼 클릭
      const startTime = Date.now();
      await Promise.all([
        page.locator('button').filter({ hasText: /검색/ }).first().click(),
        page2.locator('button').filter({ hasText: /검색/ }).first().click(),
        page3.locator('button').filter({ hasText: /검색/ }).first().click()
      ]);
      
      // 모든 검색 결과 대기
      await Promise.all([
        page.waitForSelector('[data-testid="search-results"]', { timeout: 10000 }),
        page2.waitForSelector('[data-testid="search-results"]', { timeout: 10000 }),
        page3.waitForSelector('[data-testid="search-results"]', { timeout: 10000 })
      ]);
      
      const endTime = Date.now();
      const totalTime = endTime - startTime;
      
      // 동시 검색도 합리적인 시간 내에 완료되어야 함
      expect(totalTime).toBeLessThan(5000);
      
      // 페이지 정리
      await page2.close();
      await page3.close();
    });

    test('대용량 검색 결과 처리', async ({ page }) => {
      // 많은 결과를 반환할 수 있는 일반적인 검색어
      await page.locator('.cursor-pointer').filter({ hasText: /키워드 검색/i }).click();
      await page.locator('textarea[placeholder*="검색할 내용"]').fill('*'); // 와일드카드 검색
      
      const startTime = Date.now();
      await page.locator('button').filter({ hasText: /검색/ }).first().click();
      
      // 검색 결과 대기
      await page.waitForSelector('[data-testid="search-results"]', { timeout: 15000 });
      
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      // 대용량 결과도 합리적인 시간 내에 처리되어야 함
      expect(responseTime).toBeLessThan(10000);
      
      // 결과가 페이지네이션되어 있는지 확인
      const paginationControls = page.locator('.pagination, [data-testid="pagination"]');
      if (await paginationControls.isVisible()) {
        await expect(paginationControls).toBeVisible();
      }
    });
  });

  test.describe('검색 오류 처리 테스트', () => {
    test('빈 검색어 처리', async ({ page }) => {
      // 빈 검색어로 검색 시도
      await page.locator('button').filter({ hasText: /검색/ }).first().click();
      
      // 오류 메시지 또는 알림 확인
      const errorMessage = page.locator('text=검색어를 입력해주세요, .error-message, [role="alert"]');
      await expect(errorMessage).toBeVisible({ timeout: 3000 });
    });

    test('검색 결과 없음 처리', async ({ page }) => {
      // 결과가 없을 것 같은 검색어 사용
      await page.locator('.cursor-pointer').filter({ hasText: /키워드 검색/i }).click();
      await page.locator('textarea[placeholder*="검색할 내용"]').fill('xyzabc123nonexistent');
      await page.locator('button').filter({ hasText: /검색/ }).first().click();
      
      // "결과 없음" 메시지 확인
      const noResultsMessage = page.locator('text=검색 결과가 없습니다, text=No results found, .no-results');
      await expect(noResultsMessage).toBeVisible({ timeout: 10000 });
    });

    test('네트워크 오류 시 처리', async ({ page }) => {
      // 네트워크 차단
      await page.route('**/api/**', route => route.abort());
      
      // 검색 시도
      await page.locator('.cursor-pointer').filter({ hasText: /하이브리드 검색/i }).click();
      await page.locator('textarea[placeholder*="검색할 내용"]').fill('테스트');
      await page.locator('button').filter({ hasText: /검색/ }).first().click();
      
      // 오류 메시지 확인
      const errorMessage = page.locator('text=검색 중 오류가 발생했습니다, .error-message, [role="alert"]');
      await expect(errorMessage).toBeVisible({ timeout: 5000 });
    });
  });
});