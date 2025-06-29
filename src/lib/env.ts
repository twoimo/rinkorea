import { z } from "zod";

const envSchema = z.object({
    // API 관련 - 모두 선택사항으로 변경
    VITE_API_URL: z.string().url().optional(),
    VITE_API_KEY: z.string().min(1).optional(),

    // 인증 관련 - 모두 선택사항으로 변경
    VITE_AUTH_DOMAIN: z.string().min(1).optional(),
    VITE_AUTH_CLIENT_ID: z.string().min(1).optional(),

    // 기타 설정 - 기본값 설정
    VITE_APP_ENV: z.enum(["development", "production", "test"]).default("production"),
    VITE_APP_VERSION: z.string().default("1.0.0"),
    VITE_APP_NAME: z.string().default("RIN Korea"),

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
            console.warn(`환경 변수 설정 경고: ${missingVars}`);
            // 기본값으로 fallback
            return {
                VITE_APP_ENV: "production" as const,
                VITE_APP_VERSION: "1.0.0",
                VITE_APP_NAME: "RIN Korea"
            } as Env;
        }
        console.warn("환경 변수 파싱 실패, 기본값 사용");
        return {
            VITE_APP_ENV: "production" as const,
            VITE_APP_VERSION: "1.0.0",
            VITE_APP_NAME: "RIN Korea"
        } as Env;
    }
}

export const env = {
    VITE_APP_ENV: import.meta.env.VITE_APP_ENV || "production",
    VITE_APP_VERSION: import.meta.env.VITE_APP_VERSION || "1.0.0",
    VITE_APP_NAME: import.meta.env.VITE_APP_NAME || "RIN Korea",
    VITE_API_URL: import.meta.env.VITE_API_URL,
    VITE_API_KEY: import.meta.env.VITE_API_KEY,
    VITE_AUTH_DOMAIN: import.meta.env.VITE_AUTH_DOMAIN,
    VITE_AUTH_CLIENT_ID: import.meta.env.VITE_AUTH_CLIENT_ID,
    VITE_GA_TRACKING_ID: import.meta.env.VITE_GA_TRACKING_ID,
    VITE_SENTRY_DSN: import.meta.env.VITE_SENTRY_DSN,
} as const;

// 환경 변수 타입 선언
declare global {
    interface ImportMetaEnv {
        readonly VITE_API_URL?: string;
        readonly VITE_API_KEY?: string;
        readonly VITE_AUTH_DOMAIN?: string;
        readonly VITE_AUTH_CLIENT_ID?: string;
        readonly VITE_APP_ENV?: "development" | "production" | "test";
        readonly VITE_APP_VERSION?: string;
        readonly VITE_APP_NAME?: string;
        readonly VITE_GA_TRACKING_ID?: string;
        readonly VITE_SENTRY_DSN?: string;
    }
} 