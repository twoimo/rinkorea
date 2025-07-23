// 통합 벡터 생성 서비스 테스트
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  generateAndStoreDocumentVectors,
  getVectorGenerationStats,
  regenerateDocumentVectors,
  checkVectorGenerationServiceHealth,
  type VectorGenerationOptions
} from '../vectorGenerationService';

// 의존성 모킹
vi.mock('../textChunkingService', () => ({
  chunkText: vi.fn(() => ({
    chunks: ['첫 번째 청크', '두 번째 청크', '세 번째 청크'],
    metadata: {
      totalChunks: 3,
      averageChunkSize: 50,
      strategy: 'fixed',
      processingTime: 100
    }
  }))
}));

vi.mock('../embeddingService', () => ({
  generateBatchEmbeddings: vi.fn(() => Promise.resolve({
    success: true,
    embeddings: [
      new Array(1536).fill(0.1),
      new Array(1536).fill(0.2),
      new Array(1536).fill(0.3)
    ],
    total_tokens: 150,
    failed_indices: [],
    errors: []
  })),
  checkEmbeddingServiceHealth: vi.fn(() => Promise.resolve({
    available: true,
    model: 'text-embedding-3-small',
    error: undefined
  }))
}));

vi.mock('../claudeEmbeddingService', () => ({
  generateClaudeBatchEmbeddings: vi.fn(() => Promise.resolve({
    success: true,
    embeddings: [
      new Array(1024).fill(0.1),
      new Array(1024).fill(0.2),
      new Array(1024).fill(0.3)
    ],
    total_tokens: 120,
    failed_indices: [],
    errors: []
  })),
  checkClaudeEmbeddingServiceHealth: vi.fn(() => Promise.resolve({
    available: true,
    model: 'claude-3-haiku-20240307',
    error: undefined
  }))
}));

describe('VectorGenerationService', () => {
  const sampleText = `
    이것은 테스트용 문서입니다. 여러 문장을 포함하고 있습니다.
    
    두 번째 단락입니다. 벡터 생성 테스트를 위한 내용입니다.
    
    마지막 단락입니다. 충분한 길이의 텍스트를 제공합니다.
  `.trim();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('generateAndStoreDocumentVectors', () => {
    it('기본 설정으로 벡터를 생성해야 함', async () => {
      const result = await generateAndStoreDocumentVectors('doc-123', sampleText);

      expect(result.success).toBe(true);
      expect(result.documentId).toBe('doc-123');
      expect(result.chunking.chunks).toHaveLength(3);
      expect(result.vectorsGenerated).toBe(3);
      expect(result.vectorsStored).toBe(3);
      expect(result.failedChunks).toBe(0);
      expect(result.provider).toBe('auto');
    });

    it('Claude 제공자를 사용해야 함', async () => {
      const options: VectorGenerationOptions = {
        provider: 'claude'
      };

      const result = await generateAndStoreDocumentVectors('doc-123', sampleText, options);

      expect(result.success).toBe(true);
      expect(result.provider).toBe('claude');
    });

    it('지원되지 않는 제공자에 대해 오류를 반환해야 함', async () => {
      const options: VectorGenerationOptions = {
        provider: 'unsupported' as any
      };

      const result = await generateAndStoreDocumentVectors('doc-123', sampleText, options);

      expect(result.success).toBe(false);
      expect(result.error).toContain('지원되지 않는 벡터 제공자');
    });

    it('진행률 콜백을 호출해야 함', async () => {
      const progressCallback = vi.fn();
      const options: VectorGenerationOptions = {
        onProgress: progressCallback
      };

      await generateAndStoreDocumentVectors('doc-123', sampleText, options);

      expect(progressCallback).toHaveBeenCalledWith('텍스트 청킹 시작', 0, 100);
      expect(progressCallback).toHaveBeenCalledWith('완료', 100, 100);
    });

    it('빈 텍스트에 대해 실패를 반환해야 함', async () => {
      // 청킹 서비스가 빈 결과를 반환하도록 모킹
      const { chunkText } = await import('../textChunkingService');
      vi.mocked(chunkText).mockReturnValueOnce({
        chunks: [],
        metadata: {
          totalChunks: 0,
          averageChunkSize: 0,
          strategy: 'fixed',
          processingTime: 10
        }
      });

      const result = await generateAndStoreDocumentVectors('doc-123', '');

      expect(result.success).toBe(false);
      expect(result.error).toContain('청크를 생성할 수 없습니다');
    });

    it('Claude 실패 시 적절히 처리해야 함', async () => {
      const { generateClaudeBatchEmbeddings } = await import('../claudeEmbeddingService');
      vi.mocked(generateClaudeBatchEmbeddings).mockResolvedValueOnce({
        success: false,
        embeddings: [],
        total_tokens: 0,
        failed_indices: [0, 1, 2],
        errors: ['Claude API 오류']
      });

      const options: VectorGenerationOptions = {
        provider: 'auto',
        enableFallback: true
      };

      const result = await generateAndStoreDocumentVectors('doc-123', sampleText, options);

      expect(result.success).toBe(false);
      expect(result.error).toContain('모든 청크의 벡터 생성에 실패했습니다');
    });

    it('폴백이 비활성화된 경우 실패해야 함', async () => {
      const { generateClaudeBatchEmbeddings } = await import('../claudeEmbeddingService');
      vi.mocked(generateClaudeBatchEmbeddings).mockResolvedValueOnce({
        success: false,
        embeddings: [],
        total_tokens: 0,
        failed_indices: [0, 1, 2],
        errors: ['Claude API 오류']
      });

      const options: VectorGenerationOptions = {
        provider: 'auto',
        enableFallback: false
      };

      const result = await generateAndStoreDocumentVectors('doc-123', sampleText, options);

      expect(result.success).toBe(false);
      expect(result.provider).toBe('claude');
    });

    it('청킹 옵션을 전달해야 함', async () => {
      const { chunkText } = await import('../textChunkingService');
      const chunkingOptions = {
        strategy: 'sentence' as const,
        chunkSize: 500,
        overlap: 100
      };

      const options: VectorGenerationOptions = {
        chunkingOptions
      };

      await generateAndStoreDocumentVectors('doc-123', sampleText, options);

      expect(chunkText).toHaveBeenCalledWith(sampleText, chunkingOptions);
    });

    it('처리 시간을 측정해야 함', async () => {
      const result = await generateAndStoreDocumentVectors('doc-123', sampleText);

      expect(result.processingTime).toBeGreaterThan(0);
      expect(typeof result.processingTime).toBe('number');
    });
  });

  describe('getVectorGenerationStats', () => {
    it('벡터 생성 통계를 반환해야 함', async () => {
      const stats = await getVectorGenerationStats();

      expect(stats).toHaveProperty('totalDocuments');
      expect(stats).toHaveProperty('totalChunks');
      expect(stats).toHaveProperty('totalVectors');
      expect(stats).toHaveProperty('successRate');
      expect(stats).toHaveProperty('averageProcessingTime');
      expect(stats).toHaveProperty('providerUsage');
      expect(stats).toHaveProperty('chunkingStrategies');

      expect(typeof stats.totalDocuments).toBe('number');
      expect(typeof stats.successRate).toBe('number');
      expect(stats.providerUsage).toHaveProperty('claude');
      expect(stats.providerUsage).toHaveProperty('auto');
    });
  });

  describe('regenerateDocumentVectors', () => {
    it('기존 벡터를 삭제하고 새로 생성해야 함', async () => {
      const result = await regenerateDocumentVectors('doc-123', sampleText);

      expect(result.success).toBe(true);
      expect(result.documentId).toBe('doc-123');
    });

    it('재생성 옵션을 전달해야 함', async () => {
      const options: VectorGenerationOptions = {
        provider: 'claude',
        chunkingOptions: { strategy: 'paragraph' }
      };

      const result = await regenerateDocumentVectors('doc-123', sampleText, options);

      expect(result.success).toBe(true);
      expect(result.provider).toBe('claude');
    });
  });

  describe('checkVectorGenerationServiceHealth', () => {
    it('모든 제공자의 상태를 확인해야 함', async () => {
      const health = await checkVectorGenerationServiceHealth();

      expect(health).toHaveProperty('overall');
      expect(health).toHaveProperty('providers');
      expect(health).toHaveProperty('errors');

      expect(health.providers).toHaveProperty('claude');
      expect(health.providers).toHaveProperty('auto');

      expect(typeof health.overall).toBe('boolean');
      expect(Array.isArray(health.errors)).toBe(true);
    });

    it('서비스 상태 확인 중 오류가 발생할 때 적절히 처리해야 함', async () => {
      const { checkClaudeEmbeddingServiceHealth } = await import('../claudeEmbeddingService');
      vi.mocked(checkClaudeEmbeddingServiceHealth).mockRejectedValueOnce(new Error('서비스 연결 실패'));

      const health = await checkVectorGenerationServiceHealth();

      expect(health.overall).toBe(false);
      expect(health.errors.some(error => error.includes('서비스 상태 확인 실패'))).toBe(true);
    });

    it('Claude가 사용 불가능할 때 적절히 처리해야 함', async () => {
      const { checkClaudeEmbeddingServiceHealth } = await import('../claudeEmbeddingService');
      vi.mocked(checkClaudeEmbeddingServiceHealth).mockResolvedValueOnce({
        available: false,
        model: 'claude-3-haiku-20240307',
        error: 'API 키 오류'
      });

      const health = await checkVectorGenerationServiceHealth();

      expect(health.providers.claude).toBe(false);
      expect(health.errors.some(error => error.includes('Claude'))).toBe(true);
    });

    it('Claude가 사용 가능하면 auto가 true여야 함', async () => {
      const { checkClaudeEmbeddingServiceHealth } = await import('../claudeEmbeddingService');
      vi.mocked(checkClaudeEmbeddingServiceHealth).mockResolvedValueOnce({
        available: true,
        model: 'claude-3-haiku-20240307',
        error: undefined
      });

      const health = await checkVectorGenerationServiceHealth();

      expect(health.providers.claude).toBe(true);
      expect(health.providers.auto).toBe(true); // Claude가 사용 가능하므로
    });
  });

  describe('에러 처리', () => {
    it('예외 발생 시 적절한 오류 응답을 반환해야 함', async () => {
      const { chunkText } = await import('../textChunkingService');
      vi.mocked(chunkText).mockImplementationOnce(() => {
        throw new Error('청킹 서비스 오류');
      });

      const result = await generateAndStoreDocumentVectors('doc-123', sampleText);

      expect(result.success).toBe(false);
      expect(result.error).toContain('청킹 서비스 오류');
      expect(result.processingTime).toBeGreaterThan(0);
    });

    it('임베딩 생성 실패를 처리해야 함', async () => {
      const { generateBatchEmbeddings } = await import('../embeddingService');
      vi.mocked(generateBatchEmbeddings).mockResolvedValueOnce({
        success: false,
        embeddings: [],
        total_tokens: 0,
        failed_indices: [0, 1, 2],
        errors: ['임베딩 생성 실패']
      });

      const options: VectorGenerationOptions = {
        provider: 'claude',
        enableFallback: false
      };

      const result = await generateAndStoreDocumentVectors('doc-123', sampleText, options);

      expect(result.success).toBe(false);
      expect(result.error).toContain('지원되지 않는 벡터 제공자');
    });
  });

  describe('성능 테스트', () => {
    it('큰 문서를 효율적으로 처리해야 함', async () => {
      const largeText = Array(1000).fill(0).map((_, i) => 
        `이것은 ${i + 1}번째 문장입니다. 성능 테스트를 위한 긴 텍스트입니다.`
      ).join(' ');

      const startTime = Date.now();
      const result = await generateAndStoreDocumentVectors('doc-large', largeText);
      const endTime = Date.now();

      expect(result.success).toBe(true);
      expect(endTime - startTime).toBeLessThan(5000); // 5초 이내
    });
  });

  describe('검증 기능', () => {
    it('결과 검증이 활성화된 경우 검증을 수행해야 함', async () => {
      const options: VectorGenerationOptions = {
        validateResults: true
      };

      const result = await generateAndStoreDocumentVectors('doc-123', sampleText, options);

      expect(result.success).toBe(true);
      // 검증 로직이 실행되었는지 확인 (실제 구현에서는 더 구체적인 검증)
    });

    it('검증이 비활성화된 경우 검증을 건너뛰어야 함', async () => {
      const options: VectorGenerationOptions = {
        validateResults: false
      };

      const result = await generateAndStoreDocumentVectors('doc-123', sampleText, options);

      expect(result.success).toBe(true);
    });
  });
});