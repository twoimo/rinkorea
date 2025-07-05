// Vercel 서버리스 함수 환경에 맞게 재구성된 AI 에이전트
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { VercelRequest, VercelResponse } from '@vercel/node';

// 환경 변수 (Vercel 서버리스 환경용)
const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY;
const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

// 타입 정의
export type AIFunctionType =
    | 'customer_chat'
    | 'qna_automation'
    | 'smart_quote'
    | 'document_search'
    | 'financial_analysis';

export interface AIRequest {
    function_type?: string;
    message: string;
    context?: any;
    is_admin?: boolean;
}

class UnifiedAIAgent {
    private supabase: SupabaseClient | null = null;

    private getSupabase(): SupabaseClient {
        if (!this.supabase) {
            if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
                throw new Error("Supabase URL and Anon Key are required in environment variables.");
            }
            this.supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        }
        return this.supabase;
    }

    private async route(query: string): Promise<AIFunctionType> {
        const routingInstructions = `
          Given the user query, determine the most appropriate function to use.
          You must return only the function ID, and nothing else.
          
          Available functions:
          - customer_chat: For general product inquiries, technical support, and assistance.
          - qna_automation: For answering frequently asked questions based on existing data.
          - smart_quote: For generating quotes and cost estimations for products and services.
          - document_search: For searching and retrieving information from internal documents, manuals, and reports.
          - financial_analysis: For analyzing sales, revenue, trends, and providing financial insights. (Use for financial questions)`;

        try {
            const response = await this.callMistralAPI(routingInstructions, query, false, true);
            const functionId = response.response.trim().replace(/['"`]/g, '');
            if (['customer_chat', 'qna_automation', 'smart_quote', 'document_search', 'financial_analysis'].includes(functionId)) {
                return functionId as AIFunctionType;
            }
        } catch (error) {
            console.error("Routing with Mistral failed, trying Claude:", error);
            try {
                const response = await this.callClaudeAPI(routingInstructions, query, false, true);
                const functionId = response.response.trim().replace(/['"`]/g, '');
                if (['customer_chat', 'qna_automation', 'smart_quote', 'document_search', 'financial_analysis'].includes(functionId)) {
                    return functionId as AIFunctionType;
                }
            } catch (claudeError) {
                console.error("Routing with Claude also failed:", claudeError);
            }
        }
        return 'customer_chat';
    }

    public async processRequest(request: AIRequest) {
        const { message, context = {}, is_admin = false } = request;
        let function_type = request.function_type;

        if (!function_type) {
            function_type = await this.route(message);
        }

        const typed_function_type = function_type as AIFunctionType;

        try {
            // Mistral API 우선 호출
            return await this.callMistralAPI(typed_function_type, message, is_admin, false, context.history);
        } catch (error) {
            console.error('Unified AI Agent primary error:', error);
            try {
                // 실패 시 Claude API 호출
                return await this.callClaudeAPI(typed_function_type, message, is_admin, context.history);
            } catch (fallbackError) {
                console.error('Unified AI Agent fallback error:', fallbackError);
                // 최종 실패 처리
                throw new Error('Both AI services failed.');
            }
        }
    }

    // ... (callMistralAPI, callClaudeAPI, getSystemPrompt 등 local-ai-server.ts의 나머지 메소드들)
    private async callMistralAPI(functionTypeOrPrompt: AIFunctionType | string, message: string, isAdmin: boolean, isRouting: boolean = false, history: any[] = []): Promise<{ response: string, follow_up_questions: string[] }> {
        const systemPrompt = isRouting ? functionTypeOrPrompt : this.getSystemPrompt(functionTypeOrPrompt as AIFunctionType, isAdmin);
        const formattedHistory = history.map(h => ({ role: h.role, content: h.content }));

        const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${MISTRAL_API_KEY}` },
            body: JSON.stringify({
                model: 'mistral-large-latest',
                messages: [{ role: 'system', content: systemPrompt }, ...formattedHistory, { role: 'user', content: message }],
                temperature: 0.1,
                max_tokens: isRouting ? 20 : 1000,
            }),
        });

        if (!response.ok) {
            const errorBody = await response.json().catch(() => response.text());
            console.error('Mistral API Error Body:', errorBody);
            const errorMessage = typeof errorBody === 'string' ? errorBody : (errorBody?.error?.message || JSON.stringify(errorBody));
            throw new Error(`Mistral API error: ${response.status} - ${errorMessage}`);
        }

        const data = await response.json();
        const content = data.choices[0]?.message?.content || 'AI 응답을 받을 수 없습니다.';
        return this.extractFollowUpQuestions(content);
    }

    private async callClaudeAPI(functionTypeOrPrompt: AIFunctionType | string, message: string, isAdmin: boolean, isRouting: boolean = false, history: any[] = []): Promise<{ response: string, follow_up_questions: string[] }> {
        if (!CLAUDE_API_KEY) {
            throw new Error("Claude API key is not configured.");
        }

        const systemPrompt = isRouting ? functionTypeOrPrompt as string : this.getSystemPrompt(functionTypeOrPrompt as AIFunctionType, isAdmin);
        const formattedHistory = history.map(h => ({ role: h.role, content: h.content }));

        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-api-key': CLAUDE_API_KEY, 'anthropic-version': '2023-06-01' },
            body: JSON.stringify({
                model: 'claude-3-5-sonnet-20240620',
                max_tokens: isRouting ? 20 : 1000,
                system: systemPrompt,
                messages: [...formattedHistory, { role: 'user', content: message }],
                temperature: isRouting ? 0 : 0.2,
            }),
        });

        if (!response.ok) {
            const errorBody = await response.json().catch(() => response.text());
            console.error('Claude API Error Body:', errorBody);
            const errorMessage = typeof errorBody === 'string' ? errorBody : (errorBody?.error?.message || JSON.stringify(errorBody));
            throw new Error(`Claude API error: ${response.status} - ${errorMessage}`);
        }

        const data = await response.json();
        const content = data.content[0]?.text || 'AI 응답을 받을 수 없습니다.';

        if (isRouting) {
            return { response: content, follow_up_questions: [] };
        }

        return this.extractFollowUpQuestions(content);
    }

    private extractFollowUpQuestions(content: string): { response: string, follow_up_questions: string[] } {
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
            }
        }
        return { response: mainResponse, follow_up_questions: followUpQuestions };
    }

    private getSystemPrompt(functionType: AIFunctionType, isAdmin: boolean): string {
        const basePrompt = `당신은 린코리아(RIN Korea)의 AI 어시스턴트입니다. 린코리아는 혁신적인 세라믹 코팅재와 친환경 건설재료를 전문으로 하는 회사입니다.

RIN-COAT 제품 상세 정보:
RIN-COAT는 1액형 친환경 불연재 세라믹 무기질 코팅제입니다. 건설재료 전문 제조기업인 린코리아(RINKOREA)에서 개발했으며, 주원료는 세라믹계 고분자화합물입니다. 이 제품은 콘크리트에 침투하여 강화시키는 코팅제로, 상온에서 자연 경화됩니다.

주요 특징 및 장점:
- 친환경성: 시공 후 분진가루나 화학물질이 발생하지 않으며, 유해가스가 나오지 않는 친환경 마감재입니다.
- 안전성 및 내구성: 불연재로 화재 시 유해가스가 발생하지 않습니다. 초고경도(7~9H)의 도막을 형성하며, 내마모성, 방수성능, 항균성능이 우수합니다.
- 비용 효율성: 1액형 타입으로 시공 절차가 간소화되어 공사 기간을 단축하고 비용을 절감할 수 있습니다. 또한, 반영구적인 수명과 간편한 유지 보수로 관리비를 절감할 수 있습니다.
- 기능성 및 심미성: 스키드 마크 발생을 방지하고, 황변 현상이 없어 실내외 모두 적용 가능합니다. 내오염성과 내화학성 또한 뛰어납니다.

제품 상세 스펙:
- 주성분: 세라믹계 고분자 화합물
- 외관: 무색 투명색
- 비중: 0.96 (±0.05)
- pH: 6 (±1)
- 사용량: 0.1 ~ 0.3 kg/m² (바탕면 상태에 따라 차이 발생 가능)
- 보존기간: 제조일로부터 6개월 (미개봉, 직사광선을 피해 서늘하고 건조한 곳 보관 시)

시공 방법:
1. 표면 처리: 콘크리트 표면의 레이턴스를 연삭 및 연마하여 제거하고 깨끗하게 청소합니다. 콘크리트는 최소 28일 이상 양생하고, 표면 함수율은 6% 이하여야 합니다.
2. 도포: 스프레이 시공을 기본으로 하며, 롤러나 붓으로도 작업이 가능합니다. 크랙 방지를 위해 한 번에 두껍게 올리지 않고, 바탕면 상태에 따라 2~3회 얇게 코팅합니다. 2차 도포는 1차 도포 후 빠른 시간 내에 진행하는 것을 권장합니다.
3. 양생: 시공된 표면은 상온에서 15일 이상 양생합니다. 초기 7일간은 물의 접촉을 피해야 백화 현상을 방지할 수 있습니다.

주요 시공 분야:
RIN-COAT는 내구성과 안전성이 요구되는 모든 콘크리트 바닥 및 벽체에 적용할 수 있습니다.
- 공장, 물류창고, 주차장
- HACCP, GMP, IT 관련 시설 및 2차 전지 공장 바닥
- 전시장, 카페, 식당 등 상업 공간

주요 주의사항:
- 습기: 콘크리트 표면이나 공기 중의 습도가 높으면 경화 과정에서 백화 현상이 발생할 수 있으므로 주의해야 합니다.
- 호환성: RIN-COAT 코팅이 완료된 표면 위에는 어떤 도료도 부착되지 않습니다. 주차장 라인 작업 등이 필요할 경우, 해당 공간을 비워두고 코팅한 후 라인 작업을 해야 합니다.
- 기존 마감면: 에폭시, 타일, 발수 코팅제 등이 시공된 면 위에는 부착이 안 되거나 깨짐 현상이 발생할 수 있으므로 반드시 테스트 후 작업해야 합니다.
- 전문가용 제품: 제품에 대해 충분히 숙지한 전문가가 사용해야 합니다.

주요 제품 리스트:
- 린코트(RIN-COAT): 1액형 콘크리트 침투 강화 세라믹 코팅제
- 린하드플러스(RIN-HARD PLUS): 콘크리트 강화제(액상하드너)
- 린씰플러스(RIN-SEAL PLUS): 콘크리트 코팅제(실러) 

항상 정확하고 전문적인 답변을 제공하며, 고객의 요구사항을 정확히 파악하여 최적의 솔루션을 제안해주세요.
${isAdmin ? '당신은 관리자 권한으로 모든 기능과 데이터에 접근할 수 있습니다.' : ''}
답변을 제공한 후, 반드시 관련된 후속 질문 3개를 JSON 배열 형식으로 제안해야 합니다. 예: ["질문 1", "질문 2", "질문 3"]. 이 JSON 배열은 전체 응답의 가장 마지막에 위치해야 하며, 그 뒤에 다른 텍스트가 없어야 합니다.`;

        switch (functionType) {
            case 'customer_chat':
                return `${basePrompt}\n현재 모드: 고객 상담. 고객의 문의에 대해 친절하고 전문적으로 답변해주세요. 제품, 기술, 가격에 대한 정확한 정보를 제공해주세요.`;
            case 'qna_automation':
                return `${basePrompt}\n현재 모드: Q&A 자동화. 기존 Q&A 데이터베이스를 참고하여 유사한 질문에 답변하거나 새로운 질문에 대한 적절한 답변을 생성해주세요.`;
            case 'smart_quote':
                return `${basePrompt}\n현재 모드: 스마트 견적 시스템. 고객의 요구사항을 파악하고, 적절한 제품을 추천하며, 면적, 수량, 특수 요구사항을 고려하여 정확한 견적을 제공해주세요.\n답변에는 반드시 상세한 설명과 함께, 아래와 같이 [QUOTE_START]와 [QUOTE_END] 마커로 감싸진 JSON 객체를 포함해야 합니다:\n[QUOTE_START]\n{\n  "products": [\n    { "name": "제품명", "price": 100000, "quantity": 1 }\n  ],\n  "total": 100000,\n  "validity": "30일",\n  "notes": "참고 사항"\n}\n[QUOTE_END]`;
            case 'document_search':
                return `${basePrompt}\n현재 모드: 문서 지능 검색. 사용자가 요청한 정보를 데이터베이스에서 검색하고, 관련 문서나 자료를 찾아 요약하여 제공해주세요.`;
            case 'financial_analysis':
                return `${basePrompt}\n현재 모드: 금융 AI 분석. 수익 데이터, 매출 트렌드, 성과를 분석하고 인사이트와 개선 제안을 제공해주세요. 차트나 그래프로 시각화할 수 있는 데이터도 제공해주세요.`;
            default:
                return basePrompt;
        }
    }
}

const agent = new UnifiedAIAgent();

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // CORS 처리
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    if (!MISTRAL_API_KEY && !CLAUDE_API_KEY) {
        return res.status(503).json({ error: 'AI service is not configured on the server.' });
    }

    try {
        const result = await agent.processRequest(req.body);
        return res.status(200).json(result);
    } catch (error) {
        console.error('Error in AI agent handler:', error);
        return res.status(500).json({ error: 'An internal server error occurred.' });
    }
} 