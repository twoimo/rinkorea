/**
 * 보안이 강화된 로깅 유틸리티
 * 민감한 정보가 로그에 노출되지 않도록 필터링합니다.
 */

// 민감한 정보로 간주되는 키워드들
const SENSITIVE_KEYS = [
  'password', 'passwd', 'pwd',
  'secret', 'key', 'token', 'auth',
  'api_key', 'apikey', 'api-key',
  'access_token', 'refresh_token',
  'private_key', 'public_key',
  'certificate', 'cert',
  'signature', 'hash',
  'session', 'cookie',
  'authorization', 'bearer'
];

// 민감한 값으로 간주되는 패턴들
const SENSITIVE_VALUE_PATTERNS = [
  /sk-[a-zA-Z0-9]{20,}/g,           // OpenAI/Anthropic API 키
  /pa-[a-zA-Z0-9]{20,}/g,           // Voyage AI API 키
  /AKIA[0-9A-Z]{16}/g,              // AWS Access Key ID
  /[0-9a-zA-Z/+]{40}/g,             // AWS Secret Access Key (의심)
  /AIza[0-9A-Za-z\-_]{35}/g,        // Google API 키
  /ya29\.[0-9A-Za-z\-_]+/g,        // Google OAuth 토큰
  /ghp_[0-9a-zA-Z]{36}/g,           // GitHub Personal Access Token
  /ghs_[0-9a-zA-Z]{36}/g,           // GitHub App Token
  /eyJ[a-zA-Z0-9_-]*\.[a-zA-Z0-9_-]*\.[a-zA-Z0-9_-]*/g, // JWT 토큰
  /[a-zA-Z0-9]{32,}/g               // 긴 해시나 토큰 (32자 이상)
];

/**
 * 로그 레벨 정의
 */
export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3
}

/**
 * 현재 로그 레벨 (환경에 따라 설정)
 */
const getCurrentLogLevel = (): LogLevel => {
  const env = import.meta.env.VITE_APP_ENV || 'development';
  
  switch (env) {
    case 'production':
      return LogLevel.WARN;
    case 'test':
      return LogLevel.ERROR;
    default:
      return LogLevel.DEBUG;
  }
};

/**
 * 객체에서 민감한 정보를 마스킹
 */
function sanitizeObject(obj: any, depth = 0): any {
  // 순환 참조 방지
  if (depth > 10) {
    return '[깊이 제한 초과]';
  }

  if (obj === null || obj === undefined) {
    return obj;
  }

  if (typeof obj === 'string') {
    return sanitizeString(obj);
  }

  if (typeof obj === 'number' || typeof obj === 'boolean') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item, depth + 1));
  }

  if (typeof obj === 'object') {
    const sanitized: any = {};
    
    for (const [key, value] of Object.entries(obj)) {
      const lowerKey = key.toLowerCase();
      
      // 키 이름이 민감한 정보를 나타내는 경우
      if (SENSITIVE_KEYS.some(sensitiveKey => lowerKey.includes(sensitiveKey))) {
        sanitized[key] = '[REDACTED]';
      } else {
        sanitized[key] = sanitizeObject(value, depth + 1);
      }
    }
    
    return sanitized;
  }

  return obj;
}

/**
 * 문자열에서 민감한 패턴을 마스킹
 */
function sanitizeString(str: string): string {
  let sanitized = str;
  
  SENSITIVE_VALUE_PATTERNS.forEach(pattern => {
    sanitized = sanitized.replace(pattern, (match) => {
      // 처음 4자와 마지막 4자만 보여주고 나머지는 마스킹
      if (match.length <= 8) {
        return '[REDACTED]';
      }
      return `${match.substring(0, 4)}${'*'.repeat(match.length - 8)}${match.substring(match.length - 4)}`;
    });
  });
  
  return sanitized;
}

/**
 * 로그 메시지 포맷팅
 */
function formatLogMessage(level: string, message: string, data?: any): string {
  const timestamp = new Date().toISOString();
  const prefix = `[${timestamp}] [${level}]`;
  
  if (data) {
    const sanitizedData = sanitizeObject(data);
    return `${prefix} ${message} ${JSON.stringify(sanitizedData, null, 2)}`;
  }
  
  return `${prefix} ${sanitizeString(message)}`;
}

/**
 * 보안이 강화된 로거 클래스
 */
class SecureLogger {
  private currentLevel: LogLevel;

  constructor() {
    this.currentLevel = getCurrentLogLevel();
  }

  /**
   * 로그 레벨 설정
   */
  setLevel(level: LogLevel): void {
    this.currentLevel = level;
  }

  /**
   * 현재 로그 레벨 반환
   */
  getLevel(): LogLevel {
    return this.currentLevel;
  }

  /**
   * 로그 출력 여부 확인
   */
  private shouldLog(level: LogLevel): boolean {
    return level <= this.currentLevel;
  }

  /**
   * 에러 로그
   */
  error(message: string, data?: any): void {
    if (this.shouldLog(LogLevel.ERROR)) {
      const formattedMessage = formatLogMessage('ERROR', message, data);
      console.error(formattedMessage);
    }
  }

  /**
   * 경고 로그
   */
  warn(message: string, data?: any): void {
    if (this.shouldLog(LogLevel.WARN)) {
      const formattedMessage = formatLogMessage('WARN', message, data);
      console.warn(formattedMessage);
    }
  }

  /**
   * 정보 로그
   */
  info(message: string, data?: any): void {
    if (this.shouldLog(LogLevel.INFO)) {
      const formattedMessage = formatLogMessage('INFO', message, data);
      console.info(formattedMessage);
    }
  }

  /**
   * 디버그 로그
   */
  debug(message: string, data?: any): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      const formattedMessage = formatLogMessage('DEBUG', message, data);
      console.debug(formattedMessage);
    }
  }

  /**
   * API 요청/응답 로깅 (민감한 정보 자동 필터링)
   */
  logApiCall(method: string, url: string, requestData?: any, responseData?: any): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      const sanitizedUrl = sanitizeString(url);
      const sanitizedRequest = sanitizeObject(requestData);
      const sanitizedResponse = sanitizeObject(responseData);
      
      this.debug(`API 호출: ${method} ${sanitizedUrl}`, {
        request: sanitizedRequest,
        response: sanitizedResponse
      });
    }
  }

  /**
   * 환경 변수 로깅 (자동으로 민감한 정보 마스킹)
   */
  logEnvironment(env: Record<string, any>): void {
    if (this.shouldLog(LogLevel.INFO)) {
      const sanitizedEnv = sanitizeObject(env);
      this.info('환경 변수 로드됨', sanitizedEnv);
    }
  }

  /**
   * 사용자 액션 로깅 (개인정보 제외)
   */
  logUserAction(action: string, userId?: string, metadata?: any): void {
    if (this.shouldLog(LogLevel.INFO)) {
      const sanitizedMetadata = sanitizeObject(metadata);
      this.info(`사용자 액션: ${action}`, {
        userId: userId ? `user_${userId.substring(0, 8)}***` : 'anonymous',
        metadata: sanitizedMetadata
      });
    }
  }

  /**
   * 성능 메트릭 로깅
   */
  logPerformance(operation: string, duration: number, metadata?: any): void {
    if (this.shouldLog(LogLevel.INFO)) {
      const sanitizedMetadata = sanitizeObject(metadata);
      this.info(`성능 메트릭: ${operation}`, {
        duration: `${duration}ms`,
        metadata: sanitizedMetadata
      });
    }
  }
}

// 싱글톤 로거 인스턴스
export const logger = new SecureLogger();

// 기본 로깅 함수들 (하위 호환성)
export const log = {
  error: (message: string, data?: any) => logger.error(message, data),
  warn: (message: string, data?: any) => logger.warn(message, data),
  info: (message: string, data?: any) => logger.info(message, data),
  debug: (message: string, data?: any) => logger.debug(message, data)
};

// 개발 환경에서만 사용할 수 있는 안전하지 않은 로깅
export const unsafeLog = {
  debug: (message: string, data?: any) => {
    if (import.meta.env.DEV) {
      console.debug(`[UNSAFE DEBUG] ${message}`, data);
    }
  }
};

export default logger;