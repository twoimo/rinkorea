import { z } from "zod";

const envSchema = z.object({
    // API 관련
    VITE_API_URL: z.string().url(),
    VITE_API_KEY: z.string().min(1),

    // 인증 관련
    VITE_AUTH_DOMAIN: z.string().min(1),
    VITE_AUTH_CLIENT_ID: z.string().min(1),

    // 기타 설정
    VITE_APP_ENV: z.enum(["development", "production", "test"]),
    VITE_APP_VERSION: z.string(),
    VITE_APP_NAME: z.string(),

    // 외부 서비스
    VITE_GA_TRACKING_ID: z.string().optional(),
    VITE_SENTRY_DSN: z.string().url().optional(),

    // AI API Configuration
    VITE_MISTRAL_API_KEY: z.string().min(1).optional(),
    VITE_CLAUDE_API_KEY: z.string().min(1).optional(),
    VITE_CHANNEL_TALK_PLUGIN_KEY: z.string().min(1).optional(),
    VITE_AI_CHATBOT_ENABLED: z.string().optional(),
    VITE_MAX_MESSAGE_LENGTH: z.string().optional(),
    VITE_AI_RESPONSE_TIMEOUT: z.string().optional(),
    VITE_ADMIN_ROLE_REQUIRED: z.string().optional(),
});

type Env = z.infer<typeof envSchema>;

function validateEnv(): Env {
    try {
        return envSchema.parse(import.meta.env);
    } catch (error) {
        if (error instanceof z.ZodError) {
            const missingVars = error.errors
                .map((err) => err.path.join("."))
                .join(", ");
            throw new Error(`환경 변수 설정 오류: ${missingVars}`);
        }
        throw error;
    }
}

export const env = validateEnv();

// 환경 변수 타입 선언
declare global {
    interface ImportMetaEnv {
        readonly VITE_API_URL: string;
        readonly VITE_API_KEY: string;
        readonly VITE_AUTH_DOMAIN: string;
        readonly VITE_AUTH_CLIENT_ID: string;
        readonly VITE_APP_ENV: "development" | "production" | "test";
        readonly VITE_APP_VERSION: string;
        readonly VITE_APP_NAME: string;
        readonly VITE_GA_TRACKING_ID?: string;
        readonly VITE_SENTRY_DSN?: string;
        readonly VITE_MISTRAL_API_KEY?: string;
        readonly VITE_CLAUDE_API_KEY?: string;
        readonly VITE_CHANNEL_TALK_PLUGIN_KEY?: string;
        readonly VITE_AI_CHATBOT_ENABLED?: string;
        readonly VITE_MAX_MESSAGE_LENGTH?: string;
        readonly VITE_AI_RESPONSE_TIMEOUT?: string;
        readonly VITE_ADMIN_ROLE_REQUIRED?: string;
    }
}

// AI API Configuration
export const AI_CONFIG = {
    MISTRAL_API_KEY: env.VITE_MISTRAL_API_KEY,
    CLAUDE_API_KEY: env.VITE_CLAUDE_API_KEY,
    CHANNEL_TALK_PLUGIN_KEY: env.VITE_CHANNEL_TALK_PLUGIN_KEY,
    AI_CHATBOT_ENABLED: env.VITE_AI_CHATBOT_ENABLED === 'true',
    MAX_MESSAGE_LENGTH: parseInt(env.VITE_MAX_MESSAGE_LENGTH || '2000'),
    AI_RESPONSE_TIMEOUT: parseInt(env.VITE_AI_RESPONSE_TIMEOUT || '30000'),
    ADMIN_ROLE_REQUIRED: env.VITE_ADMIN_ROLE_REQUIRED || 'admin',
} as const;

// Validation
export function validateAIConfig() {
    const errors: string[] = [];

    if (!AI_CONFIG.MISTRAL_API_KEY) {
        errors.push('VITE_MISTRAL_API_KEY is required');
    }

    if (!AI_CONFIG.CLAUDE_API_KEY) {
        errors.push('VITE_CLAUDE_API_KEY is required');
    }

    if (!AI_CONFIG.CHANNEL_TALK_PLUGIN_KEY) {
        errors.push('VITE_CHANNEL_TALK_PLUGIN_KEY is required');
    }

    if (errors.length > 0) {
        throw new Error(`AI Configuration errors: ${errors.join(', ')}`);
    }
}

// Types
export interface AIConfig {
    MISTRAL_API_KEY: string;
    CLAUDE_API_KEY: string;
    CHANNEL_TALK_PLUGIN_KEY: string;
    AI_CHATBOT_ENABLED: boolean;
    MAX_MESSAGE_LENGTH: number;
    AI_RESPONSE_TIMEOUT: number;
    ADMIN_ROLE_REQUIRED: string;
} 