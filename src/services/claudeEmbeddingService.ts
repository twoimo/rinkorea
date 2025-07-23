/**
 * Voyage AI Embeddings API 서비스 (Anthropic 권장)
 * Anthropic은 자체 임베딩 모델을 제공하지 않으며 Voyage AI를 권장합니다.
 */

/**
 * Voyage AI 임베딩 설정
 */
export const VOYAGE_EMBEDDING_CONFIG = {
  apiUrl: 'https://api.voyageai.com/v1/embeddings',
  model: 'voyage-3.5-lite', // 비용 효율적인 모델 (voyage-3-large, voyage-3.5, voyage-3.5-lite 중 선택)
  dimensions: 1024, // Voyage AI 기본 임베딩 차원
  maxTokens: 32000, // Voyage AI 컨텍스트 길이
  batchSize: 10, // Voyage API 배치 크기 (최대 128개)
  retryAttempts: 3,
  retryDelay: 1000,
  rateLimitDelay: 100 // API 호출 간격
} as const;

/**
 * 임베딩 결과 타입
 */
export interface EmbeddingResult {
  success: boolean;
  embedding?: number[];
  tokens_used?: number;
  error?: string;
}

/**
 * 배치 임베딩 결과 타입
 */
export interface BatchEmbeddingResult {
  success: boolean;
  embeddings: (number[] | undefined)[];
  total_tokens: number;
  failed_indices: number[];
  errors: string[];
}

/**
 * Voyage AI API 응답 타입
 */
interface VoyageEmbeddingResponse {
  object: string;
  data: Array<{
    object: string;
    embedding: number[];
    index: number;
  }>;
  model: string;
  usage: {
    total_tokens: number;
  };
}

/**
 * Voyage AI API 오류 응답 타입
 */
interface VoyageErrorResponse {
  error: {
    message: string;
    type: string;
    code?: string;
  };
}

/**
 * 입력 타입 (문서 또는 쿼리)
 */
type InputType = 'document' | 'query';

/**
 * Voyage AI API를 사용하여 단일 텍스트의 임베딩 생성
 * @param text 임베딩할 텍스트
 * @param inputType 'document' 또는 'query' (기본값: 'document')
 */
export const generateEmbedding = async (
  text: string, 
  inputType: InputType = 'document'
): Promise<EmbeddingResult> => {
  try {
    if (!text || text.trim().length === 0) {
      return {
        success: false,
        error: '빈 텍스트는 임베딩을 생성할 수 없습니다'
      };
    }

    // 텍스트 길이 검증 (토큰 수 추정: 대략 4자 = 1토큰)
    const estimatedTokens = Math.ceil(text.length / 4);
    if (estimatedTokens > VOYAGE_EMBEDDING_CONFIG.maxTokens) {
      return {
        success: false,
        error: `텍스트가 너무 깁니다. 최대 ${VOYAGE_EMBEDDING_CONFIG.maxTokens} 토큰까지 지원됩니다.`
      };
    }

    const apiKey = import.meta.env.VITE_VOYAGE_API_KEY;
    if (!apiKey) {
      return {
        success: false,
        error: 'Voyage API 키가 설정되지 않았습니다. .env 파일에 VITE_VOYAGE_API_KEY를 설정해주세요.'
      };
    }

    const response = await fetch(VOYAGE_EMBEDDING_CONFIG.apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: VOYAGE_EMBEDDING_CONFIG.model,
        input: text.trim(),
        input_type: inputType,
        truncation: true // 최대 컨텍스트 길이 초과 시 자동 잘라내기
      })
    });

    if (!response.ok) {
      const errorData: VoyageErrorResponse = await response.json().catch(() => ({
        error: { type: 'unknown', message: response.statusText }
      }));

      throw new Error(`Voyage API 오류 (${response.status}): ${errorData.error?.message || response.statusText}`);
    }

    const data: VoyageEmbeddingResponse = await response.json();

    if (!data.data || !data.data[0] || !data.data[0].embedding) {
      throw new Error('유효하지 않은 임베딩 응답');
    }

    return {
      success: true,
      embedding: data.data[0].embedding,
      tokens_used: data.usage?.total_tokens || 0
    };

  } catch (error) {
    // 보안 로깅 사용 (API 키 등 민감한 정보 자동 마스킹)
    const { logger } = await import('../lib/logger');
    logger.error('Voyage 임베딩 생성 오류', { error: error instanceof Error ? error.message : '알 수 없는 오류' });
    
    return {
      success: false,
      error: error instanceof Error ? error.message : '알 수 없는 오류'
    };
  }
};

/**
 * Voyage AI API를 사용하여 여러 텍스트의 임베딩을 배치로 생성
 * @param texts 임베딩할 텍스트 배열
 * @param inputType 'document' 또는 'query' (기본값: 'document')
 * @param onProgress 진행률 콜백 함수
 */
export const generateEmbeddings = async (
  texts: string[],
  inputType: InputType = 'document',
  onProgress?: (completed: number, total: number) => void
): Promise<BatchEmbeddingResult> => {
  const result: BatchEmbeddingResult = {
    success: true,
    embeddings: [],
    total_tokens: 0,
    failed_indices: [],
    errors: []
  };

  if (!texts || texts.length === 0) {
    result.success = false;
    result.errors.push('빈 텍스트 배열입니다');
    return result;
  }

  const apiKey = import.meta.env.VITE_VOYAGE_API_KEY;
  if (!apiKey) {
    result.success = false;
    result.errors.push('Voyage API 키가 설정되지 않았습니다. .env 파일에 VITE_VOYAGE_API_KEY를 설정해주세요.');
    return result;
  }

  // 10개 이하는 단일 API 호출로 처리 (Voyage API 최적화)
  if (texts.length <= VOYAGE_EMBEDDING_CONFIG.batchSize) {
    try {
      const validTexts = texts.filter(text => text && text.trim().length > 0);
      
      if (validTexts.length === 0) {
        result.success = false;
        result.errors.push('유효한 텍스트가 없습니다');
        return result;
      }

      const response = await fetch(VOYAGE_EMBEDDING_CONFIG.apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: VOYAGE_EMBEDDING_CONFIG.model,
          input: validTexts,
          input_type: inputType,
          truncation: true
        })
      });

      if (!response.ok) {
        const errorData: VoyageErrorResponse = await response.json().catch(() => ({
          error: { type: 'unknown', message: response.statusText }
        }));
        throw new Error(`Voyage API 오류 (${response.status}): ${errorData.error?.message || response.statusText}`);
      }

      const data: VoyageEmbeddingResponse = await response.json();
      
      if (!data.data || !Array.isArray(data.data)) {
        throw new Error('유효하지 않은 임베딩 응답');
      }

      // 결과 매핑
      data.data.forEach((item, index) => {
        if (item && item.embedding && Array.isArray(item.embedding)) {
          result.embeddings[index] = item.embedding;
        } else {
          result.failed_indices.push(index);
          result.errors.push(`인덱스 ${index}: 임베딩 데이터가 유효하지 않습니다`);
        }
      });

      result.total_tokens = data.usage?.total_tokens || 0;
      onProgress?.(texts.length, texts.length);

    } catch (error) {
      console.error('Voyage 배치 임베딩 생성 오류:', error);
      result.success = false;
      result.errors.push(error instanceof Error ? error.message : '알 수 없는 오류');
    }
  } else {
    // 10개 초과는 배치 처리
    for (let i = 0; i < texts.length; i += VOYAGE_EMBEDDING_CONFIG.batchSize) {
      const batch = texts.slice(i, i + VOYAGE_EMBEDDING_CONFIG.batchSize);
      const batchStartIndex = i;

      try {
        const validTexts: string[] = [];
        const validIndices: number[] = [];

        batch.forEach((text, batchIndex) => {
          const globalIndex = batchStartIndex + batchIndex;
          if (text && text.trim().length > 0) {
            const estimatedTokens = Math.ceil(text.length / 4);
            if (estimatedTokens <= VOYAGE_EMBEDDING_CONFIG.maxTokens) {
              validTexts.push(text.trim());
              validIndices.push(globalIndex);
            } else {
              result.failed_indices.push(globalIndex);
              result.errors.push(`인덱스 ${globalIndex}: 텍스트가 너무 깁니다`);
            }
          } else {
            result.failed_indices.push(globalIndex);
            result.errors.push(`인덱스 ${globalIndex}: 빈 텍스트입니다`);
          }
        });

        if (validTexts.length === 0) {
          onProgress?.(i + batch.length, texts.length);
          continue;
        }

        const response = await fetch(VOYAGE_EMBEDDING_CONFIG.apiUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: VOYAGE_EMBEDDING_CONFIG.model,
            input: validTexts,
            input_type: inputType,
            truncation: true
          })
        });

        if (!response.ok) {
          const errorData: VoyageErrorResponse = await response.json().catch(() => ({
            error: { type: 'unknown', message: response.statusText }
          }));

          const errorMessage = `Voyage API 오류 (${response.status}): ${errorData.error?.message || response.statusText}`;
          
          validIndices.forEach(index => {
            result.failed_indices.push(index);
            result.errors.push(`인덱스 ${index}: ${errorMessage}`);
          });

          onProgress?.(i + batch.length, texts.length);
          continue;
        }

        const data: VoyageEmbeddingResponse = await response.json();

        if (!data.data || !Array.isArray(data.data)) {
          const errorMessage = '유효하지 않은 임베딩 응답';
          validIndices.forEach(index => {
            result.failed_indices.push(index);
            result.errors.push(`인덱스 ${index}: ${errorMessage}`);
          });

          onProgress?.(i + batch.length, texts.length);
          continue;
        }

        // 임베딩 결과 처리
        data.data.forEach((item, dataIndex) => {
          const globalIndex = validIndices[dataIndex];
          if (item && item.embedding && Array.isArray(item.embedding)) {
            result.embeddings[globalIndex] = item.embedding;
          } else {
            result.failed_indices.push(globalIndex);
            result.errors.push(`인덱스 ${globalIndex}: 임베딩 데이터가 유효하지 않습니다`);
          }
        });

        result.total_tokens += data.usage?.total_tokens || 0;
        onProgress?.(i + batch.length, texts.length);

        // API 호출 간격 조절
        if (i + VOYAGE_EMBEDDING_CONFIG.batchSize < texts.length) {
          await new Promise(resolve => setTimeout(resolve, VOYAGE_EMBEDDING_CONFIG.rateLimitDelay));
        }

      } catch (error) {
        // 보안 로깅 사용
        const { logger } = await import('../lib/logger');
        logger.error(`Voyage 배치 ${Math.floor(i / VOYAGE_EMBEDDING_CONFIG.batchSize)} 처리 오류`, { 
          error: error instanceof Error ? error.message : '알 수 없는 오류',
          batchIndex: Math.floor(i / VOYAGE_EMBEDDING_CONFIG.batchSize)
        });

        for (let j = 0; j < batch.length; j++) {
          const globalIndex = batchStartIndex + j;
          result.failed_indices.push(globalIndex);
          result.errors.push(`인덱스 ${globalIndex}: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
        }

        onProgress?.(i + batch.length, texts.length);
      }
    }
  }

  result.success = result.failed_indices.length === 0;
  return result;
};

/**
 * 재시도 로직을 포함한 안전한 Voyage 임베딩 생성
 */
export const generateEmbeddingSafe = async (
  text: string, 
  inputType: InputType = 'document'
): Promise<EmbeddingResult> => {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < VOYAGE_EMBEDDING_CONFIG.retryAttempts; attempt++) {
    try {
      const result = await generateEmbedding(text, inputType);

      if (result.success) {
        return result;
      }

      // API 오류가 아닌 경우 재시도하지 않음
      if (result.error && !result.error.includes('API 오류')) {
        return result;
      }

      lastError = new Error(result.error || '알 수 없는 오류');

    } catch (error) {
      lastError = error instanceof Error ? error : new Error('알 수 없는 오류');
    }

    // 마지막 시도가 아닌 경우 대기
    if (attempt < VOYAGE_EMBEDDING_CONFIG.retryAttempts - 1) {
      const delay = VOYAGE_EMBEDDING_CONFIG.retryDelay * Math.pow(2, attempt);
      // 보안 로깅 사용
      const { logger } = await import('../lib/logger');
      logger.warn(`Voyage 임베딩 생성 실패 (시도 ${attempt + 1}/${VOYAGE_EMBEDDING_CONFIG.retryAttempts}), ${delay}ms 후 재시도`, {
        error: lastError?.message,
        attempt: attempt + 1,
        totalAttempts: VOYAGE_EMBEDDING_CONFIG.retryAttempts,
        delay
      });
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  return {
    success: false,
    error: `${VOYAGE_EMBEDDING_CONFIG.retryAttempts}번 시도 후 실패: ${lastError?.message || '알 수 없는 오류'}`
  };
};

/**
 * 검색용 쿼리 텍스트의 임베딩 생성 (최적화된 설정 사용)
 */
export const generateQueryEmbedding = async (query: string): Promise<EmbeddingResult> => {
  if (!query || query.trim().length === 0) {
    return {
      success: false,
      error: '검색 쿼리가 비어있습니다'
    };
  }

  return await generateEmbeddingSafe(query.trim(), 'query');
};

/**
 * Voyage AI 임베딩 서비스 상태 확인
 */
export const checkEmbeddingServiceHealth = async (): Promise<{
  available: boolean;
  model: string;
  error?: string;
}> => {
  try {
    const testResult = await generateEmbedding('테스트');

    return {
      available: testResult.success,
      model: VOYAGE_EMBEDDING_CONFIG.model,
      error: testResult.error
    };
  } catch (error) {
    return {
      available: false,
      model: VOYAGE_EMBEDDING_CONFIG.model,
      error: error instanceof Error ? error.message : '알 수 없는 오류'
    };
  }
};

/**
 * 사용 가능한 Voyage AI 모델 목록
 */
export const AVAILABLE_MODELS = {
  'voyage-3-large': {
    name: 'Voyage 3 Large',
    description: '최고 품질의 다국어 검색',
    contextLength: 32000,
    dimensions: [1024, 256, 512, 2048],
    cost: 'high'
  },
  'voyage-3.5': {
    name: 'Voyage 3.5',
    description: '일반적인 다국어 검색 최적화',
    contextLength: 32000,
    dimensions: [1024, 256, 512, 2048],
    cost: 'medium'
  },
  'voyage-3.5-lite': {
    name: 'Voyage 3.5 Lite',
    description: '지연 시간과 비용 최적화',
    contextLength: 32000,
    dimensions: [1024, 256, 512, 2048],
    cost: 'low'
  },
  'voyage-code-3': {
    name: 'Voyage Code 3',
    description: '코드 검색 최적화',
    contextLength: 32000,
    dimensions: [1024, 256, 512, 2048],
    cost: 'medium'
  },
  'voyage-finance-2': {
    name: 'Voyage Finance 2',
    description: '금융 도메인 최적화',
    contextLength: 32000,
    dimensions: [1024],
    cost: 'medium'
  },
  'voyage-law-2': {
    name: 'Voyage Law 2',
    description: '법률 및 긴 컨텍스트 최적화',
    contextLength: 16000,
    dimensions: [1024],
    cost: 'medium'
  }
} as const;

// 하위 호환성을 위한 별칭 함수들
export const generateClaudeEmbedding = generateEmbedding;
export const generateClaudeBatchEmbeddings = generateEmbeddings;
export const generateClaudeEmbeddingSafe = generateEmbeddingSafe;
export const generateClaudeQueryEmbedding = generateQueryEmbedding;
export const checkClaudeEmbeddingServiceHealth = checkEmbeddingServiceHealth;