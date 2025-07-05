import { localAIServer, LocalAIRequest } from './local-ai-server';

// AI 기능 유형 정의
export type AIFunctionType =
    | 'customer_chat'
    | 'qna_automation'
    | 'smart_quote'
    | 'document_search'
    | 'financial_analysis';

// API 응답 인터페이스
export interface AIResponse {
    success: boolean;
    response: string;
    function_type: AIFunctionType;
    timestamp: string;
    follow_up_questions: string[];
    error?: string;
}

// 에이전트 설정
export class RinKoreaAIAgent {
    private apiEndpoint = '/api/ai-chat';
    private isDevelopment = import.meta.env.DEV;

    async processRequest(
        functionType: AIFunctionType | null, // Allow null for routing
        message: string,
        context?: any,
        isAdmin: boolean = false
    ): Promise<AIResponse> {
        try {
            // 로컬 개발 환경에서는 로컬 AI 서버 사용
            if (this.isDevelopment) {
                const request: LocalAIRequest = {
                    function_type: functionType || undefined,
                    message,
                    context,
                    is_admin: isAdmin,
                };

                return await localAIServer.processRequest(request);
            }

            // 프로덕션 환경에서는 Vercel 서버리스 함수 사용
            const response = await fetch(this.apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    function_type: functionType,
                    message,
                    context,
                    is_admin: isAdmin,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }

            const data: AIResponse = await response.json();

            if (!data.success) {
                throw new Error(data.error || 'AI request failed');
            }

            return data;
        } catch (error) {
            console.error('AI request error:', error);

            // 에러 메시지 개선
            const errorMessage = error instanceof Error
                ? (error.message.includes('fetch')
                    ? '네트워크 연결을 확인해주세요. 잠시 후 다시 시도해주세요.'
                    : `오류가 발생했습니다: ${error.message}`)
                : '알 수 없는 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';

            return {
                success: false,
                response: errorMessage,
                function_type: 'customer_chat',
                timestamp: new Date().toISOString(),
                follow_up_questions: [],
                error: errorMessage
            };
        }
    }
}

export const aiAgent = new RinKoreaAIAgent(); 