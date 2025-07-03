import { useEffect, useState, Suspense } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { ChannelTalkService } from '@/services/channel-talk';
import { AI_CONFIG } from '@/lib/env';

/**
 * AI 챗봇 및 채널톡 위젯을 초기화하고 사용자 정보를 연동합니다.
 * useAuth 훅을 안전하게 사용하기 위해 내부 컴포넌트로 분리합니다.
 */
function WidgetInternal() {
    const { user } = useAuth();
    const { profile } = useProfile();
    const [isInitialized, setIsInitialized] = useState(false);

    useEffect(() => {
        const channelTalkService = ChannelTalkService.getInstance();

        if (!AI_CONFIG.AI_CHATBOT_ENABLED || isInitialized) {
            return;
        }

        const initializeChatbot = async () => {
            try {
                await channelTalkService.initialize({
                    pluginKey: AI_CONFIG.CHANNEL_TALK_PLUGIN_KEY,
                });
                setIsInitialized(true);
            } catch (error) {
                console.error("AI Chatbot 초기화 실패:", error);
            }
        };

        initializeChatbot();
    }, [isInitialized]);

    useEffect(() => {
        if (isInitialized && user) {
            const channelTalkService = ChannelTalkService.getInstance();

            channelTalkService.updateUser({
                profile: {
                    name: profile?.name,
                    email: user.email,
                    mobileNumber: profile?.phone,
                }
            });
        }
    }, [isInitialized, user, profile]);

    return null; // 이 컴포넌트는 UI를 렌더링하지 않습니다.
}

/**
 * Suspense를 사용하여 WidgetInternal을 래핑하여
 * 컨텍스트가 준비될 때까지 렌더링을 지연시킵니다.
 */
export function ChatbotWidget() {
    return (
        <Suspense fallback={null}>
            <WidgetInternal />
        </Suspense>
    );
} 