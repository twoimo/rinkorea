import { z } from "zod";

const envSchema = z.object({
    // API 관련
    VITE_API_URL: z.string().url().optional(),
    VITE_API_KEY: z.string().min(1).optional(),

    // Supabase
    VITE_SUPABASE_URL: z.string().url(),
    VITE_SUPABASE_ANON_KEY: z.string().min(1),

    // 인증 관련
    VITE_AUTH_DOMAIN: z.string().min(1).optional(),
    VITE_AUTH_CLIENT_ID: z.string().min(1).optional(),

    // AI 관련
    VITE_MISTRAL_API_KEY: z.string().min(1),
    VITE_CLAUDE_API_KEY: z.string().min(1),
    VITE_VOYAGE_API_KEY: z.string().min(1).describe("Voyage AI API key for embeddings"),

    // 기타 설정
    VITE_APP_ENV: z.enum(["development", "production", "test"]).optional(),
    VITE_APP_VERSION: z.string().optional(),
    VITE_APP_NAME: z.string().optional(),

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
            const errorDetails = error.errors.map((err) => {
                const field = err.path.join(".");
                const message = err.message;
                return `  - ${field}: ${message}`;
            }).join("\n");
            
            const missingRequired = error.errors
                .filter(err => err.code === 'invalid_type' && err.received === 'undefined')
                .map(err => err.path.join("."));
            
            let errorMessage = `환경 변수 설정 오류가 발생했습니다:\n${errorDetails}`;
            
            if (missingRequired.length > 0) {
                errorMessage += `\n\n필수 환경 변수가 누락되었습니다: ${missingRequired.join(", ")}`;
                errorMessage += `\n.env 파일을 확인하고 누락된 변수를 추가해주세요.`;
                errorMessage += `\n.env.example 파일을 참고하여 설정할 수 있습니다.`;
            }
            
            throw new Error(errorMessage);
        }
        throw error;
    }
}

/**
 * 개별 API 키 유효성 검사 함수들
 */
export const validateApiKeys = {
    /**
     * Voyage AI API 키 검증
     */
    voyage: (apiKey?: string): { valid: boolean; error?: string } => {
        if (!apiKey || apiKey.trim().length === 0) {
            return {
                valid: false,
                error: 'Voyage AI API 키가 설정되지 않았습니다. .env 파일에 VITE_VOYAGE_API_KEY를 설정해주세요.'
            };
        }
        
        if (apiKey === 'your_voyage_api_key_here') {
            return {
                valid: false,
                error: 'Voyage AI API 키가 기본값으로 설정되어 있습니다. 실제 API 키로 변경해주세요.'
            };
        }
        
        // Voyage AI API 키 형식 검증 (일반적으로 pa- 로 시작)
        if (!apiKey.startsWith('pa-') || apiKey.length < 20) {
            return {
                valid: false,
                error: 'Voyage AI API 키 형식이 올바르지 않습니다. pa-로 시작하는 유효한 키를 입력해주세요.'
            };
        }
        
        return { valid: true };
    },

    /**
     * Claude API 키 검증
     */
    claude: (apiKey?: string): { valid: boolean; error?: string } => {
        if (!apiKey || apiKey.trim().length === 0) {
            return {
                valid: false,
                error: 'Claude API 키가 설정되지 않았습니다. .env 파일에 VITE_CLAUDE_API_KEY를 설정해주세요.'
            };
        }
        
        if (apiKey === 'your_claude_api_key_here') {
            return {
                valid: false,
                error: 'Claude API 키가 기본값으로 설정되어 있습니다. 실제 API 키로 변경해주세요.'
            };
        }
        
        // Claude API 키 형식 검증 (일반적으로 sk-ant- 로 시작)
        if (!apiKey.startsWith('sk-ant-') || apiKey.length < 30) {
            return {
                valid: false,
                error: 'Claude API 키 형식이 올바르지 않습니다. sk-ant-로 시작하는 유효한 키를 입력해주세요.'
            };
        }
        
        return { valid: true };
    },

    /**
     * Mistral API 키 검증
     */
    mistral: (apiKey?: string): { valid: boolean; error?: string } => {
        if (!apiKey || apiKey.trim().length === 0) {
            return {
                valid: false,
                error: 'Mistral API 키가 설정되지 않았습니다. .env 파일에 VITE_MISTRAL_API_KEY를 설정해주세요.'
            };
        }
        
        if (apiKey === 'your_mistral_api_key_here') {
            return {
                valid: false,
                error: 'Mistral API 키가 기본값으로 설정되어 있습니다. 실제 API 키로 변경해주세요.'
            };
        }
        
        // Mistral API 키는 다양한 형식을 가질 수 있으므로 기본적인 길이만 검증
        if (apiKey.length < 20) {
            return {
                valid: false,
                error: 'Mistral API 키가 너무 짧습니다. 유효한 API 키를 입력해주세요.'
            };
        }
        
        return { valid: true };
    },

    /**
     * Supabase URL 검증
     */
    supabaseUrl: (url?: string): { valid: boolean; error?: string } => {
        if (!url || url.trim().length === 0) {
            return {
                valid: false,
                error: 'Supabase URL이 설정되지 않았습니다. .env 파일에 VITE_SUPABASE_URL을 설정해주세요.'
            };
        }
        
        if (url === 'your_supabase_project_url_here') {
            return {
                valid: false,
                error: 'Supabase URL이 기본값으로 설정되어 있습니다. 실제 프로젝트 URL로 변경해주세요.'
            };
        }
        
        // Supabase URL 형식 검증
        if (!url.includes('supabase.co') || !url.startsWith('https://')) {
            return {
                valid: false,
                error: 'Supabase URL 형식이 올바르지 않습니다. https://your-project.supabase.co 형식이어야 합니다.'
            };
        }
        
        return { valid: true };
    },

    /**
     * Supabase Anon Key 검증
     */
    supabaseAnonKey: (key?: string): { valid: boolean; error?: string } => {
        if (!key || key.trim().length === 0) {
            return {
                valid: false,
                error: 'Supabase Anon Key가 설정되지 않았습니다. .env 파일에 VITE_SUPABASE_ANON_KEY를 설정해주세요.'
            };
        }
        
        if (key === 'your_supabase_anon_key_here') {
            return {
                valid: false,
                error: 'Supabase Anon Key가 기본값으로 설정되어 있습니다. 실제 키로 변경해주세요.'
            };
        }
        
        // JWT 토큰 형식 기본 검증 (점으로 구분된 3개 부분)
        if (key.split('.').length !== 3 || key.length < 100) {
            return {
                valid: false,
                error: 'Supabase Anon Key 형식이 올바르지 않습니다. JWT 토큰 형식이어야 합니다.'
            };
        }
        
        return { valid: true };
    }
};

/**
 * 모든 필수 API 키 검증
 */
export function validateAllApiKeys(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    // Voyage AI 키 검증
    const voyageResult = validateApiKeys.voyage(env.VITE_VOYAGE_API_KEY);
    if (!voyageResult.valid && voyageResult.error) {
        errors.push(voyageResult.error);
    }
    
    // Claude 키 검증
    const claudeResult = validateApiKeys.claude(env.VITE_CLAUDE_API_KEY);
    if (!claudeResult.valid && claudeResult.error) {
        errors.push(claudeResult.error);
    }
    
    // Mistral 키 검증
    const mistralResult = validateApiKeys.mistral(env.VITE_MISTRAL_API_KEY);
    if (!mistralResult.valid && mistralResult.error) {
        errors.push(mistralResult.error);
    }
    
    // Supabase 설정 검증
    const supabaseUrlResult = validateApiKeys.supabaseUrl(env.VITE_SUPABASE_URL);
    if (!supabaseUrlResult.valid && supabaseUrlResult.error) {
        errors.push(supabaseUrlResult.error);
    }
    
    const supabaseKeyResult = validateApiKeys.supabaseAnonKey(env.VITE_SUPABASE_ANON_KEY);
    if (!supabaseKeyResult.valid && supabaseKeyResult.error) {
        errors.push(supabaseKeyResult.error);
    }
    
    return {
        valid: errors.length === 0,
        errors
    };
}

/**
 * 개발 서버 시작 시 API 키 검증
 */
export function validateStartupKeys(): void {
    const validation = validateAllApiKeys();
    
    if (!validation.valid) {
        console.error('\n🚨 API 키 설정 오류가 발견되었습니다:\n');
        validation.errors.forEach((error, index) => {
            console.error(`${index + 1}. ${error}`);
        });
        console.error('\n📖 자세한 설정 방법은 README.md 파일을 참고해주세요.\n');
        
        // 개발 환경에서는 경고만 표시하고 계속 진행
        if (env.VITE_APP_ENV !== 'production') {
            console.warn('⚠️  개발 환경에서 실행 중이므로 계속 진행합니다.\n');
        } else {
            // 프로덕션 환경에서는 실행 중단
            throw new Error('프로덕션 환경에서는 모든 API 키가 올바르게 설정되어야 합니다.');
        }
    } else {
        console.log('✅ 모든 API 키가 올바르게 설정되었습니다.');
    }
}

export const env = validateEnv();

// 임베딩 관련 설정
export const EMBEDDING_DIMENSION = 1024; // Voyage AI 기본 임베딩 차원

// 환경 변수 타입 선언
declare global {
    interface ImportMetaEnv {
        readonly VITE_API_URL?: string;
        readonly VITE_API_KEY?: string;
        readonly VITE_SUPABASE_URL: string;
        readonly VITE_SUPABASE_ANON_KEY: string;
        readonly VITE_AUTH_DOMAIN?: string;
        readonly VITE_AUTH_CLIENT_ID?: string;
        readonly VITE_MISTRAL_API_KEY: string;
        readonly VITE_CLAUDE_API_KEY: string;
        readonly VITE_VOYAGE_API_KEY: string;
        readonly VITE_APP_ENV?: "development" | "production" | "test";
        readonly VITE_APP_VERSION?: string;
        readonly VITE_APP_NAME?: string;
        readonly VITE_GA_TRACKING_ID?: string;
        readonly VITE_SENTRY_DSN?: string;
    }
} 