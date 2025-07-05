// 로컬 개발용 AI API 서버
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// 환경 변수
const MISTRAL_API_KEY = import.meta.env.VITE_MISTRAL_API_KEY;
const CLAUDE_API_KEY = import.meta.env.VITE_CLAUDE_API_KEY;

// Interfaces moved inside to remove external dependencies
export type AIFunctionType =
    | 'customer_chat'
    | 'qna_automation'
    | 'smart_quote'
    | 'document_search'
    | 'financial_analysis';

export interface LocalAIRequest {
    function_type?: string;
    message: string;
    context?: any;
    is_admin?: boolean;
}

export interface LocalAIResponse {
    success: boolean;
    response: string;
    function_type: AIFunctionType;
    timestamp: string;
    error?: string;
    follow_up_questions: string[];
}

class LocalAIServer {
    private supabase: SupabaseClient | null = null;

    private getSupabase(): SupabaseClient {
        if (!this.supabase) {
            const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
            const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

            if (!supabaseUrl || !supabaseAnonKey) {
                console.error("Supabase environment variables VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are missing in your .env.local file.");
                throw new Error("Supabase URL and Anon Key are required.");
            }

            this.supabase = createClient(supabaseUrl, supabaseAnonKey);
        }
        return this.supabase;
    }

    // Function to determine the best AI function for a given query
    private async route(query: string): Promise<AIFunctionType> {
        const routingPrompt = `
          Given the user query, determine the most appropriate function to use.
          You must return only the function ID, and nothing else.
          
          Available functions:
          - customer_chat: For general product inquiries, technical support, and assistance.
          - qna_automation: For answering frequently asked questions based on existing data.
          - smart_quote: For generating quotes and cost estimations for products and services.
          - document_search: For searching and retrieving information from internal documents, manuals, and reports.
          - financial_analysis: For analyzing sales, revenue, trends, and providing financial insights. (Use for financial questions)

          User Query: "${query}"
          Function ID:`;

        try {
            const response = await this.callMistralAPI(routingPrompt, query, false, true);
            const functionId = response.response.trim().replace(/['"`]/g, '');
            if (['customer_chat', 'qna_automation', 'smart_quote', 'document_search', 'financial_analysis'].includes(functionId)) {
                return functionId as AIFunctionType;
            }
        } catch (error) {
            console.error("Routing failed:", error);
        }

        // Default to customer_chat if routing fails
        return 'customer_chat';
    }

    async processRequest(request: LocalAIRequest): Promise<LocalAIResponse> {
        const { message, is_admin = false } = request;
        let function_type = request.function_type;

        if (!function_type) {
            function_type = await this.route(message);
        }

        const typed_function_type = function_type as AIFunctionType;

        try {
            const response = await this.callMistralAPI(typed_function_type, message, is_admin);

            return {
                success: true,
                response: response.response,
                follow_up_questions: response.follow_up_questions,
                function_type: typed_function_type,
                timestamp: new Date().toISOString()
            };

        } catch (error) {
            console.error('Local AI Server Error:', error);

            try {
                const fallbackResponse = await this.callClaudeAPI(typed_function_type, message, is_admin);
                return {
                    success: true,
                    response: fallbackResponse.response,
                    function_type: typed_function_type,
                    timestamp: new Date().toISOString(),
                    follow_up_questions: fallbackResponse.follow_up_questions
                };
            } catch (fallbackError) {
                console.error('Fallback AI service failed:', fallbackError);
                return {
                    success: false,
                    response: '',
                    function_type: typed_function_type,
                    timestamp: new Date().toISOString(),
                    error: '현재 AI 서비스가 일시적으로 이용할 수 없습니다. 잠시 후 다시 시도해주세요.',
                    follow_up_questions: []
                };
            }
        }
    }

    // Modified callMistralAPI to handle routing prompts
    private async callMistralAPI(functionTypeOrPrompt: AIFunctionType | string, message: string, isAdmin: boolean, isRouting: boolean = false): Promise<{ response: string, follow_up_questions: string[] }> {
        const systemPrompt = isRouting ? functionTypeOrPrompt : this.getSystemPrompt(functionTypeOrPrompt as AIFunctionType, isAdmin);
        const userMessage = isRouting ? "" : message;

        const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${MISTRAL_API_KEY}`,
            },
            body: JSON.stringify({
                model: 'mistral-large-latest',
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userMessage }
                ].filter(msg => msg.content), // Filter out empty messages for routing
                temperature: 0.1, // Lower temperature for deterministic routing
                max_tokens: isRouting ? 20 : 1000,
            }),
        });

        if (!response.ok) {
            throw new Error(`Mistral API error: ${response.status}`);
        }

        const data = await response.json();
        const content = data.choices[0]?.message?.content || 'AI 응답을 받을 수 없습니다.';

        // More flexible regex for follow-up questions
        const followUpRegex = /(\s*\[\s*".*?"(?:,\s*".*?")*\s*\])/s;
        const match = content.match(followUpRegex);
        let followUpQuestions: string[] = [];
        let mainResponse = content;

        if (match && match[0]) {
            try {
                followUpQuestions = JSON.parse(match[0]);
                mainResponse = mainResponse.replace(followUpRegex, '').trim();
            } catch (e) {
                console.error("Failed to parse follow-up questions:", e);
                // If parsing fails, leave the response as is.
            }
        }

        return { response: mainResponse, follow_up_questions: followUpQuestions };
    }

    private async callClaudeAPI(functionType: AIFunctionType, message: string, isAdmin: boolean): Promise<{ response: string, follow_up_questions: string[] }> {
        const systemPrompt = this.getSystemPrompt(functionType, isAdmin);

        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': CLAUDE_API_KEY,
                'anthropic-version': '2023-06-01',
            },
            body: JSON.stringify({
                model: 'claude-3-5-sonnet-20241022',
                max_tokens: 1000,
                system: systemPrompt,
                messages: [
                    { role: 'user', content: message }
                ],
            }),
        });

        if (!response.ok) {
            throw new Error(`Claude API error: ${response.status}`);
        }

        const data = await response.json();
        const content = data.content[0]?.text || 'AI 응답을 받을 수 없습니다.';

        // More flexible regex for follow-up questions
        const followUpRegex = /(\s*\[\s*".*?"(?:,\s*".*?")*\s*\])/s;
        const match = content.match(followUpRegex);
        let followUpQuestions: string[] = [];
        let mainResponse = content;

        if (match && match[0]) {
            try {
                followUpQuestions = JSON.parse(match[0]);
                mainResponse = mainResponse.replace(followUpRegex, '').trim();
            } catch (e) {
                console.error("Failed to parse follow-up questions:", e);
                // If parsing fails, leave the response as is.
            }
        }

        return { response: mainResponse, follow_up_questions: followUpQuestions };
    }

    private getSystemPrompt(functionType: AIFunctionType, isAdmin: boolean): string {
        const basePrompt = `당신은 린코리아(RIN Korea)의 AI 어시스턴트입니다. 린코리아는 혁신적인 세라믹 코팅재와 친환경 건설재료를 전문으로 하는 회사입니다.
주요 제품:
- 린코트(RIN-COAT): 1액형 세라믹 코팅제
- 린하드플러스(RIN-HARD PLUS): 고성능 경화제
- 린씰플러스(RIN-SEAL PLUS): 침투성 방수제

항상 정확하고 전문적인 답변을 제공하며, 고객의 요구사항을 정확히 파악하여 최적의 솔루션을 제안해주세요.
${isAdmin ? '당신은 관리자 권한으로 모든 기능과 데이터에 접근할 수 있습니다.' : ''}
답변을 제공한 후, 반드시 관련된 후속 질문 3개를 JSON 배열 형식으로 제안해야 합니다. 예: ["질문 1", "질문 2", "질문 3"]. 이 JSON 배열은 전체 응답의 가장 마지막에 위치해야 하며, 그 뒤에 다른 텍스트가 없어야 합니다.`;

        switch (functionType) {
            case 'customer_chat':
                return `${basePrompt}
현재 모드: 고객 상담. 고객의 문의에 대해 친절하고 전문적으로 답변해주세요. 제품, 기술, 가격에 대한 정확한 정보를 제공해주세요.`;

            case 'qna_automation':
                return `${basePrompt}
현재 모드: Q&A 자동화. 기존 Q&A 데이터베이스를 참고하여 유사한 질문에 답변하거나 새로운 질문에 대한 적절한 답변을 생성해주세요.`;

            case 'smart_quote':
                return `${basePrompt}
현재 모드: 스마트 견적 시스템. 고객의 요구사항을 파악하고, 적절한 제품을 추천하며, 면적, 수량, 특수 요구사항을 고려하여 정확한 견적을 제공해주세요.
답변에는 반드시 상세한 설명과 함께, 아래와 같이 [QUOTE_START]와 [QUOTE_END] 마커로 감싸진 JSON 객체를 포함해야 합니다:
[QUOTE_START]
{
  "products": [
    { "name": "제품명", "price": 100000, "quantity": 1 }
  ],
  "total": 100000,
  "validity": "30일",
  "notes": "참고 사항"
}
[QUOTE_END]`;

            case 'document_search':
                return `${basePrompt}
현재 모드: 문서 지능 검색. 사용자가 요청한 정보를 데이터베이스에서 검색하고, 관련 문서나 자료를 찾아 요약하여 제공해주세요.`;

            case 'financial_analysis':
                return `${basePrompt}
현재 모드: 금융 AI 분석. 수익 데이터, 매출 트렌드, 성과를 분석하고 인사이트와 개선 제안을 제공해주세요. 차트나 그래프로 시각화할 수 있는 데이터도 제공해주세요.`;

            default:
                return basePrompt;
        }
    }

    private async performDocumentSearch(query: string): Promise<string> {
        try {
            const supabase = this.getSupabase();
            const tables = ['products', 'projects', 'news', 'resources'];
            const results = [];

            for (const table of tables) {
                const { data, error } = await supabase
                    .from(table)
                    .select('*')
                    .or(`name.ilike.%${query}%,title.ilike.%${query}%,description.ilike.%${query}%,content.ilike.%${query}%`)
                    .limit(3);

                if (!error && data && data.length > 0) {
                    results.push(`${table} 검색 결과: ${data.length}개`);
                    results.push(...data.map(item =>
                        `- ${item.name || item.title}: ${(item.description || item.content || '').substring(0, 100)}...`
                    ));
                }
            }

            return results.length > 0 ? results.join('\n') : '검색 결과가 없습니다.';
        } catch (error) {
            return `검색 중 오류가 발생했습니다: ${error instanceof Error ? error.message : 'Unknown error'}`;
        }
    }

    private async generateQuote(_message: string, _context: any): Promise<string> {
        try {
            const supabase = this.getSupabase();
            const { data: products, error } = await supabase
                .from('products')
                .select('*')
                .limit(10);

            if (error) {
                return `견적 생성 중 오류가 발생했습니다: ${error.message}`;
            }

            const sampleQuote = {
                products: products?.slice(0, 3).map(p => ({
                    name: p.name,
                    price: p.price || 100000,
                    quantity: 1
                })) || [],
                total: 300000,
                validity: '30일',
                notes: '견적은 참고용이며, 정확한 견적은 별도 문의 바랍니다.'
            };

            return JSON.stringify(sampleQuote, null, 2);
        } catch (error) {
            return `견적 생성 중 오류가 발생했습니다: ${error instanceof Error ? error.message : 'Unknown error'}`;
        }
    }

    private async performFinancialAnalysis(_message: string, _context: any): Promise<string> {
        try {
            const supabase = this.getSupabase();
            const { data: revenueData, error } = await supabase
                .from('revenue_data')
                .select('*')
                .order('date', { ascending: false })
                .limit(50);

            if (error) {
                return `분석 중 오류가 발생했습니다: ${error.message}`;
            }

            if (!revenueData || revenueData.length === 0) {
                return '분석할 데이터가 없습니다.';
            }

            const totalRevenue = revenueData.reduce((sum, item) => sum + (item.revenue || 0), 0);
            const avgRevenue = totalRevenue / revenueData.length;
            const categories = [...new Set(revenueData.map(item => item.category))];

            const analysis = {
                총매출: totalRevenue,
                평균매출: avgRevenue,
                데이터포인트: revenueData.length,
                카테고리수: categories.length,
                최근데이터: revenueData.slice(0, 5)
            };

            return JSON.stringify(analysis, null, 2);
        } catch (error) {
            return `분석 중 오류가 발생했습니다: ${error instanceof Error ? error.message : 'Unknown error'}`;
        }
    }
}

export const localAIServer = new LocalAIServer(); 