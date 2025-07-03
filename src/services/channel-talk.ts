import { AI_CONFIG } from '../lib/env';
import type { ChannelTalkConfig, ChatMessage } from '../types/chatbot';
import { AIClientService } from './ai-client';
import { getCurrentUser } from './auth-simple';

// 채널톡 글로벌 객체 타입 정의
declare global {
    interface Window {
        ChannelIO?: {
            c?: (...args: unknown[]) => void;
            q?: unknown[];
            boot: (config: Record<string, unknown>) => void;
            shutdown: () => void;
            showMessenger: () => void;
            hideMessenger: () => void;
            onBadgeChanged: (callback: (unread: number) => void) => void;
            onChatCreated: (callback: () => void) => void;
            onFollowUpChanged: (callback: (event: Record<string, unknown>) => void) => void;
            updateUser: (userInfo: Record<string, unknown>) => void;
            addTags: (tags: string[]) => void;
            removeTags: (tags: string[]) => void;
            setPage: (page: string) => void;
            resetPage: () => void;
            hide: () => void;
            show: () => void;
        };
        ChannelIOInitialized?: boolean;
    }
}

export class ChannelTalkService {
    private static instance: ChannelTalkService;
    private aiClient: AIClientService;
    private isInitialized = false;
    private currentUser: { name?: string; email?: string; phone?: string; role?: string } | null = null;

    private constructor() {
        this.aiClient = AIClientService.getInstance();
    }

    public static getInstance(): ChannelTalkService {
        if (!ChannelTalkService.instance) {
            ChannelTalkService.instance = new ChannelTalkService();
        }
        return ChannelTalkService.instance;
    }

    // 채널톡 초기화
    async initialize(config?: Partial<ChannelTalkConfig>): Promise<void> {
        if (this.isInitialized) {
            console.warn('ChannelTalk is already initialized');
            return;
        }

        try {
            // 채널톡 스크립트 로드
            await this.loadChannelTalkScript();

            // 채널톡 부팅
            this.bootChannelTalk(config);

            // 이벤트 리스너 설정
            this.setupEventListeners();

            this.isInitialized = true;
            console.log('ChannelTalk initialized successfully');
        } catch (error) {
            console.error('Failed to initialize ChannelTalk:', error);
            throw error;
        }
    }

    // 채널톡 스크립트 동적 로드
    private async loadChannelTalkScript(): Promise<void> {
        return new Promise((resolve, reject) => {
            if (window.ChannelIOInitialized) {
                resolve();
                return;
            }

            const script = document.createElement('script');
            script.async = true;
            script.src = 'https://cdn.channel.io/plugin/ch-plugin-web.js';

            script.onload = () => {
                window.ChannelIOInitialized = true;
                resolve();
            };

            script.onerror = () => {
                reject(new Error('Failed to load ChannelTalk script'));
            };

            document.head.appendChild(script);
        });
    }

    // 채널톡 부팅
    private bootChannelTalk(config?: Partial<ChannelTalkConfig>): void {
        const channelTalkConfig = {
            pluginKey: config?.pluginKey || AI_CONFIG.CHANNEL_TALK_PLUGIN_KEY,
            memberId: config?.memberId,
            memberHash: config?.memberHash,
            profile: config?.profile,
            hideDefaultLauncher: false,
            zIndex: 1000,
        };

        if (window.ChannelIO) {
            window.ChannelIO.boot(channelTalkConfig);
        }
    }

    // 이벤트 리스너 설정
    private setupEventListeners(): void {
        if (!window.ChannelIO) return;

        // 새 채팅이 생성될 때
        window.ChannelIO.onChatCreated(() => {
            this.handleNewChat();
        });

        // 읽지 않은 메시지 수 변경 시
        window.ChannelIO.onBadgeChanged((_unread: number) => {
            // 필요한 경우 여기에 로직 추가
        });

        // 후속 조치 변경 시
        window.ChannelIO.onFollowUpChanged((event: Record<string, unknown>) => {
            this.handleFollowUpMessage(event);
        });
    }

    // 새 채팅 처리
    private async handleNewChat(): Promise<void> {
        try {
            const user = await getCurrentUser();
            const isAdmin = user?.isAdmin || false;

            // 환영 메시지 생성
            const welcomeMessage = this.generateWelcomeMessage(isAdmin);

            // 채널톡을 통해 환영 메시지 전송 (실제로는 관리자가 수동으로 해야 함)
            console.log('Welcome Message:', welcomeMessage);
        } catch (error) {
            console.error('Failed to handle new chat:', error);
        }
    }

    // 후속 메시지 처리 (AI 응답 생성)
    private async handleFollowUpMessage(event: Record<string, unknown>): Promise<void> {
        try {
            if (event.type === 'user_message') {
                const userMessage = event.message as string;
                const chatHistory = this.getChatHistory();

                // 사용자 권한 확인
                const user = await getCurrentUser();
                const isAdmin = user?.isAdmin || false;

                // AI 응답 생성
                const response = await this.generateAIResponse(userMessage, chatHistory, isAdmin);

                // 응답을 채널톡으로 전송 (실제 구현에서는 웹훅이나 API 필요)
                // 예: sendChannelTalkMessage(response.content);

                // 로컬 저장소에 대화 저장
                this.saveChatMessage({
                    id: this.generateMessageId(),
                    content: userMessage,
                    sender: 'user',
                    timestamp: new Date(),
                });

                this.saveChatMessage({
                    id: this.generateMessageId(),
                    content: response.content,
                    sender: 'assistant',
                    timestamp: new Date(),
                    metadata: response.metadata,
                });
            }
        } catch (error) {
            console.error('Failed to handle follow-up message:', error);
        }
    }

    // AI 응답 생성
    private async generateAIResponse(
        message: string,
        chatHistory: ChatMessage[],
        isAdmin: boolean
    ): Promise<any> {
        const systemPrompt = this.aiClient.generateSystemPrompt(isAdmin);

        // 현재 메시지를 히스토리에 추가
        const messages: ChatMessage[] = [
            ...chatHistory,
            {
                id: this.generateMessageId(),
                content: message,
                sender: 'user',
                timestamp: new Date(),
            }
        ];

        // 관리자 전용 기능 처리
        if (isAdmin && this.isAdminQuery(message)) {
            return await this.handleAdminQuery(message, messages);
        }

        // 일반 AI 응답 생성
        return await this.aiClient.generateResponse(messages, 'mistral', systemPrompt);
    }

    // 관리자 쿼리 감지
    private isAdminQuery(message: string): boolean {
        const adminKeywords = ['매출', '분석', '예측', '리포트', '성과', '데이터', '통계'];
        return adminKeywords.some(keyword => message.includes(keyword));
    }

    // 관리자 쿼리 처리
    private async handleAdminQuery(message: string, messages: ChatMessage[]): Promise<any> {
        const adminSystemPrompt = `
${this.aiClient.generateSystemPrompt(true)}

현재 매출 분석 요청을 받았습니다. 다음 데이터를 참고하여 전문적인 분석을 제공하세요:
- 월 평균 매출: 약 5억원
- 주요 고객: 건설업체, 제조업체
- 성장률: 전년 대비 15% 증가
- 주력 제품: 린코트 (전체 매출의 60%)

요청에 따라 상세한 분석과 인사이트를 제공하세요.
`;

        return await this.aiClient.generateResponse(messages, 'claude', adminSystemPrompt);
    }

    // 환영 메시지 생성
    private generateWelcomeMessage(isAdmin: boolean): string {
        const baseMessage = `
안녕하세요! 린코리아 AI 어시스턴트입니다. 🏗️

저희는 콘크리트 바닥재 전문 기업으로, 다음과 같은 도움을 드릴 수 있습니다:

📋 제품 문의 (린코트, 린하드, 린씰)
🔧 시공 상담 및 기술 지원
📞 견적 요청 및 전문가 연결
❓ 일반적인 질문 답변

궁금한 점이 있으시면 언제든 말씀해 주세요!
`;

        if (isAdmin) {
            return baseMessage + `\n\n🔐 관리자 전용 기능도 이용 가능합니다:
• 매출 분석 및 예측
• 고객 데이터 분석
• 성과 리포트 생성`;
        }

        return baseMessage;
    }

    // 사용자 정보 업데이트
    async updateUser(userInfo: { name?: string; email?: string; phone?: string; role?: string }): Promise<void> {
        this.currentUser = userInfo;

        if (window.ChannelIO) {
            window.ChannelIO.updateUser({
                profile: {
                    name: userInfo.name,
                    email: userInfo.email,
                    mobileNumber: userInfo.phone,
                },
                language: 'ko',
            });

            // 사용자 권한에 따른 태그 추가
            const user = await getCurrentUser();
            if (user?.isAdmin) {
                window.ChannelIO.addTags(['admin', 'priority']);
            }
        }
    }

    // 채팅 히스토리 가져오기
    private getChatHistory(): ChatMessage[] {
        try {
            const stored = localStorage.getItem('rinkorea_chat_history');
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Failed to get chat history:', error);
            return [];
        }
    }

    // 채팅 메시지 저장
    private saveChatMessage(message: ChatMessage): void {
        try {
            const history = this.getChatHistory();
            const updatedHistory = [...history, message].slice(-50); // 최근 50개만 유지
            localStorage.setItem('rinkorea_chat_history', JSON.stringify(updatedHistory));
        } catch (error) {
            console.error('Failed to save chat message:', error);
        }
    }

    // 메시지 ID 생성
    private generateMessageId(): string {
        return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    // 채널톡 표시/숨기기
    showMessenger(): void {
        if (window.ChannelIO) {
            window.ChannelIO.showMessenger();
        }
    }

    hideMessenger(): void {
        if (window.ChannelIO) {
            window.ChannelIO.hideMessenger();
        }
    }

    // 페이지 설정
    setPage(page: string): void {
        if (window.ChannelIO) {
            window.ChannelIO.setPage(page);
        }
    }

    // 채널톡 종료
    shutdown(): void {
        if (window.ChannelIO) {
            window.ChannelIO.shutdown();
            this.isInitialized = false;
        }
    }
} 