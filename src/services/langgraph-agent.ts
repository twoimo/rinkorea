// import { localAIServer, LocalAIRequest } from './local-ai-server'; // 삭제

// AI 기능 유형 정의
export type AIFunctionType =
    | 'customer_chat'
    | 'qna_automation'
    | 'smart_quote'
    | 'document_search'
    | 'financial_analysis';

// API 응답 인터페이스 (클라이언트용)
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
    private apiEndpoint = '/api/ai-agent'; // 새로운 통합 API 엔드포인트로 변경
    // private isDevelopment = import.meta.env.DEV; // 삭제

    async processRequest(
        functionType: AIFunctionType | null,
        message: string,
        context?: any,
        isAdmin: boolean = false
    ): Promise<AIResponse> {
        try {
            // isDevelopment 분기 로직 제거
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
                const responseText = await response.text();
                let errorMessage = `서버 오류 (Status: ${response.status})`;
                try {
                    const errorData = JSON.parse(responseText);
                    errorMessage = errorData.error || `서버 응답: ${JSON.stringify(errorData)}`;
                } catch {
                    errorMessage = responseText.substring(0, 200);
                }
                throw new Error(errorMessage);
            }

            // 새로운 API 응답 형식에 맞게 데이터 파싱
            const data = await response.json();

            return {
                success: true,
                response: data.response,
                function_type: functionType || 'customer_chat', // 라우팅된 타입은 서버에서 결정하지만, 클라이언트 상태와 일관성 유지
                timestamp: new Date().toISOString(),
                follow_up_questions: data.follow_up_questions || [],
            };

        } catch (error) {
            console.error('AI request error:', error);
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