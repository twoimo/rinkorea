// Claude 임베딩 서비스 테스트
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  generateClaudeEmbedding,
  generateClaudeBatchEmbeddings,
  generateClaudeEmbeddingSafe,
  generateClaudeQueryEmbedding,
  checkClaudeEmbeddingServiceHealth,
  compareEmbeddingModels,
  CLAUDE_EMBEDDING_CONFIG
} from '../claudeEmbeddingService';

// Fetch 모킹
const mockFetch = vi.fn();
global.fetch = mockFetch;

// 환경 변수 모킹
const originalEnv = import.meta.env;

describe('ClaudeEmbeddingService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Claude API 키 설정
    import.meta.env.VITE_CLAUDE_API_KEY = 'test-claude-api-key';
  });

  afterEach(() => {
    import.meta.env = originalEnv;
  });

  describe('generateClaudeEmbedding', () => {
    it('성공적으로 임베딩을 생성해야 함', async () => {
      const mockResponse = {
        embeddings: [{
          embedding: new Array(1024).fill(0.1),
          index: 0
        }],
        usage: {
          input_tokens: 10,
          output_tokens: 0
        }
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      const result = await generateClaudeEmbedding('테스트 텍스트');

      expect(result.success).toBe(true);
      expect(result.embedding).toHaveLength(1024);
      expect(result.tokens_used).toBe(10);
      expect(mockFetch).toHaveBeenCalledWith(
        CLAUDE_EMBEDDING_CONFIG.apiUrl,
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-claude-api-key',
            'Content-Type': 'application/json',
            'anthropic-version': '2023-06-01'
          })
        })
      );
    });

    it('빈 텍스트에 대해 오류를 반환해야 함', async () => {
      const result = await generateClaudeEmbedding('');

      expect(result.success).toBe(false);
      expect(result.error).toContain('빈 텍스트');
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('너무 긴 텍스트에 대해 오류를 반환해야 함', async () => {
      const longText = 'a'.repeat(CLAUDE_EMBEDDING_CONFIG.maxTokens * 5);
      
      const result = await generateClaudeEmbedding(longText);

      expect(result.success).toBe(false);
      expect(result.error).toContain('텍스트가 너무 깁니다');
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('API 키가 없을 때 오류를 반환해야 함', async () => {
      import.meta.env.VITE_CLAUDE_API_KEY = '';

      const result = await generateClaudeEmbedding('테스트');

      expect(result.success).toBe(false);
      expect(result.error).toContain('API 키가 설정되지 않았습니다');
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

      const result = await generateClaudeEmbedding('테스트');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Claude API 오류');
      expect(result.error).toContain('Invalid API key');
    });

    it('잘못된 응답 형식을 처리해야 함', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          embeddings: [] // 빈 배열
        })
      });

      const result = await generateClaudeEmbedding('테스트');

      expect(result.success).toBe(false);
      expect(result.error).toContain('유효하지 않은 임베딩 응답');
    });
  });

  describe('generateClaudeBatchEmbeddings', () => {
    it('여러 텍스트의 임베딩을 생성해야 함', async () => {
      const texts = ['첫 번째 텍스트', '두 번째 텍스트', '세 번째 텍스트'];
      const mockResponse = {
        embeddings: texts.map((_, index) => ({
          embedding: new Array(1024).fill(0.1 + index * 0.1),
          index
        })),
        usage: {
          input_tokens: 30,
          output_tokens: 0
        }
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      const progressCallback = vi.fn();
      const result = await generateClaudeBatchEmbeddings(texts, progressCallback);

      expect(result.success).toBe(true);
      expect(result.embeddings).toHaveLength(3);
      expect(result.total_tokens).toBe(30);
      expect(result.failed_indices).toHaveLength(0);
      expect(progressCallback).toHaveBeenCalled();
    });

    it('빈 배열에 대해 오류를 반환해야 함', async () => {
      const result = await generateClaudeBatchEmbeddings([]);

      expect(result.success).toBe(false);
      expect(result.errors[0]).toContain('빈 텍스트 배열');
    });

    it('일부 실패한 텍스트를 처리해야 함', async () => {
      const texts = ['정상 텍스트', '', 'a'.repeat(50000)]; // 빈 텍스트와 너무 긴 텍스트
      const mockResponse = {
        embeddings: [{
          embedding: new Array(1024).fill(0.1),
          index: 0
        }],
        usage: {
          input_tokens: 10,
          output_tokens: 0
        }
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      const result = await generateClaudeBatchEmbeddings(texts);

      expect(result.success).toBe(false); // 일부 실패로 인해 false
      expect(result.embeddings[0]).toBeDefined(); // 첫 번째는 성공
      expect(result.failed_indices).toContain(1); // 빈 텍스트
      expect(result.failed_indices).toContain(2); // 너무 긴 텍스트
    });

    it('배치 크기에 따라 여러 요청을 보내야 함', async () => {
      const texts = new Array(CLAUDE_EMBEDDING_CONFIG.batchSize + 10)
        .fill(0)
        .map((_, i) => `텍스트 ${i}`);

      const mockResponse = {
        embeddings: new Array(CLAUDE_EMBEDDING_CONFIG.batchSize).fill(0).map((_, i) => ({
          embedding: new Array(1024).fill(0.1),
          index: i
        })),
        usage: {
          input_tokens: CLAUDE_EMBEDDING_CONFIG.batchSize * 5,
          output_tokens: 0
        }
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      const result = await generateClaudeBatchEmbeddings(texts);

      expect(mockFetch).toHaveBeenCalledTimes(2); // 두 번의 배치 요청
      expect(result.embeddings.filter(e => e).length).toBeGreaterThan(0);
    });
  });

  describe('generateClaudeEmbeddingSafe', () => {
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
            embeddings: [{
              embedding: new Array(1024).fill(0.1),
              index: 0
            }],
            usage: { input_tokens: 10, output_tokens: 0 }
          })
        });

      const result = await generateClaudeEmbeddingSafe('테스트');

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

      const result = await generateClaudeEmbeddingSafe('테스트');

      expect(result.success).toBe(false);
      expect(result.error).toContain('번 시도 후 실패');
      expect(mockFetch).toHaveBeenCalledTimes(CLAUDE_EMBEDDING_CONFIG.retryAttempts);
    });
  });

  describe('generateClaudeQueryEmbedding', () => {
    it('검색 쿼리 임베딩을 생성해야 함', async () => {
      const mockResponse = {
        embeddings: [{
          embedding: new Array(1024).fill(0.1),
          index: 0
        }],
        usage: { input_tokens: 5, output_tokens: 0 }
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      const result = await generateClaudeQueryEmbedding('검색 쿼리');

      expect(result.success).toBe(true);
      expect(result.embedding).toHaveLength(1024);
    });

    it('빈 쿼리에 대해 오류를 반환해야 함', async () => {
      const result = await generateClaudeQueryEmbedding('');

      expect(result.success).toBe(false);
      expect(result.error).toContain('검색 쿼리가 비어있습니다');
    });
  });

  describe('checkClaudeEmbeddingServiceHealth', () => {
    it('서비스가 정상일 때 available: true를 반환해야 함', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          embeddings: [{
            embedding: new Array(1024).fill(0.1),
            index: 0
          }],
          usage: { input_tokens: 1, output_tokens: 0 }
        })
      });

      const health = await checkClaudeEmbeddingServiceHealth();

      expect(health.available).toBe(true);
      expect(health.model).toBe(CLAUDE_EMBEDDING_CONFIG.model);
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

      const health = await checkClaudeEmbeddingServiceHealth();

      expect(health.available).toBe(false);
      expect(health.model).toBe(CLAUDE_EMBEDDING_CONFIG.model);
      expect(health.error).toContain('Invalid API key');
    });
  });

  describe('compareEmbeddingModels', () => {
    it('두 모델을 비교해야 함', async () => {
      // Claude 성공 모킹
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          embeddings: [{
            embedding: new Array(1024).fill(0.1),
            index: 0
          }],
          usage: { input_tokens: 5, output_tokens: 0 }
        })
      });

      const result = await compareEmbeddingModels('테스트 텍스트');

      expect(result.claude_result).toBeDefined();
      expect(result.recommendation).toBeOneOf(['openai', 'claude', 'both']);
      expect(result.reason).toBeDefined();
    });
  });

  describe('설정 검증', () => {
    it('Claude 설정이 올바르게 정의되어야 함', () => {
      expect(CLAUDE_EMBEDDING_CONFIG.apiUrl).toBeDefined();
      expect(CLAUDE_EMBEDDING_CONFIG.model).toBeDefined();
      expect(CLAUDE_EMBEDDING_CONFIG.dimensions).toBeGreaterThan(0);
      expect(CLAUDE_EMBEDDING_CONFIG.maxTokens).toBeGreaterThan(0);
      expect(CLAUDE_EMBEDDING_CONFIG.batchSize).toBeGreaterThan(0);
      expect(CLAUDE_EMBEDDING_CONFIG.retryAttempts).toBeGreaterThan(0);
    });
  });

  describe('에러 처리', () => {
    it('네트워크 오류를 처리해야 함', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await generateClaudeEmbedding('테스트');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Network error');
    });

    it('JSON 파싱 오류를 처리해야 함', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.reject(new Error('Invalid JSON'))
      });

      const result = await generateClaudeEmbedding('테스트');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid JSON');
    });
  });
});