// 문서 관리 서비스
import { supabase } from '@/integrations/supabase/client';
import type {
  Document,
  DocumentChunk,
  DocumentFilters,
  UploadResult,
  ProcessingResult,
  UploadProgress
} from '@/types/vector';
import { SUPPORTED_FILE_TYPES } from '@/types/vector';

/**
 * 파일 타입 검증
 */
export const validateFileType = (file: File): { valid: boolean; error?: string } => {
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

  return { valid: true };
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
    const validation = validateFileType(file);
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
 * 여러 문서 일괄 업로드
 */
export const uploadDocuments = async (
  files: File[],
  collectionId: string,
  onProgress?: (progress: UploadProgress[]) => void
): Promise<UploadResult[]> => {
  const results: UploadResult[] = [];
  const progressList: UploadProgress[] = files.map(file => ({
    file_name: file.name,
    status: 'uploading',
    progress: 0
  }));

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    
    // 진행률 업데이트
    progressList[i] = {
      file_name: file.name,
      status: 'uploading',
      progress: 0
    };
    onProgress?.(progressList);

    try {
      const result = await uploadDocument(file, collectionId);
      results.push(result);

      // 업로드 완료 상태 업데이트
      progressList[i] = {
        file_name: file.name,
        status: result.success ? 'completed' : 'failed',
        progress: 100,
        error: result.error
      };
      onProgress?.(progressList);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
      results.push({
        file,
        success: false,
        error: errorMessage
      });

      progressList[i] = {
        file_name: file.name,
        status: 'failed',
        progress: 0,
        error: errorMessage
      };
      onProgress?.(progressList);
    }
  }

  return results;
};

/**
 * 문서 처리 (텍스트 추출 및 청킹)
 */
export const processDocument = async (
  documentId: string,
  file: File
): Promise<ProcessingResult> => {
  const startTime = Date.now();

  try {
    // 문서 상태를 처리 중으로 변경
    await supabase
      .from('documents')
      .update({ processing_status: 'processing' })
      .eq('id', documentId);

    // 텍스트 추출
    const text = await extractTextFromFile(file);
    
    // 텍스트를 청크로 분할
    const chunks = splitTextIntoChunks(text);

    if (chunks.length === 0) {
      throw new Error('추출된 텍스트가 없습니다');
    }

    // 문서 내용 및 청크 수 업데이트
    await supabase
      .from('documents')
      .update({
        content: text,
        chunk_count: chunks.length,
        processing_status: 'completed'
      })
      .eq('id', documentId);

    // 청크들을 데이터베이스에 저장
    const chunkInserts = chunks.map((content, index) => ({
      document_id: documentId,
      chunk_index: index,
      content,
      metadata: {
        length: content.length,
        created_at: new Date().toISOString()
      }
    }));

    const { error: chunkError } = await supabase
      .from('document_chunks')
      .insert(chunkInserts);

    if (chunkError) {
      throw new Error(`청크 저장 실패: ${chunkError.message}`);
    }

    const processingTime = Date.now() - startTime;

    return {
      document_id: documentId,
      success: true,
      chunks_created: chunks.length,
      processing_time_ms: processingTime
    };

  } catch (error) {
    console.error('문서 처리 오류:', error);
    
    // 오류 상태로 업데이트
    const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
    await supabase
      .from('documents')
      .update({
        processing_status: 'failed',
        error_message: errorMessage
      })
      .eq('id', documentId);

    return {
      document_id: documentId,
      success: false,
      chunks_created: 0,
      error: errorMessage,
      processing_time_ms: Date.now() - startTime
    };
  }
};

/**
 * 문서 목록 조회
 */
export const getDocuments = async (
  collectionId?: string,
  filters?: DocumentFilters
): Promise<Document[]> => {
  try {
    let query = supabase
      .from('documents')
      .select('*');

    if (collectionId) {
      query = query.eq('collection_id', collectionId);
    }

    // 필터 적용
    if (filters?.file_type) {
      query = query.eq('file_type', filters.file_type);
    }

    if (filters?.processing_status) {
      query = query.eq('processing_status', filters.processing_status);
    }

    if (filters?.created_by) {
      query = query.eq('created_by', filters.created_by);
    }

    if (filters?.search) {
      query = query.or(`filename.ilike.%${filters.search}%,original_filename.ilike.%${filters.search}%`);
    }

    if (filters?.date_from) {
      query = query.gte('created_at', filters.date_from);
    }

    if (filters?.date_to) {
      query = query.lte('created_at', filters.date_to);
    }

    // 정렬
    const sortBy = filters?.sort_by || 'created_at';
    const sortOrder = filters?.sort_order || 'desc';
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });

    const { data, error } = await query;

    if (error) {
      throw new Error(`문서 조회 실패: ${error.message}`);
    }

    return data || [];
  } catch (error) {
    console.error('문서 조회 오류:', error);
    throw error;
  }
};

/**
 * 특정 문서 조회
 */
export const getDocumentById = async (id: string): Promise<Document> => {
  try {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      throw new Error(`문서 조회 실패: ${error.message}`);
    }

    if (!data) {
      throw new Error('문서를 찾을 수 없습니다');
    }

    return data;
  } catch (error) {
    console.error('문서 조회 오류:', error);
    throw error;
  }
};

/**
 * 문서 삭제
 */
export const deleteDocument = async (id: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('documents')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`문서 삭제 실패: ${error.message}`);
    }
  } catch (error) {
    console.error('문서 삭제 오류:', error);
    throw error;
  }
};

/**
 * 문서 일괄 삭제
 */
export const bulkDeleteDocuments = async (ids: string[]): Promise<void> => {
  try {
    if (ids.length === 0) {
      return;
    }

    const { error } = await supabase
      .from('documents')
      .delete()
      .in('id', ids);

    if (error) {
      throw new Error(`문서 일괄 삭제 실패: ${error.message}`);
    }
  } catch (error) {
    console.error('문서 일괄 삭제 오류:', error);
    throw error;
  }
};

/**
 * 문서 청크 조회
 */
export const getDocumentChunks = async (documentId: string): Promise<DocumentChunk[]> => {
  try {
    const { data, error } = await supabase
      .from('document_chunks')
      .select('*')
      .eq('document_id', documentId)
      .order('chunk_index', { ascending: true });

    if (error) {
      throw new Error(`문서 청크 조회 실패: ${error.message}`);
    }

    return data || [];
  } catch (error) {
    console.error('문서 청크 조회 오류:', error);
    throw error;
  }
};

/**
 * 청크 내용 수정
 */
export const updateChunk = async (chunkId: string, content: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('document_chunks')
      .update({
        content: content.trim(),
        metadata: {
          ...{}, // 기존 메타데이터 유지
          modified_at: new Date().toISOString(),
          length: content.trim().length
        }
      })
      .eq('id', chunkId);

    if (error) {
      throw new Error(`청크 수정 실패: ${error.message}`);
    }
  } catch (error) {
    console.error('청크 수정 오류:', error);
    throw error;
  }
};

/**
 * 문서 재처리
 */
export const reprocessDocument = async (documentId: string): Promise<void> => {
  try {
    // 기존 청크 삭제
    await supabase
      .from('document_chunks')
      .delete()
      .eq('document_id', documentId);

    // 문서 상태를 대기 중으로 변경
    await supabase
      .from('documents')
      .update({
        processing_status: 'pending',
        error_message: null,
        chunk_count: 0
      })
      .eq('id', documentId);

  } catch (error) {
    console.error('문서 재처리 오류:', error);
    throw error;
  }
};

/**
 * 처리 대기 중인 문서 목록 조회
 */
export const getPendingDocuments = async (): Promise<Document[]> => {
  return getDocuments(undefined, { processing_status: 'pending' });
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
 * 파일 검증 (확장된 검증)
 */
export const validateFileExtended = (file: File): { valid: boolean; error?: string; warnings?: string[] } => {
  const warnings: string[] = [];
  
  // 기본 파일 타입 검증
  const basicValidation = validateFileType(file);
  if (!basicValidation.valid) {
    return basicValidation;
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

  const extension = '.' + file.name.split('.').pop()?.toLowerCase();
  if (extension === '.pdf' && file.size > 25 * 1024 * 1024) { // PDF 25MB 이상
    warnings.push('큰 PDF 파일은 텍스트 추출에 시간이 오래 걸릴 수 있습니다');
  }

  return { valid: true, warnings };
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
 * 배치 처리를 위한 청크 분할 (메모리 효율적)
 */
export const splitTextIntoChunksBatch = (
  text: string,
  chunkSize: number = 1000,
  overlap: number = 200,
  batchSize: number = 100
): string[][] => {
  const allChunks = splitTextIntoChunks(text, chunkSize, overlap);
  const batches: string[][] = [];

  for (let i = 0; i < allChunks.length; i += batchSize) {
    batches.push(allChunks.slice(i, i + batchSize));
  }

  return batches;
};

/**
 * 문서 처리 상태 업데이트
 */
const updateDocumentStatus = async (
  documentId: string,
  status: 'pending' | 'processing' | 'completed' | 'failed',
  additionalData?: Partial<Document>
): Promise<void> => {
  try {
    const updateData: any = {
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
    // 상태 업데이트 실패는 치명적이지 않으므로 에러를 던지지 않음
  }
};

/**
 * 스토리지에서 파일 삭제
 */
const deleteFileFromStorage = async (storagePath: string): Promise<void> => {
  try {
    const { error } = await supabase.storage
      .from('vector-documents')
      .remove([storagePath]);

    if (error) {
      console.error('스토리지 파일 삭제 실패:', error);
    }
  } catch (error) {
    console.error('스토리지 파일 삭제 오류:', error);
  }
};

/**
 * 파일 크기 포맷팅 유틸리티
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * 파일 타입 아이콘 가져오기
 */
export const getFileTypeIcon = (fileType: string): string => {
  if (fileType.includes('pdf')) return '📄';
  if (fileType.includes('text')) return '📝';
  if (fileType.includes('html')) return '🌐';
  if (fileType.includes('word') || fileType.includes('docx')) return '📘';
  if (fileType.includes('markdown')) return '📋';
  return '📄';
};

/**
 * 파일 MIME 타입 검증
 */
export const validateMimeType = (file: File): boolean => {
  const extension = '.' + file.name.split('.').pop()?.toLowerCase();
  const expectedMimeTypes = Object.values(SUPPORTED_FILE_TYPES)
    .filter(config => config.extension === extension)
    .map(config => config.mimeType);

  if (expectedMimeTypes.length === 0) {
    return false;
  }

  // MIME 타입이 비어있거나 일반적인 경우 확장자로 판단
  if (!file.type || file.type === 'application/octet-stream') {
    return true;
  }

  return expectedMimeTypes.includes(file.type);
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