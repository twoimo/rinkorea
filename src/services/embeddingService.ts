// 텍스트 임베딩 및 벡터 생성 서비스
import { supabase } from '@/integrations/supabase/client';

/**
 * 임베딩 설정
 */
export const EMBEDDING_CONFIG = {
  model: 'text-embedding-3-small',
  dimensions: 1536,
  maxTokens: 8191,
  batchSize: 100, // 한 번에 처리할 청크 수
  retryAttempts: 3,
  retryDelay: 1000
} as const;

/**
 * 임베딩 결과 타입
 */
export interface EmbeddingResult {
  success: boolean;
  embedding?: number[];
  error?: string;
  tokens_used?: number;
}

/**
 * 배치 임베딩 결과 타입
 */
export interface BatchEmbeddingResult {
  success: boolean;
  embeddings: number[][];
  total_tokens: number;
  failed_indices: number[];
  errors: string[];
}

/**
 * 벡터 저장 결과 타입
 */
export interface VectorStorageResult {
  success: boolean;
  vectors_stored: number;
  failed_chunks: number;
  error?: string;
}

/**
 * OpenAI API를 사용하여 단일 텍스트의 임베딩 생성
 */
export const generateEmbedding = async (text: string): Promise<EmbeddingResult> => {
  try {
    if (!text || text.trim().length === 0) {
      return {
        success: false,
        error: '빈 텍스트는 임베딩을 생성할 수 없습니다'
      };
    }

    // 텍스트 길이 검증 (토큰 수 추정: 대략 4자 = 1토큰)
    const estimatedTokens = Math.ceil(text.length / 4);
    if (estimatedTokens > EMBEDDING_CONFIG.maxTokens) {
      return {
        success: false,
        error: `텍스트가 너무 깁니다. 최대 ${EMBEDDING_CONFIG.maxTokens} 토큰까지 지원됩니다.`
      };
    }

    const response = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: EMBEDDING_CONFIG.model,
        input: text,
        dimensions: EMBEDDING_CONFIG.dimensions
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`OpenAI API 오류 (${response.status}): ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.data || !data.data[0] || !data.data[0].embedding) {
      throw new Error('유효하지 않은 임베딩 응답');
    }

    return {
      success: true,
      embedding: data.data[0].embedding,
      tokens_used: data.usage?.total_tokens || 0
    };

  } catch (error) {
    console.error('임베딩 생성 오류:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '알 수 없는 오류'
    };
  }
};

/**
 * 여러 텍스트의 임베딩을 배치로 생성
 */
export const generateBatchEmbeddings = async (
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

  // 배치 단위로 처리
  for (let i = 0; i < texts.length; i += EMBEDDING_CONFIG.batchSize) {
    const batch = texts.slice(i, i + EMBEDDING_CONFIG.batchSize);
    const batchStartIndex = i;

    try {
      // 배치 내 각 텍스트 검증
      const validTexts: string[] = [];
      const validIndices: number[] = [];

      batch.forEach((text, batchIndex) => {
        const globalIndex = batchStartIndex + batchIndex;
        if (text && text.trim().length > 0) {
          const estimatedTokens = Math.ceil(text.length / 4);
          if (estimatedTokens <= EMBEDDING_CONFIG.maxTokens) {
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

      // OpenAI API 호출
      const response = await fetch('https://api.openai.com/v1/embeddings', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: EMBEDDING_CONFIG.model,
          input: validTexts,
          dimensions: EMBEDDING_CONFIG.dimensions
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = `OpenAI API 오류 (${response.status}): ${errorData.error?.message || response.statusText}`;
        
        // 배치 전체 실패 처리
        validIndices.forEach(index => {
          result.failed_indices.push(index);
          result.errors.push(`인덱스 ${index}: ${errorMessage}`);
        });
        
        onProgress?.(i + batch.length, texts.length);
        continue;
      }

      const data = await response.json();
      
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
      data.data.forEach((item: any, dataIndex: number) => {
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
      result.total_tokens += data.usage?.total_tokens || 0;

      // 진행률 업데이트
      onProgress?.(i + batch.length, texts.length);

      // API 호출 간격 조절 (Rate Limit 방지)
      if (i + EMBEDDING_CONFIG.batchSize < texts.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }

    } catch (error) {
      console.error(`배치 ${Math.floor(i / EMBEDDING_CONFIG.batchSize)} 처리 오류:`, error);
      
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
 * 재시도 로직을 포함한 안전한 임베딩 생성
 */
export const generateEmbeddingSafe = async (text: string): Promise<EmbeddingResult> => {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < EMBEDDING_CONFIG.retryAttempts; attempt++) {
    try {
      const result = await generateEmbedding(text);
      
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
    if (attempt < EMBEDDING_CONFIG.retryAttempts - 1) {
      const delay = EMBEDDING_CONFIG.retryDelay * Math.pow(2, attempt);
      console.warn(`임베딩 생성 실패 (시도 ${attempt + 1}/${EMBEDDING_CONFIG.retryAttempts}), ${delay}ms 후 재시도:`, lastError?.message);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  return {
    success: false,
    error: `${EMBEDDING_CONFIG.retryAttempts}번 시도 후 실패: ${lastError?.message || '알 수 없는 오류'}`
  };
};

/**
 * 문서 청크들의 벡터를 생성하고 데이터베이스에 저장
 */
export const generateAndStoreVectors = async (
  documentId: string,
  chunks: string[],
  onProgress?: (completed: number, total: number) => void
): Promise<VectorStorageResult> => {
  try {
    if (!chunks || chunks.length === 0) {
      return {
        success: false,
        vectors_stored: 0,
        failed_chunks: 0,
        error: '저장할 청크가 없습니다'
      };
    }

    console.log(`문서 ${documentId}의 ${chunks.length}개 청크에 대한 벡터 생성 시작`);

    // 배치 임베딩 생성
    const embeddingResult = await generateBatchEmbeddings(chunks, onProgress);

    if (!embeddingResult.success && embeddingResult.embeddings.length === 0) {
      return {
        success: false,
        vectors_stored: 0,
        failed_chunks: chunks.length,
        error: '모든 청크의 임베딩 생성에 실패했습니다'
      };
    }

    // 성공한 임베딩들을 데이터베이스에 저장
    let vectorsStored = 0;
    let failedChunks = 0;

    for (let i = 0; i < chunks.length; i++) {
      const embedding = embeddingResult.embeddings[i];
      
      if (!embedding || !Array.isArray(embedding)) {
        failedChunks++;
        continue;
      }

      try {
        // document_chunks 테이블에서 해당 청크 업데이트
        const { error: updateError } = await supabase
          .from('document_chunks')
          .update({
            embedding: embedding,
            metadata: {
              embedding_model: EMBEDDING_CONFIG.model,
              embedding_dimensions: EMBEDDING_CONFIG.dimensions,
              created_at: new Date().toISOString()
            }
          })
          .eq('document_id', documentId)
          .eq('chunk_index', i);

        if (updateError) {
          console.error(`청크 ${i} 벡터 저장 실패:`, updateError);
          failedChunks++;
        } else {
          vectorsStored++;
        }

      } catch (error) {
        console.error(`청크 ${i} 벡터 저장 오류:`, error);
        failedChunks++;
      }
    }

    // 문서 메타데이터 업데이트
    await supabase
      .from('documents')
      .update({
        metadata: {
          vectors_generated: vectorsStored,
          total_tokens_used: embeddingResult.total_tokens,
          embedding_model: EMBEDDING_CONFIG.model,
          vector_generation_completed_at: new Date().toISOString()
        }
      })
      .eq('id', documentId);

    console.log(`벡터 생성 완료: ${vectorsStored}개 성공, ${failedChunks}개 실패`);

    return {
      success: vectorsStored > 0,
      vectors_stored: vectorsStored,
      failed_chunks: failedChunks,
      error: failedChunks > 0 ? `${failedChunks}개 청크의 벡터 생성에 실패했습니다` : undefined
    };

  } catch (error) {
    console.error('벡터 생성 및 저장 오류:', error);
    return {
      success: false,
      vectors_stored: 0,
      failed_chunks: chunks.length,
      error: error instanceof Error ? error.message : '알 수 없는 오류'
    };
  }
};

/**
 * 검색용 쿼리 텍스트의 임베딩 생성
 */
export const generateQueryEmbedding = async (query: string): Promise<EmbeddingResult> => {
  if (!query || query.trim().length === 0) {
    return {
      success: false,
      error: '검색 쿼리가 비어있습니다'
    };
  }

  return await generateEmbeddingSafe(query.trim());
};

/**
 * 임베딩 서비스 상태 확인
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
      model: EMBEDDING_CONFIG.model,
      error: testResult.error
    };
  } catch (error) {
    return {
      available: false,
      model: EMBEDDING_CONFIG.model,
      error: error instanceof Error ? error.message : '알 수 없는 오류'
    };
  }
};

/**
 * 임베딩 통계 조회
 */
export const getEmbeddingStats = async (): Promise<{
  total_vectors: number;
  total_documents_with_vectors: number;
  avg_vector_dimension: number;
  models_used: string[];
}> => {
  try {
    const { data: chunks, error } = await supabase
      .from('document_chunks')
      .select('embedding, metadata')
      .not('embedding', 'is', null);

    if (error) {
      throw new Error(`벡터 통계 조회 실패: ${error.message}`);
    }

    const stats = {
      total_vectors: chunks.length,
      total_documents_with_vectors: 0,
      avg_vector_dimension: 0,
      models_used: [] as string[]
    };

    if (chunks.length > 0) {
      // 차원 수 계산
      const dimensions = chunks
        .filter(chunk => chunk.embedding && Array.isArray(chunk.embedding))
        .map(chunk => chunk.embedding.length);
      
      if (dimensions.length > 0) {
        stats.avg_vector_dimension = Math.round(
          dimensions.reduce((sum, dim) => sum + dim, 0) / dimensions.length
        );
      }

      // 사용된 모델 목록
      const models = new Set<string>();
      chunks.forEach(chunk => {
        if (chunk.metadata?.embedding_model) {
          models.add(chunk.metadata.embedding_model);
        }
      });
      stats.models_used = Array.from(models);

      // 벡터가 있는 문서 수 계산
      const { data: documents, error: docError } = await supabase
        .from('documents')
        .select('id')
        .gt('metadata->vectors_generated', 0);

      if (!docError && documents) {
        stats.total_documents_with_vectors = documents.length;
      }
    }

    return stats;
  } catch (error) {
    console.error('임베딩 통계 조회 오류:', error);
    throw error;
  }
};