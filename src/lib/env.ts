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
    }
} 