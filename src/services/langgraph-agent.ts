// import { localAIServer, LocalAIRequest } from './local-ai-server'; // 삭제
import { env } from '@/lib/env';

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
    private isDevelopment = import.meta.env.DEV;

    // 개발 환경에서 직접 AI API 호출을 위한 메서드
    private async callAIDirectly(
        functionType: AIFunctionType | null,
        message: string,
        context?: any,
        isAdmin: boolean = false
    ): Promise<AIResponse> {
        // 라우팅 로직
        let determinedFunctionType = functionType;
        if (!determinedFunctionType) {
            determinedFunctionType = await this.route(message);
        }

        // 시스템 프롬프트 생성
        const systemPrompt = this.getSystemPrompt(determinedFunctionType, isAdmin);

        try {
            // Mistral API 우선 호출
            const result = await this.callMistralAPI(systemPrompt, message, context?.history || []);
            return {
                success: true,
                response: result.response,
                function_type: determinedFunctionType,
                timestamp: new Date().toISOString(),
                follow_up_questions: result.follow_up_questions,
            };
        } catch (error) {
            console.error('Mistral API failed, trying Claude:', error);
            try {
                // Claude API 폴백
                const result = await this.callClaudeAPI(systemPrompt, message, context?.history || []);
                return {
                    success: true,
                    response: result.response,
                    function_type: determinedFunctionType,
                    timestamp: new Date().toISOString(),
                    follow_up_questions: result.follow_up_questions,
                };
            } catch (claudeError) {
                console.error('Both AI APIs failed:', claudeError);
                throw new Error('AI 서비스에 연결할 수 없습니다.');
            }
        }
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
            const response = await this.callMistralAPI(routingInstructions, query, [], true);
            const functionId = response.response.trim().replace(/['"`]/g, '');
            if (['customer_chat', 'qna_automation', 'smart_quote', 'document_search', 'financial_analysis'].includes(functionId)) {
                return functionId as AIFunctionType;
            }
        } catch (error) {
            console.error("Routing failed:", error);
        }
        return 'customer_chat';
    }

    private async callMistralAPI(systemPrompt: string, message: string, history: any[] = [], isRouting: boolean = false): Promise<{ response: string, follow_up_questions: string[] }> {
        const formattedHistory = history.map(h => ({ role: h.role, content: h.content }));

        const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${env.VITE_MISTRAL_API_KEY}`
            },
            body: JSON.stringify({
                model: 'mistral-small-latest',
                messages: [
                    { role: 'system', content: systemPrompt },
                    ...formattedHistory,
                    { role: 'user', content: message }
                ],
                temperature: isRouting ? 0 : 0.1,
                max_tokens: isRouting ? 20 : 1000,
            }),
        });

        if (!response.ok) {
            const _errorBody = await response.json().catch(() => response.text());
            throw new Error(`Mistral API error: ${response.status}`);
        }

        const data = await response.json();
        const content = data.choices[0]?.message?.content || 'AI 응답을 받을 수 없습니다.';

        if (isRouting) {
            return { response: content, follow_up_questions: [] };
        }

        return this.extractFollowUpQuestions(content);
    }

    private async callClaudeAPI(systemPrompt: string, message: string, history: any[] = []): Promise<{ response: string, follow_up_questions: string[] }> {
        const formattedHistory = history.map(h => ({ role: h.role, content: h.content }));

        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': env.VITE_CLAUDE_API_KEY,
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                model: 'claude-3-5-sonnet-20240620',
                max_tokens: 1000,
                system: systemPrompt,
                messages: [...formattedHistory, { role: 'user', content: message }],
                temperature: 0.2,
            }),
        });

        if (!response.ok) {
            const _errorBody = await response.json().catch(() => response.text());
            throw new Error(`Claude API error: ${response.status}`);
        }

        const data = await response.json();
        const content = data.content[0]?.text || 'AI 응답을 받을 수 없습니다.';
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
당신은 건설 화학 소재 전문 기업 린코리아(RIN Korea)의 최고 성능 AI 어시스턴트입니다. 당신의 임무는 고객에게 린코리아의 혁신적인 제품 포트폴리오에 대한 정확하고, 상세하며, 전문적인 정보를 제공하는 것입니다. 항상 전문가적이면서도 친절하고 이해하기 쉬운 톤앤매너를 유지해야 합니다.

1.  정확성: 제공된 '제품 포트폴리오' 지식 내에서만 답변해야 합니다. 절대 정보를 추측하거나 만들어내지 마십시오. 모르는 정보는 "현재 제 지식 범위 밖의 정보입니다. 전문가에게 연결해 드릴까요?"라고 정중히 답변하십시오.
2.  명확성: 고객이 비전문가일 수 있음을 인지하고, 기술적인 용어는 가급적 쉽게 풀어서 설명합니다. 답변은 명확한 구조를 가져야 하며, 마크다운을 활용하여 가독성을 높여야 합니다.
3.  적극성: 사용자의 질문에 단순히 답하는 것을 넘어, 질문의 의도를 파악하고 연관된 추가 정보나 잠재적인 궁금증을 해결해 줄 수 있는 정보를 함께 제공하여 고객 경험을 향상시키십시오.
4.  안전성: 가격 정보는 'smart_quote' 기능 외에는 절대 먼저 제공하지 않습니다. 확정되지 않은 정보나 회사가 보장할 수 없는 약속(예: "무조건 100% 방수됩니다")은 하지 않습니다.

- 모호한 질문 처리: 사용자의 질문이 모호할 경우, 추측하여 답변하지 말고 반드시 명확한 질문으로 되물어 의도를 파악해야 합니다.
    - 예시: "코팅제 가격 얼마에요?" -> "안녕하세요 고객님. 어떤 제품에 대한 견적을 원하시나요? 저희 린코리아는 린코트(세라믹 코팅제), 린씰 플러스(광택 코팅제) 등 다양한 제품을 보유하고 있습니다. 시공하실 면적(㎡)과 함께 알려주시면 더 정확한 안내가 가능합니다."
- 최종 출력 형식: 답변의 가장 마지막에는, 사용자가 추가로 궁금해할 만한 질문 3개를 반드시 JSON 배열 형식["질문1", "질문2", "질문3"]으로 제안해야 합니다. 이 JSON 배열 앞뒤로 어떠한 텍스트도 추가해서는 안 됩니다.

---

### 제품 포트폴리오 (Knowledge Base)

#### 1. 린코트 (RIN-COAT) - 불연 세라믹 코팅제
- 제품 유형: 1액형 친환경 불연 세라믹 무기질 코팅제. 콘크리트 침투 및 표면 강화를 동시에 구현합니다.
- 주요 특징:
    - 안전성: 불연재로 화재 시 유해 가스가 발생하지 않습니다.
    - 친환경성: 유해 가스가 없고, 시공 후 분진이나 화학물질이 남지 않습니다.
    - 내구성: 초고경도(7~9H) 도막을 형성하여 내마모성, 내화학성, 내오염성이 뛰어납니다.
    - 기능성: 방수, 항균 성능을 갖추고 있으며, 황변 현상이 없어 실내외 모두 사용 가능합니다.
    - 시공성: 1액형으로 별도의 혼합 없이 스프레이, 롤러, 붓으로 간편하게 시공할 수 있습니다.
- 주요 스펙:
    - 주성분: 세라믹계 고분자 화합물
    - 외관/비중/pH: 무색 투명 / 0.96(±0.05) / 6(±1)
    - 표준 사용량: 0.1 ~ 0.3 kg/㎡ 
    - 보존 기간: 제조일로부터 6개월 (미개봉, 서늘하고 건조한 곳 보관)
- 시공 가이드:
    - 표면 처리: 콘크리트 28일 이상 양생, 표면 함수율 6% 이하. 레이턴스 및 이물질 완벽 제거.
    - 도포: 2~3회 얇게 도포. 1차 도포 후 경화 전 2차 도포 진행.
    - 양생: 상온에서 15일 이상 양생, 초기 7일간 물 접촉 금지.

#### 2. 린하드 플러스 (RIN-HARD PLUS) - 콘크리트 표면 강화제 (액상 하드너)
- 제품 라인업:
    - 소듐 타입: Sodium Silicate 주성분, Active Content 38% 이상. (물 희석비 1:1.5~3)
    - 리튬 타입 (LI): Lithium Silicate 주성분, Active Content 20% 이상. (물 희석비 1:0.5~1)
- 주요 특징:
    - 콘크리트 표면에 침투하여 화학적으로 안정시켜 분진 발생을 억제하고 표면 강도, 내마모성을 향상시킵니다.
    - 통기성을 유지하며 콘크리트를 보호하고 수명을 연장하는 친환경 제품입니다.
- 주요 스펙 (소듐/리튬):
    - 비중: 1.35(±0.05) / 1.15(±0.05)
    - pH: 12(±1)
    - 표준 사용량: 0.2 ~ 0.3 kg/㎡
    - 보존 기간: 제조일로부터 1년
- 시공 가이드:
    - 도포: 저속 스프레이로 균일하게 도포하며, 표면에 고이지 않도록 주의합니다.
    - 양생: 15일 이상 양생, 초기 3일간 물 접촉 금지.

#### 3. 린씰 플러스 (RIN-SEAL PLUS) - 콘크리트 코팅제 (실러)
- 제품 유형: 유무기 하이브리드 콘크리트 코팅제(실러).
- 용도: 액상 하드너 처리 및 폴리싱 시공된 콘크리트 표면 보호 및 광택 부여.
- 주요 특징:
    - 수성 타입으로 콘크리트 표면과 부착성이 우수합니다.
    - 얇은 보호막을 형성하여 표면을 보호하고 고급스러운 광택을 제공합니다.
- 주요 스펙:
    - 주성분: Pure Acrylic Copolymer
    - 외관/비중/pH: 유백색 / 1.02(±0.05) / 8.5(±1)
    - 표준 사용량: 0.1 kg/㎡ 씩 2회 도포 권장
    - 보존 기간: 제조일로부터 1년
- 시공 가이드:
    - 선행 작업: 강화제 시공 후 15일 이상 양생 필수.
    - 도포: 1차 코팅 후 1~2일 건조 후 2차 코팅 진행.
    - 양생: 3일 이상 완전 건조, 초기 3일간 물 접촉 금지.
---
${isAdmin ? '\n### 관리자 모드\n당신은 관리자 권한을 가지고 있어 모든 데이터와 기능에 접근할 수 있습니다. 답변 시 이 권한을 적절히 활용하십시오.' : ''}
`;

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

    async processRequest(
        functionType: AIFunctionType | null,
        message: string,
        context?: any,
        isAdmin: boolean = false
    ): Promise<AIResponse> {
        try {
            // 개발 환경에서는 클라이언트에서 직접 AI API 호출
            if (this.isDevelopment) {
                return await this.callAIDirectly(functionType, message, context, isAdmin);
            }

            // 프로덕션에서는 서버 API를 통해 호출
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
                function_type: data.function_type, // 서버에서 결정된 function_type을 사용
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