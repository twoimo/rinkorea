// 텍스트 청킹 및 벡터 생성 서비스
import type { DocumentChunk } from '@/types/vector';

/**
 * 청킹 설정
 */
export const CHUNKING_CONFIG = {
  defaultChunkSize: 1000,
  defaultOverlap: 200,
  minChunkSize: 100,
  maxChunkSize: 4000,
  sentenceEndMarkers: ['.', '!', '?', '。', '！', '？'],
  paragraphMarkers: ['\n\n', '\r\n\r\n'],
  maxChunksPerDocument: 1000
} as const;

/**
 * 청킹 전략 타입
 */
export type ChunkingStrategy = 'sentence' | 'paragraph' | 'fixed' | 'semantic';

/**
 * 청킹 옵션
 */
export interface ChunkingOptions {
  strategy?: ChunkingStrategy;
  chunkSize?: number;
  overlap?: number;
  preserveFormatting?: boolean;
  respectSentenceBoundaries?: boolean;
  minChunkSize?: number;
  maxChunkSize?: number;
}

/**
 * 청킹 결과
 */
export interface ChunkingResult {
  chunks: string[];
  metadata: {
    totalChunks: number;
    averageChunkSize: number;
    strategy: ChunkingStrategy;
    processingTime: number;
  };
}

/**
 * 문장 경계 감지
 */
const findSentenceBoundary = (text: string, position: number): number => {
  const { sentenceEndMarkers } = CHUNKING_CONFIG;
  
  // 현재 위치에서 뒤로 검색
  for (let i = position; i >= Math.max(0, position - 200); i--) {
    if (sentenceEndMarkers.includes(text[i])) {
      // 문장 끝 마커 다음 위치 반환
      return i + 1;
    }
  }
  
  // 문장 경계를 찾지 못한 경우 원래 위치 반환
  return position;
};

/**
 * 단락 경계 감지
 */
const findParagraphBoundary = (text: string, position: number): number => {
  const { paragraphMarkers } = CHUNKING_CONFIG;
  
  for (let i = position; i >= Math.max(0, position - 500); i--) {
    for (const marker of paragraphMarkers) {
      if (text.substring(i, i + marker.length) === marker) {
        return i + marker.length;
      }
    }
  }
  
  return position;
};

/**
 * 고정 크기 청킹 (기본 전략)
 */
const chunkByFixedSize = (
  text: string,
  chunkSize: number,
  overlap: number,
  respectBoundaries: boolean = true
): string[] => {
  if (!text || text.trim().length === 0) {
    return [];
  }

  const chunks: string[] = [];
  let start = 0;

  while (start < text.length) {
    let end = Math.min(start + chunkSize, text.length);
    
    // 문장 경계 존중
    if (respectBoundaries && end < text.length) {
      const sentenceBoundary = findSentenceBoundary(text, end);
      if (sentenceBoundary > start + chunkSize * 0.5) {
        end = sentenceBoundary;
      }
    }

    const chunk = text.slice(start, end).trim();
    if (chunk.length >= CHUNKING_CONFIG.minChunkSize) {
      chunks.push(chunk);
    }

    // 다음 청크 시작점 계산 (오버랩 고려)
    start = Math.max(start + chunkSize - overlap, end);
    
    // 무한 루프 방지
    if (start >= text.length || chunks.length >= CHUNKING_CONFIG.maxChunksPerDocument) {
      break;
    }
  }

  return chunks;
};

/**
 * 문장 기반 청킹
 */
const chunkBySentence = (
  text: string,
  targetChunkSize: number,
  overlap: number
): string[] => {
  if (!text || text.trim().length === 0) {
    return [];
  }

  // 문장 분리
  const sentences = text
    .split(/([.!?。！？]+\s*)/)
    .filter(s => s.trim().length > 0)
    .reduce((acc: string[], curr, index, arr) => {
      if (index % 2 === 0) {
        const sentence = curr + (arr[index + 1] || '');
        if (sentence.trim().length > 0) {
          acc.push(sentence.trim());
        }
      }
      return acc;
    }, []);

  const chunks: string[] = [];
  let currentChunk = '';
  let overlapBuffer: string[] = [];

  for (const sentence of sentences) {
    const potentialChunk = currentChunk + (currentChunk ? ' ' : '') + sentence;
    
    if (potentialChunk.length <= targetChunkSize) {
      currentChunk = potentialChunk;
      overlapBuffer.push(sentence);
    } else {
      // 현재 청크 저장
      if (currentChunk.trim().length >= CHUNKING_CONFIG.minChunkSize) {
        chunks.push(currentChunk.trim());
      }
      
      // 오버랩 처리
      const overlapText = overlapBuffer
        .slice(-Math.ceil(overlap / 100))
        .join(' ');
      
      currentChunk = overlapText + (overlapText ? ' ' : '') + sentence;
      overlapBuffer = [sentence];
    }

    if (chunks.length >= CHUNKING_CONFIG.maxChunksPerDocument) {
      break;
    }
  }

  // 마지막 청크 추가
  if (currentChunk.trim().length >= CHUNKING_CONFIG.minChunkSize) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
};

/**
 * 단락 기반 청킹
 */
const chunkByParagraph = (
  text: string,
  targetChunkSize: number,
  overlap: number
): string[] => {
  if (!text || text.trim().length === 0) {
    return [];
  }

  // 단락 분리
  const paragraphs = text
    .split(/\n\s*\n/)
    .map(p => p.trim())
    .filter(p => p.length > 0);

  const chunks: string[] = [];
  let currentChunk = '';
  let overlapBuffer: string[] = [];

  for (const paragraph of paragraphs) {
    const potentialChunk = currentChunk + (currentChunk ? '\n\n' : '') + paragraph;
    
    if (potentialChunk.length <= targetChunkSize) {
      currentChunk = potentialChunk;
      overlapBuffer.push(paragraph);
    } else {
      // 현재 청크 저장
      if (currentChunk.trim().length >= CHUNKING_CONFIG.minChunkSize) {
        chunks.push(currentChunk.trim());
      }
      
      // 오버랩 처리
      const overlapText = overlapBuffer
        .slice(-1)
        .join('\n\n');
      
      currentChunk = overlapText + (overlapText ? '\n\n' : '') + paragraph;
      overlapBuffer = [paragraph];
    }

    if (chunks.length >= CHUNKING_CONFIG.maxChunksPerDocument) {
      break;
    }
  }

  // 마지막 청크 추가
  if (currentChunk.trim().length >= CHUNKING_CONFIG.minChunkSize) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
};

/**
 * 의미론적 청킹 (향후 구현)
 */
const chunkBySemantic = (
  text: string,
  targetChunkSize: number,
  overlap: number
): string[] => {
  // 현재는 문장 기반 청킹으로 대체
  // 향후 임베딩 기반 의미론적 유사도를 활용한 청킹 구현 예정
  console.warn('의미론적 청킹은 현재 개발 중입니다. 문장 기반 청킹을 사용합니다.');
  return chunkBySentence(text, targetChunkSize, overlap);
};

/**
 * 텍스트 청킹 메인 함수
 */
export const chunkText = (
  text: string,
  options: ChunkingOptions = {}
): ChunkingResult => {
  const startTime = Date.now();
  
  const {
    strategy = 'fixed',
    chunkSize = CHUNKING_CONFIG.defaultChunkSize,
    overlap = CHUNKING_CONFIG.defaultOverlap,
    respectSentenceBoundaries = true
  } = options;

  // 입력 검증
  if (!text || text.trim().length === 0) {
    return {
      chunks: [],
      metadata: {
        totalChunks: 0,
        averageChunkSize: 0,
        strategy,
        processingTime: Date.now() - startTime
      }
    };
  }

  // 청킹 크기 검증 및 조정
  const validatedChunkSize = Math.max(
    CHUNKING_CONFIG.minChunkSize,
    Math.min(chunkSize, CHUNKING_CONFIG.maxChunkSize)
  );

  const validatedOverlap = Math.max(0, Math.min(overlap, validatedChunkSize * 0.5));

  let chunks: string[] = [];

  // 전략별 청킹 실행
  switch (strategy) {
    case 'sentence':
      chunks = chunkBySentence(text, validatedChunkSize, validatedOverlap);
      break;
    case 'paragraph':
      chunks = chunkByParagraph(text, validatedChunkSize, validatedOverlap);
      break;
    case 'semantic':
      chunks = chunkBySemantic(text, validatedChunkSize, validatedOverlap);
      break;
    case 'fixed':
    default:
      chunks = chunkByFixedSize(text, validatedChunkSize, validatedOverlap, respectSentenceBoundaries);
      break;
  }

  // 통계 계산
  const totalChunks = chunks.length;
  const averageChunkSize = totalChunks > 0 
    ? Math.round(chunks.reduce((sum, chunk) => sum + chunk.length, 0) / totalChunks)
    : 0;

  return {
    chunks,
    metadata: {
      totalChunks,
      averageChunkSize,
      strategy,
      processingTime: Date.now() - startTime
    }
  };
};

/**
 * 청크 품질 검증
 */
export const validateChunks = (chunks: string[]): {
  valid: boolean;
  issues: string[];
  recommendations: string[];
} => {
  const issues: string[] = [];
  const recommendations: string[] = [];

  if (chunks.length === 0) {
    issues.push('청크가 생성되지 않았습니다');
    return { valid: false, issues, recommendations };
  }

  // 크기 검증
  const tooSmallChunks = chunks.filter(chunk => chunk.length < CHUNKING_CONFIG.minChunkSize);
  const tooLargeChunks = chunks.filter(chunk => chunk.length > CHUNKING_CONFIG.maxChunkSize);

  if (tooSmallChunks.length > 0) {
    issues.push(`${tooSmallChunks.length}개 청크가 최소 크기(${CHUNKING_CONFIG.minChunkSize}자)보다 작습니다`);
    recommendations.push('청크 크기를 줄이거나 오버랩을 늘려보세요');
  }

  if (tooLargeChunks.length > 0) {
    issues.push(`${tooLargeChunks.length}개 청크가 최대 크기(${CHUNKING_CONFIG.maxChunkSize}자)를 초과합니다`);
    recommendations.push('청크 크기를 줄여보세요');
  }

  // 빈 청크 검증
  const emptyChunks = chunks.filter(chunk => chunk.trim().length === 0);
  if (emptyChunks.length > 0) {
    issues.push(`${emptyChunks.length}개의 빈 청크가 있습니다`);
  }

  // 중복 청크 검증
  const uniqueChunks = new Set(chunks);
  if (uniqueChunks.size < chunks.length) {
    issues.push(`${chunks.length - uniqueChunks.size}개의 중복 청크가 있습니다`);
    recommendations.push('오버랩 설정을 확인해보세요');
  }

  // 청크 수 검증
  if (chunks.length > CHUNKING_CONFIG.maxChunksPerDocument) {
    issues.push(`청크 수(${chunks.length})가 최대 허용 수(${CHUNKING_CONFIG.maxChunksPerDocument})를 초과합니다`);
    recommendations.push('청크 크기를 늘리거나 문서를 분할해보세요');
  }

  const valid = issues.length === 0;
  return { valid, issues, recommendations };
};

/**
 * 청킹 전략 추천
 */
export const recommendChunkingStrategy = (text: string): {
  strategy: ChunkingStrategy;
  reason: string;
  options: ChunkingOptions;
} => {
  const textLength = text.length;
  const paragraphCount = text.split(/\n\s*\n/).length;
  const sentenceCount = text.split(/[.!?。！？]+/).length;

  // 짧은 텍스트
  if (textLength < 2000) {
    return {
      strategy: 'fixed',
      reason: '짧은 텍스트이므로 고정 크기 청킹이 적합합니다',
      options: { chunkSize: 500, overlap: 100 }
    };
  }

  // 단락이 많은 구조화된 텍스트
  if (paragraphCount > textLength / 1000) {
    return {
      strategy: 'paragraph',
      reason: '단락 구조가 잘 정의되어 있어 단락 기반 청킹이 적합합니다',
      options: { chunkSize: 1200, overlap: 200 }
    };
  }

  // 문장이 많은 텍스트
  if (sentenceCount > textLength / 100) {
    return {
      strategy: 'sentence',
      reason: '문장 구조가 명확하여 문장 기반 청킹이 적합합니다',
      options: { chunkSize: 1000, overlap: 150 }
    };
  }

  // 기본값
  return {
    strategy: 'fixed',
    reason: '일반적인 텍스트이므로 고정 크기 청킹을 사용합니다',
    options: { chunkSize: 1000, overlap: 200 }
  };
};

/**
 * 청크 메타데이터 생성
 */
export const generateChunkMetadata = (
  chunk: string,
  index: number,
  totalChunks: number,
  documentId: string
): Record<string, any> => {
  return {
    chunk_index: index,
    total_chunks: totalChunks,
    document_id: documentId,
    length: chunk.length,
    word_count: chunk.split(/\s+/).length,
    sentence_count: chunk.split(/[.!?。！？]+/).filter(s => s.trim().length > 0).length,
    created_at: new Date().toISOString(),
    hash: generateChunkHash(chunk)
  };
};

/**
 * 청크 해시 생성 (중복 감지용)
 */
const generateChunkHash = (chunk: string): string => {
  // 간단한 해시 함수 (실제 환경에서는 crypto 라이브러리 사용 권장)
  let hash = 0;
  for (let i = 0; i < chunk.length; i++) {
    const char = chunk.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // 32비트 정수로 변환
  }
  return Math.abs(hash).toString(16);
};