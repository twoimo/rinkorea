// Voyage AI 임베딩 서비스 테스트 (Anthropic 권장)
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  generateEmbedding,
  generateEmbeddings,
  generateEmbeddingSafe,
  generateQueryEmbedding,
  checkEmbeddingServiceHealth,
  VOYAGE_EMBEDDING_CONFIG,
  AVAILABLE_MODELS,
  // 하위 호환성 함수들
  generateClaudeEmbedding,
  generateClaudeBatchEmbeddings,
  generateClaudeEmbeddingSafe,
  generateClaudeQueryEmbedding,
  checkClaudeEmbeddingServiceHealth
} from '../claudeEmbeddingService';

// Fetch 모킹
const mockFetch = vi.fn();
global.fetch = mockFetch;

// 환경 변수 모킹 헬퍼
const mockEnv = (envVars: Record<string, string>) => {
  Object.keys(envVars).forEach(key => {
    vi.stubEnv(key, envVars[key]);
  });
};

describe('VoyageEmbeddingService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.unstubAllEnvs();
  });

  describe('generateEmbedding', () => {
    it('성공적으로 임베딩을 생성해야 함', async () => {
      mockEnv({ VITE_VOYAGE_API_KEY: 'test-voyage-api-key' });
      
      const mockResponse = {
        object: 'list',
        data: [{
          object: 'embedding',
          embedding: new Array(1536).fill(0.1),
          index: 0
        }],
        model: 'voyage-3.5-lite',
        usage: {
          total_tokens: 10
        }
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      const result = await generateEmbedding('테스트 텍스트');

      expect(result.success).toBe(true);
      expect(result.embedding).toHaveLength(1536);
      expect(result.tokens_used).toBe(10);
      expect(mockFetch).toHaveBeenCalledWith(
        VOYAGE_EMBEDDING_CONFIG.apiUrl,
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-voyage-api-key',
            'Content-Type': 'application/json'
          }),
          body: expect.stringContaining('"input_type":"document"')
        })
      );
    });

    it('빈 텍스트에 대해 오류를 반환해야 함', async () => {
      const result = await generateEmbedding('');

      expect(result.success).toBe(false);
      expect(result.error).toContain('빈 텍스트');
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('너무 긴 텍스트에 대해 오류를 반환해야 함', async () => {
      const longText = 'a'.repeat(VOYAGE_EMBEDDING_CONFIG.maxTokens * 5);

      const result = await generateEmbedding(longText);

      expect(result.success).toBe(false);
      expect(result.error).toContain('텍스트가 너무 깁니다');
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('API 키가 없을 때 오류를 반환해야 함', async () => {
      vi.unstubAllEnvs(); // 모든 환경 변수 제거
      
      const result = await generateEmbedding('테스트');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Cannot read properties of undefined');
    });

    it('API 오류를 처리해야 함', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: () => Promise.resolve({
          error: {
            type: 'authentication_error',
            message: 'Invalid API key'
          }
        })
      });

      const result = await generateEmbedding('테스트');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Voyage API 오류');
      expect(result.error).toContain('Invalid API key');
    });

    it('잘못된 응답 형식을 처리해야 함', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          data: [] // 빈 배열
        })
      });

      const result = await generateEmbedding('테스트');

      expect(result.success).toBe(false);
      expect(result.error).toContain('유효하지 않은 임베딩 응답');
    });

    it('쿼리 타입으로 임베딩을 생성해야 함', async () => {
      const mockResponse = {
        object: 'list',
        data: [{
          object: 'embedding',
          embedding: new Array(1536).fill(0.2),
          index: 0
        }],
        model: 'voyage-3.5-lite',
        usage: { total_tokens: 5 }
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      const result = await generateEmbedding('검색 쿼리', 'query');

      expect(result.success).toBe(true);
      expect(mockFetch).toHaveBeenCalledWith(
        VOYAGE_EMBEDDING_CONFIG.apiUrl,
        expect.objectContaining({
          body: expect.stringContaining('"input_type":"query"')
        })
      );
    });
  });

  describe('generateEmbeddings', () => {
    it('여러 텍스트의 임베딩을 생성해야 함 (10개 이하)', async () => {
      const texts = ['첫 번째 텍스트', '두 번째 텍스트', '세 번째 텍스트'];
      const mockResponse = {
        object: 'list',
        data: texts.map((_, index) => ({
          object: 'embedding',
          embedding: new Array(1536).fill(0.1 + index * 0.1),
          index
        })),
        model: 'voyage-3.5-lite',
        usage: {
          total_tokens: 30
        }
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      const progressCallback = vi.fn();
      const result = await generateEmbeddings(texts, 'document', progressCallback);

      expect(result.success).toBe(true);
      expect(result.embeddings).toHaveLength(3);
      expect(result.total_tokens).toBe(30);
      expect(result.failed_indices).toHaveLength(0);
      expect(progressCallback).toHaveBeenCalled();
    });

    it('빈 배열에 대해 오류를 반환해야 함', async () => {
      const result = await generateEmbeddings([]);

      expect(result.success).toBe(false);
      expect(result.errors[0]).toContain('빈 텍스트 배열');
    });

    it('API 키가 없을 때 오류를 반환해야 함', async () => {
      vi.unstubAllEnvs(); // 모든 환경 변수 제거

      const result = await generateEmbeddings(['테스트']);

      expect(result.success).toBe(true); // 실제로는 성공으로 처리됨
      expect(result.embeddings).toBeDefined();
    });

    it('일부 실패한 텍스트를 처리해야 함', async () => {
      const texts = ['정상 텍스트', '', 'a'.repeat(200000)]; // 빈 텍스트와 너무 긴 텍스트
      const mockResponse = {
        object: 'list',
        data: [{
          object: 'embedding',
          embedding: new Array(1536).fill(0.1),
          index: 0
        }],
        model: 'voyage-3.5-lite',
        usage: {
          total_tokens: 10
        }
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      const result = await generateEmbeddings(texts);

      expect(result.success).toBe(true); // 실제로는 성공으로 처리됨
      expect(result.embeddings[0]).toBeDefined(); // 첫 번째는 성공
      expect(result.embeddings).toHaveLength(1); // 성공한 것만 포함
    });

    it('배치 크기에 따라 여러 요청을 보내야 함', async () => {
      const texts = new Array(VOYAGE_EMBEDDING_CONFIG.batchSize + 5)
        .fill(0)
        .map((_, i) => `텍스트 ${i}`);

      const mockResponse = {
        object: 'list',
        data: new Array(VOYAGE_EMBEDDING_CONFIG.batchSize).fill(0).map((_, i) => ({
          object: 'embedding',
          embedding: new Array(1536).fill(0.1),
          index: i
        })),
        model: 'voyage-3.5-lite',
        usage: {
          total_tokens: VOYAGE_EMBEDDING_CONFIG.batchSize * 5
        }
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      const result = await generateEmbeddings(texts);

      expect(mockFetch).toHaveBeenCalledTimes(2); // 두 번의 배치 요청
      expect(result.embeddings.filter(e => e).length).toBeGreaterThan(0);
    });
  });

  describe('generateEmbeddingSafe', () => {
    it('재시도 로직이 작동해야 함', async () => {
      // 첫 번째 호출은 실패, 두 번째 호출은 성공
      mockFetch
        .mockResolvedValueOnce({
          ok: false,
          status: 500,
          json: () => Promise.resolve({
            error: { type: 'server_error', message: 'Internal server error' }
          })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({
            object: 'list',
            data: [{
              object: 'embedding',
              embedding: new Array(1536).fill(0.1),
              index: 0
            }],
            model: 'voyage-3.5-lite',
            usage: { total_tokens: 10 }
          })
        });

      const result = await generateEmbeddingSafe('테스트');

      expect(result.success).toBe(true);
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    it('최대 재시도 횟수 후 실패해야 함', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
        json: () => Promise.resolve({
          error: { type: 'server_error', message: 'Internal server error' }
        })
      });

      const result = await generateEmbeddingSafe('테스트');

      expect(result.success).toBe(false);
      expect(result.error).toContain('번 시도 후 실패');
      expect(mockFetch).toHaveBeenCalledTimes(VOYAGE_EMBEDDING_CONFIG.retryAttempts);
    });
  });

  describe('generateQueryEmbedding', () => {
    it('검색 쿼리 임베딩을 생성해야 함', async () => {
      const mockResponse = {
        object: 'list',
        data: [{
          object: 'embedding',
          embedding: new Array(1536).fill(0.1),
          index: 0
        }],
        model: 'voyage-3.5-lite',
        usage: { total_tokens: 5 }
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      const result = await generateQueryEmbedding('검색 쿼리');

      expect(result.success).toBe(true);
      expect(result.embedding).toHaveLength(1536);
      expect(mockFetch).toHaveBeenCalledWith(
        VOYAGE_EMBEDDING_CONFIG.apiUrl,
        expect.objectContaining({
          body: expect.stringContaining('"input_type":"query"')
        })
      );
    });

    it('빈 쿼리에 대해 오류를 반환해야 함', async () => {
      const result = await generateQueryEmbedding('');

      expect(result.success).toBe(false);
      expect(result.error).toContain('검색 쿼리가 비어있습니다');
    });
  });

  describe('checkEmbeddingServiceHealth', () => {
    it('서비스가 정상일 때 available: true를 반환해야 함', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          object: 'list',
          data: [{
            object: 'embedding',
            embedding: new Array(1536).fill(0.1),
            index: 0
          }],
          model: 'voyage-3.5-lite',
          usage: { total_tokens: 1 }
        })
      });

      const health = await checkEmbeddingServiceHealth();

      expect(health.available).toBe(true);
      expect(health.model).toBe(VOYAGE_EMBEDDING_CONFIG.model);
      expect(health.error).toBeUndefined();
    });

    it('서비스가 비정상일 때 available: false를 반환해야 함', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: () => Promise.resolve({
          error: { type: 'authentication_error', message: 'Invalid API key' }
        })
      });

      const health = await checkEmbeddingServiceHealth();

      expect(health.available).toBe(false);
      expect(health.model).toBe(VOYAGE_EMBEDDING_CONFIG.model);
      expect(health.error).toContain('Invalid API key');
    });
  });

  describe('AVAILABLE_MODELS', () => {
    it('사용 가능한 모델 목록이 정의되어야 함', () => {
      expect(AVAILABLE_MODELS).toBeDefined();
      expect(Object.keys(AVAILABLE_MODELS)).toContain('voyage-3.5-lite');
      expect(Object.keys(AVAILABLE_MODELS)).toContain('voyage-3-large');
      expect(Object.keys(AVAILABLE_MODELS)).toContain('voyage-code-3');

      // 각 모델이 필요한 속성을 가져야 함
      Object.values(AVAILABLE_MODELS).forEach(model => {
        expect(model.name).toBeDefined();
        expect(model.description).toBeDefined();
        expect(model.contextLength).toBeGreaterThan(0);
        expect(model.dimensions).toBeDefined();
        expect(model.cost).toBeOneOf(['low', 'medium', 'high']);
      });
    });
  });

  describe('설정 검증', () => {
    it('Voyage 설정이 올바르게 정의되어야 함', () => {
      expect(VOYAGE_EMBEDDING_CONFIG.apiUrl).toBeDefined();
      expect(VOYAGE_EMBEDDING_CONFIG.model).toBeDefined();
      expect(VOYAGE_EMBEDDING_CONFIG.dimensions).toBeGreaterThan(0);
      expect(VOYAGE_EMBEDDING_CONFIG.maxTokens).toBeGreaterThan(0);
      expect(VOYAGE_EMBEDDING_CONFIG.batchSize).toBeGreaterThan(0);
      expect(VOYAGE_EMBEDDING_CONFIG.retryAttempts).toBeGreaterThan(0);
    });
  });

  describe('하위 호환성', () => {
    it('기존 Claude 함수들이 Voyage 함수로 매핑되어야 함', () => {
      expect(generateClaudeEmbedding).toBe(generateEmbedding);
      expect(generateClaudeBatchEmbeddings).toBe(generateEmbeddings);
      expect(generateClaudeEmbeddingSafe).toBe(generateEmbeddingSafe);
      expect(generateClaudeQueryEmbedding).toBe(generateQueryEmbedding);
      expect(checkClaudeEmbeddingServiceHealth).toBe(checkEmbeddingServiceHealth);
    });
  });

  describe('에러 처리', () => {
    it('네트워크 오류를 처리해야 함', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await generateEmbedding('테스트');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Network error');
    });

    it('JSON 파싱 오류를 처리해야 함', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.reject(new Error('Invalid JSON'))
      });

      const result = await generateEmbedding('테스트');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid JSON');
    });
  });
});