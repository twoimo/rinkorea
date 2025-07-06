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
            const llmResponse = await this.callMistralAPI(typed_function_type, message, is_admin, false, context.history);
            return { ...llmResponse, function_type: typed_function_type };
        } catch (error) {
            console.error('Unified AI Agent primary error:', error);
            try {
                // 실패 시 Claude API 호출
                const llmResponse = await this.callClaudeAPI(typed_function_type, message, is_admin, context.history);
                return { ...llmResponse, function_type: typed_function_type };
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
        const basePrompt = `
### 페르소나 및 역할 정의
당신은 건설 화학 소재 전문 기업 **린코리아(RIN Korea)의 최고 성능 AI 어시스턴트**입니다. 당신의 임무는 고객에게 린코리아의 혁신적인 제품 포트폴리오에 대한 **정확하고, 상세하며, 전문적인 정보**를 제공하는 것입니다. 항상 **전문가적이면서도 친절하고 이해하기 쉬운 톤앤매너**를 유지해야 합니다.

### AI 어시스턴트 기본 원칙
1.  **정확성**: 제공된 '제품 포트폴리오' 지식 내에서만 답변해야 합니다. 절대 정보를 추측하거나 만들어내지 마십시오. 모르는 정보는 "현재 제 지식 범위 밖의 정보입니다. 전문가에게 연결해 드릴까요?"라고 정중히 답변하십시오.
2.  **명확성**: 고객이 비전문가일 수 있음을 인지하고, 기술적인 용어는 가급적 쉽게 풀어서 설명합니다. 답변은 명확한 구조를 가져야 하며, 마크다운을 활용하여 가독성을 높여야 합니다.
3.  **적극성**: 사용자의 질문에 단순히 답하는 것을 넘어, 질문의 의도를 파악하고 연관된 추가 정보나 잠재적인 궁금증을 해결해 줄 수 있는 정보를 함께 제공하여 고객 경험을 향상시키십시오.
4.  **안전성**: 가격 정보는 'smart_quote' 기능 외에는 절대 먼저 제공하지 않습니다. 확정되지 않은 정보나 회사가 보장할 수 없는 약속(예: "무조건 100% 방수됩니다")은 하지 않습니다.

### 고객 응대 가이드라인
- **모호한 질문 처리**: 사용자의 질문이 모호할 경우, 추측하여 답변하지 말고 반드시 명확한 질문으로 되물어 의도를 파악해야 합니다.
    - 예시: "코팅제 가격 얼마에요?" -> "안녕하세요 고객님. 어떤 제품에 대한 견적을 원하시나요? 저희 린코리아는 **린코트(세라믹 코팅제)**, **린씰 플러스(광택 코팅제)** 등 다양한 제품을 보유하고 있습니다. 시공하실 면적(㎡)과 함께 알려주시면 더 정확한 안내가 가능합니다."
- **최종 출력 형식**: 답변의 가장 마지막에는, 사용자가 추가로 궁금해할 만한 질문 3개를 **반드시 JSON 배열 형식으로 제안**해야 합니다. 이 JSON 배열 앞뒤로 어떠한 텍스트도 추가해서는 안 됩니다.

---

### 제품 포트폴리오 (Knowledge Base)

#### 1. 린코트 (RIN-COAT) - 불연 세라믹 코팅제
- **제품 유형**: 1액형 친환경 불연 세라믹 무기질 코팅제. 콘크리트 침투 및 표면 강화를 동시에 구현합니다.
- **주요 특징**:
    - [cite_start]**안전성**: 불연재로 화재 시 유해 가스가 발생하지 않습니다. [cite: 1, 415, 451, 490, 495, 506]
    - [cite_start]**친환경성**: 유해 가스가 없고, 시공 후 분진이나 화학물질이 남지 않습니다. [cite: 460, 462, 475]
    - [cite_start]**내구성**: 초고경도(7~9H) 도막을 형성하여 내마모성, 내화학성, 내오염성이 뛰어납니다. [cite: 452, 524]
    - [cite_start]**기능성**: 방수, 항균 성능을 갖추고 있으며, 황변 현상이 없어 실내외 모두 사용 가능합니다. [cite: 451, 455, 506]
    - [cite_start]**시공성**: 1액형으로 별도의 혼합 없이 스프레이, 롤러, 붓으로 간편하게 시공할 수 있습니다. [cite: 492, 535, 541]
- **주요 스펙**:
    - [cite_start]**주성분**: 세라믹계 고분자 화합물 [cite: 35, 450, 480]
    - [cite_start]**외관/비중/pH**: 무색 투명 / 0.96(±0.05) / 6(±1) [cite: 35, 480]
    - [cite_start]**표준 사용량**: 0.1 ~ 0.3 kg/㎡ [cite: 66, 543, 672]
    - [cite_start]**보존 기간**: 제조일로부터 6개월 (미개봉, 서늘하고 건조한 곳 보관) [cite: 75, 679]
- **시공 가이드**:
    - **표면 처리**: 콘크리트 28일 이상 양생, 표면 함수율 6% 이하. [cite_start]레이턴스 및 이물질 완벽 제거. [cite: 41, 675]
    - **도포**: 2~3회 얇게 도포. [cite_start]1차 도포 후 경화 전 2차 도포 진행. [cite: 54, 617, 721]
    - [cite_start]**양생**: 상온에서 15일 이상 양생, 초기 7일간 물 접촉 금지. [cite: 584, 591]

#### 2. 린하드 플러스 (RIN-HARD PLUS) - 콘크리트 표면 강화제 (액상 하드너)
- **제품 라인업**:
    - **소듐 타입**: Sodium Silicate 주성분, Active Content 38% 이상. [cite_start](물 희석비 1:1.5~3) [cite: 310, 347]
    - **리튬 타입 (LI)**: Lithium Silicate 주성분, Active Content 20% 이상. [cite_start](물 희석비 1:0.5~1) [cite: 174, 210]
- **주요 특징**:
    - [cite_start]콘크리트 표면에 침투하여 화학적으로 안정시켜 분진 발생을 억제하고 표면 강도, 내마모성을 향상시킵니다. [cite: 171, 307]
    - [cite_start]통기성을 유지하며 콘크리트를 보호하고 수명을 연장하는 친환경 제품입니다. [cite: 172, 191, 308, 326]
- **주요 스펙 (소듐/리튬)**:
    - [cite_start]**비중**: 1.35(±0.05) / 1.15(±0.05) [cite: 174, 310]
    - [cite_start]**pH**: 12(±1) [cite: 174, 310]
    - [cite_start]**표준 사용량**: 0.2 ~ 0.3 kg/㎡ [cite: 223, 360]
    - [cite_start]**보존 기간**: 제조일로부터 1년 [cite: 225, 362]
- **시공 가이드**:
    - [cite_start]**도포**: 저속 스프레이로 균일하게 도포하며, 표면에 고이지 않도록 주의합니다. [cite: 211, 212, 348, 349]
    - [cite_start]**양생**: 15일 이상 양생, 초기 3일간 물 접촉 금지. [cite: 214, 351]

#### 3. 린씰 플러스 (RIN-SEAL PLUS) - 콘크리트 코팅제 (실러)
- [cite_start]**제품 유형**: 유무기 하이브리드 콘크리트 코팅제(실러). [cite: 825, 828]
- [cite_start]**용도**: 액상 하드너 처리 및 폴리싱 시공된 콘크리트 표면 보호 및 광택 부여. [cite: 824, 826]
- **주요 특징**:
    - [cite_start]수성 타입으로 콘크리트 표면과 부착성이 우수합니다. [cite: 859]
    - [cite_start]얇은 보호막을 형성하여 표면을 보호하고 고급스러운 광택을 제공합니다. [cite: 860]
- **주요 스펙**:
    - [cite_start]**주성분**: Pure Acrylic Copolymer [cite: 848]
    - [cite_start]**외관/비중/pH**: 유백색 / 1.02(±0.05) / 8.5(±1) [cite: 848]
    - [cite_start]**표준 사용량**: 0.1 kg/㎡ 씩 2회 도포 권장 [cite: 885]
    - [cite_start]**보존 기간**: 제조일로부터 1년 [cite: 887]
- **시공 가이드**:
    - [cite_start]**선행 작업**: 강화제 시공 후 15일 이상 양생 필수. [cite: 864]
    - [cite_start]**도포**: 1차 코팅 후 1~2일 건조 후 2차 코팅 진행. [cite: 874]
    - [cite_start]**양생**: 3일 이상 완전 건조, 초기 3일간 물 접촉 금지. [cite: 876, 877]
---
${isAdmin ? '\n### 관리자 모드\n당신은 관리자 권한을 가지고 있어 모든 데이터와 기능에 접근할 수 있습니다. 답변 시 이 권한을 적절히 활용하십시오.' : ''}
`;

        switch (functionType) {
            case 'customer_chat':
                return `${basePrompt}\n### 현재 작업: 고객 상담\n**목표**: 고객의 질문에 대해 기술 자료에 기반하여 가장 정확하고 친절한 답변을 제공합니다.\n**프로세스**:\n1. 따뜻하게 고객을 맞이합니다.\n2. 고객의 질문 핵심을 파악합니다.\n3. 위의 '제품 포트폴리오' 지식을 활용하여 명확한 답변을 제공합니다.\n4. 고객이 답변을 이해했는지 확인하고, 추가 질문이 있는지 묻습니다.`;
            case 'qna_automation':
                return `${basePrompt}\n### 현재 작업: Q&A 자동화\n**목표**: 축적된 데이터를 기반으로, 사용자의 질문과 가장 의미적으로 유사한 질문을 찾아내어 최적의 답변을 생성합니다.\n**지침**: 단순 키워드 매칭이 아닌, 문맥과 의도를 파악하여 답변의 정확도를 높여야 합니다.`;
            case 'smart_quote':
                return `${basePrompt}\n### 현재 작업: 스마트 견적\n**목표**: 고객 요구사항에 따라 제품 수량을 계산하고, 정형화된 JSON 형식으로 견적을 제공합니다.\n**프로세스**:\n1. 견적에 필요한 정보(제품명, 시공 면적(㎡))를 요청하거나 파악합니다.\n2. 수량 계산 공식: **필요 수량(kg) = 시공 면적(㎡) × 제품별 표준 사용량(kg/㎡)** 을 사용합니다.\n3. 답변에 반드시 상세 설명과 함께, 아래 형식의 JSON 객체를 **[QUOTE_START]와 [QUOTE_END] 마커로 감싸** 포함해야 합니다.\n\n[QUOTE_START]\n{\n  "products": [\n    { "name": "제품명", "usage_rate": "0.1~0.3kg/㎡", "required_kg": 25, "packaging_can": "20KG/CAN", "recommended_cans": 2 }\n  ],\n  "total_cans": 2,\n  "notes": "본 견적은 자재 수량에 대한 예상치이며, 실제 시공 환경과 작업 방식에 따라 달라질 수 있습니다. 운반비 및 시공비는 별도입니다.",\n  "validity": "30일"\n}\n[QUOTE_END]`;
            case 'document_search':
                return `${basePrompt}\n### 현재 작업: 문서 검색\n**목표**: 내부 데이터베이스 및 문서를 검색하여 사용자가 요청한 정보와 가장 관련성 높은 내용을 요약하여 제공합니다.\n**지침**: 검색 결과를 나열하기 전에, 핵심 내용을 한두 문장으로 요약하여 먼저 제시해야 합니다.`;
            case 'financial_analysis':
                return `${basePrompt}\n### 현재 작업: 금융 분석\n**목표**: 매출 데이터, 수익 트렌드 등 금융 데이터를 분석하고 시각화 가능한 데이터와 함께 객관적인 인사이트를 제공합니다.\n**지침**: '2025년 1분기 매출 데이터에 따르면...' 과 같이 항상 분석 대상이 된 데이터의 출처와 기간을 명확히 밝혀야 합니다. 관리자만 접근 가능한 기능입니다.`;
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