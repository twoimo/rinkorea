import { supabase } from '@/integrations/supabase/client';
import { AI_CONFIG } from '../lib/env';
import type { ChannelTalkConfig, ChatMessage, AIResponse } from '../types/chatbot';
import { AIClientService } from './ai-client';
import { getCurrentUser } from './auth-simple';
import { RevenueService } from './revenue-service';

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
    private currentUser: any = null;
    private currentSessionId: string | null = null;

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
    private handleNewChat(): void {
        try {
            // 초기 환영 메시지는 채널톡의 자동화 규칙으로 처리하는 것을 권장합니다.
            // 필요하다면 여기서 첫 메시지를 보낼 수 있습니다.
            // 예: this.sendBotMessage("안녕하세요! 무엇을 도와드릴까요?");
        } catch (error) {
            console.error('Failed to handle new chat:', error);
        }
    }

    // 후속 메시지 처리 (AI 응답 생성)
    private async handleFollowUpMessage(event: Record<string, unknown>): Promise<void> {
        try {
            if (event.type !== 'user_message' || !event.message) {
                return;
            }

            const userMessage = event.message as string;
            const user = await getCurrentUser();

            if (!user) {
                this.sendBotMessage("채팅 기능은 로그인 후 이용 가능합니다.");
                return;
            }

            const chatHistory = await this.getChatHistoryFromDB(user.id);
            const isAdmin = user.isAdmin || false;

            const response = await this.generateAIResponse(userMessage, chatHistory, isAdmin);

            this.sendBotMessage(response.content);
            await this.saveConversationToDB(user.id, userMessage, response);

        } catch (error) {
            console.error('Failed to handle follow-up message:', error);
            this.sendBotMessage("죄송합니다. 답변을 생성하는 중에 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
        }
    }

    // AI 응답 생성 로직
    private async generateAIResponse(
        message: string,
        chatHistory: ChatMessage[],
        isAdmin: boolean
    ): Promise<AIResponse> {
        const systemPrompt = this.aiClient.generateSystemPrompt(isAdmin);

        const messages: ChatMessage[] = [
            ...chatHistory,
            {
                id: this.generateMessageId(),
                content: message,
                sender: 'user',
                timestamp: new Date(),
            }
        ];

        // 관리자 전용 기능 감지 및 처리
        if (isAdmin && this.isAdminQuery(message)) {
            return await this.handleAdminQuery(message, messages);
        }

        return await this.aiClient.generateResponse(messages, 'mistral', systemPrompt);
    }

    // 관리자 전용 쿼리 처리
    private async handleAdminQuery(message: string, messages: ChatMessage[]): Promise<AIResponse> {
        const revenueService = RevenueService.getInstance();
        let revenueSummary = "매출 데이터를 가져올 수 없습니다.";

        try {
            // 우선 최근 1년치 데이터를 기본으로 조회
            const endDate = new Date();
            const startDate = new Date(new Date().setFullYear(endDate.getFullYear() - 1));

            const revenueData = await revenueService.getRevenueData({
                startDate: startDate.toISOString().split('T')[0],
                endDate: endDate.toISOString().split('T')[0],
            });
            revenueSummary = revenueService.summarizeRevenueForAI(revenueData);

        } catch (error) {
            console.error("Error fetching revenue data for AI:", error);
            if (error instanceof Error) {
                revenueSummary = `매출 데이터 조회 중 오류 발생: ${error.message}`;
            }
        }

        const adminSystemPrompt = `${this.aiClient.generateSystemPrompt(true)}
        
현재 "${message}" 라는 관리자 요청을 받았습니다. 아래의 실제 매출 데이터를 기반으로 전문적인 분석과 답변을 생성하세요.

${revenueSummary}`;

        // 실제 데이터를 기반으로 분석을 요청
        return await this.aiClient.generateResponse(messages, 'claude', adminSystemPrompt);
    }

    // 관리자 쿼리인지 확인
    private isAdminQuery(message: string): boolean {
        const adminKeywords = ['매출', '분석', '예측', '리포트', '성과', '데이터', '통계'];
        return adminKeywords.some(keyword => message.includes(keyword));
    }

    // 사용자 정보 업데이트
    async updateUser(userInfo: {
        profile?: { name?: string; email?: string; mobileNumber?: string; };
        tags?: string[];
    }): Promise<void> {
        this.currentUser = { ...this.currentUser, ...userInfo.profile };

        if (window.ChannelIO) {
            window.ChannelIO.updateUser(userInfo);

            // 사용자 권한에 따른 태그 추가
            const user = await getCurrentUser();
            if (user?.isAdmin) {
                window.ChannelIO.addTags(['admin', 'priority']);
            }
        }
    }

    // DB에서 채팅 세션 가져오거나 생성
    private async getOrCreateDBSession(userId: string): Promise<string> {
        if (this.currentSessionId) {
            return this.currentSessionId;
        }

        const { data, error } = await supabase
            .from('chat_sessions')
            .select('id')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

        if (data && !error) {
            this.currentSessionId = data.id;
            return data.id;
        }

        const { data: newSession, error: newSessionError } = await supabase
            .from('chat_sessions')
            .insert({ user_id: userId, session_type: (await getCurrentUser())?.isAdmin ? 'admin' : 'user' })
            .select('id')
            .single();

        if (newSessionError || !newSession) {
            throw new Error('Failed to create a new chat session.');
        }

        this.currentSessionId = newSession.id;
        return newSession.id;
    }

    // DB에서 채팅 기록 가져오기
    private async getChatHistoryFromDB(userId: string): Promise<ChatMessage[]> {
        try {
            const sessionId = await this.getOrCreateDBSession(userId);
            const { data, error } = await supabase
                .from('chat_messages')
                .select('content, sender, created_at, metadata')
                .eq('session_id', sessionId)
                .order('created_at', { ascending: true })
                .limit(20);

            if (error) throw error;

            return (data || []).map(msg => ({
                id: '', // DB id is not needed for history context
                content: msg.content,
                sender: msg.sender as 'user' | 'assistant' | 'system',
                timestamp: new Date(msg.created_at),
                metadata: msg.metadata || undefined,
            }));
        } catch (error) {
            console.error('Failed to get chat history from DB:', error);
            return [];
        }
    }

    // DB에 대화 내용 저장
    private async saveConversationToDB(userId: string, userMessage: string, aiResponse: AIResponse): Promise<void> {
        try {
            const sessionId = await this.getOrCreateDBSession(userId);
            const messagesToInsert = [
                {
                    session_id: sessionId,
                    message_id: `user_${Date.now()}`,
                    content: userMessage,
                    sender: 'user',
                },
                {
                    session_id: sessionId,
                    message_id: `asst_${Date.now()}`,
                    content: aiResponse.content,
                    sender: 'assistant',
                    metadata: aiResponse.metadata,
                    tokens_used: aiResponse.usage?.tokens,
                },
            ];

            const { error } = await supabase.from('chat_messages').insert(messagesToInsert);
            if (error) throw error;

        } catch (error) {
            console.error('Failed to save conversation to DB:', error);
        }
    }

    // 채널톡에 봇 메시지 전송 (실제로는 서버-사이드 API 필요)
    private sendBotMessage(message: string): void {
        // 중요: 현재 클라이언트 측에서는 메시지를 직접 보낼 수 없습니다.
        // 이는 데모를 위한 로깅이며, 실제 구현에서는
        // 웹훅(Webhook)을 수신하는 서버에서 채널톡의 Send bot message API를 호출해야 합니다.
        console.log("🤖 AI Bot Response (to be sent via server):", message);
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