// Claude Embeddings API 연동 서비스
import type { EmbeddingResult, BatchEmbeddingResult, VectorStorageResult } from './embeddingService';

/**
 * Claude 임베딩 설정
 */
export const CLAUDE_EMBEDDING_CONFIG = {
  apiUrl: 'https://api.anthropic.com/v1/embeddings',
  model: 'claude-3-haiku-20240307', // Claude 임베딩 모델
  dimensions: 1024, // Claude 임베딩 차원
  maxTokens: 8000,
  batchSize: 50, // Claude API 배치 크기
  retryAttempts: 3,
  retryDelay: 1000,
  rateLimitDelay: 100 // API 호출 간격
} as const;

/**
 * Claude API 응답 타입
 */
interface ClaudeEmbeddingResponse {
  embeddings: Array<{
    embedding: number[];
    index: number;
  }>;
  usage: {
    input_tokens: number;
    output_tokens: number;
  };
}

/**
 * Claude API 오류 응답 타입
 */
interface ClaudeErrorResponse {
  error: {
    type: string;
    message: string;
  };
}

/**
 * Claude API를 사용하여 단일 텍스트의 임베딩 생성
 */
export const generateClaudeEmbedding = async (text: string): Promise<EmbeddingResult> => {
  try {
    if (!text || text.trim().length === 0) {
      return {
        success: false,
        error: '빈 텍스트는 임베딩을 생성할 수 없습니다'
      };
    }

    // 텍스트 길이 검증 (토큰 수 추정: 대략 4자 = 1토큰)
    const estimatedTokens = Math.ceil(text.length / 4);
    if (estimatedTokens > CLAUDE_EMBEDDING_CONFIG.maxTokens) {
      return {
        success: false,
        error: `텍스트가 너무 깁니다. 최대 ${CLAUDE_EMBEDDING_CONFIG.maxTokens} 토큰까지 지원됩니다.`
      };
    }

    const apiKey = import.meta.env.VITE_CLAUDE_API_KEY;
    if (!apiKey) {
      return {
        success: false,
        error: 'Claude API 키가 설정되지 않았습니다'
      };
    }

    const response = await fetch(CLAUDE_EMBEDDING_CONFIG.apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: CLAUDE_EMBEDDING_CONFIG.model,
        input: [text.trim()]
      })
    });

    if (!response.ok) {
      const errorData: ClaudeErrorResponse = await response.json().catch(() => ({
        error: { type: 'unknown', message: response.statusText }
      }));
      
      throw new Error(`Claude API 오류 (${response.status}): ${errorData.error?.message || response.statusText}`);
    }

    const data: ClaudeEmbeddingResponse = await response.json();
    
    if (!data.embeddings || !data.embeddings[0] || !data.embeddings[0].embedding) {
      throw new Error('유효하지 않은 임베딩 응답');
    }

    return {
      success: true,
      embedding: data.embeddings[0].embedding,
      tokens_used: data.usage?.input_tokens || 0
    };

  } catch (error) {
    console.error('Claude 임베딩 생성 오류:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '알 수 없는 오류'
    };
  }
};

/**
 * Claude API를 사용하여 여러 텍스트의 임베딩을 배치로 생성
 */
export const generateClaudeBatchEmbeddings = async (
  texts: string[],
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

  const apiKey = import.meta.env.VITE_CLAUDE_API_KEY;
  if (!apiKey) {
    result.success = false;
    result.errors.push('Claude API 키가 설정되지 않았습니다');
    return result;
  }

  // 배치 단위로 처리
  for (let i = 0; i < texts.length; i += CLAUDE_EMBEDDING_CONFIG.batchSize) {
    const batch = texts.slice(i, i + CLAUDE_EMBEDDING_CONFIG.batchSize);
    const batchStartIndex = i;

    try {
      // 배치 내 각 텍스트 검증
      const validTexts: string[] = [];
      const validIndices: number[] = [];

      batch.forEach((text, batchIndex) => {
        const globalIndex = batchStartIndex + batchIndex;
        if (text && text.trim().length > 0) {
          const estimatedTokens = Math.ceil(text.length / 4);
          if (estimatedTokens <= CLAUDE_EMBEDDING_CONFIG.maxTokens) {
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

      // Claude API 호출
      const response = await fetch(CLAUDE_EMBEDDING_CONFIG.apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: CLAUDE_EMBEDDING_CONFIG.model,
          input: validTexts
        })
      });

      if (!response.ok) {
        const errorData: ClaudeErrorResponse = await response.json().catch(() => ({
          error: { type: 'unknown', message: response.statusText }
        }));
        
        const errorMessage = `Claude API 오류 (${response.status}): ${errorData.error?.message || response.statusText}`;
        
        // 배치 전체 실패 처리
        validIndices.forEach(index => {
          result.failed_indices.push(index);
          result.errors.push(`인덱스 ${index}: ${errorMessage}`);
        });
        
        onProgress?.(i + batch.length, texts.length);
        continue;
      }

      const data: ClaudeEmbeddingResponse = await response.json();
      
      if (!data.embeddings || !Array.isArray(data.embeddings)) {
        const errorMessage = '유효하지 않은 임베딩 응답';
        validIndices.forEach(index => {
          result.failed_indices.push(index);
          result.errors.push(`인덱스 ${index}: ${errorMessage}`);
        });
        
        onProgress?.(i + batch.length, texts.length);
        continue;
      }

      // 임베딩 결과 처리
      data.embeddings.forEach((item, dataIndex) => {
        const globalIndex = validIndices[dataIndex];
        if (item && item.embedding && Array.isArray(item.embedding)) {
          // 결과 배열의 올바른 위치에 임베딩 저장
          result.embeddings[globalIndex] = item.embedding;
        } else {
          result.failed_indices.push(globalIndex);
          result.errors.push(`인덱스 ${globalIndex}: 임베딩 데이터가 유효하지 않습니다`);
        }
      });

      // 토큰 사용량 누적
      result.total_tokens += data.usage?.input_tokens || 0;

      // 진행률 업데이트
      onProgress?.(i + batch.length, texts.length);

      // API 호출 간격 조절 (Rate Limit 방지)
      if (i + CLAUDE_EMBEDDING_CONFIG.batchSize < texts.length) {
        await new Promise(resolve => setTimeout(resolve, CLAUDE_EMBEDDING_CONFIG.rateLimitDelay));
      }

    } catch (error) {
      console.error(`Claude 배치 ${Math.floor(i / CLAUDE_EMBEDDING_CONFIG.batchSize)} 처리 오류:`, error);
      
      // 배치 전체 실패 처리
      for (let j = 0; j < batch.length; j++) {
        const globalIndex = batchStartIndex + j;
        result.failed_indices.push(globalIndex);
        result.errors.push(`인덱스 ${globalIndex}: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
      }
      
      onProgress?.(i + batch.length, texts.length);
    }
  }

  // 전체 성공 여부 판단
  result.success = result.failed_indices.length === 0;

  return result;
};

/**
 * 재시도 로직을 포함한 안전한 Claude 임베딩 생성
 */
export const generateClaudeEmbeddingSafe = async (text: string): Promise<EmbeddingResult> => {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < CLAUDE_EMBEDDING_CONFIG.retryAttempts; attempt++) {
    try {
      const result = await generateClaudeEmbedding(text);
      
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
    if (attempt < CLAUDE_EMBEDDING_CONFIG.retryAttempts - 1) {
      const delay = CLAUDE_EMBEDDING_CONFIG.retryDelay * Math.pow(2, attempt);
      console.warn(`Claude 임베딩 생성 실패 (시도 ${attempt + 1}/${CLAUDE_EMBEDDING_CONFIG.retryAttempts}), ${delay}ms 후 재시도:`, lastError?.message);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  return {
    success: false,
    error: `${CLAUDE_EMBEDDING_CONFIG.retryAttempts}번 시도 후 실패: ${lastError?.message || '알 수 없는 오류'}`
  };
};

/**
 * Claude 검색용 쿼리 텍스트의 임베딩 생성
 */
export const generateClaudeQueryEmbedding = async (query: string): Promise<EmbeddingResult> => {
  if (!query || query.trim().length === 0) {
    return {
      success: false,
      error: '검색 쿼리가 비어있습니다'
    };
  }

  return await generateClaudeEmbeddingSafe(query.trim());
};

/**
 * Claude 임베딩 서비스 상태 확인
 */
export const checkClaudeEmbeddingServiceHealth = async (): Promise<{
  available: boolean;
  model: string;
  error?: string;
}> => {
  try {
    const testResult = await generateClaudeEmbedding('테스트');
    
    return {
      available: testResult.success,
      model: CLAUDE_EMBEDDING_CONFIG.model,
      error: testResult.error
    };
  } catch (error) {
    return {
      available: false,
      model: CLAUDE_EMBEDDING_CONFIG.model,
      error: error instanceof Error ? error.message : '알 수 없는 오류'
    };
  }
};

/**
 * 임베딩 모델 비교 (OpenAI vs Claude)
 */
export const compareEmbeddingModels = async (text: string): Promise<{
  openai_result?: EmbeddingResult;
  claude_result?: EmbeddingResult;
  recommendation: 'openai' | 'claude' | 'both';
  reason: string;
}> => {
  const results = await Promise.allSettled([
    // OpenAI 임베딩 (기존 서비스에서 가져오기)
    import('./embeddingService').then(module => module.generateEmbeddingSafe(text)),
    // Claude 임베딩
    generateClaudeEmbeddingSafe(text)
  ]);

  const openaiResult = results[0].status === 'fulfilled' ? results[0].value : undefined;
  const claudeResult = results[1].status === 'fulfilled' ? results[1].value : undefined;

  let recommendation: 'openai' | 'claude' | 'both' = 'both';
  let reason = '';

  if (openaiResult?.success && claudeResult?.success) {
    recommendation = 'both';
    reason = '두 모델 모두 성공적으로 임베딩을 생성했습니다. 용도에 따라 선택하세요.';
  } else if (openaiResult?.success && !claudeResult?.success) {
    recommendation = 'openai';
    reason = `OpenAI만 성공했습니다. Claude 오류: ${claudeResult?.error}`;
  } else if (!openaiResult?.success && claudeResult?.success) {
    recommendation = 'claude';
    reason = `Claude만 성공했습니다. OpenAI 오류: ${openaiResult?.error}`;
  } else {
    recommendation = 'openai'; // 기본값
    reason = '두 모델 모두 실패했습니다. 기본적으로 OpenAI를 권장합니다.';
  }

  return {
    openai_result: openaiResult,
    claude_result: claudeResult,
    recommendation,
    reason
  };
};