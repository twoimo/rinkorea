// 검색 서비스
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';
import { executeWithRetry } from '@/lib/errorHandler';
import type {
  SearchResult,
  SearchType,
  SemanticSearchOptions,
  KeywordSearchOptions,
  HybridSearchOptions,
  SearchFilters,
  SearchStats,
  SearchLog
} from '@/types/vector';
import {
  ServiceError,
  handleServiceError,
  retryWithBackoff,
  logServiceOperation,
  measurePerformance,
  validateRequired,
  safeParseMetadata
} from './common/serviceUtils';

// Supabase 데이터베이스 타입 정의

// RPC 함수 반환 타입
type SearchSimilarChunksResult = Database['public']['Functions']['search_similar_chunks']['Returns'][0];
type SearchChunksByKeywordResult = Database['public']['Functions']['search_chunks_by_keyword']['Returns'][0];

/**
 * Claude 임베딩 생성
 */
export const generateEmbedding = async (text: string): Promise<number[]> => {
  try {
    // Claude 임베딩 서비스 사용
    const { generateClaudeEmbedding } = await import('./claudeEmbeddingService');
    const result = await generateClaudeEmbedding(text);
    
    if (!result.success || !result.embedding) {
      throw new Error(result.error || '임베딩 생성에 실패했습니다');
    }
    
    return result.embedding;
  } catch (error) {
    console.error('임베딩 생성 오류:', error);
    throw new Error('임베딩 생성에 실패했습니다');
  }
};

// 검색 결과 캐시
const searchCache = new Map<string, { results: SearchResult[]; timestamp: number; ttl: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5분
const MAX_CACHE_SIZE = 100;

/**
 * 캐시 키 생성
 */
const generateCacheKey = (type: string, options: any): string => {
  return `${type}:${JSON.stringify(options)}`;
};

/**
 * 캐시에서 검색 결과 조회
 */
const getCachedResults = (cacheKey: string): SearchResult[] | null => {
  const cached = searchCache.get(cacheKey);
  
  if (!cached) {
    return null;
  }
  
  if (Date.now() - cached.timestamp > cached.ttl) {
    searchCache.delete(cacheKey);
    return null;
  }
  
  return cached.results;
};

/**
 * 검색 결과 캐시 저장
 */
const setCachedResults = (cacheKey: string, results: SearchResult[], ttl: number = CACHE_TTL): void => {
  // 캐시 크기 제한
  if (searchCache.size >= MAX_CACHE_SIZE) {
    const oldestKey = searchCache.keys().next().value;
    searchCache.delete(oldestKey);
  }
  
  searchCache.set(cacheKey, {
    results,
    timestamp: Date.now(),
    ttl
  });
};

/**
 * 검색 성능 모니터링
 */
const performanceMonitor = {
  searches: new Map<string, number[]>(), // 검색 타입별 응답 시간 기록
  
  recordSearchTime(searchType: string, duration: number): void {
    if (!this.searches.has(searchType)) {
      this.searches.set(searchType, []);
    }
    
    const times = this.searches.get(searchType)!;
    times.push(duration);
    
    // 최근 100개 기록만 유지
    if (times.length > 100) {
      times.shift();
    }
  },
  
  getAverageTime(searchType: string): number {
    const times = this.searches.get(searchType) || [];
    if (times.length === 0) return 0;
    
    return times.reduce((sum, time) => sum + time, 0) / times.length;
  },
  
  getStats(): Record<string, { avg: number; count: number; recent: number }> {
    const stats: Record<string, { avg: number; count: number; recent: number }> = {};
    
    for (const [searchType, times] of this.searches.entries()) {
      stats[searchType] = {
        avg: this.getAverageTime(searchType),
        count: times.length,
        recent: times.length > 0 ? times[times.length - 1] : 0
      };
    }
    
    return stats;
  }
};

/**
 * 의미 기반 벡터 검색 (캐싱 및 성능 최적화)
 */
export const semanticSearch = async (options: SemanticSearchOptions): Promise<SearchResult[]> => {
  return measurePerformance(async () => {
    const startTime = Date.now();
    const cacheKey = generateCacheKey('semantic', options);
    
    try {
      // 캐시 확인
      const cachedResults = getCachedResults(cacheKey);
      if (cachedResults) {
        logServiceOperation('검색 캐시 히트', { 
          query: options.query, 
          type: 'semantic',
          resultCount: cachedResults.length 
        });
        return cachedResults;
      }

      // 쿼리 텍스트를 벡터로 변환
      const queryEmbedding = await generateEmbedding(options.query);
      
      // 최적화된 Supabase 함수 호출
      const { data, error } = await retryWithBackoff(
        () => supabase.rpc('search_similar_chunks', {
          query_embedding: queryEmbedding,
          match_threshold: options.match_threshold || 0.7,
          match_count: options.match_count || 10,
          collection_ids: options.collection_ids || null
        }),
        2,
        500,
        '의미 검색'
      );

      if (error) {
        throw new ServiceError(`의미 검색 실패: ${error.message}`, 'SEARCH_FAILED', error);
      }

      const results: SearchResult[] = (data || []).map((item: SearchSimilarChunksResult) => ({
        chunk_id: item.chunk_id,
        document_id: item.document_id,
        collection_id: item.collection_id,
        content: item.content,
        similarity_score: item.similarity,
        document_name: item.document_name,
        collection_name: item.collection_name,
        metadata: safeParseMetadata(item.metadata)
      }));

      // 결과 캐싱 (높은 유사도 결과만)
      const highQualityResults = results.filter(r => (r.similarity_score || 0) > 0.8);
      if (highQualityResults.length > 0) {
        setCachedResults(cacheKey, results, CACHE_TTL);
      }

      const duration = Date.now() - startTime;
      performanceMonitor.recordSearchTime('semantic', duration);

      // 검색 로그 저장
      await logSearch(options.query, 'semantic', results.length, duration);

      logServiceOperation('의미 검색 완료', {
        query: options.query,
        resultCount: results.length,
        duration,
        cached: false
      });

      return results;
    } catch (error) {
      const duration = Date.now() - startTime;
      performanceMonitor.recordSearchTime('semantic', duration);
      await logSearch(options.query, 'semantic', 0, duration);
      throw handleServiceError(error, '의미 검색');
    }
  }, 'semanticSearch');
};

/**
 * 키워드 기반 전문 검색 (캐싱 및 성능 최적화)
 */
export const keywordSearch = async (options: KeywordSearchOptions): Promise<SearchResult[]> => {
  return measurePerformance(async () => {
    const startTime = Date.now();
    const cacheKey = generateCacheKey('keyword', options);
    
    try {
      // 캐시 확인
      const cachedResults = getCachedResults(cacheKey);
      if (cachedResults) {
        logServiceOperation('검색 캐시 히트', { 
          query: options.query, 
          type: 'keyword',
          resultCount: cachedResults.length 
        });
        return cachedResults;
      }

      // 최적화된 Supabase 함수 호출
      const { data, error } = await retryWithBackoff(
        () => supabase.rpc('search_chunks_by_keyword', {
          search_query: options.query,
          match_count: options.match_count || 10,
          collection_ids: options.collection_ids || null
        }),
        2,
        500,
        '키워드 검색'
      );

      if (error) {
        throw new ServiceError(`키워드 검색 실패: ${error.message}`, 'SEARCH_FAILED', error);
      }

      let results: SearchResult[] = (data || []).map((item: SearchChunksByKeywordResult) => ({
        chunk_id: item.chunk_id,
        document_id: item.document_id,
        collection_id: item.collection_id,
        content: item.content,
        rank: item.rank,
        document_name: item.document_name,
        collection_name: item.collection_name,
        metadata: safeParseMetadata(item.metadata)
      }));

      // 하이라이팅 적용 (성능 최적화)
      if (options.highlight && results.length > 0) {
        results = results.map(result => ({
          ...result,
          highlighted_content: highlightKeywords(result.content, options.query)
        }));
      }

      // 결과 캐싱 (좋은 랭킹 결과만)
      const highQualityResults = results.filter(r => (r.rank || 0) > 0.1);
      if (highQualityResults.length > 0) {
        setCachedResults(cacheKey, results, CACHE_TTL);
      }

      const duration = Date.now() - startTime;
      performanceMonitor.recordSearchTime('keyword', duration);

      // 검색 로그 저장
      await logSearch(options.query, 'keyword', results.length, duration);

      logServiceOperation('키워드 검색 완료', {
        query: options.query,
        resultCount: results.length,
        duration,
        cached: false
      });

      return results;
    } catch (error) {
      const duration = Date.now() - startTime;
      performanceMonitor.recordSearchTime('keyword', duration);
      await logSearch(options.query, 'keyword', 0, duration);
      throw handleServiceError(error, '키워드 검색');
    }
  }, 'keywordSearch');
};

// 동시 검색 요청 관리
const concurrentSearches = new Map<string, Promise<SearchResult[]>>();

/**
 * 동시 검색 요청 중복 제거
 */
const deduplicateSearch = async <T extends SearchResult[]>(
  key: string,
  searchFn: () => Promise<T>
): Promise<T> => {
  if (concurrentSearches.has(key)) {
    return concurrentSearches.get(key) as Promise<T>;
  }
  
  const searchPromise = searchFn().finally(() => {
    concurrentSearches.delete(key);
  });
  
  concurrentSearches.set(key, searchPromise);
  return searchPromise;
};

/**
 * 하이브리드 검색 (의미 + 키워드) - 성능 최적화
 */
export const hybridSearch = async (options: HybridSearchOptions): Promise<SearchResult[]> => {
  return measurePerformance(async () => {
    const startTime = Date.now();
    const cacheKey = generateCacheKey('hybrid', options);
    
    try {
      // 캐시 확인
      const cachedResults = getCachedResults(cacheKey);
      if (cachedResults) {
        logServiceOperation('검색 캐시 히트', { 
          query: options.query, 
          type: 'hybrid',
          resultCount: cachedResults.length 
        });
        return cachedResults;
      }

      const semanticWeight = options.semantic_weight || 0.7;
      const keywordWeight = options.keyword_weight || 0.3;
      
      // 병렬로 두 검색 실행 (중복 제거 적용)
      const searchPromises = await Promise.allSettled([
        deduplicateSearch(`semantic:${options.query}`, () => 
          semanticSearch({
            query: options.query,
            match_threshold: options.match_threshold || 0.6,
            match_count: Math.ceil((options.match_count || 10) * 1.5),
            collection_ids: options.collection_ids
          })
        ),
        deduplicateSearch(`keyword:${options.query}`, () =>
          keywordSearch({
            query: options.query,
            match_count: Math.ceil((options.match_count || 10) * 1.5),
            collection_ids: options.collection_ids,
            highlight: true
          })
        )
      ]);

      // 검색 결과 처리 (실패한 검색이 있어도 계속 진행)
      const semanticResults = searchPromises[0].status === 'fulfilled' ? searchPromises[0].value : [];
      const keywordResults = searchPromises[1].status === 'fulfilled' ? searchPromises[1].value : [];

      if (searchPromises[0].status === 'rejected') {
        console.warn('의미 검색 실패:', searchPromises[0].reason);
      }
      if (searchPromises[1].status === 'rejected') {
        console.warn('키워드 검색 실패:', searchPromises[1].reason);
      }

      // 결과 병합 및 점수 계산 (최적화)
      const combinedResults = new Map<string, SearchResult>();

      // 의미 검색 결과 처리
      for (const result of semanticResults) {
        const score = (result.similarity_score || 0) * semanticWeight;
        combinedResults.set(result.chunk_id, {
          ...result,
          similarity_score: score,
          rank: score
        });
      }

      // 키워드 검색 결과 처리 및 병합
      for (const result of keywordResults) {
        const keywordScore = (result.rank || 0) * keywordWeight;
        
        if (combinedResults.has(result.chunk_id)) {
          // 이미 존재하는 결과 - 점수 합산
          const existing = combinedResults.get(result.chunk_id)!;
          combinedResults.set(result.chunk_id, {
            ...existing,
            rank: (existing.rank || 0) + keywordScore,
            highlighted_content: result.highlighted_content || existing.highlighted_content
          });
        } else {
          // 새로운 결과 추가
          combinedResults.set(result.chunk_id, {
            ...result,
            similarity_score: keywordScore,
            rank: keywordScore
          });
        }
      }

      // 점수순으로 정렬하고 제한
      const finalResults = Array.from(combinedResults.values())
        .sort((a, b) => (b.rank || 0) - (a.rank || 0))
        .slice(0, options.match_count || 10);

      // 결과 캐싱 (품질이 좋은 결과만)
      if (finalResults.length > 0 && (finalResults[0].rank || 0) > 0.5) {
        setCachedResults(cacheKey, finalResults, CACHE_TTL);
      }

      const duration = Date.now() - startTime;
      performanceMonitor.recordSearchTime('hybrid', duration);

      // 검색 로그 저장
      await logSearch(options.query, 'hybrid', finalResults.length, duration);

      logServiceOperation('하이브리드 검색 완료', {
        query: options.query,
        resultCount: finalResults.length,
        semanticCount: semanticResults.length,
        keywordCount: keywordResults.length,
        duration,
        cached: false
      });

      return finalResults;
    } catch (error) {
      const duration = Date.now() - startTime;
      performanceMonitor.recordSearchTime('hybrid', duration);
      await logSearch(options.query, 'hybrid', 0, duration);
      throw handleServiceError(error, '하이브리드 검색');
    }
  }, 'hybridSearch');
};

/**
 * 필터를 적용한 검색
 */
export const searchWithFilters = async (
  query: string,
  searchType: SearchType,
  filters: SearchFilters
): Promise<SearchResult[]> => {
  const baseOptions = {
    query,
    collection_ids: filters.collection_ids,
    match_count: 50 // 필터링 전에 더 많은 결과 가져오기
  };

  let results: SearchResult[];

  switch (searchType) {
    case 'semantic':
      results = await semanticSearch({
        ...baseOptions,
        match_threshold: filters.min_similarity || 0.7
      });
      break;
    case 'keyword':
      results = await keywordSearch({
        ...baseOptions,
        highlight: true
      });
      break;
    case 'hybrid':
      results = await hybridSearch(baseOptions);
      break;
    default:
      throw new Error(`지원되지 않는 검색 타입: ${searchType}`);
  }

  // 추가 필터링 적용
  let filteredResults = results;

  // 문서 타입 필터
  if (filters.document_types && filters.document_types.length > 0) {
    // 문서 정보를 가져와서 필터링 (실제로는 조인 쿼리로 최적화 가능)
    const documentIds = [...new Set(filteredResults.map(r => r.document_id))];
    const { data: documents } = await supabase
      .from('documents')
      .select('id, file_type')
      .in('id', documentIds);

    const allowedDocIds = new Set(
      documents?.filter(doc => 
        filters.document_types!.some(type => doc.file_type.includes(type))
      ).map(doc => doc.id) || []
    );

    filteredResults = filteredResults.filter(result => 
      allowedDocIds.has(result.document_id)
    );
  }

  // 날짜 필터 (문서 생성일 기준)
  if (filters.date_from || filters.date_to) {
    const documentIds = [...new Set(filteredResults.map(r => r.document_id))];
    let docQuery = supabase
      .from('documents')
      .select('id, created_at')
      .in('id', documentIds);

    if (filters.date_from) {
      docQuery = docQuery.gte('created_at', filters.date_from);
    }
    if (filters.date_to) {
      docQuery = docQuery.lte('created_at', filters.date_to);
    }

    const { data: documents } = await docQuery;
    const allowedDocIds = new Set(documents?.map(doc => doc.id) || []);

    filteredResults = filteredResults.filter(result => 
      allowedDocIds.has(result.document_id)
    );
  }

  // 유사도 점수 필터 (의미 검색의 경우)
  if (filters.min_similarity && searchType === 'semantic') {
    filteredResults = filteredResults.filter(result => 
      (result.similarity_score || 0) >= filters.min_similarity!
    );
  }

  return filteredResults.slice(0, 10); // 최종 결과 제한
};

/**
 * 키워드 하이라이팅
 */
export const highlightKeywords = (text: string, query: string): string => {
  if (!query.trim()) return text;

  const keywords = query.trim().split(/\s+/);
  let highlightedText = text;

  keywords.forEach(keyword => {
    const regex = new RegExp(`(${keyword})`, 'gi');
    highlightedText = highlightedText.replace(regex, '<mark>$1</mark>');
  });

  return highlightedText;
};

/**
 * 검색 로그 저장
 */
export const logSearch = async (
  query: string,
  searchType: SearchType,
  resultsCount: number,
  executionTimeMs: number
): Promise<void> => {
  try {
    const { data: user } = await supabase.auth.getUser();
    
    await supabase
      .from('search_logs')
      .insert({
        user_id: user.user?.id || null,
        query: query.trim(),
        search_type: searchType,
        results_count: resultsCount,
        execution_time_ms: executionTimeMs
      });
  } catch (error) {
    // 로그 저장 실패는 검색 기능에 영향을 주지 않도록 조용히 처리
    console.warn('검색 로그 저장 실패:', error);
  }
};

/**
 * 검색 통계 조회 (성능 최적화)
 */
export const getSearchStats = async (): Promise<SearchStats & { 
  performance: Record<string, { avg: number; count: number; recent: number }>;
  cache_stats: { hit_rate: number; size: number; max_size: number };
}> => {
  return measurePerformance(async () => {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      // 병렬로 통계 데이터 조회
      const [
        { count: totalSearches },
        { data: avgTimeData },
        { data: popularQueries },
        { data: searchTypeData }
      ] = await Promise.all([
        supabase.from('search_logs').select('*', { count: 'exact', head: true }),
        supabase.from('search_logs').select('execution_time_ms').not('execution_time_ms', 'is', null),
        supabase.from('search_logs').select('query').gte('created_at', thirtyDaysAgo.toISOString()).limit(1000),
        supabase.from('search_logs').select('search_type').gte('created_at', thirtyDaysAgo.toISOString())
      ]);

      const avgExecutionTime = avgTimeData?.length 
        ? avgTimeData.reduce((sum, log) => sum + (log.execution_time_ms || 0), 0) / avgTimeData.length
        : 0;

      // 인기 검색어 계산 (최적화)
      const queryCount = new Map<string, number>();
      popularQueries?.forEach(log => {
        const query = log.query.toLowerCase().trim();
        queryCount.set(query, (queryCount.get(query) || 0) + 1);
      });

      const popularQueriesArray = Array.from(queryCount.entries())
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
        .map(([query, count]) => ({ query, count }));

      // 검색 타입 분포 계산
      const searchTypeDistribution: Record<SearchType, number> = {
        semantic: 0,
        keyword: 0,
        hybrid: 0
      };

      searchTypeData?.forEach(log => {
        if (log.search_type in searchTypeDistribution) {
          searchTypeDistribution[log.search_type as SearchType]++;
        }
      });

      // 성능 모니터링 데이터
      const performanceStats = performanceMonitor.getStats();

      // 캐시 통계
      const totalCacheRequests = Array.from(performanceStats.values())
        .reduce((sum, stat) => sum + stat.count, 0);
      const cacheHitRate = totalCacheRequests > 0 ? (searchCache.size / totalCacheRequests) * 100 : 0;

      return {
        total_searches: totalSearches || 0,
        avg_execution_time: Math.round(avgExecutionTime),
        popular_queries: popularQueriesArray,
        search_type_distribution: searchTypeDistribution,
        performance: performanceStats,
        cache_stats: {
          hit_rate: Math.round(cacheHitRate * 100) / 100,
          size: searchCache.size,
          max_size: MAX_CACHE_SIZE
        }
      };
    } catch (error) {
      throw handleServiceError(error, '검색 통계 조회');
    }
  }, 'getSearchStats');
};

/**
 * 최근 검색 기록 조회
 */
export const getRecentSearches = async (limit: number = 10): Promise<SearchLog[]> => {
  try {
    const { data: user } = await supabase.auth.getUser();
    
    if (!user.user) {
      return [];
    }

    const { data, error } = await supabase
      .from('search_logs')
      .select('*')
      .eq('user_id', user.user.id)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error(`최근 검색 기록 조회 실패: ${error.message}`);
    }

    return (data || []).map(item => ({
      ...item,
      search_type: item.search_type as SearchType
    }));
  } catch (error) {
    console.error('최근 검색 기록 조회 오류:', error);
    return [];
  }
};

/**
 * 검색 제안 (자동완성)
 */
export const getSearchSuggestions = async (query: string): Promise<string[]> => {
  try {
    if (query.trim().length < 2) {
      return [];
    }

    // 최근 검색어에서 유사한 쿼리 찾기
    const { data } = await supabase
      .from('search_logs')
      .select('query')
      .ilike('query', `%${query}%`)
      .order('created_at', { ascending: false })
      .limit(5);

    const suggestions = [...new Set(data?.map(log => log.query) || [])];
    return suggestions.slice(0, 5);
  } catch (error) {
    console.error('검색 제안 조회 오류:', error);
    return [];
  }
};

/**
 * 검색 캐시 관리 함수들
 */
export const clearSearchCache = (): void => {
  searchCache.clear();
  logServiceOperation('검색 캐시 클리어', { previousSize: searchCache.size });
};

export const getCacheStats = () => ({
  size: searchCache.size,
  maxSize: MAX_CACHE_SIZE,
  hitRate: searchCache.size > 0 ? (searchCache.size / MAX_CACHE_SIZE) * 100 : 0
});

/**
 * 검색 성능 최적화를 위한 쿼리 전처리
 */
export const optimizeSearchQuery = (query: string): string => {
  return query
    .trim()
    .toLowerCase()
    .replace(/[^\w\s가-힣]/g, ' ') // 특수문자 제거
    .replace(/\s+/g, ' ') // 연속 공백 정리
    .substring(0, 200); // 쿼리 길이 제한
};

/**
 * 검색 결과 품질 평가
 */
export const evaluateSearchQuality = (results: SearchResult[], searchType: SearchType): {
  score: number;
  feedback: string[];
  recommendations: string[];
} => {
  const feedback: string[] = [];
  const recommendations: string[] = [];
  let score = 0;

  // 결과 수 평가
  if (results.length === 0) {
    feedback.push('검색 결과가 없습니다');
    recommendations.push('다른 키워드로 검색해보세요');
    return { score: 0, feedback, recommendations };
  }

  if (results.length < 3) {
    feedback.push('검색 결과가 적습니다');
    recommendations.push('더 일반적인 검색어를 사용해보세요');
    score += 30;
  } else {
    feedback.push(`${results.length}개의 결과를 찾았습니다`);
    score += 50;
  }

  // 관련도 점수 평가
  const scores = results.map(r => r.similarity_score || r.rank || 0);
  const avgScore = scores.reduce((sum, s) => sum + s, 0) / scores.length;

  if (avgScore > 0.8) {
    feedback.push('높은 관련도의 결과입니다');
    score += 30;
  } else if (avgScore > 0.6) {
    feedback.push('적당한 관련도의 결과입니다');
    score += 20;
  } else {
    feedback.push('관련도가 낮은 결과입니다');
    recommendations.push('더 구체적인 검색어를 사용해보세요');
    score += 10;
  }

  // 다양성 평가
  const uniqueDocuments = new Set(results.map(r => r.document_id)).size;
  const uniqueCollections = new Set(results.map(r => r.collection_id)).size;

  if (uniqueCollections > 1) {
    feedback.push('여러 컬렉션에서 결과를 찾았습니다');
    score += 10;
  }

  if (uniqueDocuments > results.length * 0.7) {
    feedback.push('다양한 문서에서 결과를 찾았습니다');
    score += 10;
  }

  return {
    score: Math.min(100, score),
    feedback,
    recommendations
  };
};

/**
 * 검색 결과 내보내기 (CSV) - 성능 최적화
 */
export const exportSearchResults = (results: SearchResult[], query: string): void => {
  try {
    const headers = ['순위', '컬렉션', '문서명', '내용', '점수'];
    const rows = results.map((result, index) => [
      index + 1,
      `"${result.collection_name.replace(/"/g, '""')}"`,
      `"${result.document_name.replace(/"/g, '""')}"`,
      `"${result.content.replace(/"/g, '""').substring(0, 200)}..."`,
      result.similarity_score?.toFixed(3) || result.rank?.toFixed(3) || 'N/A'
    ]);

    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `search_results_${optimizeSearchQuery(query).replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // 메모리 정리
    URL.revokeObjectURL(url);
    
    logServiceOperation('검색 결과 내보내기', {
      query,
      resultCount: results.length
    });
  } catch (error) {
    console.error('검색 결과 내보내기 실패:', error);
    throw new Error('검색 결과 내보내기에 실패했습니다');
  }
};