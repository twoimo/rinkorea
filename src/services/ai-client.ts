import axios, { AxiosResponse } from 'axios';
import { AI_CONFIG } from '../lib/env';
import type { AIProvider, AIResponse, ChatMessage } from '../types/chatbot';

// API 응답 타입 정의
interface MistralResponse {
    choices: Array<{
        message: {
            content: string;
        };
    }>;
    usage?: {
        total_tokens: number;
    };
}

interface ClaudeResponse {
    content: Array<{
        text: string;
    }>;
    usage?: {
        input_tokens: number;
        output_tokens: number;
    };
}

export class AIClientService {
    private static instance: AIClientService;

    private constructor() { }

    public static getInstance(): AIClientService {
        if (!AIClientService.instance) {
            AIClientService.instance = new AIClientService();
        }
        return AIClientService.instance;
    }

    // 메시지를 AI에게 전송하고 응답을 받는 메인 메서드
    async generateResponse(
        messages: ChatMessage[],
        provider: AIProvider['name'] = 'mistral',
        systemPrompt?: string
    ): Promise<AIResponse> {
        try {
            const formattedMessages = this.formatMessages(messages, systemPrompt);

            switch (provider) {
                case 'mistral':
                    return await this.callMistralAPI(formattedMessages);
                case 'claude':
                    return await this.callClaudeAPI(formattedMessages);
                default:
                    throw new Error(`Unsupported AI provider: ${provider}`);
            }
        } catch (error) {
            console.error(`AI API 호출 실패 (${provider}):`, error);
            throw new Error(`AI 응답 생성에 실패했습니다: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    // Mistral API 호출
    private async callMistralAPI(messages: { role: string; content: string }[]): Promise<AIResponse> {
        const response: AxiosResponse<MistralResponse> = await axios.post(
            'https://api.mistral.ai/v1/chat/completions',
            {
                model: 'mistral-large-latest',
                messages,
                max_tokens: 1000,
                temperature: 0.7,
            },
            {
                headers: {
                    'Authorization': `Bearer ${AI_CONFIG.MISTRAL_API_KEY}`,
                    'Content-Type': 'application/json',
                },
                timeout: AI_CONFIG.AI_RESPONSE_TIMEOUT,
            }
        );

        return {
            content: response.data.choices[0]?.message?.content || '응답을 생성할 수 없습니다.',
            usage: {
                tokens: response.data.usage?.total_tokens || 0,
            },
            metadata: {
                provider: 'mistral',
                model: 'mistral-large-latest',
            },
        };
    }

    // Claude API 호출
    private async callClaudeAPI(messages: { role: string; content: string }[]): Promise<AIResponse> {
        // Claude API는 시스템 메시지를 별도로 처리
        const systemMessage = messages.find(m => m.role === 'system');
        const conversationMessages = messages.filter(m => m.role !== 'system');

        const response: AxiosResponse<ClaudeResponse> = await axios.post(
            'https://api.anthropic.com/v1/messages',
            {
                model: 'claude-3-5-sonnet-20241022',
                max_tokens: 1000,
                messages: conversationMessages,
                system: systemMessage?.content || undefined,
            },
            {
                headers: {
                    'x-api-key': AI_CONFIG.CLAUDE_API_KEY,
                    'Content-Type': 'application/json',
                    'anthropic-version': '2023-06-01',
                },
                timeout: AI_CONFIG.AI_RESPONSE_TIMEOUT,
            }
        );

        const totalTokens = (response.data.usage?.input_tokens || 0) + (response.data.usage?.output_tokens || 0);

        return {
            content: response.data.content[0]?.text || '응답을 생성할 수 없습니다.',
            usage: {
                tokens: totalTokens,
            },
            metadata: {
                provider: 'claude',
                model: 'claude-3-5-sonnet-20241022',
            },
        };
    }

    // 메시지 포맷팅
    private formatMessages(messages: ChatMessage[], systemPrompt?: string): { role: string; content: string }[] {
        const formatted = messages.map(msg => ({
            role: msg.sender === 'user' ? 'user' : 'assistant',
            content: msg.content,
        }));

        // 시스템 프롬프트가 있다면 맨 앞에 추가
        if (systemPrompt) {
            formatted.unshift({
                role: 'system',
                content: systemPrompt,
            });
        }

        return formatted;
    }

    // 사용자 권한에 따른 시스템 프롬프트 생성
    generateSystemPrompt(isAdmin: boolean): string {
        const basePrompt = `
당신은 린코리아의 AI 어시스턴트입니다. 린코리아는 콘크리트 바닥재 전문 기업으로 다음 제품들을 제공합니다:

주요 제품:
- 린코트(RIN COAT): 고성능 콘크리트 바닥재
- 린하드(RIN HARD): 콘크리트 경화제
- 린씰(RIN SEAL): 침투성 방수제

회사 정보:
- 설립: 콘크리트 바닥재 전문 기업
- 주력 사업: 산업용 바닥재, 시공, 유지보수
- 강점: 고품질 제품, 전문 시공팀, 기술 지원

고객 응대 시 다음을 준수하세요:
1. 친근하고 전문적인 톤으로 응답
2. 제품 문의 시 상세한 기술 정보 제공
3. 시공 관련 문의 시 전문가 상담 안내
4. 견적 요청 시 연락처로 안내
`;

        if (isAdmin) {
            return basePrompt + `

관리자 전용 기능:
- 매출 분석 및 예측
- 고객 분석 리포트
- 성과 지표 모니터링
- 시장 트렌드 분석

관리자로서 추가적인 비즈니스 인사이트와 데이터 분석을 제공할 수 있습니다.
`;
        }

        return basePrompt;
    }

    // 건강 체크
    async healthCheck(): Promise<{ mistral: boolean; claude: boolean }> {
        const results = {
            mistral: false,
            claude: false,
        };

        try {
            // Mistral 건강 체크
            await axios.get('https://api.mistral.ai/v1/models', {
                headers: { 'Authorization': `Bearer ${AI_CONFIG.MISTRAL_API_KEY}` },
                timeout: 5000,
            });
            results.mistral = true;
        } catch (error) {
            console.warn('Mistral API 연결 실패:', error);
        }

        try {
            // Claude 건강 체크 (간단한 메시지 전송)
            await this.callClaudeAPI([
                { role: 'user', content: 'Hello' }
            ]);
            results.claude = true;
        } catch (error) {
            console.warn('Claude API 연결 실패:', error);
        }

        return results;
    }
} 