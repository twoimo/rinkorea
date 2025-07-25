// AI 에이전트와 RAG 시스템 통합 서비스
import type { 
  RAGContext, 
  RAGSearchOptions, 
  RAGPromptContext,
  RAGSearchResult 
} from './ragService';
import { 
  performRAGSearch, 
  performSmartRAGSearch,
  formatRAGPrompt,
  evaluateRAGQuality 
} from './ragService';
import { getActiveCollections } from './collectionService';

export interface AIAgentRAGRequest {
  userQuery: string;
  conversationContext?: string[];
  preferredCollections?: string[];
  searchOptions?: Partial<RAGSearchOptions>;
  responseFormat?: 'detailed' | 'concise' | 'bullet_points';
  includeSourceCitations?: boolean;
}

export interface AIAgentRAGResponse {
  success: boolean;
  ragContext: RAGContext;
  promptContext: RAGPromptContext;
  qualityScore: number;
  suggestions: string[];
  error?: string;
  metadata: {
    searchType: string;
    executionTime: number;
    resultsCount: number;
    collectionsSearched: string[];
  };
}

export interface ConversationRAGContext {
  conversationId: string;
  previousQueries: string[];
  cumulativeContext: RAGSearchResult[];
  lastUpdated: Date;
}

/**
 * AI 에이전트를 위한 통합 RAG 검색
 */
export const performAIAgentRAGSearch = async (
  request: AIAgentRAGRequest
): Promise<AIAgentRAGResponse> => {
  const startTime = Date.now();

  try {
    // 1단계: 검색 옵션 준비
    const searchOptions: RAGSearchOptions = {
      query: request.userQuery,
      maxResults: 8,
      minSimilarity: 0.6,
      contextWindow: 1,
      includeMetadata: true,
      ...request.searchOptions
    };

    // 선호 컬렉션이 있는 경우 적용
    if (request.preferredCollections && request.preferredCollections.length > 0) {
      searchOptions.collectionIds = request.preferredCollections;
    }

    // 2단계: RAG 검색 실행
    const ragContext = await performSmartRAGSearch(request.userQuery, searchOptions);

    // 3단계: 대화 컨텍스트 고려
    const enhancedContext = await enhanceWithConversationContext(
      ragContext,
      request.conversationContext
    );

    // 4단계: 응답 형식에 맞는 시스템 지침 생성
    const systemInstructions = generateSystemInstructions(
      request.responseFormat,
      request.includeSourceCitations
    );

    // 5단계: AI 프롬프트 형식으로 변환
    const promptContext = formatRAGPrompt(
      enhancedContext,
      request.userQuery,
      systemInstructions
    );

    // 6단계: 품질 평가
    const qualityEvaluation = evaluateRAGQuality(enhancedContext);

    // 7단계: 검색된 컬렉션 정보 수집
    const collectionsSearched = [
      ...new Set(enhancedContext.results.map(r => r.source.collectionName))
    ];

    const executionTime = Date.now() - startTime;

    return {
      success: true,
      ragContext: enhancedContext,
      promptContext,
      qualityScore: qualityEvaluation.score,
      suggestions: qualityEvaluation.recommendations,
      metadata: {
        searchType: enhancedContext.searchType,
        executionTime,
        resultsCount: enhancedContext.results.length,
        collectionsSearched
      }
    };

  } catch (error) {
    console.error('AI 에이전트 RAG 검색 오류:', error);
    
    return {
      success: false,
      ragContext: {
        query: request.userQuery,
        results: [],
        totalResults: 0,
        searchType: 'hybrid',
        executionTime: Date.now() - startTime,
        sources: []
      },
      promptContext: {
        systemPrompt: '',
        userQuery: request.userQuery,
        context: '',
        sources: '',
        instructions: ''
      },
      qualityScore: 0,
      suggestions: ['검색 중 오류가 발생했습니다. 다시 시도해주세요.'],
      error: error instanceof Error ? error.message : '알 수 없는 오류',
      metadata: {
        searchType: 'hybrid',
        executionTime: Date.now() - startTime,
        resultsCount: 0,
        collectionsSearched: []
      }
    };
  }
};

/**
 * 대화 컨텍스트를 고려한 RAG 검색 향상
 */
const enhanceWithConversationContext = async (
  ragContext: RAGContext,
  conversationContext?: string[]
): Promise<RAGContext> => {
  if (!conversationContext || conversationContext.length === 0) {
    return ragContext;
  }

  // 이전 대화에서 언급된 키워드 추출
  const contextKeywords = extractKeywordsFromConversation(conversationContext);
  
  // 현재 검색 결과와 대화 컨텍스트의 관련성 평가
  const enhancedResults = ragContext.results.map(result => {
    const contextRelevance = calculateContextRelevance(result.content, contextKeywords);
    
    return {
      ...result,
      relevanceScore: result.relevanceScore * 0.8 + contextRelevance * 0.2,
      metadata: {
        ...result.metadata,
        contextRelevance
      }
    };
  });

  // 관련성 점수로 재정렬
  enhancedResults.sort((a, b) => b.relevanceScore - a.relevanceScore);

  return {
    ...ragContext,
    results: enhancedResults
  };
};

/**
 * 대화에서 키워드 추출
 */
const extractKeywordsFromConversation = (conversation: string[]): string[] => {
  const allText = conversation.join(' ').toLowerCase();
  
  // 간단한 키워드 추출 (실제로는 더 정교한 NLP 기법 사용 가능)
  const words = allText.split(/\s+/);
  const stopWords = new Set(['은', '는', '이', '가', '을', '를', '에', '에서', '로', '으로', '와', '과', '의', '도', '만', '부터', '까지', '에게', '한테', '께', '에서부터']);
  
  const keywords = words
    .filter(word => word.length > 1 && !stopWords.has(word))
    .reduce((acc, word) => {
      acc[word] = (acc[word] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

  // 빈도순으로 정렬하여 상위 키워드 반환
  return Object.entries(keywords)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([word]) => word);
};

/**
 * 컨텍스트 관련성 계산
 */
const calculateContextRelevance = (content: string, keywords: string[]): number => {
  if (keywords.length === 0) return 0;
  
  const contentLower = content.toLowerCase();
  const matchCount = keywords.filter(keyword => contentLower.includes(keyword)).length;
  
  return matchCount / keywords.length;
};

/**
 * 응답 형식에 맞는 시스템 지침 생성
 */
const generateSystemInstructions = (
  format?: 'detailed' | 'concise' | 'bullet_points',
  includeCitations?: boolean
): string => {
  let baseInstructions = `당신은 제공된 문서를 기반으로 정확하고 도움이 되는 답변을 제공하는 AI 어시스턴트입니다.

기본 지침:
1. 제공된 문서의 내용만을 기반으로 답변하세요
2. 문서에 없는 정보는 추측하지 마세요
3. 불확실한 경우 "제공된 문서에서는 명확하지 않습니다"라고 말하세요
4. 한국어로 자연스럽고 이해하기 쉽게 답변하세요`;

  // 형식별 추가 지침
  switch (format) {
    case 'detailed':
      baseInstructions += `
5. 상세하고 포괄적인 답변을 제공하세요
6. 관련된 배경 정보와 맥락을 포함하세요
7. 예시나 구체적인 설명을 추가하세요`;
      break;
    
    case 'concise':
      baseInstructions += `
5. 간결하고 핵심적인 답변을 제공하세요
6. 불필요한 부연설명은 피하세요
7. 요점만 명확하게 전달하세요`;
      break;
    
    case 'bullet_points':
      baseInstructions += `
5. 답변을 불릿 포인트 형식으로 구성하세요
6. 각 포인트는 간결하고 명확하게 작성하세요
7. 논리적 순서로 정보를 배열하세요`;
      break;
  }

  // 인용 포함 지침
  if (includeCitations) {
    baseInstructions += `
8. 답변의 각 부분에 대해 참고한 문서 번호를 [문서 N] 형식으로 명시하세요
9. 답변 마지막에 참고 문서 목록을 제공하세요`;
  }

  return baseInstructions;
};

/**
 * 질문 유형 분석 및 최적화된 검색 전략 제안
 */
export const analyzeQuestionAndSuggestStrategy = (question: string): {
  questionType: 'factual' | 'analytical' | 'procedural' | 'comparative' | 'creative';
  suggestedSearchType: 'semantic' | 'keyword' | 'hybrid';
  suggestedOptions: Partial<RAGSearchOptions>;
  tips: string[];
} => {
  const questionLower = question.toLowerCase();
  
  // 질문 유형 분석
  let questionType: 'factual' | 'analytical' | 'procedural' | 'comparative' | 'creative' = 'factual';
  let suggestedSearchType: 'semantic' | 'keyword' | 'hybrid' = 'hybrid';
  let suggestedOptions: Partial<RAGSearchOptions> = {};
  const tips: string[] = [];

  // 사실적 질문 (What, Who, When, Where)
  if (/^(무엇|누구|언제|어디|몇|얼마)/.test(questionLower) || 
      /정의|의미|이름|날짜|시간|장소/.test(questionLower)) {
    questionType = 'factual';
    suggestedSearchType = 'keyword';
    suggestedOptions = { minSimilarity: 0.8, maxResults: 5 };
    tips.push('구체적인 키워드 검색이 효과적입니다');
  }
  
  // 분석적 질문 (Why, How)
  else if (/^(왜|어떻게|어째서)/.test(questionLower) || 
           /이유|원인|방법|과정|원리/.test(questionLower)) {
    questionType = 'analytical';
    suggestedSearchType = 'semantic';
    suggestedOptions = { minSimilarity: 0.6, maxResults: 8, contextWindow: 2 };
    tips.push('의미 기반 검색으로 관련 맥락을 찾습니다');
  }
  
  // 절차적 질문 (How to)
  else if (/방법|절차|단계|과정|어떻게.*하|하는.*방법/.test(questionLower)) {
    questionType = 'procedural';
    suggestedSearchType = 'hybrid';
    suggestedOptions = { minSimilarity: 0.7, maxResults: 6, contextWindow: 1 };
    tips.push('단계별 정보를 찾기 위해 하이브리드 검색을 사용합니다');
  }
  
  // 비교 질문
  else if (/차이|비교|다른점|같은점|유사|대비/.test(questionLower)) {
    questionType = 'comparative';
    suggestedSearchType = 'semantic';
    suggestedOptions = { minSimilarity: 0.65, maxResults: 10, contextWindow: 1 };
    tips.push('여러 개념을 비교하기 위해 더 많은 결과를 검색합니다');
  }
  
  // 창의적/종합적 질문
  else if (/제안|추천|의견|생각|아이디어|방안/.test(questionLower)) {
    questionType = 'creative';
    suggestedSearchType = 'semantic';
    suggestedOptions = { minSimilarity: 0.5, maxResults: 12, contextWindow: 2 };
    tips.push('다양한 관점을 위해 낮은 임계값으로 검색합니다');
  }

  return {
    questionType,
    suggestedSearchType,
    suggestedOptions,
    tips
  };
};

/**
 * RAG 검색 결과를 AI 에이전트 응답 형식으로 변환
 */
export const formatRAGResponseForAI = (
  ragResponse: AIAgentRAGResponse,
  includeMetadata: boolean = false
): string => {
  if (!ragResponse.success) {
    return `검색 중 오류가 발생했습니다: ${ragResponse.error}`;
  }

  let response = ragResponse.promptContext.userQuery;

  if (includeMetadata) {
    response += `\n\n[검색 정보]
- 검색 방식: ${ragResponse.metadata.searchType}
- 검색 시간: ${ragResponse.metadata.executionTime}ms
- 결과 수: ${ragResponse.metadata.resultsCount}개
- 검색 컬렉션: ${ragResponse.metadata.collectionsSearched.join(', ')}
- 품질 점수: ${ragResponse.qualityScore}/100`;

    if (ragResponse.suggestions.length > 0) {
      response += `\n- 제안사항: ${ragResponse.suggestions.join(', ')}`;
    }
  }

  return response;
};

/**
 * 대화형 RAG 세션 관리
 */
const conversationSessions = new Map<string, ConversationRAGContext>();

/**
 * 대화 세션 시작
 */
export const startConversationRAGSession = (conversationId: string): void => {
  conversationSessions.set(conversationId, {
    conversationId,
    previousQueries: [],
    cumulativeContext: [],
    lastUpdated: new Date()
  });
};

/**
 * 대화 세션에 RAG 결과 추가
 */
export const addToConversationRAGSession = (
  conversationId: string,
  query: string,
  ragResults: RAGSearchResult[]
): void => {
  const session = conversationSessions.get(conversationId);
  if (!session) return;

  session.previousQueries.push(query);
  session.cumulativeContext.push(...ragResults);
  session.lastUpdated = new Date();

  // 세션 크기 제한 (최대 50개 쿼리, 200개 결과)
  if (session.previousQueries.length > 50) {
    session.previousQueries = session.previousQueries.slice(-50);
  }
  if (session.cumulativeContext.length > 200) {
    session.cumulativeContext = session.cumulativeContext.slice(-200);
  }
};

/**
 * 대화 세션 정리
 */
export const cleanupConversationRAGSessions = (): void => {
  const now = new Date();
  const maxAge = 24 * 60 * 60 * 1000; // 24시간

  for (const [id, session] of conversationSessions.entries()) {
    if (now.getTime() - session.lastUpdated.getTime() > maxAge) {
      conversationSessions.delete(id);
    }
  }
};

// 주기적으로 세션 정리 (1시간마다)
setInterval(cleanupConversationRAGSessions, 60 * 60 * 1000);