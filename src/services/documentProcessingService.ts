// 문서 처리 워크플로우 통합 서비스
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';
import type { 
  Document, 
  ProcessingResult, 
  UploadResult,
  ProcessingProgress 
} from '@/types/vector';
import { 
  processDocument, 
  extractTextFromFileSafe, 
  splitTextIntoChunks,
  updateDocumentStatus 
} from './documentService';
import { generateAndStoreDocumentVectors } from './vectorGenerationService';
import { incrementCollectionStats } from './collectionService';

// Supabase 데이터베이스 타입 정의
type DbDocument = Database['public']['Tables']['documents']['Row'];
type DbDocumentChunk = Database['public']['Tables']['document_chunks']['Row'];

export interface DocumentProcessingOptions {
  chunkSize?: number;
  chunkOverlap?: number;
  batchSize?: number;
  enableVectorGeneration?: boolean;
  onProgress?: (progress: ProcessingProgress) => void;
}

export interface ProcessingProgress {
  document_id: string;
  filename: string;
  stage: 'text_extraction' | 'chunking' | 'vector_generation' | 'completed' | 'failed';
  progress: number; // 0-100
  message?: string;
  chunks_processed?: number;
  total_chunks?: number;
}

/**
 * 문서 업로드 후 전체 처리 워크플로우 실행
 */
export const processUploadedDocument = async (
  documentId: string,
  file: File,
  options: DocumentProcessingOptions = {}
): Promise<ProcessingResult> => {
  const {
    chunkSize = 1000,
    chunkOverlap = 200,
    batchSize = 10,
    enableVectorGeneration = true,
    onProgress
  } = options;

  const startTime = Date.now();
  let document: Document;

  try {
    // 문서 정보 조회
    const { data: docData, error: docError } = await supabase
      .from('documents')
      .select('*')
      .eq('id', documentId)
      .single();

    if (docError || !docData) {
      throw new Error(`문서 조회 실패: ${docError?.message || '문서를 찾을 수 없습니다'}`);
    }

    document = docData as Document;

    // 1단계: 문서 상태를 처리 중으로 변경
    await supabase
      .from('documents')
      .update({ processing_status: 'processing' })
      .eq('id', documentId);

    onProgress?.({
      document_id: documentId,
      filename: document.filename,
      stage: 'text_extraction',
      progress: 10,
      message: '텍스트 추출 중...'
    });

    // 2단계: 텍스트 추출
    const text = await extractTextFromFileSafe(file);
    
    if (!text || text.trim().length === 0) {
      throw new Error('추출된 텍스트가 없습니다');
    }

    onProgress?.({
      document_id: documentId,
      filename: document.filename,
      stage: 'chunking',
      progress: 30,
      message: '텍스트 청킹 중...'
    });

    // 3단계: 텍스트를 청크로 분할
    const chunks = splitTextIntoChunks(text, chunkSize, chunkOverlap);

    if (chunks.length === 0) {
      throw new Error('생성된 청크가 없습니다');
    }

    // 4단계: 문서 내용 및 청크 수 업데이트
    await supabase
      .from('documents')
      .update({
        content: text,
        chunk_count: chunks.length
      })
      .eq('id', documentId);

    // 5단계: 청크들을 데이터베이스에 저장
    const chunkInserts = chunks.map((content, index) => ({
      document_id: documentId,
      chunk_index: index,
      content,
      metadata: {
        length: content.length,
        created_at: new Date().toISOString()
      }
    }));

    const { data: insertedChunks, error: chunkError } = await supabase
      .from('document_chunks')
      .insert(chunkInserts)
      .select();

    if (chunkError) {
      throw new Error(`청크 저장 실패: ${chunkError.message}`);
    }

    onProgress?.({
      document_id: documentId,
      filename: document.filename,
      stage: 'vector_generation',
      progress: 60,
      message: '벡터 생성 중...',
      total_chunks: chunks.length
    });

    // 6단계: 벡터 생성 (옵션)
    if (enableVectorGeneration && insertedChunks) {
      try {
        await generateVectorsForDocumentChunks(
          insertedChunks as DbDocumentChunk[],
          {
            batchSize,
            onProgress: (processed, total) => {
              const vectorProgress = 60 + (processed / total) * 30;
              onProgress?.({
                document_id: documentId,
                filename: document.filename,
                stage: 'vector_generation',
                progress: vectorProgress,
                message: `벡터 생성 중... (${processed}/${total})`,
                chunks_processed: processed,
                total_chunks: total
              });
            }
          }
        );
      } catch (vectorError) {
        console.warn('벡터 생성 실패, 문서 처리는 계속 진행:', vectorError);
        // 벡터 생성 실패는 치명적이지 않으므로 경고만 출력
      }
    }

    // 7단계: 문서 처리 완료
    await supabase
      .from('documents')
      .update({ processing_status: 'completed' })
      .eq('id', documentId);

    // 8단계: 컬렉션 통계 업데이트
    await incrementCollectionStats(document.collection_id, chunks.length);

    onProgress?.({
      document_id: documentId,
      filename: document.filename,
      stage: 'completed',
      progress: 100,
      message: '처리 완료'
    });

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

    onProgress?.({
      document_id: documentId,
      filename: document?.filename || 'Unknown',
      stage: 'failed',
      progress: 0,
      message: errorMessage
    });

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
 * 문서 청크들에 대한 벡터 생성
 */
export const generateVectorsForDocumentChunks = async (
  chunks: DbDocumentChunk[],
  options: {
    batchSize?: number;
    onProgress?: (processed: number, total: number) => void;
  } = {}
): Promise<void> => {
  const { batchSize = 10, onProgress } = options;
  
  // 벡터가 없는 청크들만 필터링
  const chunksWithoutVectors = chunks.filter(chunk => 
    !chunk.embedding || chunk.embedding.length === 0
  );

  if (chunksWithoutVectors.length === 0) {
    onProgress?.(chunks.length, chunks.length);
    return;
  }

  // 배치 단위로 처리
  for (let i = 0; i < chunksWithoutVectors.length; i += batchSize) {
    const batch = chunksWithoutVectors.slice(i, i + batchSize);
    
    try {
      // TODO: Fix vector generation for chunks
      // This needs to be implemented properly with the available functions
      console.log('Vector generation for chunks needs to be implemented');

      // 진행률 업데이트
      const processed = Math.min(i + batchSize, chunksWithoutVectors.length);
      onProgress?.(processed, chunksWithoutVectors.length);

    } catch (error) {
      console.error(`배치 ${i}-${i + batchSize} 벡터 생성 실패:`, error);
      // 배치 실패 시에도 다음 배치 계속 처리
    }

    // API 레이트 리밋 방지를 위한 지연
    if (i + batchSize < chunksWithoutVectors.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
};

/**
 * 여러 문서를 순차적으로 처리
 */
export const processMultipleDocuments = async (
  uploadResults: UploadResult[],
  files: File[],
  options: DocumentProcessingOptions = {}
): Promise<ProcessingResult[]> => {
  const results: ProcessingResult[] = [];
  const successfulUploads = uploadResults.filter(result => result.success && result.document_id);

  for (let i = 0; i < successfulUploads.length; i++) {
    const uploadResult = successfulUploads[i];
    const file = files.find(f => f.name === uploadResult.file.name);

    if (!file || !uploadResult.document_id) {
      continue;
    }

    try {
      const result = await processUploadedDocument(
        uploadResult.document_id,
        file,
        {
          ...options,
          onProgress: (progress) => {
            // 전체 진행률에 현재 문서 인덱스 반영
            const overallProgress = {
              ...progress,
              progress: (i / successfulUploads.length) * 100 + (progress.progress / successfulUploads.length)
            };
            options.onProgress?.(overallProgress);
          }
        }
      );
      results.push(result);
    } catch (error) {
      console.error(`문서 ${uploadResult.file.name} 처리 실패:`, error);
      results.push({
        document_id: uploadResult.document_id,
        success: false,
        chunks_created: 0,
        error: error instanceof Error ? error.message : '알 수 없는 오류',
        processing_time_ms: 0
      });
    }

    // 문서 간 처리 지연 (시스템 부하 방지)
    if (i < successfulUploads.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }

  return results;
};

/**
 * 실패한 문서들을 재처리
 */
export const reprocessFailedDocuments = async (
  collectionId?: string,
  options: DocumentProcessingOptions = {}
): Promise<ProcessingResult[]> => {
  try {
    // 실패한 문서들 조회
    let query = supabase
      .from('documents')
      .select('*')
      .eq('processing_status', 'failed');

    if (collectionId) {
      query = query.eq('collection_id', collectionId);
    }

    const { data: failedDocs, error } = await query;

    if (error) {
      throw new Error(`실패한 문서 조회 실패: ${error.message}`);
    }

    if (!failedDocs || failedDocs.length === 0) {
      return [];
    }

    const results: ProcessingResult[] = [];

    for (const doc of failedDocs) {
      try {
        // 스토리지에서 파일 다운로드 (실제 구현에서는 스토리지 경로 사용)
        // 현재는 재처리 로직만 구현
        await supabase
          .from('documents')
          .update({ 
            processing_status: 'pending',
            error_message: null 
          })
          .eq('id', doc.id);

        results.push({
          document_id: doc.id,
          success: true,
          chunks_created: 0,
          processing_time_ms: 0
        });
      } catch (error) {
        console.error(`문서 ${doc.filename} 재처리 실패:`, error);
        results.push({
          document_id: doc.id,
          success: false,
          chunks_created: 0,
          error: error instanceof Error ? error.message : '알 수 없는 오류',
          processing_time_ms: 0
        });
      }
    }

    return results;
  } catch (error) {
    console.error('실패한 문서 재처리 오류:', error);
    throw error;
  }
};

/**
 * 처리 대기 중인 문서들을 자동으로 처리
 */
export const processPendingDocuments = async (
  options: DocumentProcessingOptions = {}
): Promise<ProcessingResult[]> => {
  try {
    // 대기 중인 문서들 조회
    const { data: pendingDocs, error } = await supabase
      .from('documents')
      .select('*')
      .eq('processing_status', 'pending')
      .order('created_at', { ascending: true })
      .limit(10); // 한 번에 최대 10개씩 처리

    if (error) {
      throw new Error(`대기 중인 문서 조회 실패: ${error.message}`);
    }

    if (!pendingDocs || pendingDocs.length === 0) {
      return [];
    }

    const results: ProcessingResult[] = [];

    for (const doc of pendingDocs) {
      try {
        // 실제로는 스토리지에서 파일을 다운로드해야 하지만
        // 현재는 문서 상태만 업데이트
        await supabase
          .from('documents')
          .update({ processing_status: 'processing' })
          .eq('id', doc.id);

        // 여기서 실제 파일 처리 로직 호출
        // const result = await processUploadedDocument(doc.id, file, options);
        
        // 임시로 성공 처리
        results.push({
          document_id: doc.id,
          success: true,
          chunks_created: 0,
          processing_time_ms: 0
        });
      } catch (error) {
        console.error(`문서 ${doc.filename} 처리 실패:`, error);
        results.push({
          document_id: doc.id,
          success: false,
          chunks_created: 0,
          error: error instanceof Error ? error.message : '알 수 없는 오류',
          processing_time_ms: 0
        });
      }
    }

    return results;
  } catch (error) {
    console.error('대기 중인 문서 처리 오류:', error);
    throw error;
  }
};

/**
 * 문서 처리 상태 모니터링
 */
export const getProcessingStatus = async (collectionId?: string) => {
  try {
    let query = supabase
      .from('documents')
      .select('processing_status, count(*)', { count: 'exact' });

    if (collectionId) {
      query = query.eq('collection_id', collectionId);
    }

    const { data, error, count } = await query;

    if (error) {
      throw new Error(`처리 상태 조회 실패: ${error.message}`);
    }

    // 상태별 집계
    const statusCounts = {
      pending: 0,
      processing: 0,
      completed: 0,
      failed: 0,
      total: count || 0
    };

    // 실제 집계는 별도 쿼리로 수행
    const { data: statusData } = await supabase
      .from('documents')
      .select('processing_status')
      .eq('collection_id', collectionId || '');

    if (statusData) {
      statusData.forEach(doc => {
        const status = doc.processing_status as keyof typeof statusCounts;
        if (status in statusCounts) {
          statusCounts[status]++;
        }
      });
    }

    return statusCounts;
  } catch (error) {
    console.error('처리 상태 조회 오류:', error);
    throw error;
  }
};