// 파일 업로드 및 텍스트 추출 서비스
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';
import type {
  UploadResult,
  ProcessingResult,
  UploadProgress
} from '@/types/vector';
import { SUPPORTED_FILE_TYPES } from '@/types/vector';
import { generateAndStoreDocumentVectors, type VectorGenerationOptions } from './vectorGenerationService';
import { processUploadedDocument, type ProcessingProgress } from './documentProcessingService';
import { ErrorType, executeWithRetry } from '@/lib/errorHandler';
import {
  handleUserError,
  collectUserFeedback
} from './common/userFeedback';

// Supabase 데이터베이스 타입 정의
type DbDocumentUpdate = Database['public']['Tables']['documents']['Update'];

// 타입 가드 함수들
const isValidMetadata = (metadata: unknown): metadata is Record<string, any> => {
  return metadata !== null && typeof metadata === 'object' && !Array.isArray(metadata);
};

const safeParseMetadata = (metadata: unknown): Record<string, any> => {
  if (isValidMetadata(metadata)) {
    return metadata;
  }
  return {};
};

// 런타임 타입 검증 함수들
const validateFileSize = (size: number): boolean => {
  return typeof size === 'number' && size >= 0 && size <= 60 * 1024 * 1024; // 60MB 제한
};

const validateFileName = (name: string): boolean => {
  return typeof name === 'string' && name.length > 0 && name.length <= 255;
};

const validateFileType = (type: string): boolean => {
  return typeof type === 'string' && type.length > 0;
};

/**
 * 파일 타입 검증 (확장된 검증)
 */
export const validateFileExtended = (file: File): { valid: boolean; error?: string; warnings?: string[] } => {
  const warnings: string[] = [];
  
  // 런타임 타입 검증
  if (!validateFileName(file.name)) {
    return {
      valid: false,
      error: '유효하지 않은 파일명입니다'
    };
  }

  if (!validateFileSize(file.size)) {
    return {
      valid: false,
      error: '파일 크기가 유효하지 않습니다 (최대 60MB)'
    };
  }

  if (!validateFileType(file.type)) {
    return {
      valid: false,
      error: '유효하지 않은 파일 타입입니다'
    };
  }
  
  // 기본 파일 타입 검증
  const extension = '.' + file.name.split('.').pop()?.toLowerCase();
  const fileType = Object.entries(SUPPORTED_FILE_TYPES).find(
    ([_, config]) => config.extension === extension
  );

  if (!fileType) {
    return {
      valid: false,
      error: `지원되지 않는 파일 형식입니다. 지원 형식: ${Object.values(SUPPORTED_FILE_TYPES).map(t => t.extension).join(', ')}`
    };
  }

  const [, config] = fileType;
  if (file.size > config.maxSize) {
    return {
      valid: false,
      error: `파일 크기가 너무 큽니다. 최대 크기: ${(config.maxSize / 1024 / 1024).toFixed(1)}MB`
    };
  }

  // 파일명 검증
  if (file.name.length > 255) {
    return {
      valid: false,
      error: '파일명이 너무 깁니다 (최대 255자)'
    };
  }

  // 특수 문자 검증
  const invalidChars = /[<>:"/\\|?*]/;
  if (invalidChars.test(file.name)) {
    return {
      valid: false,
      error: '파일명에 허용되지 않는 특수문자가 포함되어 있습니다'
    };
  }

  // 빈 파일 검증
  if (file.size === 0) {
    return {
      valid: false,
      error: '빈 파일은 업로드할 수 없습니다'
    };
  }

  // 경고 사항 체크
  if (file.size > 10 * 1024 * 1024) { // 10MB 이상
    warnings.push('큰 파일은 처리 시간이 오래 걸릴 수 있습니다');
  }

  const ext = '.' + file.name.split('.').pop()?.toLowerCase();
  if (ext === '.pdf' && file.size > 25 * 1024 * 1024) { // PDF 25MB 이상
    warnings.push('큰 PDF 파일은 텍스트 추출에 시간이 오래 걸릴 수 있습니다');
  }

  return { valid: true, warnings };
};

/**
 * 문서 업로드 및 데이터베이스 저장
 */
export const uploadDocument = async (
  file: File,
  collectionId: string
): Promise<UploadResult> => {
  try {
    // 파일 검증
    const validation = validateFileExtended(file);
    if (!validation.valid) {
      handleUserError(validation.error || '파일 검증 실패');
      collectUserFeedback('file_validation', false, { 
        fileName: file.name, 
        fileSize: file.size,
        error: validation.error 
      });
      
      return {
        file,
        success: false,
        error: validation.error
      };
    }

    // 검증 성공 시 경고사항 표시
    if (validation.warnings && validation.warnings.length > 0) {
      validation.warnings.forEach(warning => {
        console.warn(`파일 ${file.name}: ${warning}`);
      });
    }

    // 현재 사용자 정보 가져오기
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return {
        file,
        success: false,
        error: '인증되지 않은 사용자입니다'
      };
    }

    // 파일 정보로 문서 레코드 생성
    const { data: document, error: docError } = await supabase
      .from('documents')
      .insert({
        collection_id: collectionId,
        filename: file.name,
        original_filename: file.name,
        file_type: file.type || 'application/octet-stream',
        file_size: file.size,
        processing_status: 'pending',
        created_by: user.id,
        metadata: {
          upload_timestamp: new Date().toISOString(),
          original_size: file.size
        }
      })
      .select()
      .single();

    if (docError) {
      throw new Error(`문서 레코드 생성 실패: ${docError.message}`);
    }

    return {
      file,
      success: true,
      document_id: document.id
    };
  } catch (error) {
    console.error('문서 업로드 오류:', error);
    return {
      file,
      success: false,
      error: error instanceof Error ? error.message : '알 수 없는 오류'
    };
  }
};

/**
 * 파일 처리 통합 서비스 클래스 (메모리 최적화)
 */
export class FileProcessingService {
  private progressCallbacks: Map<string, (progress: UploadProgress) => void> = new Map();
  private processingQueue: Map<string, AbortController> = new Map();
  private memoryMonitor = {
    maxMemoryMB: 100,
    currentUsageMB: 0,
    activeProcesses: 0
  };
  private lastProgressUpdate: Map<string, number> = new Map();

  /**
   * 메모리 사용량 모니터링
   */
  private updateMemoryUsage(delta: number): void {
    this.memoryMonitor.currentUsageMB += delta;
    
    if (this.memoryMonitor.currentUsageMB > this.memoryMonitor.maxMemoryMB) {
      console.warn(`메모리 사용량 초과: ${this.memoryMonitor.currentUsageMB}MB / ${this.memoryMonitor.maxMemoryMB}MB`);
    }
  }

  /**
   * 리소스 정리
   */
  private cleanupResources(progressId: string): void {
    this.progressCallbacks.delete(progressId);
    
    const abortController = this.processingQueue.get(progressId);
    if (abortController) {
      abortController.abort();
      this.processingQueue.delete(progressId);
    }
    
    this.memoryMonitor.activeProcesses = Math.max(0, this.memoryMonitor.activeProcesses - 1);
    
    // 가비지 컬렉션 힌트
    if ((global as any).gc && this.memoryMonitor.activeProcesses === 0) {
      (global as any).gc();
    }
  }

  /**
   * 처리 대기열 관리
   */
  private async waitForAvailableSlot(): Promise<void> {
    const maxConcurrentProcesses = 3;
    
    while (this.memoryMonitor.activeProcesses >= maxConcurrentProcesses) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  /**
   * 진행률 업데이트 (스로틀링 적용)
   */
  private updateProgress(progressId: string, progress: UploadProgress): void {
    const callback = this.progressCallbacks.get(progressId);
    if (callback) {
      // 진행률 업데이트 스로틀링 (100ms 간격)
      const now = Date.now();
      const lastUpdate = this.lastProgressUpdate.get(progressId) || 0;
      
      if (now - lastUpdate >= 100 || progress.status === 'completed' || progress.status === 'failed') {
        callback(progress);
        this.lastProgressUpdate.set(progressId, now);
      }
    }
  }

  /**
   * 단일 파일 업로드 및 처리 (메모리 최적화)
   */
  async uploadAndProcessFile(
    file: File,
    collectionId: string,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<{ uploadResult: UploadResult; processingResult?: ProcessingResult }> {
    const progressId = `${file.name}_${Date.now()}`;
    const abortController = new AbortController();
    
    // 처리 대기열에 추가
    await this.waitForAvailableSlot();
    this.processingQueue.set(progressId, abortController);
    this.memoryMonitor.activeProcesses++;
    
    if (onProgress) {
      this.progressCallbacks.set(progressId, onProgress);
    }

    try {
      // 파일 크기 기반 메모리 사용량 추정
      const estimatedMemoryMB = Math.ceil(file.size / (1024 * 1024)) * 2; // 파일 크기의 2배로 추정
      this.updateMemoryUsage(estimatedMemoryMB);

      // 1단계: 파일 검증
      this.updateProgress(progressId, {
        file_name: file.name,
        status: 'uploading',
        progress: 10
      });

      const validation = validateFileExtended(file);
      if (!validation.valid) {
        const result = {
          uploadResult: {
            file,
            success: false,
            error: validation.error
          }
        };
        
        this.updateProgress(progressId, {
          file_name: file.name,
          status: 'failed',
          progress: 0,
          error: validation.error
        });
        
        return result;
      }

      // 2단계: 파일 업로드
      this.updateProgress(progressId, {
        file_name: file.name,
        status: 'uploading',
        progress: 25
      });

      const uploadResult = await uploadDocument(file, collectionId);
      
      if (!uploadResult.success || !uploadResult.document_id) {
        this.updateProgress(progressId, {
          file_name: file.name,
          status: 'failed',
          progress: 0,
          error: uploadResult.error
        });
        
        return { uploadResult };
      }

      // 3단계: 텍스트 추출 및 처리
      this.updateProgress(progressId, {
        file_name: file.name,
        status: 'processing',
        progress: 50
      });

      const processingResult = await executeWithRetry(
        () => processUploadedDocument(
          uploadResult.document_id,
          file,
          {
            enableVectorGeneration: true,
            onProgress: (progress: ProcessingProgress) => {
              this.updateProgress(progressId, {
                file_name: file.name,
                status: 'processing',
                progress: 50 + (progress.progress * 0.5), // 50-100% 범위로 매핑
                error: progress.stage === 'failed' ? progress.message : undefined
              });
            }
          }
        ),
        {
          operationName: 'processUploadedDocument',
          errorType: ErrorType.FILE_PROCESSING,
          userMessage: `"${file.name}" 파일 처리 중 오류가 발생했습니다.`,
          metadata: { fileName: file.name, fileSize: file.size }
        }
      );

      // 최종 상태 업데이트
      this.updateProgress(progressId, {
        file_name: file.name,
        status: processingResult.success ? 'completed' : 'failed',
        progress: processingResult.success ? 100 : 50,
        error: processingResult.error
      });

      return { uploadResult, processingResult };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
      
      this.updateProgress(progressId, {
        file_name: file.name,
        status: 'failed',
        progress: 0,
        error: errorMessage
      });

      return {
        uploadResult: {
          file,
          success: false,
          error: errorMessage
        }
      };
    } finally {
      // 메모리 사용량 복원
      const estimatedMemoryMB = Math.ceil(file.size / (1024 * 1024)) * 2;
      this.updateMemoryUsage(-estimatedMemoryMB);
      
      // 리소스 정리
      this.cleanupResources(progressId);
    }
  }

  /**
   * 여러 파일 일괄 업로드 및 처리 (동적 배치 크기)
   */
  async uploadAndProcessFiles(
    files: File[],
    collectionId: string,
    onProgress?: (progress: UploadProgress[]) => void
  ): Promise<Array<{ uploadResult: UploadResult; processingResult?: ProcessingResult }>> {
    const results: Array<{ uploadResult: UploadResult; processingResult?: ProcessingResult }> = [];
    const progressList: UploadProgress[] = files.map(file => ({
      file_name: file.name,
      status: 'uploading',
      progress: 0
    }));

    // 파일 크기 기반 동적 배치 크기 계산
    const totalSize = files.reduce((sum, file) => sum + file.size, 0);
    const avgFileSize = totalSize / files.length;
    const concurrencyLimit = this.calculateOptimalConcurrency(avgFileSize);
    
    console.log(`파일 ${files.length}개 처리 시작 (동시 처리: ${concurrencyLimit}개)`);

    // 파일을 배치로 분할
    const batches: File[][] = [];
    for (let i = 0; i < files.length; i += concurrencyLimit) {
      batches.push(files.slice(i, i + concurrencyLimit));
    }

    for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
      const batch = batches[batchIndex];
      
      console.log(`배치 ${batchIndex + 1}/${batches.length} 처리 중... (${batch.length}개 파일)`);
      
      const batchPromises = batch.map(async (file, fileIndex) => {
        const globalIndex = results.length + fileIndex;
        
        try {
          const result = await this.uploadAndProcessFile(
            file,
            collectionId,
            (progress) => {
              progressList[globalIndex] = progress;
              onProgress?.(progressList);
            }
          );

          return result;
        } catch (error) {
          console.error(`파일 ${file.name} 처리 실패:`, error);
          return {
            uploadResult: {
              file,
              success: false,
              error: error instanceof Error ? error.message : '알 수 없는 오류'
            }
          };
        }
      });

      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
      
      // 배치 간 메모리 정리를 위한 짧은 대기
      if (batchIndex < batches.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    console.log(`전체 파일 처리 완료: ${results.length}개`);
    return results;
  }

  /**
   * 파일 크기 기반 최적 동시 처리 수 계산
   */
  private calculateOptimalConcurrency(avgFileSize: number): number {
    // 파일 크기에 따른 동시 처리 수 조정
    if (avgFileSize > 20 * 1024 * 1024) { // 20MB 이상
      return 1;
    } else if (avgFileSize > 10 * 1024 * 1024) { // 10MB 이상
      return 2;
    } else if (avgFileSize > 5 * 1024 * 1024) { // 5MB 이상
      return 3;
    } else {
      return 4; // 작은 파일들
    }
  }
}

// 싱글톤 인스턴스 생성
export const fileProcessingService = new FileProcessingService();