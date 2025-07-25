// RAG (Retrieval-Augmented Generation) 검색 서비스
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';
import type { 
  SearchResult, 
  SearchType,
  Collection 
} from '@/types/vector';
import { 
  semanticSearch, 
  keywordSearch, 
  hybridSearch,
  searchWithFilters 
} from './searchService';
import { getActiveCollections } from './collectionService';

export interface RAGSearchOptions {
  query: string;
  maxResults?: number;
  minSimilarity?: number;
  searchType?: SearchType;
  collectionIds?: string[];
  includeMetadata?: boolean;
  contextWindow?: number; // 주변 청크 포함 개수
}

export interface RAGContext {
  query: string;
  results: RAGSearchResult[];
  totalResults: number;
  searchType: SearchType;
  executionTime: number;
  sources: RAGSource[];
}

export interface RAGSearchResult {
  content: string;
  source: RAGSource;
  relevanceScore: number;
  contextBefore?: string;
  contextAfter?: string;
  metadata: Record<string, any>;
}

export interface RAGSource {
  documentId: string;
  documentName: string;
  collectionId: string;
  collectionName: string;
  chunkId: string;
  chunkIndex: number;
  confidence: number;
}

export interface RAGPromptContext {
  systemPrompt: string;
  userQuery: string;
  context: string;
  sources: string;
  instructions: string;
}

/**
 * AI 에이전트를 위한 RAG 검색 실행
 */
export const performRAGSearch = async (options: RAGSearchOptions): Promise<RAGContext> => {
  const startTime = Date.now();
  const {
    query,
    maxResults = 10,
    minSimilarity = 0.7,
    searchType = 'hybrid',
    collectionIds,
    includeMetadata = true,
    contextWindow = 1
  } = options;

  try {
    // 1단계: 기본 검색 실행
    let searchResults: SearchResult[];
    
    if (collectionIds && collectionIds.length > 0) {
      // 특정 컬렉션에서 검색
      searchResults = await searchWithFilters(query, searchType, {
        collection_ids: collectionIds,
        min_similarity: minSimilarity
      });
    } else {
      // 전체 검색
      switch (searchType) {
        case 'semantic':
          searchResults = await semanticSearch({
            query,
            match_threshold: minSimilarity,
            match_count: maxResults * 2 // 더 많은 결과를 가져와서 필터링
          });
          break;
        case 'keyword':
          searchResults = await keywordSearch({
            query,
            match_count: maxResults * 2,
            highlight: false // RAG에서는 하이라이팅 불필요
          });
          break;
        case 'hybrid':
        default:
          searchResults = await hybridSearch({
            query,
            match_count: maxResults * 2,
            semantic_weight: 0.7,
            keyword_weight: 0.3
          });
          break;
      }
    }

    // 2단계: 결과 필터링 및 정렬
    const filteredResults = searchResults
      .filter(result => {
        if (searchType === 'semantic' && result.similarity_score) {
          return result.similarity_score >= minSimilarity;
        }
        return true;
      })
      .slice(0, maxResults);

    // 3단계: 컨텍스트 윈도우 적용 (주변 청크 포함)
    const enrichedResults = await enrichWithContext(filteredResults, contextWindow);

    // 4단계: RAG 결과 형식으로 변환
    const ragResults: RAGSearchResult[] = enrichedResults.map(result => ({
      content: result.content,
      source: {
        documentId: result.document_id,
        documentName: result.document_name,
        collectionId: result.collection_id,
        collectionName: result.collection_name,
        chunkId: result.chunk_id,
        chunkIndex: result.chunk_index || 0,
        confidence: result.similarity_score || result.rank || 0
      },
      relevanceScore: result.similarity_score || result.rank || 0,
      contextBefore: result.contextBefore,
      contextAfter: result.contextAfter,
      metadata: includeMetadata ? result.metadata : {}
    }));

    // 5단계: 소스 정보 생성
    const sources: RAGSource[] = ragResults.map(result => result.source);

    const executionTime = Date.now() - startTime;

    return {
      query,
      results: ragResults,
      totalResults: searchResults.length,
      searchType,
      executionTime,
      sources
    };

  } catch (error) {
    console.error('RAG 검색 오류:', error);
    throw new Error(`RAG 검색 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
  }
};

/**
 * 검색 결과에 주변 컨텍스트 추가
 */
const enrichWithContext = async (
  results: SearchResult[], 
  contextWindow: number
): Promise<(SearchResult & { contextBefore?: string; contextAfter?: string; chunk_index?: number })[]> => {
  if (contextWindow === 0) {
    return results;
  }

  const enrichedResults = await Promise.all(
    results.map(async (result) => {
      try {
        // 현재 청크의 인덱스 조회
        const { data: currentChunk, error: chunkError } = await supabase
          .from('document_chunks')
          .select('chunk_index')
          .eq('id', result.chunk_id)
          .single();

        if (chunkError || !currentChunk) {
          return { ...result, chunk_index: 0 };
        }

        const chunkIndex = currentChunk.chunk_index;

        // 주변 청크들 조회
        const { data: contextChunks, error: contextError } = await supabase
          .from('document_chunks')
          .select('chunk_index, content')
          .eq('document_id', result.document_id)
          .gte('chunk_index', Math.max(0, chunkIndex - contextWindow))
          .lte('chunk_index', chunkIndex + contextWindow)
          .order('chunk_index', { ascending: true });

        if (contextError || !contextChunks) {
          return { ...result, chunk_index: chunkIndex };
        }

        // 이전 컨텍스트
        const beforeChunks = contextChunks
          .filter(chunk => chunk.chunk_index < chunkIndex)
          .map(chunk => chunk.content);
        const contextBefore = beforeChunks.length > 0 ? beforeChunks.join(' ') : undefined;

        // 이후 컨텍스트
        const afterChunks = contextChunks
          .filter(chunk => chunk.chunk_index > chunkIndex)
          .map(chunk => chunk.content);
        const contextAfter = afterChunks.length > 0 ? afterChunks.join(' ') : undefined;

        return {
          ...result,
          chunk_index: chunkIndex,
          contextBefore,
          contextAfter
        };

      } catch (error) {
        console.error('컨텍스트 추가 오류:', error);
        return { ...result, chunk_index: 0 };
      }
    })
  );

  return enrichedResults;
};

/**
 * RAG 컨텍스트를 AI 프롬프트 형식으로 변환
 */
export const formatRAGPrompt = (
  ragContext: RAGContext,
  userQuery: string,
  systemInstructions?: string
): RAGPromptContext => {
  // 컨텍스트 문서 생성
  const contextDocuments = ragContext.results.map((result, index) => {
    let content = result.content;
    
    // 주변 컨텍스트 포함
    if (result.contextBefore) {
      content = `...${result.contextBefore} ${content}`;
    }
    if (result.contextAfter) {
      content = `${content} ${result.contextAfter}...`;
    }

    return `[문서 ${index + 1}]
제목: ${result.source.documentName}
컬렉션: ${result.source.collectionName}
관련도: ${(result.relevanceScore * 100).toFixed(1)}%

${content}

---`;
  }).join('\n');

  // 소스 정보 생성
  const sourcesList = ragContext.sources.map((source, index) => 
    `${index + 1}. ${source.documentName} (${source.collectionName}) - 신뢰도: ${(source.confidence * 100).toFixed(1)}%`
  ).join('\n');

  // 시스템 프롬프트
  const systemPrompt = systemInstructions || `당신은 제공된 문서를 기반으로 정확하고 도움이 되는 답변을 제공하는 AI 어시스턴트입니다.

다음 지침을 따라주세요:
1. 제공된 문서의 내용만을 기반으로 답변하세요
2. 문서에 없는 정보는 추측하지 마세요
3. 답변의 근거가 되는 문서를 명시하세요
4. 불확실한 경우 "제공된 문서에서는 명확하지 않습니다"라고 말하세요
5. 한국어로 자연스럽고 이해하기 쉽게 답변하세요`;

  // 사용자 쿼리 포맷팅
  const formattedUserQuery = `다음 문서들을 참고하여 질문에 답변해주세요:

${contextDocuments}

질문: ${userQuery}

답변 시 참고한 문서 번호를 명시해주세요.`;

  // 추가 지침
  const instructions = `검색된 ${ragContext.results.length}개의 문서를 기반으로 답변하세요. 
검색 방식: ${getSearchTypeLabel(ragContext.searchType)}
검색 시간: ${ragContext.executionTime}ms`;

  return {
    systemPrompt,
    userQuery: formattedUserQuery,
    context: contextDocuments,
    sources: sourcesList,
    instructions
  };
};

/**
 * 특정 컬렉션에서만 RAG 검색
 */
export const performCollectionRAGSearch = async (
  query: string,
  collectionId: string,
  options: Partial<RAGSearchOptions> = {}
): Promise<RAGContext> => {
  return performRAGSearch({
    query,
    collectionIds: [collectionId],
    ...options
  });
};

/**
 * 다중 컬렉션 RAG 검색
 */
export const performMultiCollectionRAGSearch = async (
  query: string,
  collectionIds: string[],
  options: Partial<RAGSearchOptions> = {}
): Promise<RAGContext> => {
  return performRAGSearch({
    query,
    collectionIds,
    ...options
  });
};

/**
 * 스마트 RAG 검색 (자동 검색 타입 선택)
 */
export const performSmartRAGSearch = async (
  query: string,
  options: Partial<RAGSearchOptions> = {}
): Promise<RAGContext> => {
  // 쿼리 분석을 통한 최적 검색 타입 결정
  const searchType = analyzeQueryForSearchType(query);
  
  return performRAGSearch({
    query,
    searchType,
    ...options
  });
};

/**
 * 쿼리 분석을 통한 검색 타입 결정
 */
const analyzeQueryForSearchType = (query: string): SearchType => {
  const queryLower = query.toLowerCase();
  
  // 키워드 검색이 적합한 경우
  const keywordIndicators = [
    '정확히', '구체적으로', '명시적으로', '특정', '정의',
    '이름', '번호', '날짜', '시간', '주소', '연락처'
  ];
  
  if (keywordIndicators.some(indicator => queryLower.includes(indicator))) {
    return 'keyword';
  }
  
  // 의미 검색이 적합한 경우
  const semanticIndicators = [
    '어떻게', '왜', '무엇', '설명', '이유', '방법', '과정',
    '개념', '원리', '의미', '차이점', '유사점', '관계'
  ];
  
  if (semanticIndicators.some(indicator => queryLower.includes(indicator))) {
    return 'semantic';
  }
  
  // 기본적으로 하이브리드 검색 사용
  return 'hybrid';
};

/**
 * RAG 검색 결과 품질 평가
 */
export const evaluateRAGQuality = (ragContext: RAGContext): {
  score: number;
  feedback: string[];
  recommendations: string[];
} => {
  const feedback: string[] = [];
  const recommendations: string[] = [];
  let score = 0;

  // 결과 수 평가
  if (ragContext.results.length === 0) {
    feedback.push('검색 결과가 없습니다');
    recommendations.push('검색어를 다르게 시도해보세요');
  } else if (ragContext.results.length < 3) {
    feedback.push('검색 결과가 적습니다');
    recommendations.push('더 일반적인 검색어를 사용해보세요');
    score += 30;
  } else {
    feedback.push(`${ragContext.results.length}개의 관련 문서를 찾았습니다`);
    score += 50;
  }

  // 관련도 점수 평가
  const avgRelevance = ragContext.results.reduce((sum, result) => sum + result.relevanceScore, 0) / ragContext.results.length;
  
  if (avgRelevance > 0.8) {
    feedback.push('높은 관련도의 결과입니다');
    score += 30;
  } else if (avgRelevance > 0.6) {
    feedback.push('적당한 관련도의 결과입니다');
    score += 20;
  } else {
    feedback.push('관련도가 낮은 결과입니다');
    recommendations.push('더 구체적인 검색어를 사용해보세요');
    score += 10;
  }

  // 다양성 평가
  const uniqueDocuments = new Set(ragContext.results.map(r => r.source.documentId)).size;
  const uniqueCollections = new Set(ragContext.results.map(r => r.source.collectionId)).size;
  
  if (uniqueCollections > 1) {
    feedback.push('여러 컬렉션에서 결과를 찾았습니다');
    score += 10;
  }
  
  if (uniqueDocuments > ragContext.results.length * 0.7) {
    feedback.push('다양한 문서에서 결과를 찾았습니다');
    score += 10;
  }

  // 성능 평가
  if (ragContext.executionTime < 1000) {
    feedback.push('빠른 검색 속도입니다');
  } else if (ragContext.executionTime > 3000) {
    feedback.push('검색 속도가 느립니다');
    recommendations.push('필터를 사용하여 검색 범위를 줄여보세요');
  }

  return {
    score: Math.min(100, score),
    feedback,
    recommendations
  };
};

/**
 * 검색 타입 라벨 반환
 */
const getSearchTypeLabel = (searchType: SearchType): string => {
  switch (searchType) {
    case 'semantic': return '의미 검색';
    case 'keyword': return '키워드 검색';
    case 'hybrid': return '하이브리드 검색';
    default: return '검색';
  }
};

/**
 * RAG 검색 캐시 (간단한 메모리 캐시)
 */
const ragCache = new Map<string, { result: RAGContext; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5분

/**
 * 캐시된 RAG 검색
 */
export const performCachedRAGSearch = async (options: RAGSearchOptions): Promise<RAGContext> => {
  const cacheKey = JSON.stringify(options);
  const cached = ragCache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.result;
  }
  
  const result = await performRAGSearch(options);
  ragCache.set(cacheKey, { result, timestamp: Date.now() });
  
  // 캐시 크기 제한 (최대 100개)
  if (ragCache.size > 100) {
    const oldestKey = ragCache.keys().next().value;
    ragCache.delete(oldestKey);
  }
  
  return result;
};

/**
 * RAG 검색 캐시 클리어
 */
export const clearRAGCache = (): void => {
  ragCache.clear();
};