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
});

type Env = z.infer<typeof envSchema>;

// Environment configuration with validation
const requiredEnvVars = [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY',
] as const;

interface EnvConfig {
    SUPABASE_URL: string;
    SUPABASE_ANON_KEY: string;
    NODE_ENV: string;
    DEV: boolean;
    PROD: boolean;
}

// Validate environment variables
function validateEnv(): EnvConfig {
    const missing: string[] = [];

    // Check for required variables in production
    if (import.meta.env.PROD) {
        requiredEnvVars.forEach(key => {
            if (!import.meta.env[key]) {
                missing.push(key);
            }
        });
    }

    if (missing.length > 0) {
        console.error('Missing required environment variables:', missing);
        // In production, use fallback values or throw error
        if (import.meta.env.PROD) {
            throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
        }
    }

    return {
        SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL || '',
        SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
        NODE_ENV: import.meta.env.NODE_ENV || 'development',
        DEV: import.meta.env.DEV || false,
        PROD: import.meta.env.PROD || false,
    };
}

// Safe environment access
let env: EnvConfig;

try {
    env = validateEnv();
} catch (error) {
    console.error('Environment validation failed:', error);
    // Fallback configuration for development
    env = {
        SUPABASE_URL: '',
        SUPABASE_ANON_KEY: '',
        NODE_ENV: 'development',
        DEV: true,
        PROD: false,
    };
}

export { env };
export default env;

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
    }
} 