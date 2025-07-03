import { AI_CONFIG } from '../lib/env';
import { supabase } from '../integrations/supabase/client';

export interface AuthenticatedUser {
    id: string;
    email: string;
    role: string;
    isAdmin: boolean;
}

// 현재 사용자 정보 가져오기
export async function getCurrentUser(): Promise<AuthenticatedUser | null> {
    try {
        const { data: { user }, error } = await supabase.auth.getUser();

        if (error || !user) {
            return null;
        }

        // 사용자 역할 가져오기
        const { data: userRole } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', user.id)
            .single();

        const role = userRole?.role || 'user';

        return {
            id: user.id,
            email: user.email || '',
            role,
            isAdmin: role === AI_CONFIG.ADMIN_ROLE_REQUIRED,
        };
    } catch (error) {
        console.error('Failed to get current user:', error);
        return null;
    }
}

// 관리자 권한 확인
export async function requireAdmin(): Promise<AuthenticatedUser> {
    const user = await getCurrentUser();

    if (!user) {
        throw new Error('로그인이 필요합니다.');
    }

    if (!user.isAdmin) {
        throw new Error('관리자 권한이 필요합니다.');
    }

    return user;
}

// 로그인 확인
export async function requireAuth(): Promise<AuthenticatedUser> {
    const user = await getCurrentUser();

    if (!user) {
        throw new Error('로그인이 필요합니다.');
    }

    return user;
}

// AI 기능 접근 권한 확인
export async function canUseAIFeature(feature: string): Promise<boolean> {
    const user = await getCurrentUser();

    if (!user) {
        return false;
    }

    // 기본 AI 채팅은 모든 인증된 사용자가 사용 가능
    if (feature === 'basic_chat') {
        return true;
    }

    // 관리자 전용 기능들
    const adminFeatures = [
        'revenue_analysis',
        'sales_prediction',
        'customer_analytics',
        'advanced_reporting'
    ];

    if (adminFeatures.includes(feature)) {
        return user.isAdmin;
    }

    return false;
}

// 세션 검증
export async function validateSession(): Promise<boolean> {
    try {
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error || !session) {
            return false;
        }

        // 세션 만료 확인
        const now = Math.floor(Date.now() / 1000);
        if (session.expires_at && session.expires_at < now) {
            return false;
        }

        return true;
    } catch (error) {
        console.error('Session validation failed:', error);
        return false;
    }
}

// 사용자 권한 목록 가져오기
export async function getUserPermissions(): Promise<string[]> {
    try {
        const user = await getCurrentUser();

        if (!user) {
            return [];
        }

        // 관리자는 모든 기본 권한을 가짐
        if (user.isAdmin) {
            return [
                'basic_chat',
                'revenue_analysis',
                'sales_prediction',
                'customer_analytics',
                'advanced_reporting',
                'user_management'
            ];
        }

        // 일반 사용자는 기본 권한만
        return ['basic_chat'];
    } catch (error) {
        console.error('Failed to get user permissions:', error);
        return [];
    }
}

// 에러 메시지 한국어 변환
export function getAuthErrorMessage(error: Error): string {
    if (error.message === '로그인이 필요합니다.') {
        return error.message;
    }

    if (error.message === '관리자 권한이 필요합니다.') {
        return error.message;
    }

    if (error.message.includes('permission')) {
        return '권한이 부족합니다.';
    }

    return '인증 오류가 발생했습니다.';
} 