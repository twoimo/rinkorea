// 전역 오류 처리 시스템
import { logger } from './logger';

export enum ErrorType {
  VALIDATION = 'VALIDATION',
  NETWORK = 'NETWORK',
  DATABASE = 'DATABASE',
  FILE_PROCESSING = 'FILE_PROCESSING',
  VECTOR_GENERATION = 'VECTOR_GENERATION',
  AUTHENTICATION = 'AUTHENTICATION',
  AUTHORIZATION = 'AUTHORIZATION',
  RATE_LIMIT = 'RATE_LIMIT',
  SYSTEM = 'SYSTEM',
  USER_INPUT = 'USER_INPUT'
}

export enum ErrorSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export interface AppError {
  id: string;
  type: ErrorType;
  severity: ErrorSeverity;
  message: string;
  userMessage: string;
  details?: any;
  timestamp: Date;
  context?: {
    userId?: string;
    action?: string;
    resource?: string;
    metadata?: Record<string, any>;
  };
  stack?: string;
  retryable: boolean;
  retryCount?: number;
  maxRetries?: number;
}

export interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
  retryableErrors: ErrorType[];
}

export class AppErrorHandler {
  private static instance: AppErrorHandler;
  private errorLog: AppError[] = [];
  private maxLogSize = 1000;
  private retryConfig: RetryConfig = {
    maxRetries: 3,
    baseDelay: 1000,
    maxDelay: 30000,
    backoffMultiplier: 2,
    retryableErrors: [
      ErrorType.NETWORK,
      ErrorType.DATABASE,
      ErrorType.VECTOR_GENERATION,
      ErrorType.RATE_LIMIT
    ]
  };

  private constructor() {}

  public static getInstance(): AppErrorHandler {
    if (!AppErrorHandler.instance) {
      AppErrorHandler.instance = new AppErrorHandler();
    }
    return AppErrorHandler.instance;
  }

  /**
   * 오류 생성 및 처리
   */
  public createError(
    type: ErrorType,
    message: string,
    userMessage: string,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    details?: any,
    context?: AppError['context']
  ): AppError {
    const error: AppError = {
      id: this.generateErrorId(),
      type,
      severity,
      message,
      userMessage,
      details,
      timestamp: new Date(),
      context,
      retryable: this.retryConfig.retryableErrors.includes(type),
      retryCount: 0,
      maxRetries: this.retryConfig.maxRetries
    };

    this.logError(error);
    return error;
  }

  /**
   * JavaScript Error를 AppError로 변환
   */
  public fromJSError(
    jsError: Error,
    type: ErrorType = ErrorType.SYSTEM,
    userMessage?: string,
    context?: AppError['context']
  ): AppError {
    const error = this.createError(
      type,
      jsError.message,
      userMessage || this.getDefaultUserMessage(type),
      this.getSeverityFromType(type),
      { originalError: jsError.name },
      context
    );

    error.stack = jsError.stack;
    return error;
  }

  /**
   * 오류 로깅
   */
  private logError(error: AppError): void {
    // 메모리 로그에 추가
    this.errorLog.unshift(error);
    if (this.errorLog.length > this.maxLogSize) {
      this.errorLog = this.errorLog.slice(0, this.maxLogSize);
    }

    // 외부 로거에 기록
    const logLevel = this.getLogLevel(error.severity);
    logger[logLevel]('Application Error', {
      errorId: error.id,
      type: error.type,
      severity: error.severity,
      message: error.message,
      context: error.context,
      details: error.details
    });

    // 심각한 오류의 경우 추가 처리
    if (error.severity === ErrorSeverity.CRITICAL) {
      this.handleCriticalError(error);
    }
  }

  /**
   * 재시도 가능한 작업 실행
   */
  public async executeWithRetry<T>(
    operation: () => Promise<T>,
    context: {
      operationName: string;
      errorType: ErrorType;
      userMessage: string;
      metadata?: Record<string, any>;
    }
  ): Promise<T> {
    let lastError: AppError | null = null;
    
    for (let attempt = 0; attempt <= this.retryConfig.maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        const appError = error instanceof Error 
          ? this.fromJSError(error, context.errorType, context.userMessage, {
              action: context.operationName,
              metadata: { ...context.metadata, attempt }
            })
          : error as AppError;

        appError.retryCount = attempt;
        lastError = appError;

        // 재시도 불가능하거나 최대 시도 횟수 도달
        if (!appError.retryable || attempt === this.retryConfig.maxRetries) {
          throw appError;
        }

        // 백오프 지연
        const delay = this.calculateBackoffDelay(attempt);
        logger.warn(`재시도 ${attempt + 1}/${this.retryConfig.maxRetries} - ${delay}ms 후 재시도`, {
          operation: context.operationName,
          error: appError.message
        });

        await this.sleep(delay);
      }
    }

    throw lastError;
  }

  /**
   * 백오프 지연 계산
   */
  private calculateBackoffDelay(attempt: number): number {
    const delay = this.retryConfig.baseDelay * Math.pow(this.retryConfig.backoffMultiplier, attempt);
    return Math.min(delay, this.retryConfig.maxDelay);
  }

  /**
   * 지연 함수
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 오류 복구 시도
   */
  public async attemptRecovery(error: AppError): Promise<boolean> {
    logger.info(`오류 복구 시도: ${error.id}`, { error });

    switch (error.type) {
      case ErrorType.NETWORK:
        return this.recoverFromNetworkError(error);
      case ErrorType.DATABASE:
        return this.recoverFromDatabaseError(error);
      case ErrorType.FILE_PROCESSING:
        return this.recoverFromFileProcessingError(error);
      case ErrorType.VECTOR_GENERATION:
        return this.recoverFromVectorGenerationError(error);
      default:
        return false;
    }
  }

  /**
   * 네트워크 오류 복구
   */
  private async recoverFromNetworkError(error: AppError): Promise<boolean> {
    // 연결 상태 확인
    if (navigator.onLine) {
      logger.info('네트워크 연결 복구됨');
      return true;
    }
    return false;
  }

  /**
   * 데이터베이스 오류 복구
   */
  private async recoverFromDatabaseError(error: AppError): Promise<boolean> {
    // 데이터베이스 연결 상태 확인 (실제 구현에서는 health check API 호출)
    try {
      // 간단한 연결 테스트
      const response = await fetch('/api/health');
      return response.ok;
    } catch {
      return false;
    }
  }

  /**
   * 파일 처리 오류 복구
   */
  private async recoverFromFileProcessingError(error: AppError): Promise<boolean> {
    // 파일 처리 오류는 일반적으로 복구 불가능
    return false;
  }

  /**
   * 벡터 생성 오류 복구
   */
  private async recoverFromVectorGenerationError(error: AppError): Promise<boolean> {
    // API 키 또는 서비스 상태 확인
    try {
      // 벡터 생성 서비스 상태 확인
      return true; // 실제로는 서비스 상태 확인 로직 구현
    } catch {
      return false;
    }
  }

  /**
   * 심각한 오류 처리
   */
  private handleCriticalError(error: AppError): void {
    // 심각한 오류 알림 (실제 환경에서는 모니터링 시스템에 전송)
    console.error('CRITICAL ERROR:', error);
    
    // 필요한 경우 사용자에게 시스템 재시작 권장
    if (error.type === ErrorType.SYSTEM) {
      // 시스템 레벨 오류 처리
    }
  }

  /**
   * 오류 통계 조회
   */
  public getErrorStats(timeRange?: { start: Date; end: Date }): {
    total: number;
    byType: Record<ErrorType, number>;
    bySeverity: Record<ErrorSeverity, number>;
    retryableErrors: number;
    recentErrors: AppError[];
  } {
    let filteredErrors = this.errorLog;
    
    if (timeRange) {
      filteredErrors = this.errorLog.filter(
        error => error.timestamp >= timeRange.start && error.timestamp <= timeRange.end
      );
    }

    const byType = {} as Record<ErrorType, number>;
    const bySeverity = {} as Record<ErrorSeverity, number>;
    let retryableErrors = 0;

    // 초기화
    Object.values(ErrorType).forEach(type => byType[type] = 0);
    Object.values(ErrorSeverity).forEach(severity => bySeverity[severity] = 0);

    filteredErrors.forEach(error => {
      byType[error.type]++;
      bySeverity[error.severity]++;
      if (error.retryable) retryableErrors++;
    });

    return {
      total: filteredErrors.length,
      byType,
      bySeverity,
      retryableErrors,
      recentErrors: filteredErrors.slice(0, 10)
    };
  }

  /**
   * 오류 ID 생성
   */
  private generateErrorId(): string {
    return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 타입별 기본 사용자 메시지
   */
  private getDefaultUserMessage(type: ErrorType): string {
    const messages = {
      [ErrorType.VALIDATION]: '입력 정보를 확인해주세요.',
      [ErrorType.NETWORK]: '네트워크 연결을 확인해주세요.',
      [ErrorType.DATABASE]: '일시적인 서버 오류입니다. 잠시 후 다시 시도해주세요.',
      [ErrorType.FILE_PROCESSING]: '파일 처리 중 오류가 발생했습니다.',
      [ErrorType.VECTOR_GENERATION]: '벡터 생성 중 오류가 발생했습니다.',
      [ErrorType.AUTHENTICATION]: '로그인이 필요합니다.',
      [ErrorType.AUTHORIZATION]: '접근 권한이 없습니다.',
      [ErrorType.RATE_LIMIT]: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.',
      [ErrorType.SYSTEM]: '시스템 오류가 발생했습니다.',
      [ErrorType.USER_INPUT]: '입력 내용을 확인해주세요.'
    };
    return messages[type] || '알 수 없는 오류가 발생했습니다.';
  }

  /**
   * 타입별 심각도 결정
   */
  private getSeverityFromType(type: ErrorType): ErrorSeverity {
    const severityMap = {
      [ErrorType.VALIDATION]: ErrorSeverity.LOW,
      [ErrorType.NETWORK]: ErrorSeverity.MEDIUM,
      [ErrorType.DATABASE]: ErrorSeverity.HIGH,
      [ErrorType.FILE_PROCESSING]: ErrorSeverity.MEDIUM,
      [ErrorType.VECTOR_GENERATION]: ErrorSeverity.MEDIUM,
      [ErrorType.AUTHENTICATION]: ErrorSeverity.LOW,
      [ErrorType.AUTHORIZATION]: ErrorSeverity.MEDIUM,
      [ErrorType.RATE_LIMIT]: ErrorSeverity.LOW,
      [ErrorType.SYSTEM]: ErrorSeverity.CRITICAL,
      [ErrorType.USER_INPUT]: ErrorSeverity.LOW
    };
    return severityMap[type] || ErrorSeverity.MEDIUM;
  }

  /**
   * 심각도별 로그 레벨
   */
  private getLogLevel(severity: ErrorSeverity): 'info' | 'warn' | 'error' {
    switch (severity) {
      case ErrorSeverity.LOW:
        return 'info';
      case ErrorSeverity.MEDIUM:
        return 'warn';
      case ErrorSeverity.HIGH:
      case ErrorSeverity.CRITICAL:
        return 'error';
      default:
        return 'warn';
    }
  }

  /**
   * 오류 로그 클리어
   */
  public clearErrorLog(): void {
    this.errorLog = [];
    logger.info('오류 로그가 클리어되었습니다.');
  }

  /**
   * 재시도 설정 업데이트
   */
  public updateRetryConfig(config: Partial<RetryConfig>): void {
    this.retryConfig = { ...this.retryConfig, ...config };
    logger.info('재시도 설정이 업데이트되었습니다.', { config: this.retryConfig });
  }
}

// 전역 인스턴스
export const errorHandler = AppErrorHandler.getInstance();

// 편의 함수들
export const createError = (
  type: ErrorType,
  message: string,
  userMessage: string,
  severity?: ErrorSeverity,
  details?: any,
  context?: AppError['context']
) => errorHandler.createError(type, message, userMessage, severity, details, context);

export const fromJSError = (
  jsError: Error,
  type?: ErrorType,
  userMessage?: string,
  context?: AppError['context']
) => errorHandler.fromJSError(jsError, type, userMessage, context);

export const executeWithRetry = <T>(
  operation: () => Promise<T>,
  context: {
    operationName: string;
    errorType: ErrorType;
    userMessage: string;
    metadata?: Record<string, any>;
  }
) => errorHandler.executeWithRetry(operation, context);

// React Error Boundary용 오류 처리
export const handleReactError = (error: Error, errorInfo: any) => {
  const appError = errorHandler.fromJSError(
    error,
    ErrorType.SYSTEM,
    '페이지 렌더링 중 오류가 발생했습니다.',
    {
      action: 'render',
      metadata: { componentStack: errorInfo.componentStack }
    }
  );
  
  return appError;
};