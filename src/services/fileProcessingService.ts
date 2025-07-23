// 파일 업로드 및 텍스트 추출 서비스
import { supabase } from '@/integrations/supabase/client';
import type {
  Document,
  UploadResult,
  ProcessingResult,
  UploadProgress,
  FileType
} from '@/types/vector';
import { SUPPORTED_FILE_TYPES } from '@/types/vector';
import { generateAndStoreDocumentVectors, type VectorGenerationOptions } from './vectorGenerationService';

/**
 * 파일 타입 검증 (확장된 검증)
 */
export const validateFileExtended = (file: File): { valid: boolean; error?: string; warnings?: string[] } => {
  const warnings: string[] = [];
  
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

  const [type, config] = fileType;
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

  if (extension === '.pdf' && file.size > 25 * 1024 * 1024) { // PDF 25MB 이상
    warnings.push('큰 PDF 파일은 텍스트 추출에 시간이 오래 걸릴 수 있습니다');
  }

  return { valid: true, warnings };
};

/**
 * PDF 텍스트 추출
 */
const extractTextFromPDF = async (file: File): Promise<string> => {
  try {
    const pdfParse = (await import('pdf-parse')).default;
    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);
    const data = await pdfParse(buffer);
    return data.text;
  } catch (error) {
    console.error('PDF 텍스트 추출 오류:', error);
    throw new Error('PDF 파일에서 텍스트를 추출할 수 없습니다');
  }
};

/**
 * DOCX 텍스트 추출
 */
const extractTextFromDOCX = async (file: File): Promise<string> => {
  try {
    const mammoth = await import('mammoth');
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value;
  } catch (error) {
    console.error('DOCX 텍스트 추출 오류:', error);
    throw new Error('DOCX 파일에서 텍스트를 추출할 수 없습니다');
  }
};

/**
 * HTML 텍스트 추출
 */
const extractTextFromHTML = (htmlContent: string): string => {
  try {
    // DOM 파서를 사용하여 HTML 태그 제거
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');
    
    // 스크립트와 스타일 태그 제거
    const scripts = doc.querySelectorAll('script, style');
    scripts.forEach(el => el.remove());
    
    // 텍스트 내용만 추출
    const textContent = doc.body?.textContent || doc.textContent || '';
    
    // 여러 공백을 하나로 정리하고 줄바꿈 정리
    return textContent
      .replace(/\s+/g, ' ')
      .replace(/\n\s*\n/g, '\n')
      .trim();
  } catch (error) {
    console.error('HTML 텍스트 추출 오류:', error);
    throw new Error('HTML 파일에서 텍스트를 추출할 수 없습니다');
  }
};

/**
 * 텍스트 추출 (브라우저 기반)
 */
export const extractTextFromFile = async (file: File): Promise<string> => {
  const extension = '.' + file.name.split('.').pop()?.toLowerCase();
  
  try {
    switch (extension) {
      case '.txt':
      case '.md':
        const textContent = await file.text();
        return textContent.trim();
      
      case '.html':
        const htmlText = await file.text();
        return extractTextFromHTML(htmlText);
      
      case '.pdf':
        return await extractTextFromPDF(file);
      
      case '.docx':
        return await extractTextFromDOCX(file);
      
      default:
        throw new Error(`지원되지 않는 파일 형식: ${extension}`);
    }
  } catch (error) {
    console.error('텍스트 추출 오류:', error);
    throw new Error(`텍스트 추출 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
  }
};

/**
 * 안전한 텍스트 추출 (재시도 포함)
 */
export const extractTextFromFileSafe = async (file: File): Promise<string> => {
  return retryWithBackoff(async () => {
    try {
      const text = await extractTextFromFile(file);
      
      // 추출된 텍스트 검증
      if (!text || text.trim().length === 0) {
        throw new Error('파일에서 텍스트를 추출할 수 없습니다');
      }

      // 텍스트 길이 제한 (1MB = 약 1,000,000자)
      if (text.length > 1000000) {
        console.warn('텍스트가 매우 큽니다. 처리 시간이 오래 걸릴 수 있습니다.');
      }

      return text;
    } catch (error) {
      console.error('텍스트 추출 실패:', error);
      throw error;
    }
  }, 2, 2000); // 최대 2번 재시도, 2초 간격
};

/**
 * 텍스트를 청크로 분할
 */
export const splitTextIntoChunks = (
  text: string,
  chunkSize: number = 1000,
  overlap: number = 200
): string[] => {
  if (!text || text.trim().length === 0) {
    return [];
  }

  const chunks: string[] = [];
  let start = 0;

  while (start < text.length) {
    let end = start + chunkSize;
    
    // 문장 경계에서 자르기 시도
    if (end < text.length) {
      const sentenceEnd = text.lastIndexOf('.', end);
      const questionEnd = text.lastIndexOf('?', end);
      const exclamationEnd = text.lastIndexOf('!', end);
      
      const bestEnd = Math.max(sentenceEnd, questionEnd, exclamationEnd);
      if (bestEnd > start + chunkSize * 0.5) {
        end = bestEnd + 1;
      }
    }

    const chunk = text.slice(start, end).trim();
    if (chunk.length > 0) {
      chunks.push(chunk);
    }

    // 다음 청크 시작점 계산 (오버랩 고려)
    start = Math.max(start + chunkSize - overlap, end);
    
    // 무한 루프 방지
    if (start >= text.length) {
      break;
    }
  }

  return chunks;
};

/**
 * Supabase Storage에 파일 업로드
 */
const uploadFileToStorage = async (file: File, documentId: string): Promise<string> => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${documentId}.${fileExt}`;
    const filePath = `documents/${fileName}`;

    const { data, error } = await supabase.storage
      .from('vector-documents')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      throw new Error(`파일 저장 실패: ${error.message}`);
    }

    return data.path;
  } catch (error) {
    console.error('파일 저장 오류:', error);
    throw error;
  }
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
      return {
        file,
        success: false,
        error: validation.error
      };
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

    // Supabase Storage에 파일 업로드
    try {
      const storagePath = await uploadFileToStorage(file, document.id);
      
      // 문서 레코드에 저장 경로 업데이트
      await supabase
        .from('documents')
        .update({
          metadata: {
            ...document.metadata,
            storage_path: storagePath
          }
        })
        .eq('id', document.id);

    } catch (storageError) {
      // 스토리지 업로드 실패 시 문서 레코드 삭제
      await supabase
        .from('documents')
        .delete()
        .eq('id', document.id);
      
      throw storageError;
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
 * 문서 처리 진행률 계산
 */
export const calculateProcessingProgress = (
  currentStep: 'upload' | 'text_extraction' | 'chunking' | 'storage',
  totalSteps: number = 4
): number => {
  const stepProgress = {
    upload: 25,
    text_extraction: 50,
    chunking: 75,
    storage: 100
  };

  return stepProgress[currentStep] || 0;
};

/**
 * 재시도 로직 (백오프 전략 포함)
 */
const retryWithBackoff = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  baseDelayMs: number = 1000
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
      console.warn(`작업 실패 (시도 ${attempt + 1}/${maxRetries + 1}), ${delay}ms 후 재시도:`, lastError.message);
      
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw new Error(`${maxRetries + 1}번 시도 후 실패: ${lastError.message}`);
};

/**
 * 파일 처리 통합 서비스 클래스
 */
export class FileProcessingService {
  private progressCallbacks: Map<string, (progress: UploadProgress) => void> = new Map();

  /**
   * 단일 파일 업로드 및 처리
   */
  async uploadAndProcessFile(
    file: File,
    collectionId: string,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<{ uploadResult: UploadResult; processingResult?: ProcessingResult }> {
    const progressId = `${file.name}_${Date.now()}`;
    
    if (onProgress) {
      this.progressCallbacks.set(progressId, onProgress);
    }

    try {
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

      const processingResult = await this.processUploadedDocument(
        uploadResult.document_id,
        file,
        progressId
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
      // 콜백 정리
      this.progressCallbacks.delete(progressId);
    }
  }

  /**
   * 여러 파일 일괄 업로드 및 처리
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

    // 동시 처리 제한 (최대 3개 파일 동시 처리)
    const concurrencyLimit = 3;
    const batches: File[][] = [];
    
    for (let i = 0; i < files.length; i += concurrencyLimit) {
      batches.push(files.slice(i, i + concurrencyLimit));
    }

    for (const batch of batches) {
      const batchPromises = batch.map(async (file, batchIndex) => {
        const globalIndex = results.length + batchIndex;
        
        const result = await this.uploadAndProcessFile(
          file,
          collectionId,
          (progress) => {
            progressList[globalIndex] = progress;
            onProgress?.(progressList);
          }
        );

        return result;
      });

      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
    }

    return results;
  }

  /**
   * 업로드된 문서 처리
   */
  private async processUploadedDocument(
    documentId: string,
    file: File,
    progressId: string
  ): Promise<ProcessingResult> {
    const startTime = Date.now();

    try {
      // 문서 상태를 처리 중으로 변경
      await this.updateDocumentStatus(documentId, 'processing');

      // 텍스트 추출
      this.updateProgress(progressId, {
        file_name: file.name,
        status: 'processing',
        progress: calculateProcessingProgress('text_extraction')
      });

      const text = await extractTextFromFileSafe(file);
      
      if (!text || text.trim().length === 0) {
        throw new Error('파일에서 텍스트를 추출할 수 없습니다');
      }

      // 벡터 생성 및 저장 (새로운 통합 서비스 사용)
      this.updateProgress(progressId, {
        file_name: file.name,
        status: 'processing',
        progress: calculateProcessingProgress('chunking')
      });

      const vectorOptions: VectorGenerationOptions = {
        provider: 'auto', // Claude 우선, 실패 시 OpenAI
        enableFallback: true,
        validateResults: true,
        onProgress: (step, progress, total) => {
          const overallProgress = 50 + Math.floor((progress / total) * 40);
          this.updateProgress(progressId, {
            file_name: file.name,
            status: 'processing',
            progress: overallProgress
          });
        }
      };

      const vectorResult = await generateAndStoreDocumentVectors(
        documentId,
        text,
        vectorOptions
      );

      if (!vectorResult.success) {
        throw new Error(vectorResult.error || '벡터 생성에 실패했습니다');
      }

      // 문서 내용 및 메타데이터 업데이트
      await supabase
        .from('documents')
        .update({
          content: text.substring(0, 50000), // 내용 미리보기 (50KB 제한)
          chunk_count: vectorResult.chunking.metadata.totalChunks,
          processing_status: 'completed',
          metadata: {
            text_length: text.length,
            chunk_count: vectorResult.chunking.metadata.totalChunks,
            vectors_generated: vectorResult.vectorsGenerated,
            vectors_stored: vectorResult.vectorsStored,
            chunking_strategy: vectorResult.chunking.metadata.strategy,
            embedding_provider: vectorResult.provider,
            processing_completed_at: new Date().toISOString(),
            warnings: vectorResult.warnings
          }
        })
        .eq('id', documentId);

      const processingTime = Date.now() - startTime;

      return {
        document_id: documentId,
        success: true,
        chunks_created: vectorResult.chunking.metadata.totalChunks,
        processing_time_ms: processingTime
      };

    } catch (error) {
      console.error('문서 처리 오류:', error);
      
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
      
      // 오류 상태로 업데이트
      await this.updateDocumentStatus(documentId, 'failed', {
        error_message: errorMessage
      });

      return {
        document_id: documentId,
        success: false,
        chunks_created: 0,
        error: errorMessage,
        processing_time_ms: Date.now() - startTime
      };
    }
  }

  /**
   * 청크를 배치로 저장 (메모리 효율성)
   */
  private async saveChunksInBatches(
    documentId: string,
    chunks: string[],
    batchSize: number = 50
  ): Promise<void> {
    for (let i = 0; i < chunks.length; i += batchSize) {
      const batch = chunks.slice(i, i + batchSize);
      
      const chunkInserts = batch.map((content, batchIndex) => ({
        document_id: documentId,
        chunk_index: i + batchIndex,
        content,
        metadata: {
          length: content.length,
          created_at: new Date().toISOString(),
          batch_number: Math.floor(i / batchSize)
        }
      }));

      const { error } = await supabase
        .from('document_chunks')
        .insert(chunkInserts);

      if (error) {
        throw new Error(`청크 배치 저장 실패 (배치 ${Math.floor(i / batchSize)}): ${error.message}`);
      }
    }
  }

  /**
   * 문서 상태 업데이트
   */
  private async updateDocumentStatus(
    documentId: string,
    status: 'pending' | 'processing' | 'completed' | 'failed',
    additionalData?: any
  ): Promise<void> {
    try {
      const updateData = {
        processing_status: status,
        updated_at: new Date().toISOString(),
        ...additionalData
      };

      await supabase
        .from('documents')
        .update(updateData)
        .eq('id', documentId);
    } catch (error) {
      console.error('문서 상태 업데이트 실패:', error);
    }
  }

  /**
   * 진행률 업데이트
   */
  private updateProgress(progressId: string, progress: UploadProgress): void {
    const callback = this.progressCallbacks.get(progressId);
    if (callback) {
      callback(progress);
    }
  }

  /**
   * 실패한 문서 재처리
   */
  async reprocessFailedDocument(documentId: string): Promise<ProcessingResult> {
    try {
      // 문서 정보 조회
      const { data: document, error } = await supabase
        .from('documents')
        .select('*')
        .eq('id', documentId)
        .single();

      if (error || !document) {
        throw new Error('문서를 찾을 수 없습니다');
      }

      // 스토리지에서 파일 다운로드
      const storagePath = document.metadata?.storage_path;
      if (!storagePath) {
        throw new Error('저장된 파일을 찾을 수 없습니다');
      }

      const { data: fileData, error: downloadError } = await supabase.storage
        .from('vector-documents')
        .download(storagePath);

      if (downloadError || !fileData) {
        throw new Error('파일 다운로드 실패');
      }

      // File 객체 재생성
      const file = new File([fileData], document.original_filename, {
        type: document.file_type
      });

      // 기존 청크 삭제
      await supabase
        .from('document_chunks')
        .delete()
        .eq('document_id', documentId);

      // 재처리
      return await this.processUploadedDocument(documentId, file, `reprocess_${documentId}`);

    } catch (error) {
      console.error('문서 재처리 오류:', error);
      
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
      
      await this.updateDocumentStatus(documentId, 'failed', {
        error_message: errorMessage
      });

      return {
        document_id: documentId,
        success: false,
        chunks_created: 0,
        error: errorMessage,
        processing_time_ms: 0
      };
    }
  }

  /**
   * 처리 통계 조회
   */
  async getProcessingStats(): Promise<{
    total_documents: number;
    pending_documents: number;
    processing_documents: number;
    completed_documents: number;
    failed_documents: number;
    total_chunks: number;
    avg_processing_time: number;
  }> {
    try {
      const { data: documents, error } = await supabase
        .from('documents')
        .select('processing_status, chunk_count, metadata');

      if (error) {
        throw new Error(`통계 조회 실패: ${error.message}`);
      }

      const stats = {
        total_documents: documents.length,
        pending_documents: 0,
        processing_documents: 0,
        completed_documents: 0,
        failed_documents: 0,
        total_chunks: 0,
        avg_processing_time: 0
      };

      let totalProcessingTime = 0;
      let processedCount = 0;

      documents.forEach(doc => {
        switch (doc.processing_status) {
          case 'pending':
            stats.pending_documents++;
            break;
          case 'processing':
            stats.processing_documents++;
            break;
          case 'completed':
            stats.completed_documents++;
            stats.total_chunks += doc.chunk_count || 0;
            break;
          case 'failed':
            stats.failed_documents++;
            break;
        }

        // 처리 시간 계산 (메타데이터에서)
        if (doc.metadata?.processing_time_ms) {
          totalProcessingTime += doc.metadata.processing_time_ms;
          processedCount++;
        }
      });

      if (processedCount > 0) {
        stats.avg_processing_time = Math.round(totalProcessingTime / processedCount);
      }

      return stats;
    } catch (error) {
      console.error('처리 통계 조회 오류:', error);
      throw error;
    }
  }
}

// 싱글톤 인스턴스 생성
export const fileProcessingService = new FileProcessingService();