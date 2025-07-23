// 검색 서비스
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';
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

// Supabase 데이터베이스 타입 정의
type DbSearchLog = Database['public']['Tables']['search_logs']['Row'];
type DbSearchLogInsert = Database['public']['Tables']['search_logs']['Insert'];
type DbDocument = Database['public']['Tables']['documents']['Row'];

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

/**
 * 의미 기반 벡터 검색
 */
export const semanticSearch = async (options: SemanticSearchOptions): Promise<SearchResult[]> => {
  const startTime = Date.now();
  
  try {
    // 쿼리 텍스트를 벡터로 변환
    const queryEmbedding = await generateEmbedding(options.query);
    
    // Supabase 함수 호출
    const { data, error } = await supabase.rpc('search_similar_chunks', {
      query_embedding: queryEmbedding,
      match_threshold: options.match_threshold || 0.7,
      match_count: options.match_count || 10,
      collection_ids: options.collection_ids || null
    });

    if (error) {
      throw new Error(`의미 검색 실패: ${error.message}`);
    }

    const results: SearchResult[] = (data || []).map((item: SearchSimilarChunksResult) => ({
      chunk_id: item.chunk_id,
      document_id: item.document_id,
      collection_id: item.collection_id,
      content: item.content,
      similarity_score: item.similarity,
      document_name: item.document_name,
      collection_name: item.collection_name,
      metadata: item.metadata || {}
    }));

    // 검색 로그 저장
    await logSearch(options.query, 'semantic', results.length, Date.now() - startTime);

    return results;
  } catch (error) {
    console.error('의미 검색 오류:', error);
    await logSearch(options.query, 'semantic', 0, Date.now() - startTime);
    throw error;
  }
};

/**
 * 키워드 기반 전문 검색
 */
export const keywordSearch = async (options: KeywordSearchOptions): Promise<SearchResult[]> => {
  const startTime = Date.now();
  
  try {
    // Supabase 함수 호출
    const { data, error } = await supabase.rpc('search_chunks_by_keyword', {
      search_query: options.query,
      match_count: options.match_count || 10,
      collection_ids: options.collection_ids || null
    });

    if (error) {
      throw new Error(`키워드 검색 실패: ${error.message}`);
    }

    let results: SearchResult[] = (data || []).map((item: SearchChunksByKeywordResult) => ({
      chunk_id: item.chunk_id,
      document_id: item.document_id,
      collection_id: item.collection_id,
      content: item.content,
      rank: item.rank,
      document_name: item.document_name,
      collection_name: item.collection_name,
      metadata: item.metadata || {}
    }));

    // 하이라이팅 적용
    if (options.highlight) {
      results = results.map(result => ({
        ...result,
        highlighted_content: highlightKeywords(result.content, options.query)
      }));
    }

    // 검색 로그 저장
    await logSearch(options.query, 'keyword', results.length, Date.now() - startTime);

    return results;
  } catch (error) {
    console.error('키워드 검색 오류:', error);
    await logSearch(options.query, 'keyword', 0, Date.now() - startTime);
    throw error;
  }
};

/**
 * 하이브리드 검색 (의미 + 키워드)
 */
export const hybridSearch = async (options: HybridSearchOptions): Promise<SearchResult[]> => {
  const startTime = Date.now();
  
  try {
    const semanticWeight = options.semantic_weight || 0.7;
    const keywordWeight = options.keyword_weight || 0.3;
    
    // 병렬로 두 검색 실행
    const [semanticResults, keywordResults] = await Promise.all([
      semanticSearch({
        query: options.query,
        match_threshold: options.match_threshold || 0.6,
        match_count: Math.ceil((options.match_count || 10) * 1.5), // 더 많은 결과 가져오기
        collection_ids: options.collection_ids
      }),
      keywordSearch({
        query: options.query,
        match_count: Math.ceil((options.match_count || 10) * 1.5),
        collection_ids: options.collection_ids,
        highlight: true
      })
    ]);

    // 결과 병합 및 점수 계산
    const combinedResults = new Map<string, SearchResult>();

    // 의미 검색 결과 처리
    semanticResults.forEach(result => {
      const score = (result.similarity_score || 0) * semanticWeight;
      combinedResults.set(result.chunk_id, {
        ...result,
        similarity_score: score,
        rank: score
      });
    });

    // 키워드 검색 결과 처리 및 병합
    keywordResults.forEach(result => {
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
    });

    // 점수순으로 정렬하고 제한
    const finalResults = Array.from(combinedResults.values())
      .sort((a, b) => (b.rank || 0) - (a.rank || 0))
      .slice(0, options.match_count || 10);

    // 검색 로그 저장
    await logSearch(options.query, 'hybrid', finalResults.length, Date.now() - startTime);

    return finalResults;
  } catch (error) {
    console.error('하이브리드 검색 오류:', error);
    await logSearch(options.query, 'hybrid', 0, Date.now() - startTime);
    throw error;
  }
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
 * 검색 통계 조회
 */
export const getSearchStats = async (): Promise<SearchStats> => {
  try {
    // 전체 검색 수
    const { count: totalSearches } = await supabase
      .from('search_logs')
      .select('*', { count: 'exact', head: true });

    // 평균 실행 시간
    const { data: avgTimeData } = await supabase
      .from('search_logs')
      .select('execution_time_ms')
      .not('execution_time_ms', 'is', null);

    const avgExecutionTime = avgTimeData?.length 
      ? avgTimeData.reduce((sum, log) => sum + (log.execution_time_ms || 0), 0) / avgTimeData.length
      : 0;

    // 인기 검색어 (최근 30일)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: popularQueries } = await supabase
      .from('search_logs')
      .select('query')
      .gte('created_at', thirtyDaysAgo.toISOString())
      .limit(1000);

    const queryCount = new Map<string, number>();
    popularQueries?.forEach(log => {
      const query = log.query.toLowerCase().trim();
      queryCount.set(query, (queryCount.get(query) || 0) + 1);
    });

    const popularQueriesArray = Array.from(queryCount.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([query, count]) => ({ query, count }));

    // 검색 타입 분포
    const { data: searchTypeData } = await supabase
      .from('search_logs')
      .select('search_type')
      .gte('created_at', thirtyDaysAgo.toISOString());

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

    return {
      total_searches: totalSearches || 0,
      avg_execution_time: Math.round(avgExecutionTime),
      popular_queries: popularQueriesArray,
      search_type_distribution: searchTypeDistribution
    };
  } catch (error) {
    console.error('검색 통계 조회 오류:', error);
    throw error;
  }
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

    return data || [];
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
 * 검색 결과 내보내기 (CSV)
 */
export const exportSearchResults = (results: SearchResult[], query: string): void => {
  const headers = ['순위', '컬렉션', '문서명', '내용', '점수'];
  const csvContent = [
    headers.join(','),
    ...results.map((result, index) => [
      index + 1,
      `"${result.collection_name}"`,
      `"${result.document_name}"`,
      `"${result.content.replace(/"/g, '""').substring(0, 200)}..."`,
      result.similarity_score?.toFixed(3) || result.rank?.toFixed(3) || 'N/A'
    ].join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `search_results_${query}_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};