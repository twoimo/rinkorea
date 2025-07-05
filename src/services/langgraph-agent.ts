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
        // function_type에 따라 적절한 systemPrompt를 생성합니다.
        const getSystemPrompt = (type: AIFunctionType | null): string => {
            switch (type) {
                case 'customer_chat':
                    return 'You are a friendly and helpful customer support assistant for RinKorea, a company specializing in concrete floor finishing solutions.';
                case 'qna_automation':
                    return 'You are an intelligent Q&A assistant. Your goal is to accurately answer questions based on the provided company documents and knowledge base.';
                case 'smart_quote':
                    return 'You are a smart quotation assistant. Generate a detailed quote based on the user\'s request for RinKorea products. Include itemized costs, quantities, and totals.';
                case 'document_search':
                    return 'You are a powerful document search assistant. Search through RinKorea\'s internal documents to find the most relevant information for the user\'s query.';
                case 'financial_analysis':
                    return 'You are a sophisticated financial analyst AI. Provide insights and analysis on RinKorea\'s financial data. This is a restricted function.';
                default:
                    // functionType이 null이거나 정의되지 않은 경우, 일반적인 상담원으로 작동
                    return 'You are a general AI assistant for RinKorea. First, understand the user\'s intent and then route to the most appropriate function if necessary.';
            }
        };

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
            const systemPrompt = getSystemPrompt(functionType);

            const response = await fetch(this.apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message, // 사용자 메시지
                    systemPrompt, // 생성된 시스템 프롬프트
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }

            // 서버 응답 형식에 맞게 클라이언트 응답 객체를 재구성합니다.
            const data = await response.json();

            return {
                success: true,
                response: data.response,
                function_type: functionType || 'customer_chat',
                timestamp: new Date().toISOString(),
                follow_up_questions: [], // 서버가 이 정보를 제공하지 않으므로 빈 배열로 설정
            };
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