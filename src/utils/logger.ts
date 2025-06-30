/**
 * 클린 코드를 위한 로깅 유틸리티
 * 프로덕션 환경에서는 로그가 출력되지 않습니다.
 */

const isDevelopment = import.meta.env.DEV;

export const logger = {
    /**
     * 개발환경에서만 일반 로그 출력
     */
    debug: (message: string, ...args: unknown[]) => {
        if (isDevelopment) {
            console.log(`🔍 [DEBUG] ${message}`, ...args);
        }
    },

    /**
     * 개발환경에서만 정보 로그 출력
     */
    info: (message: string, ...args: unknown[]) => {
        if (isDevelopment) {
            console.info(`ℹ️ [INFO] ${message}`, ...args);
        }
    },

    /**
     * 개발환경에서만 경고 로그 출력
     */
    warn: (message: string, ...args: unknown[]) => {
        if (isDevelopment) {
            console.warn(`⚠️ [WARN] ${message}`, ...args);
        }
    },

    /**
     * 항상 에러 로그 출력 (프로덕션에서도 필요)
     */
    error: (message: string, error?: unknown, ...args: unknown[]) => {
        console.error(`❌ [ERROR] ${message}`, error, ...args);
    },

    /**
     * 성능 관련 로그 (개발환경에서만)
     */
    performance: (message: string, ...args: unknown[]) => {
        if (isDevelopment) {
            console.log(`🚀 [PERF] ${message}`, ...args);
        }
    },

    /**
     * 성공 관련 로그 (개발환경에서만)
     */
    success: (message: string, ...args: unknown[]) => {
        if (isDevelopment) {
            console.log(`✅ [SUCCESS] ${message}`, ...args);
        }
    }
};

export default logger; 