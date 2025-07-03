// AI 챗봇 관련 타입 정의
export interface ChatMessage {
    id: string;
    content: string;
    sender: 'user' | 'assistant' | 'system';
    timestamp: Date;
    metadata?: Record<string, unknown>;
}

export interface ChatSession {
    id: string;
    userId: string;
    startTime: Date;
    endTime?: Date;
    messages: ChatMessage[];
    context?: Record<string, unknown>;
}

export interface AIProvider {
    name: 'mistral' | 'claude';
    endpoint: string;
    model?: string;
}

export interface AIResponse {
    content: string;
    usage?: {
        tokens: number;
        cost?: number;
    };
    metadata?: Record<string, unknown>;
}

export interface UserRole {
    id: string;
    name: string;
    permissions: string[];
    isAdmin: boolean;
}

export interface ChatbotConfig {
    enabledProviders: AIProvider[];
    maxMessageLength: number;
    responseTimeout: number;
    adminRole: string;
    features: {
        revenueAnalysis: boolean;
        salesPrediction: boolean;
        customerAnalytics: boolean;
    };
}

// 채널톡 관련 타입 정의
export interface ChannelTalkConfig {
    pluginKey: string;
    memberId?: string;
    memberHash?: string;
    profile?: {
        name?: string;
        email?: string;
        mobileNumber?: string;
        avatarUrl?: string;
    };
}

export interface ChannelTalkMessage {
    type: 'user' | 'manager';
    message: string;
    createdAt: Date;
}

// AI 분석 관련 타입
export interface RevenueAnalysis {
    period: 'monthly' | 'quarterly' | 'yearly';
    trend: 'increasing' | 'decreasing' | 'stable';
    prediction: number;
    confidence: number;
    insights: string[];
}

export interface CustomerAnalytics {
    totalCustomers: number;
    newCustomers: number;
    churnRate: number;
    satisfaction: number;
    topQueries: string[];
}

export interface AnalysisRequest {
    type: 'revenue' | 'customer' | 'sales';
    timeframe: {
        start: Date;
        end: Date;
    };
    filters?: Record<string, unknown>;
}

export interface AnalysisResponse {
    data: RevenueAnalysis | CustomerAnalytics;
    generatedAt: Date;
    requestId: string;
} 