// 서비스 레이어 공통 유틸리티
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

// 공통 타입 정의
export type ServiceResult<T> = {
  success: true;
  data: T;
} | {
  success: false;
  error: string;
  code?: string;
};

export type PaginationOptions = {
  page?: number;
  limit?: number;
  offset?: number;
};

export type SortOptions = {
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
};

// 메타데이터 타입 가드
export const isValidMetadata = (metadata: unknown): metadata is Record<string, any> => {
  return metadata !== null && typeof metadata === 'object' && !Array.isArray(metadata);
};

export const safeParseMetadata = (metadata: unknown): Record<string, any> => {
  if (isValidMetadata(metadata)) {
    return metadata;
  }
  return {};
};

// 오류 처리 유틸리티
export class ServiceError extends Error {
  constructor(
    message: string,
    public code?: string,
    public originalError?: unknown
  ) {
    super(message);
    this.name = 'ServiceError';
  }
}

export const handleServiceError = (error: unknown, operation: string): ServiceError => {
  if (error instanceof ServiceError) {
    return error;
  }

  if (error instanceof Error) {
    return new ServiceError(
      `${operation} 실패: ${error.message}`,
      'OPERATION_FAILED',
      error
    );
  }

  return new ServiceError(
    `${operation} 중 알 수 없는 오류가 발생했습니다`,
    'UNKNOWN_ERROR',
    error
  );
};

// 재시도 로직
export const retryWithBackoff = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  baseDelayMs: number = 1000,
  operationName: string = 'operation'
): Promise<T> => {
  let lastError: Error;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('알 수 없는 오류');
      
      if (attempt === maxRetries) {
        break;
      }

      // 지수 백오프: 1초, 2초, 4초, 8초...
      const delay = baseDelayMs * Math.pow(2, attempt);
      console.warn(`${operationName} 실패 (시도 ${attempt + 1}/${maxRetries + 1}), ${delay}ms 후 재시도:`, lastError.message);
      
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw new ServiceError(
    `${operationName}: ${maxRetries + 1}번 시도 후 실패`,
    'RETRY_EXHAUSTED',
    lastError
  );
};

// Supabase 쿼리 헬퍼
export const createSupabaseQuery = <T extends keyof Database['public']['Tables']>(
  tableName: T
) => {
  return supabase.from(tableName);
};

// 페이지네이션 헬퍼
export const applyPagination = <T>(
  query: any,
  options: PaginationOptions = {}
) => {
  const { page = 1, limit = 10, offset } = options;
  
  if (offset !== undefined) {
    return query.range(offset, offset + limit - 1);
  }
  
  const start = (page - 1) * limit;
  const end = start + limit - 1;
  
  return query.range(start, end);
};

// 정렬 헬퍼
export const applySorting = (
  query: any,
  options: SortOptions = {}
) => {
  const { sort_by = 'created_at', sort_order = 'desc' } = options;
  return query.order(sort_by, { ascending: sort_order === 'asc' });
};

// 사용자 인증 헬퍼
export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error) {
    throw new ServiceError('사용자 인증 확인 실패', 'AUTH_ERROR', error);
  }
  
  if (!user) {
    throw new ServiceError('인증되지 않은 사용자입니다', 'UNAUTHENTICATED');
  }
  
  return user;
};

// 관리자 권한 확인
export const requireAdminUser = async () => {
  const user = await getCurrentUser();
  
  // 관리자 권한 확인 로직 (실제 구현에 맞게 수정)
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();
  
  if (profile?.role !== 'admin') {
    throw new ServiceError('관리자 권한이 필요합니다', 'INSUFFICIENT_PERMISSIONS');
  }
  
  return user;
};

// 로깅 유틸리티
export const logServiceOperation = (
  operation: string,
  details: Record<string, any> = {},
  level: 'info' | 'warn' | 'error' = 'info'
) => {
  const logData = {
    timestamp: new Date().toISOString(),
    operation,
    ...details
  };
  
  switch (level) {
    case 'error':
      console.error(`[SERVICE ERROR] ${operation}:`, logData);
      break;
    case 'warn':
      console.warn(`[SERVICE WARN] ${operation}:`, logData);
      break;
    default:
      console.log(`[SERVICE INFO] ${operation}:`, logData);
  }
};

// 성능 모니터링 헬퍼
export const measurePerformance = async <T>(
  operation: () => Promise<T>,
  operationName: string
): Promise<T> => {
  const startTime = Date.now();
  
  try {
    const result = await operation();
    const duration = Date.now() - startTime;
    
    logServiceOperation('performance', {
      operation: operationName,
      duration,
      status: 'success'
    });
    
    return result;
  } catch (error) {
    const duration = Date.now() - startTime;
    
    logServiceOperation('performance', {
      operation: operationName,
      duration,
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, 'error');
    
    throw error;
  }
};

// 데이터 검증 헬퍼
export const validateRequired = (value: any, fieldName: string): void => {
  if (value === null || value === undefined || value === '') {
    throw new ServiceError(`${fieldName}은(는) 필수 항목입니다`, 'VALIDATION_ERROR');
  }
};

export const validateStringLength = (
  value: string,
  fieldName: string,
  minLength: number = 0,
  maxLength: number = 255
): void => {
  if (typeof value !== 'string') {
    throw new ServiceError(`${fieldName}은(는) 문자열이어야 합니다`, 'VALIDATION_ERROR');
  }
  
  if (value.length < minLength) {
    throw new ServiceError(
      `${fieldName}은(는) 최소 ${minLength}자 이상이어야 합니다`,
      'VALIDATION_ERROR'
    );
  }
  
  if (value.length > maxLength) {
    throw new ServiceError(
      `${fieldName}은(는) 최대 ${maxLength}자 이하여야 합니다`,
      'VALIDATION_ERROR'
    );
  }
};

export const validateEmail = (email: string): void => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new ServiceError('유효하지 않은 이메일 형식입니다', 'VALIDATION_ERROR');
  }
};

// 캐시 헬퍼 (간단한 메모리 캐시)
class SimpleCache<T> {
  private cache = new Map<string, { data: T; timestamp: number }>();
  private ttl: number;

  constructor(ttlMs: number = 5 * 60 * 1000) { // 기본 5분
    this.ttl = ttlMs;
  }

  get(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) {
      return null;
    }
    
    if (Date.now() - item.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return item.data;
  }

  set(key: string, data: T): void {
    this.cache.set(key, { data, timestamp: Date.now() });
    
    // 캐시 크기 제한 (최대 100개)
    if (this.cache.size > 100) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }
  }

  clear(): void {
    this.cache.clear();
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }
}

export const createCache = <T>(ttlMs?: number) => new SimpleCache<T>(ttlMs);

// 배치 처리 헬퍼
export const processBatch = async <T, R>(
  items: T[],
  processor: (item: T) => Promise<R>,
  batchSize: number = 10,
  concurrency: number = 3
): Promise<R[]> => {
  const results: R[] = [];
  
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchPromises: Promise<R>[] = [];
    
    for (let j = 0; j < batch.length; j += concurrency) {
      const concurrentBatch = batch.slice(j, j + concurrency);
      const concurrentPromises = concurrentBatch.map(processor);
      batchPromises.push(...concurrentPromises);
    }
    
    const batchResults = await Promise.all(batchPromises);
    results.push(...batchResults);
  }
  
  return results;
};