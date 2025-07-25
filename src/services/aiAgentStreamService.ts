// AI 에이전트 스트리밍 서비스
export interface StreamMessage {
  type: 'status' | 'function_type' | 'rag_results' | 'content' | 'rag_context' | 'done' | 'error';
  message?: string;
  content?: string;
  value?: any;
  count?: number;
  quality?: number;
}

export interface AIStreamRequest {
  function_type?: string;
  message: string;
  context?: any;
  is_admin?: boolean;
  enable_rag?: boolean;
  preferred_collections?: string[];
  conversation_id?: string;
  stream: boolean;
}

export interface StreamCallbacks {
  onStatus?: (message: string) => void;
  onFunctionType?: (functionType: string) => void;
  onRAGResults?: (count: number, quality: number) => void;
  onContent?: (content: string) => void;
  onRAGContext?: (context: any) => void;
  onDone?: () => void;
  onError?: (error: string) => void;
}

/**
 * AI 에이전트 스트리밍 요청
 */
export const streamAIAgentRequest = async (
  request: AIStreamRequest,
  callbacks: StreamCallbacks
): Promise<void> => {
  try {
    const response = await fetch('/api/ai-agent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('스트림을 읽을 수 없습니다.');
    }

    const decoder = new TextDecoder();
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data.trim() === '') continue;

            try {
              const message: StreamMessage = JSON.parse(data);
              handleStreamMessage(message, callbacks);
            } catch (parseError) {
              console.error('스트림 메시지 파싱 오류:', parseError);
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  } catch (error) {
    console.error('스트리밍 요청 오류:', error);
    callbacks.onError?.(error instanceof Error ? error.message : '알 수 없는 오류');
  }
};

/**
 * 스트림 메시지 처리
 */
const handleStreamMessage = (message: StreamMessage, callbacks: StreamCallbacks): void => {
  switch (message.type) {
    case 'status':
      callbacks.onStatus?.(message.message || '');
      break;
    case 'function_type':
      callbacks.onFunctionType?.(message.value || '');
      break;
    case 'rag_results':
      callbacks.onRAGResults?.(message.count || 0, message.quality || 0);
      break;
    case 'content':
      callbacks.onContent?.(message.content || '');
      break;
    case 'rag_context':
      callbacks.onRAGContext?.(message.value);
      break;
    case 'done':
      callbacks.onDone?.();
      break;
    case 'error':
      callbacks.onError?.(message.message || '알 수 없는 오류');
      break;
  }
};

/**
 * 일반 AI 에이전트 요청 (비스트리밍)
 */
export const requestAIAgent = async (request: Omit<AIStreamRequest, 'stream'>): Promise<any> => {
  try {
    const response = await fetch('/api/ai-agent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ...request, stream: false }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('AI 에이전트 요청 오류:', error);
    throw error;
  }
};

/**
 * RAG 기능이 활성화된 스트리밍 요청
 */
export const streamRAGRequest = async (
  message: string,
  preferredCollections: string[] = [],
  callbacks: StreamCallbacks,
  conversationId?: string
): Promise<void> => {
  return streamAIAgentRequest({
    message,
    enable_rag: true,
    preferred_collections: preferredCollections,
    conversation_id: conversationId,
    stream: true,
    function_type: 'document_search'
  }, callbacks);
};

/**
 * 문서 검색 스트리밍 요청
 */
export const streamDocumentSearch = async (
  query: string,
  collections: string[] = [],
  callbacks: StreamCallbacks
): Promise<void> => {
  return streamAIAgentRequest({
    message: query,
    function_type: 'document_search',
    enable_rag: true,
    preferred_collections: collections,
    stream: true
  }, callbacks);
};

/**
 * QnA 자동화 스트리밍 요청
 */
export const streamQnAAutomation = async (
  question: string,
  callbacks: StreamCallbacks,
  conversationHistory?: any[]
): Promise<void> => {
  return streamAIAgentRequest({
    message: question,
    function_type: 'qna_automation',
    enable_rag: true,
    context: { history: conversationHistory },
    stream: true
  }, callbacks);
};

/**
 * 스트리밍 응답을 위한 React Hook
 */
export const useAIAgentStream = () => {
  const [isStreaming, setIsStreaming] = React.useState(false);
  const [currentResponse, setCurrentResponse] = React.useState('');
  const [status, setStatus] = React.useState('');
  const [functionType, setFunctionType] = React.useState('');
  const [ragResults, setRAGResults] = React.useState<{ count: number; quality: number } | null>(null);
  const [ragContext, setRAGContext] = React.useState<any>(null);
  const [error, setError] = React.useState<string | null>(null);

  const streamRequest = React.useCallback(async (request: AIStreamRequest) => {
    setIsStreaming(true);
    setCurrentResponse('');
    setStatus('');
    setFunctionType('');
    setRAGResults(null);
    setRAGContext(null);
    setError(null);

    await streamAIAgentRequest(request, {
      onStatus: setStatus,
      onFunctionType: setFunctionType,
      onRAGResults: (count, quality) => setRAGResults({ count, quality }),
      onContent: (content) => setCurrentResponse(prev => prev + content),
      onRAGContext: setRAGContext,
      onDone: () => setIsStreaming(false),
      onError: (err) => {
        setError(err);
        setIsStreaming(false);
      }
    });
  }, []);

  const reset = React.useCallback(() => {
    setCurrentResponse('');
    setStatus('');
    setFunctionType('');
    setRAGResults(null);
    setRAGContext(null);
    setError(null);
    setIsStreaming(false);
  }, []);

  return {
    isStreaming,
    currentResponse,
    status,
    functionType,
    ragResults,
    ragContext,
    error,
    streamRequest,
    reset
  };
};

// React import (조건부)
let React: any;
try {
  React = require('react');
} catch {
  // React가 없는 환경에서는 Hook을 사용할 수 없음
}