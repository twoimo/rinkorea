import { test, expect } from '@playwright/test';
import { promises as fs } from 'fs';
import path from 'path';

test.describe('벡터 데이터베이스 성능 및 부하 테스트', () => {
  // 테스트용 대용량 파일 생성 헬퍼
  const createTestFile = async (filename: string, sizeInMB: number): Promise<string> => {
    const testDir = path.join(process.cwd(), 'e2e', 'test-files');
    await fs.mkdir(testDir, { recursive: true });
    
    const filePath = path.join(testDir, filename);
    const content = 'A'.repeat(sizeInMB * 1024 * 1024); // MB 크기의 텍스트 생성
    await fs.writeFile(filePath, content);
    
    return filePath;
  };

  // 테스트 파일 정리
  const cleanupTestFiles = async () => {
    const testDir = path.join(process.cwd(), 'e2e', 'test-files');
    try {
      await fs.rmdir(testDir, { recursive: true });
    } catch (error) {
      // 디렉토리가 없으면 무시
    }
  };

  test.afterAll(async () => {
    await cleanupTestFiles();
  });

  test.describe('대용량 파일 처리 성능 테스트', () => {
    test('10MB 파일 업로드 및 처리 성능 테스트', async ({ page }) => {
      // 벡터 관리 페이지로 이동
      await page.goto('/admin/vector-management');
      
      // 문서 탭으로 이동
      const documentsTab = page.locator('[role="tab"]').filter({ hasText: /문서|Document/ });
      await documentsTab.click();
      
      // 테스트용 대용량 파일 생성 (10MB)
      const testFilePath = await createTestFile('large-test-10mb.txt', 10);
      
      // 파일 업로드 시작 시간 기록
      const uploadStartTime = Date.now();
      
      // 파일 업로드
      const fileInput = page.locator('input[type="file"]');
      await fileInput.setInputFiles(testFilePath);
      
      // 업로드 버튼 클릭
      const uploadButton = page.locator('button').filter({ hasText: /업로드|Upload/ });
      await uploadButton.click();
      
      // 업로드 진행률 표시 확인
      const progressBar = page.locator('[role="progressbar"], .progress-bar');
      await expect(progressBar).toBeVisible({ timeout: 5000 });
      
      // 업로드 완료 대기 (최대 2분)
      const successMessage = page.locator('text=업로드가 완료되었습니다, text=Upload completed, .success-message');
      await expect(successMessage).toBeVisible({ timeout: 120000 });
      
      const uploadEndTime = Date.now();
      const uploadTime = uploadEndTime - uploadStartTime;
      
      console.log(`10MB 파일 업로드 시간: ${uploadTime}ms`);
      
      // 업로드 시간이 2분 이내인지 확인
      expect(uploadTime).toBeLessThan(120000);
      
      // 텍스트 추출 및 벡터 생성 프로세스 시작 시간 기록
      const processingStartTime = Date.now();
      
      // 처리 완료 대기 (최대 5분)
      const processingComplete = page.locator('text=처리가 완료되었습니다, text=Processing completed, .processing-complete');
      await expect(processingComplete).toBeVisible({ timeout: 300000 });
      
      const processingEndTime = Date.now();
      const processingTime = processingEndTime - processingStartTime;
      
      console.log(`10MB 파일 처리 시간: ${processingTime}ms`);
      
      // 처리 시간이 5분 이내인지 확인
      expect(processingTime).toBeLessThan(300000);
      
      // 전체 처리 시간 확인
      const totalTime = uploadTime + processingTime;
      console.log(`10MB 파일 전체 처리 시간: ${totalTime}ms`);
      
      // 파일 정리
      await fs.unlink(testFilePath);
    });

    test('50MB 파일 처리 스트레스 테스트', async ({ page }) => {
      // 벡터 관리 페이지로 이동
      await page.goto('/admin/vector-management');
      
      // 문서 탭으로 이동
      const documentsTab = page.locator('[role="tab"]').filter({ hasText: /문서|Document/ });
      await documentsTab.click();
      
      // 테스트용 대용량 파일 생성 (50MB)
      const testFilePath = await createTestFile('stress-test-50mb.txt', 50);
      
      // 메모리 사용량 모니터링 시작
      const initialMemory = await page.evaluate(() => {
        return (performance as any).memory ? (performance as any).memory.usedJSHeapSize : 0;
      });
      
      // 파일 업로드 시작
      const startTime = Date.now();
      
      const fileInput = page.locator('input[type="file"]');
      await fileInput.setInputFiles(testFilePath);
      
      const uploadButton = page.locator('button').filter({ hasText: /업로드|Upload/ });
      await uploadButton.click();
      
      // 진행률 모니터링
      let progressValues: number[] = [];
      const progressMonitor = setInterval(async () => {
        try {
          const progressElement = page.locator('[role="progressbar"]');
          if (await progressElement.isVisible()) {
            const progressValue = await progressElement.getAttribute('value');
            if (progressValue) {
              progressValues.push(parseInt(progressValue));
            }
          }
        } catch (error) {
          // 진행률 읽기 실패 시 무시
        }
      }, 1000);
      
      // 업로드 완료 대기 (최대 10분)
      try {
        const successMessage = page.locator('text=업로드가 완료되었습니다, text=Upload completed, .success-message');
        await expect(successMessage).toBeVisible({ timeout: 600000 });
        
        const endTime = Date.now();
        const totalTime = endTime - startTime;
        
        console.log(`50MB 파일 처리 시간: ${totalTime}ms`);
        console.log(`진행률 변화: ${progressValues.join(' -> ')}`);
        
        // 메모리 사용량 확인
        const finalMemory = await page.evaluate(() => {
          return (performance as any).memory ? (performance as any).memory.usedJSHeapSize : 0;
        });
        
        const memoryIncrease = finalMemory - initialMemory;
        console.log(`메모리 사용량 증가: ${memoryIncrease} bytes`);
        
        // 메모리 누수가 심각하지 않은지 확인 (100MB 이하)
        expect(memoryIncrease).toBeLessThan(100 * 1024 * 1024);
        
        // 진행률이 점진적으로 증가했는지 확인
        expect(progressValues.length).toBeGreaterThan(0);
        
      } finally {
        clearInterval(progressMonitor);
        await fs.unlink(testFilePath);
      }
    });

    test('다양한 파일 형식 동시 처리 테스트', async ({ page }) => {
      // 벡터 관리 페이지로 이동
      await page.goto('/admin/vector-management');
      
      // 문서 탭으로 이동
      const documentsTab = page.locator('[role="tab"]').filter({ hasText: /문서|Document/ });
      await documentsTab.click();
      
      // 다양한 형식의 테스트 파일 생성
      const testFiles = [
        await createTestFile('test-1.txt', 5),
        await createTestFile('test-2.md', 3),
        await createTestFile('test-3.html', 4)
      ];
      
      const startTime = Date.now();
      
      // 모든 파일을 한 번에 선택
      const fileInput = page.locator('input[type="file"]');
      await fileInput.setInputFiles(testFiles);
      
      // 업로드 시작
      const uploadButton = page.locator('button').filter({ hasText: /업로드|Upload/ });
      await uploadButton.click();
      
      // 각 파일의 처리 상태 모니터링
      const fileStatusElements = page.locator('[data-testid="file-status"], .file-status');
      
      // 모든 파일 처리 완료 대기 (최대 10분)
      await expect(page.locator('text=모든 파일 처리 완료, text=All files processed')).toBeVisible({ timeout: 600000 });
      
      const endTime = Date.now();
      const totalTime = endTime - startTime;
      
      console.log(`다중 파일 처리 시간: ${totalTime}ms`);
      
      // 각 파일이 성공적으로 처리되었는지 확인
      const statusCount = await fileStatusElements.count();
      expect(statusCount).toBe(testFiles.length);
      
      // 파일 정리
      for (const filePath of testFiles) {
        await fs.unlink(filePath);
      }
    });
  });

  test.describe('동시 다중 파일 업로드 부하 테스트', () => {
    test('5개 파일 동시 업로드 테스트', async ({ page, context }) => {
      // 여러 탭에서 동시 업로드 시뮬레이션
      const pages = [page];
      
      // 추가 탭 생성
      for (let i = 0; i < 4; i++) {
        const newPage = await context.newPage();
        await newPage.goto('/admin/vector-management');
        pages.push(newPage);
      }
      
      // 각 탭에서 파일 업로드 준비
      const uploadPromises = pages.map(async (currentPage, index) => {
        // 문서 탭으로 이동
        const documentsTab = currentPage.locator('[role="tab"]').filter({ hasText: /문서|Document/ });
        await documentsTab.click();
        
        // 테스트 파일 생성
        const testFilePath = await createTestFile(`concurrent-test-${index}.txt`, 2);
        
        // 파일 업로드
        const fileInput = currentPage.locator('input[type="file"]');
        await fileInput.setInputFiles(testFilePath);
        
        const uploadButton = currentPage.locator('button').filter({ hasText: /업로드|Upload/ });
        const startTime = Date.now();
        
        await uploadButton.click();
        
        // 업로드 완료 대기
        const successMessage = currentPage.locator('text=업로드가 완료되었습니다, .success-message');
        await expect(successMessage).toBeVisible({ timeout: 180000 });
        
        const endTime = Date.now();
        const uploadTime = endTime - startTime;
        
        // 파일 정리
        await fs.unlink(testFilePath);
        
        return { index, uploadTime };
      });
      
      // 모든 업로드 완료 대기
      const results = await Promise.all(uploadPromises);
      
      // 결과 분석
      const totalTime = Math.max(...results.map(r => r.uploadTime));
      const avgTime = results.reduce((sum, r) => sum + r.uploadTime, 0) / results.length;
      
      console.log(`동시 업로드 결과:`);
      console.log(`- 최대 처리 시간: ${totalTime}ms`);
      console.log(`- 평균 처리 시간: ${avgTime}ms`);
      console.log(`- 개별 처리 시간: ${results.map(r => `${r.index}: ${r.uploadTime}ms`).join(', ')}`);
      
      // 모든 업로드가 3분 이내에 완료되었는지 확인
      expect(totalTime).toBeLessThan(180000);
      
      // 추가 탭 정리
      for (let i = 1; i < pages.length; i++) {
        await pages[i].close();
      }
    });

    test('서버 부하 상황에서의 안정성 테스트', async ({ page }) => {
      // 벡터 관리 페이지로 이동
      await page.goto('/admin/vector-management');
      
      // 문서 탭으로 이동
      const documentsTab = page.locator('[role="tab"]').filter({ hasText: /문서|Document/ });
      await documentsTab.click();
      
      // 연속적인 업로드 요청으로 서버 부하 생성
      const uploadTasks = [];
      
      for (let i = 0; i < 3; i++) {
        const task = (async () => {
          const testFilePath = await createTestFile(`load-test-${i}.txt`, 3);
          
          try {
            const fileInput = page.locator('input[type="file"]');
            await fileInput.setInputFiles(testFilePath);
            
            const uploadButton = page.locator('button').filter({ hasText: /업로드|Upload/ });
            await uploadButton.click();
            
            // 짧은 대기 후 다음 업로드
            await page.waitForTimeout(2000);
            
            return { success: true, index: i };
          } catch (error) {
            console.error(`Upload ${i} failed:`, error);
            return { success: false, index: i, error };
          } finally {
            await fs.unlink(testFilePath);
          }
        })();
        
        uploadTasks.push(task);
      }
      
      // 모든 업로드 작업 실행
      const results = await Promise.allSettled(uploadTasks);
      
      // 결과 분석
      const successCount = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
      const failureCount = results.length - successCount;
      
      console.log(`부하 테스트 결과: 성공 ${successCount}개, 실패 ${failureCount}개`);
      
      // 최소 50% 이상의 요청이 성공해야 함
      expect(successCount / results.length).toBeGreaterThanOrEqual(0.5);
      
      // 페이지가 여전히 반응하는지 확인
      await expect(page.locator('body')).toBeVisible();
    });
  });

  test.describe('벡터 검색 응답 시간 성능 테스트', () => {
    test('의미 검색 응답 시간 테스트 (3초 이내)', async ({ page }) => {
      // 벡터 관리 페이지로 이동
      await page.goto('/admin/vector-management');
      
      // 검색 탭으로 이동
      const searchTab = page.locator('[role="tab"]').filter({ hasText: /검색|Search/ });
      await searchTab.click();
      
      // 의미 검색 선택
      const semanticSearchCard = page.locator('.cursor-pointer').filter({ hasText: /의미 검색|semantic/i });
      await semanticSearchCard.click();
      
      // 여러 검색어로 성능 테스트
      const testQueries = [
        '사용자 인증 시스템',
        '데이터베이스 최적화 방법',
        '보안 취약점 분석',
        '성능 모니터링 도구',
        'API 설계 패턴'
      ];
      
      const searchTimes: number[] = [];
      
      for (const query of testQueries) {
        // 검색어 입력
        const searchInput = page.locator('textarea[placeholder*="검색할 내용"]');
        await searchInput.clear();
        await searchInput.fill(query);
        
        // 검색 시작 시간 기록
        const startTime = Date.now();
        
        // 검색 실행
        const searchButton = page.locator('button').filter({ hasText: /검색/ }).first();
        await searchButton.click();
        
        // 검색 결과 대기
        await page.waitForSelector('[data-testid="search-results"]', { timeout: 10000 });
        
        const endTime = Date.now();
        const searchTime = endTime - startTime;
        searchTimes.push(searchTime);
        
        console.log(`"${query}" 검색 시간: ${searchTime}ms`);
        
        // 3초 이내 응답 확인
        expect(searchTime).toBeLessThan(3000);
        
        // 다음 검색을 위한 짧은 대기
        await page.waitForTimeout(500);
      }
      
      // 평균 검색 시간 계산
      const avgSearchTime = searchTimes.reduce((sum, time) => sum + time, 0) / searchTimes.length;
      console.log(`평균 의미 검색 시간: ${avgSearchTime}ms`);
      
      // 평균 검색 시간이 2초 이내인지 확인
      expect(avgSearchTime).toBeLessThan(2000);
    });

    test('키워드 검색 응답 시간 테스트', async ({ page }) => {
      // 벡터 관리 페이지로 이동
      await page.goto('/admin/vector-management');
      
      // 검색 탭으로 이동
      const searchTab = page.locator('[role="tab"]').filter({ hasText: /검색|Search/ });
      await searchTab.click();
      
      // 키워드 검색 선택
      const keywordSearchCard = page.locator('.cursor-pointer').filter({ hasText: /키워드 검색|keyword/i });
      await keywordSearchCard.click();
      
      // 키워드 검색 테스트
      const keywords = ['function', 'class', 'interface', 'component', 'service'];
      const searchTimes: number[] = [];
      
      for (const keyword of keywords) {
        const searchInput = page.locator('textarea[placeholder*="검색할 내용"]');
        await searchInput.clear();
        await searchInput.fill(keyword);
        
        const startTime = Date.now();
        
        const searchButton = page.locator('button').filter({ hasText: /검색/ }).first();
        await searchButton.click();
        
        await page.waitForSelector('[data-testid="search-results"]', { timeout: 10000 });
        
        const endTime = Date.now();
        const searchTime = endTime - startTime;
        searchTimes.push(searchTime);
        
        console.log(`"${keyword}" 키워드 검색 시간: ${searchTime}ms`);
        
        // 키워드 검색은 더 빨라야 함 (2초 이내)
        expect(searchTime).toBeLessThan(2000);
        
        await page.waitForTimeout(300);
      }
      
      const avgSearchTime = searchTimes.reduce((sum, time) => sum + time, 0) / searchTimes.length;
      console.log(`평균 키워드 검색 시간: ${avgSearchTime}ms`);
      
      // 키워드 검색 평균 시간이 1초 이내인지 확인
      expect(avgSearchTime).toBeLessThan(1000);
    });

    test('하이브리드 검색 성능 비교 테스트', async ({ page }) => {
      // 벡터 관리 페이지로 이동
      await page.goto('/admin/vector-management');
      
      // 검색 탭으로 이동
      const searchTab = page.locator('[role="tab"]').filter({ hasText: /검색|Search/ });
      await searchTab.click();
      
      const testQuery = '사용자 관리 시스템 구현';
      const searchTypes = ['의미 검색', '키워드 검색', '하이브리드 검색'];
      const performanceResults: { [key: string]: number } = {};
      
      for (const searchType of searchTypes) {
        // 검색 타입 선택
        const searchCard = page.locator('.cursor-pointer').filter({ hasText: new RegExp(searchType, 'i') });
        await searchCard.click();
        
        // 검색어 입력
        const searchInput = page.locator('textarea[placeholder*="검색할 내용"]');
        await searchInput.clear();
        await searchInput.fill(testQuery);
        
        // 검색 시간 측정
        const startTime = Date.now();
        
        const searchButton = page.locator('button').filter({ hasText: /검색/ }).first();
        await searchButton.click();
        
        await page.waitForSelector('[data-testid="search-results"]', { timeout: 10000 });
        
        const endTime = Date.now();
        const searchTime = endTime - startTime;
        performanceResults[searchType] = searchTime;
        
        console.log(`${searchType} 검색 시간: ${searchTime}ms`);
        
        // 모든 검색 타입이 3초 이내에 응답해야 함
        expect(searchTime).toBeLessThan(3000);
        
        await page.waitForTimeout(1000);
      }
      
      // 성능 비교 결과 출력
      console.log('검색 성능 비교:', performanceResults);
      
      // 하이브리드 검색이 너무 느리지 않은지 확인 (의미 검색의 2배 이내)
      const semanticTime = performanceResults['의미 검색'];
      const hybridTime = performanceResults['하이브리드 검색'];
      
      if (semanticTime && hybridTime) {
        expect(hybridTime).toBeLessThan(semanticTime * 2);
      }
    });
  });

  test.describe('AI 에이전트 RAG 검색 성능 테스트', () => {
    test('RAG 검색 응답 시간 테스트 (1초 이내)', async ({ page }) => {
      // AI 에이전트 페이지로 이동 (RAG 기능이 있는 페이지)
      await page.goto('/');
      
      // AI 채팅 인터페이스 찾기
      const chatInput = page.locator('textarea[placeholder*="메시지"], input[placeholder*="질문"], .chat-input');
      
      if (await chatInput.isVisible()) {
        // RAG 기능이 활성화된 질문들
        const ragQueries = [
          '벡터 데이터베이스는 어떻게 작동하나요?',
          '사용자 인증 시스템을 구현하는 방법은?',
          '성능 최적화를 위한 팁을 알려주세요',
          'API 보안을 강화하는 방법은?'
        ];
        
        const ragResponseTimes: number[] = [];
        
        for (const query of ragQueries) {
          await chatInput.clear();
          await chatInput.fill(query);
          
          // RAG 검색 시작 시간 기록
          const startTime = Date.now();
          
          // 메시지 전송
          const sendButton = page.locator('button[type="submit"], .send-button').first();
          await sendButton.click();
          
          // RAG 검색 완료 및 응답 시작 대기
          const ragIndicator = page.locator('text=문서 검색 중, text=Searching documents, .rag-indicator');
          if (await ragIndicator.isVisible({ timeout: 2000 })) {
            // RAG 검색이 완료될 때까지 대기
            await expect(ragIndicator).not.toBeVisible({ timeout: 5000 });
          }
          
          // AI 응답 시작 확인
          const aiResponse = page.locator('.ai-response, .assistant-message').last();
          await expect(aiResponse).toBeVisible({ timeout: 10000 });
          
          const endTime = Date.now();
          const responseTime = endTime - startTime;
          ragResponseTimes.push(responseTime);
          
          console.log(`RAG 질문 "${query}" 응답 시간: ${responseTime}ms`);
          
          // RAG 검색이 1초 이내에 시작되어야 함
          expect(responseTime).toBeLessThan(1000);
          
          await page.waitForTimeout(2000);
        }
        
        const avgRagTime = ragResponseTimes.reduce((sum, time) => sum + time, 0) / ragResponseTimes.length;
        console.log(`평균 RAG 응답 시간: ${avgRagTime}ms`);
        
        // 평균 RAG 응답 시간이 800ms 이내인지 확인
        expect(avgRagTime).toBeLessThan(800);
      } else {
        // AI 검색 모달 열기 시도
        const aiSearchButton = page.locator('button[aria-label="AI 검색"]');
        if (await aiSearchButton.isVisible()) {
          await aiSearchButton.click();
          await page.waitForSelector('textarea[placeholder*="메시지"]', { timeout: 5000 });
          console.log('AI 검색 모달을 성공적으로 열었습니다.');
        } else {
          console.log('AI 채팅 인터페이스를 찾을 수 없어 RAG 테스트를 건너뜁니다.');
        }
      }
    });

    test('RAG 검색 품질 vs 속도 트레이드오프 테스트', async ({ page }) => {
      // 벡터 관리 페이지로 이동
      await page.goto('/admin/vector-management');
      
      // 검색 탭으로 이동
      const searchTab = page.locator('[role="tab"]').filter({ hasText: /검색|Search/ });
      await searchTab.click();
      
      // 다양한 검색 설정으로 성능 테스트
      const testConfigs = [
        { maxResults: 5, threshold: 0.8, description: '고품질 (적은 결과, 높은 임계값)' },
        { maxResults: 20, threshold: 0.6, description: '균형 (보통 결과, 보통 임계값)' },
        { maxResults: 50, threshold: 0.4, description: '고속 (많은 결과, 낮은 임계값)' }
      ];
      
      const testQuery = '시스템 아키텍처 설계 원칙';
      
      for (const config of testConfigs) {
        // 의미 검색 선택
        const semanticSearchCard = page.locator('.cursor-pointer').filter({ hasText: /의미 검색/i });
        await semanticSearchCard.click();
        
        // 고급 필터 설정
        const filterButton = page.locator('button').filter({ hasText: /필터|Filter/ });
        if (await filterButton.isVisible()) {
          await filterButton.click();
          
          // 최대 결과 수 설정
          const maxResultsInput = page.locator('input[name="max_results"]');
          if (await maxResultsInput.isVisible()) {
            await maxResultsInput.fill(config.maxResults.toString());
          }
          
          // 유사도 임계값 설정
          const thresholdInput = page.locator('input[name="threshold"], input[type="range"]');
          if (await thresholdInput.isVisible()) {
            await thresholdInput.fill(config.threshold.toString());
          }
        }
        
        // 검색 실행
        const searchInput = page.locator('textarea[placeholder*="검색할 내용"]');
        await searchInput.clear();
        await searchInput.fill(testQuery);
        
        const startTime = Date.now();
        
        const searchButton = page.locator('button').filter({ hasText: /검색/ }).first();
        await searchButton.click();
        
        await page.waitForSelector('[data-testid="search-results"]', { timeout: 15000 });
        
        const endTime = Date.now();
        const searchTime = endTime - startTime;
        
        // 결과 개수 확인
        const resultItems = page.locator('[data-testid="search-result-item"]');
        const resultCount = await resultItems.count();
        
        console.log(`${config.description}: ${searchTime}ms, ${resultCount}개 결과`);
        
        // 설정에 따른 성능 기대치 확인
        if (config.maxResults <= 5) {
          // 적은 결과는 빨라야 함
          expect(searchTime).toBeLessThan(2000);
        } else if (config.maxResults >= 50) {
          // 많은 결과는 더 오래 걸릴 수 있음
          expect(searchTime).toBeLessThan(5000);
        }
        
        await page.waitForTimeout(1000);
      }
    });
  });

  test.describe('메모리 사용량 및 리소스 최적화 테스트', () => {
    test('메모리 누수 감지 테스트', async ({ page }) => {
      // 초기 메모리 사용량 측정
      const getMemoryUsage = async () => {
        return await page.evaluate(() => {
          const memory = (performance as any).memory;
          return memory ? {
            used: memory.usedJSHeapSize,
            total: memory.totalJSHeapSize,
            limit: memory.jsHeapSizeLimit
          } : null;
        });
      };
      
      await page.goto('/admin/vector-management');
      
      const initialMemory = await getMemoryUsage();
      console.log('초기 메모리 사용량:', initialMemory);
      
      // 반복적인 작업 수행 (검색, 업로드, 탭 전환)
      for (let i = 0; i < 10; i++) {
        // 검색 탭으로 이동
        const searchTab = page.locator('[role="tab"]').filter({ hasText: /검색|Search/ });
        await searchTab.click();
        
        // 검색 실행
        const searchInput = page.locator('textarea[placeholder*="검색할 내용"]');
        await searchInput.fill(`메모리 테스트 ${i}`);
        
        const searchButton = page.locator('button').filter({ hasText: /검색/ }).first();
        await searchButton.click();
        
        // 결과 대기
        await page.waitForTimeout(2000);
        
        // 문서 탭으로 이동
        const documentsTab = page.locator('[role="tab"]').filter({ hasText: /문서|Document/ });
        await documentsTab.click();
        
        await page.waitForTimeout(1000);
        
        // 컬렉션 탭으로 이동
        const collectionsTab = page.locator('[role="tab"]').filter({ hasText: /컬렉션|Collection/ });
        await collectionsTab.click();
        
        await page.waitForTimeout(1000);
      }
      
      // 가비지 컬렉션 강제 실행 (가능한 경우)
      await page.evaluate(() => {
        if ((window as any).gc) {
          (window as any).gc();
        }
      });
      
      await page.waitForTimeout(2000);
      
      const finalMemory = await getMemoryUsage();
      console.log('최종 메모리 사용량:', finalMemory);
      
      if (initialMemory && finalMemory) {
        const memoryIncrease = finalMemory.used - initialMemory.used;
        const memoryIncreasePercent = (memoryIncrease / initialMemory.used) * 100;
        
        console.log(`메모리 증가량: ${memoryIncrease} bytes (${memoryIncreasePercent.toFixed(2)}%)`);
        
        // 메모리 증가가 50% 이내인지 확인 (메모리 누수 방지)
        expect(memoryIncreasePercent).toBeLessThan(50);
        
        // 절대적인 메모리 증가가 50MB 이내인지 확인
        expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024);
      }
    });

    test('DOM 노드 누수 감지 테스트', async ({ page }) => {
      await page.goto('/admin/vector-management');
      
      // 초기 DOM 노드 수 측정
      const getNodeCount = async () => {
        return await page.evaluate(() => {
          return document.querySelectorAll('*').length;
        });
      };
      
      const initialNodeCount = await getNodeCount();
      console.log('초기 DOM 노드 수:', initialNodeCount);
      
      // 반복적인 UI 조작
      for (let i = 0; i < 20; i++) {
        // 모달 열기/닫기
        const createButton = page.locator('button').filter({ hasText: /생성|Create/ }).first();
        if (await createButton.isVisible()) {
          await createButton.click();
          await page.waitForTimeout(500);
          
          // 모달 닫기
          const cancelButton = page.locator('button').filter({ hasText: /취소|Cancel/ });
          if (await cancelButton.isVisible()) {
            await cancelButton.click();
          } else {
            await page.keyboard.press('Escape');
          }
          await page.waitForTimeout(500);
        }
        
        // 탭 전환
        const tabs = page.locator('[role="tab"]');
        const tabCount = await tabs.count();
        if (tabCount > 0) {
          const randomTab = tabs.nth(i % tabCount);
          await randomTab.click();
          await page.waitForTimeout(300);
        }
      }
      
      const finalNodeCount = await getNodeCount();
      console.log('최종 DOM 노드 수:', finalNodeCount);
      
      const nodeIncrease = finalNodeCount - initialNodeCount;
      const nodeIncreasePercent = (nodeIncrease / initialNodeCount) * 100;
      
      console.log(`DOM 노드 증가: ${nodeIncrease}개 (${nodeIncreasePercent.toFixed(2)}%)`);
      
      // DOM 노드 증가가 20% 이내인지 확인
      expect(nodeIncreasePercent).toBeLessThan(20);
    });

    test('네트워크 요청 최적화 테스트', async ({ page }) => {
      // 네트워크 요청 모니터링
      const networkRequests: any[] = [];
      
      page.on('request', request => {
        networkRequests.push({
          url: request.url(),
          method: request.method(),
          timestamp: Date.now()
        });
      });
      
      await page.goto('/admin/vector-management');
      
      // 초기 로딩 후 네트워크 요청 수 확인
      await page.waitForLoadState('networkidle');
      const initialRequestCount = networkRequests.length;
      
      console.log(`초기 로딩 네트워크 요청 수: ${initialRequestCount}`);
      
      // 탭 전환 시 불필요한 요청이 발생하지 않는지 확인
      const tabs = ['컬렉션', '문서', '검색'];
      
      for (const tabName of tabs) {
        const requestCountBefore = networkRequests.length;
        
        const tab = page.locator('[role="tab"]').filter({ hasText: new RegExp(tabName) });
        await tab.click();
        
        await page.waitForTimeout(2000);
        
        const requestCountAfter = networkRequests.length;
        const newRequests = requestCountAfter - requestCountBefore;
        
        console.log(`${tabName} 탭 전환 시 네트워크 요청: ${newRequests}개`);
        
        // 탭 전환 시 과도한 요청이 발생하지 않는지 확인 (5개 이하)
        expect(newRequests).toBeLessThan(5);
      }
      
      // 중복 요청 감지
      const urlCounts: { [key: string]: number } = {};
      networkRequests.forEach(req => {
        const baseUrl = req.url.split('?')[0]; // 쿼리 파라미터 제거
        urlCounts[baseUrl] = (urlCounts[baseUrl] || 0) + 1;
      });
      
      const duplicateRequests = Object.entries(urlCounts).filter(([url, count]) => count > 3);
      
      if (duplicateRequests.length > 0) {
        console.log('중복 요청 감지:', duplicateRequests);
      }
      
      // 과도한 중복 요청이 없는지 확인
      expect(duplicateRequests.length).toBeLessThan(3);
    });
  });
});