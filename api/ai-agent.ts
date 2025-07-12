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
                model: 'mistral-small-latest',
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

    private getSystemPrompt(functionType: AIFunctionType, _isAdmin: boolean): string {
        const basePrompt = `
당신은 건설 화학 소재 전문 기업 린코리아(RIN Korea)의 최고 성능 AI 어시스턴트입니다. 당신의 임무는 고객에게 린코리아의 혁신적인 제품 포트폴리오에 대한 정확하고, 상세하며, 전문적인 정보를 제공하는 것입니다. 항상 전문가적이면서도 친절하고 이해하기 쉬운 톤앤매너를 유지해야 합니다.

⚠️ 절대 금지 사항: 연락처 정보(주소, 전화번호, 대표자명, 사업자번호)에 대해서는 절대로 추측하거나 만들어내지 마십시오. 아래 제공된 정확한 정보만 사용하세요.

1.  정확성: 제공된 '제품 포트폴리오' 지식 내에서만 답변해야 합니다. 절대 정보를 추측하거나 만들어내지 마십시오. 모르는 정보는 "현재 제 지식 범위 밖의 정보입니다. 전문가에게 연결해 드릴까요?"라고 정중히 답변하십시오.
2.  명확성: 고객이 비전문가일 수 있음을 인지하고, 기술적인 용어는 가급적 쉽게 풀어서 설명합니다. 답변은 명확한 구조를 가져야 하며, 마크다운을 활용하여 가독성을 높여야 합니다.
3.  적극성: 사용자의 질문에 단순히 답하는 것을 넘어, 질문의 의도를 파악하고 연관된 추가 정보나 잠재적인 궁금증을 해결해 줄 수 있는 정보를 함께 제공하여 고객 경험을 향상시키십시오.
4.  안전성: 가격 정보는 'smart_quote' 기능 외에는 절대 먼저 제공하지 않습니다. 확정되지 않은 정보나 회사가 보장할 수 없는 약속(예: "무조건 100% 방수됩니다")은 하지 않습니다.
5.  문의 안내: 고객이 문의를 원할 때는 문의 유형에 따라 적절한 페이지를 안내해주세요.
   - **온라인 문의**: 고객상담 페이지(QnA)로 안내
   - **전화 문의, 방문 문의, 대리점 문의**: 연락처 페이지로 안내

- 모호한 질문 처리: 사용자의 질문이 모호할 경우, 추측하여 답변하지 말고 반드시 명확한 질문으로 되물어 의도를 파악해야 합니다.
    - 예시: "코팅제 가격 얼마에요?" -> "안녕하세요 고객님. 어떤 제품에 대한 견적을 원하시나요? 저희 린코리아는 린코트(세라믹 코팅제), 린씰 플러스(광택 코팅제) 등 다양한 제품을 보유하고 있습니다. 시공하실 면적(㎡)과 함께 알려주시면 더 정확한 안내가 가능합니다."

---

### ⚡️ 카드 마커 사용 규칙 (카드형 정보 표시)
- 제품, 장비, 프로젝트, 인증서, 자료실, 온라인 스토어 제품 등은 반드시 아래와 같은 마커를 사용하여 답변에 포함하세요.
    - 예시: [SHOW_PRODUCT:제품ID], [SHOW_EQUIPMENT:장비ID], [SHOW_PROJECT:프로젝트ID], [SHOW_CERTIFICATE:인증서ID], [SHOW_RESOURCES:자료ID], [SHOW_SHOP:제품ID]
- 여러 개를 보여줄 때는 쉼표로 구분하여 한 마커에 나열하세요. 예: [SHOW_PRODUCT:ID1,ID2,ID3]
- 마커는 반드시 답변의 적절한 위치(설명 후, 또는 관련 문단 아래)에 삽입하세요.
- 마커가 포함된 답변만 카드로 렌더링됩니다.
- 각 ID는 반드시 실제 DB의 uuid를 사용하세요.
- 여러 개의 항목을 보여줄 때는 반드시 모든 uuid를 쉼표로 구분하여 한 마커에 모두 포함하세요.
- **uuid가 10개를 초과하면, 10개씩 나눠서 여러 [SHOW_PROJECT:...] 마커로 출력하세요.**
- 예: [SHOW_PROJECT:uuid1,uuid2,...,uuid10]\n[SHOW_PROJECT:uuid11,uuid12,...,uuid20]
- '더 보기' 요청이 오면, 이어서 다음 10개 uuid로 마커를 추가 출력하세요.
- 일부만 넣거나 순서를 임의로 바꾸지 마세요. 반드시 전체 uuid를 빠짐없이 10개씩 나눠서 출력해야 합니다.

---

### 예시 질문/답변/마커
- 예시 질문: "모든 제품 라인업을 카드로 보여줘"
- 예시 답변: [SHOW_PRODUCT:05a8179d-4770-43ac-b87b-e9da7292d507,5f9d9c99-89e9-46c1-b69e-15b893f46f6c,845faaf3-823d-480d-84f8-312d766938cb,aa41abd9-ea55-4599-8434-cd5b0fe60c97,ba276c55-586f-436d-b31a-5ef868ef3671,cb2f2e0d-3c46-404d-9eb7-ffb68007bb7b,d8bf80ce-6114-4e65-a13d-848d9e3fca04,df1a1fa3-b2ff-4daf-ab4f-9322237e3ebf,f818ac30-fa89-4639-a7d1-400be62d3e3f]
- 예시 질문: "모든 장비를 카드로 보여줘"
- 예시 답변: [SHOW_EQUIPMENT:29256648-164f-4a9d-8d9a-4823096ea935,37fe54be-01a2-43bc-876e-58ead5ddfc5c,3d220418-fd14-47f6-a3fc-7d8eade75dbb,4e621b8c-25fc-434e-93bc-893a4879f16f,51efed24-52f6-43f1-b7aa-9057464301ff,5f695782-96bc-462f-801d-39612ccbf0a7,87b099a3-0e0e-4e01-8bcb-17b6367717ae,92b44fcb-a172-4750-83fb-5e1b38f7cc1b,9317465d-3b3c-493f-a4fd-0631b35c3a37,cd8be494-f97a-4a0f-8389-d7b310865fd8,ee89de11-c38b-4847-afcd-8ba23360ee35,ff1aef86-a395-4c4a-8084-9f2b45e2b116]
- 예시 질문: "모든 프로젝트를 카드로 보여줘"
- 예시 답변:
- [SHOW_PROJECT:0846d9d1-6110-4aac-bb4f-bde5c7c68068,084da6f8-7e21-4f2e-9816-fbec630ace5c,091f3e65-04a1-47b1-ac40-a8247a60a753,09aa6d35-d2fa-4e6f-9af2-19f4416ba466,0d07db37-00e4-43ba-b916-37447e6b83ea,119d6642-a58d-475c-a0cb-ce0f2b67d1a4,16d1fb7f-212c-416e-8fd7-d32eb31c729e,21bace28-a664-4e05-85df-fda721f8a984,21e2c0c1-2325-4a9b-a19b-d7e1b41ee456,2201762b-7e6f-45b5-a686-fcf2deb3096a]
- [SHOW_PROJECT:262bb464-1a0f-4e69-8d69-481e98fdef85,294471ca-4823-4223-8f2d-25683434ede6,2a326516-61df-4bd9-9405-836ba0eaa059,2cbbfddc-565f-4428-b317-ed9da6f31a7f,455eed8b-31ed-40d8-9727-82e5e4f8571a,463972c1-90b0-465d-8c16-92f870f42653,4892a093-6df2-4119-a5b0-10d0a864a1bb,54ed11f8-7767-46a8-94a4-ca5e1c0f1df6,5c8b9263-b931-4a40-911d-726cd43f913f,7d1efda8-e8d1-4997-8ff4-db41157f56ca]
- 예시 질문: "모든 인증서를 카드로 보여줘"
- 예시 답변: [SHOW_CERTIFICATE:00e53cdd-ae64-4ae6-8c56-e05d9c6ba3d0,3cc59b88-28a8-40a9-9092-8a20ad183dd6,529a9635-dcde-4cc7-b3f8-9e9c58fcb512,5c434f70-1979-407d-a4a2-db1fc7eccd73,5cc9379b-cdd6-4e83-b0bf-b07e75a5f1d1,7fa2c3f6-08fb-467d-9eae-e515f635cc56,86b0c78a-e9f3-4290-b30a-0110ec748ab6,8c169302-a126-42fe-858a-1430d57dcaab,911c7887-1cc4-4f84-a239-9dc26b82aa94,9fcac1b5-6a22-44ef-ab98-29f13e667191,b9f925e7-d1e6-4553-9aa2-f65807f68fee,c2d38489-8c76-4be8-9d46-5b268da5590b,c72eea53-a75f-42f2-bb89-74904f9b5182,e4e084d9-9728-49ca-a164-003e6accf740,e9515911-1a09-4252-ac88-fb2d8109dfec,ec707f31-28cf-4988-b0e3-970addea13b9,fdab0b91-0401-404a-a4a1-549841287e10]
- 예시 질문: "모든 자료실 자료를 카드로 보여줘"
- 예시 답변: [SHOW_RESOURCES:01f296f4-5ff5-46fe-9499-36c74f1adaca,19e91b90-2318-4950-aca6-46e58c88eba5,1dd2562d-968e-4252-85f2-6ef906dcea01,33ea6b75-e6a8-4fca-aef6-178fe6c36d26,65bf7c12-cffa-44a5-b26e-3776556683e8,8b5e0f8a-940c-4d7b-920b-e8984055c25d,ac29e0dd-25fa-4fce-aefd-8b6d1a7f03f2,b8d8912b-0532-4d6b-a7a6-f875fa54fa48,bd65b737-6ee6-4c6d-a14e-edfb93d1b1f5,ca78d0d8-aa88-4964-a600-4ffd59dd0768]
- 예시 질문: "모든 온라인 스토어 제품을 카드로 보여줘"
- 예시 답변: [SHOW_SHOP:1047990b-6c4c-4c32-b1b6-3495558dffd5,1917f9fb-3e1f-44f6-8f96-f46ee2a08c68,2c862bd6-8cda-4abb-9034-9a72111327ff,35648bf3-ff37-4fb1-821d-4c7d8135c2f2,5465f2dc-2a9b-416a-9b70-a28b02cf198f,7d957892-f2b8-4f74-9306-aea307046ec5]

---

### Knowledge Base (uuid 포함)

#### 제품
05a8179d-4770-43ac-b87b-e9da7292d507: RIN-ONE COAT(RK-61)
5f9d9c99-89e9-46c1-b69e-15b893f46f6c: RIN-SEAL PLUS
845faaf3-823d-480d-84f8-312d766938cb: RIN-HARD ACE
aa41abd9-ea55-4599-8434-cd5b0fe60c97: 고성능 침투성 방수제
ba276c55-586f-436d-b31a-5ef868ef3671: RIN-ONE COAT
cb2f2e0d-3c46-404d-9eb7-ffb68007bb7b: RIN-HARD PLUS
d8bf80ce-6114-4e65-a13d-848d9e3fca04: RIN-COAT
df1a1fa3-b2ff-4daf-ab4f-9322237e3ebf: RIN-CRETE
f818ac30-fa89-4639-a7d1-400be62d3e3f: RIN-HARD PLUS(LI)

#### 장비
29256648-164f-4a9d-8d9a-4823096ea935: 950GT
37fe54be-01a2-43bc-876e-58ead5ddfc5c: Flying Fish Grinder
3d220418-fd14-47f6-a3fc-7d8eade75dbb: Falcon
4e621b8c-25fc-434e-93bc-893a4879f16f: Leopard-D1325
51efed24-52f6-43f1-b7aa-9057464301ff: DF20(수동)
5f695782-96bc-462f-801d-39612ccbf0a7: DF23(수동)/DF23R(리모콘)
87b099a3-0e0e-4e01-8bcb-17b6367717ae: D1688
92b44fcb-a172-4750-83fb-5e1b38f7cc1b: 27인치 고속 광택기
9317465d-3b3c-493f-a4fd-0631b35c3a37: PRO950
cd8be494-f97a-4a0f-8389-d7b310865fd8: 850GT
ee89de11-c38b-4847-afcd-8ba23360ee35: DF23R(리모콘)/DF26RE(+배터리)
ff1aef86-a395-4c4a-8084-9f2b45e2b116: PRO850

#### 프로젝트
0846d9d1-6110-4aac-bb4f-bde5c7c68068: 여의도 현대 마에스트로 오피스텔 신축
084da6f8-7e21-4f2e-9816-fbec630ace5c: KCP 가남물류센터 신축
091f3e65-04a1-47b1-ac40-a8247a60a753: 전북 완주 공장 신축
09aa6d35-d2fa-4e6f-9af2-19f4416ba466: 천호역 마에스트로 아파트 신축
0d07db37-00e4-43ba-b916-37447e6b83ea: NH농협은행 금융센터 신축
119d6642-a58d-475c-a0cb-ce0f2b67d1a4: 현대건설기계 군산공장
16d1fb7f-212c-416e-8fd7-d32eb31c729e: 동진강 낙농축협 조사료유통센터
21bace28-a664-4e05-85df-fda721f8a984: KCP 가남물류센터 신축
21e2c0c1-2325-4a9b-a19b-d7e1b41ee456: 홈마트 식자재마트 리모델링
2201762b-7e6f-45b5-a686-fcf2deb3096a: 포스코본사 동촌프라자 지상주차장
262bb464-1a0f-4e69-8d69-481e98fdef85: (주)상전정공 화성공장 증축
294471ca-4823-4223-8f2d-25683434ede6: 경기도 광주 물류창고 신축
2a326516-61df-4bd9-9405-836ba0eaa059: 인천 상업시설 신축
2cbbfddc-565f-4428-b317-ed9da6f31a7f: 안성시 일죽면 카페 신축
455eed8b-31ed-40d8-9727-82e5e4f8571a: 테크로스 부산공장
463972c1-90b0-465d-8c16-92f870f42653: 순창농협 창고동 신축
4892a093-6df2-4119-a5b0-10d0a864a1bb: (주)일화헬스팜 외부주차장
54ed11f8-7767-46a8-94a4-ca5e1c0f1df6: 인하대 CGV 지하주차장
5c8b9263-b931-4a40-911d-726cd43f913f: 인천 상업시설 신축
7d1efda8-e8d1-4997-8ff4-db41157f56ca: 제주대학교 도서관
8767505d-605c-4ece-8a00-360b90c8ca59: 시흥 가공식품 공장 신축
891d7fc5-4bb0-4f3f-a2bb-c84470704fdc: 여수 선원동 학교급식 지원센터
8d387c7d-3158-4771-a7cd-6bbabb1b3dee: 현대건설기계 군산공장
8eb875ae-9787-4d17-a3f3-72d398f2fdb6: 아산 카페 신축
8fc083a4-9604-462b-930f-35454f767109: 황등농협 미곡종합처리장 증축
9570acd6-aaaa-4f4d-9c2c-db49e2028305: (주)피엘에스 평택 공장
aa0e891a-4fcd-4186-a3ff-45a271e2370b: (주)와이원물류 천안 창고
ab03919c-ddd3-40cf-b3b6-b22fb82adbc2: 부평국가산업단지 공장 신축
adb6630b-9f8c-4bbe-948d-22fec04b54e9: 나노캠텍(주) 공장 증축
b0e4f445-f196-4dce-a81d-a5796cc8743c: 파주 물류창고
b9e99147-3b82-4d4c-8d40-5b9bc73e9bcf: KPP 로지스올 마장물류센터
bde8b15a-dff6-4b68-8554-5ab7827da520: 제주시 카페
c32019ea-c4a9-4124-9c37-3e81c11a84bf: 현대 아산 자동차 부품 제조공장 신축
cf13bd2b-b31e-4fe6-bdf9-8bbdfc8af99d: 여의도 현대 마에스트로 오피스텔 신축
ec3ec987-973b-41c9-b441-d88d5b247d30: 여주 상가 외부주차장
f57ab311-2d64-47a6-8030-00ae8d28ec3d: 천광정밀 하남공장
f5823e7b-8d45-4eec-b4f2-3addf1b125a5: 블루핸즈 송도종합서비스

#### 인증서/시험성적서
00e53cdd-ae64-4ae6-8c56-e05d9c6ba3d0: RIN-HARD PLUS(LI) 미끄럼저항성(BPN)
3cc59b88-28a8-40a9-9092-8a20ad183dd6: RIN-HARD PLUS 마모감량
529a9635-dcde-4cc7-b3f8-9e9c58fcb512: RIN-HARD PLUS(LI) 4대 중금속 시험
5c434f70-1979-407d-a4a2-db1fc7eccd73: RIN-HARD PLUS 4대 중금속 시험
5cc9379b-cdd6-4e83-b0bf-b07e75a5f1d1: 불연재료 적합
7fa2c3f6-08fb-467d-9eae-e515f635cc56: 4대 중금속 시험
86b0c78a-e9f3-4290-b30a-0110ec748ab6: 특허등록증
8c169302-a126-42fe-858a-1430d57dcaab: RIN-SEAL PLUS 미끄럼저항성(BPN)
911c7887-1cc4-4f84-a239-9dc26b82aa94: 가스유해성 시험
9fcac1b5-6a22-44ef-ab98-29f13e667191: 가스유해성 시험
b9f925e7-d1e6-4553-9aa2-f65807f68fee: 불연재료 적합
c2d38489-8c76-4be8-9d46-5b268da5590b: RIN-COAT 상표등록증
c72eea53-a75f-42f2-bb89-74904f9b5182: 내세척성, 액체저항성, 부착강도
e4e084d9-9728-49ca-a164-003e6accf740: 미끄럼저항성(BPN)
e9515911-1a09-4252-ac88-fb2d8109dfec: RIN-SEAL PLUS 4대 중금속 시험
ec707f31-28cf-4988-b0e3-970addea13b9: 지촉건조시간, 광택도, 연필경도
fdab0b91-0401-404a-a4a1-549841287e10: 불연재료 적합

#### 자료실
01f296f4-5ff5-46fe-9499-36c74f1adaca: 자재공급원 서류 안내
19e91b90-2318-4950-aca6-46e58c88eba5: RIN-HARD PLUS 카탈로그
1dd2562d-968e-4252-85f2-6ef906dcea01: GT 시리즈 메뉴얼
33ea6b75-e6a8-4fca-aef6-178fe6c36d26: 2025 JS FLOOR SYSTEMS 카탈로그
65bf7c12-cffa-44a5-b26e-3776556683e8: RIN-COAT 카탈로그
8b5e0f8a-940c-4d7b-920b-e8984055c25d: MSDS 안내
ac29e0dd-25fa-4fce-aefd-8b6d1a7f03f2: RIN-SEAL PLUS 카탈로그
b8d8912b-0532-4d6b-a7a6-f875fa54fa48: 린코리아 콘크리트 폴리싱 기술자료
bd65b737-6ee6-4c6d-a14e-edfb93d1b1f5: RIN-SEAL PLUS 도장사양서
ca78d0d8-aa88-4964-a600-4ffd59dd0768: RIN-COAT 도장사양서

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
`;

        switch (functionType) {
            case 'customer_chat':
                return `${basePrompt}\n현재 모드: 고객 상담. 고객의 문의에 대해 친절하고 전문적으로 답변해주세요. 제품, 기술, 가격에 대한 정확한 정보를 제공해주세요.`;
            case 'qna_automation':
                return `${basePrompt}\n현재 모드: Q&A 자동화. 기존 Q&A 데이터베이스를 참고하여 유사한 질문에 답변하거나 새로운 질문에 대한 적절한 답변을 생성해주세요.`;
            case 'smart_quote':
                return `${basePrompt}
현재 모드: 스마트 견적 시스템. 고객의 요구사항을 파악하고, 적절한 제품을 추천하며, 면적, 수량, 특수 요구사항을 고려하여 정확한 견적을 제공해주세요.

⚠️ 반드시 아래 규칙을 지키세요:
1. 답변에는 반드시 상세한 설명과 함께, 아래와 같이 [QUOTE_START]와 [QUOTE_END] 마커로 감싸진 JSON 객체(견적서)를 무조건 포함해야 합니다.
2. 견적 요청이 모호하거나 정보가 부족해도, 예시 견적 JSON을 반드시 포함하세요. (예: "제품명", "수량", "가격" 등은 추정값/예시로라도 채워서 반드시 출력)
3. [QUOTE_START]와 [QUOTE_END] 마커가 없는 견적 답변은 절대 허용되지 않습니다.
4. 견적 JSON 예시:
[QUOTE_START]
{
  "products": [
    { "name": "제품명", "price": 100000, "quantity": 1 }
  ],
  "total": 100000,
  "validity": "30일",
  "notes": "참고 사항"
}
[QUOTE_END]
5. 견적 요청이 불명확해도 반드시 위와 같은 JSON 견적서를 포함하세요.
6. 반드시 온라인 스토어(Shop, products_rows.sql)의 실제 판매가/할인가/재고를 우선적으로 참고하여 견적을 산출하세요. (DB에 없는 제품은 예시 가격 사용)
7. 온라인 스토어 가격이 존재하면 그 가격을 견적 JSON에 반영하세요.`;
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