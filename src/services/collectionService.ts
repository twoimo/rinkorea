// 컬렉션 관리 서비스
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';
import type {
  Collection,
  CreateCollectionData,
  UpdateCollectionData,
  CollectionStats,
  CollectionFilters
} from '@/types/vector';
import {
  ServiceError,
  handleServiceError,
  retryWithBackoff,
  createSupabaseQuery,
  applySorting,
  getCurrentUser,
  logServiceOperation,
  measurePerformance,
  validateRequired,
  validateStringLength,
  safeParseMetadata
} from './common/serviceUtils';
import {
  handleServiceError,
  retryWithBackoff,
  createSupabaseQuery,
  applySorting,
  getCurrentUser,
  logServiceOperation,
  measurePerformance,
  isValidMetadata
} from './common/serviceUtils';

// Supabase 데이터베이스 타입 정의
type DbCollection = Database['public']['Tables']['collections']['Row'];
type DbCollectionInsert = Database['public']['Tables']['collections']['Insert'];
type DbCollectionUpdate = Database['public']['Tables']['collections']['Update'];
type DbDocument = Database['public']['Tables']['documents']['Row'];

// 타입 안전한 쿼리 함수
const queryCollections = () => supabase.from('collections');
const queryDocuments = () => supabase.from('documents');

// 타입 변환 함수
const dbCollectionToCollection = (dbCollection: DbCollection): Collection => ({
  id: dbCollection.id,
  name: dbCollection.name,
  description: dbCollection.description,
  metadata: dbCollection.metadata as Record<string, any>,
  created_by: dbCollection.created_by,
  created_at: dbCollection.created_at,
  updated_at: dbCollection.updated_at,
  is_active: dbCollection.is_active,
  document_count: dbCollection.document_count,
  total_chunks: dbCollection.total_chunks
});

/**
 * 컬렉션 생성
 */
export const createCollection = async (data: CreateCollectionData): Promise<Collection> => {
  return measurePerformance(async () => {
    try {
      // 입력 검증
      validateRequired(data.name, '컬렉션 이름');
      validateStringLength(data.name.trim(), '컬렉션 이름', 1, 100);
      
      if (data.description) {
        validateStringLength(data.description.trim(), '설명', 0, 500);
      }

      const user = await getCurrentUser();
      
      const { data: result, error } = await retryWithBackoff(
        () => queryCollections()
          .insert({
            name: data.name.trim(),
            description: data.description?.trim() || null,
            metadata: data.metadata || {},
            created_by: user.id
          })
          .select()
          .single(),
        2,
        1000,
        '컬렉션 생성'
      );

      if (error) {
        throw new ServiceError(`컬렉션 생성 실패: ${error.message}`, 'CREATE_FAILED', error);
      }

      logServiceOperation('컬렉션 생성', { 
        collectionId: result.id, 
        name: data.name,
        userId: user.id 
      });

      return dbCollectionToCollection(result);
    } catch (error) {
      throw handleServiceError(error, '컬렉션 생성');
    }
  }, 'createCollection');
};

/**
 * 컬렉션 목록 조회 (필터링 지원)
 */
export const getCollections = async (filters?: CollectionFilters): Promise<Collection[]> => {
  try {
    let query = queryCollections()
      .select('*');

    // 필터 적용
    if (filters?.is_active !== undefined) {
      query = query.eq('is_active', filters.is_active);
    }

    if (filters?.created_by) {
      query = query.eq('created_by', filters.created_by);
    }

    if (filters?.search) {
      query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
    }

    // 정렬
    const sortBy = filters?.sort_by || 'created_at';
    const sortOrder = filters?.sort_order || 'desc';
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });

    const { data, error } = await query;

    if (error) {
      throw new Error(`컬렉션 조회 실패: ${error.message}`);
    }

    return (data || []).map(dbCollectionToCollection);
  } catch (error) {
    console.error('컬렉션 조회 오류:', error);
    throw error;
  }
};

/**
 * 특정 컬렉션 조회
 */
export const getCollectionById = async (id: string): Promise<Collection> => {
  try {
    const { data, error } = await queryCollections()
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      throw new Error(`컬렉션 조회 실패: ${error.message}`);
    }

    if (!data) {
      throw new Error('컬렉션을 찾을 수 없습니다');
    }

    return dbCollectionToCollection(data);
  } catch (error) {
    console.error('컬렉션 조회 오류:', error);
    throw error;
  }
};

/**
 * 컬렉션 수정
 */
export const updateCollection = async (
  id: string,
  data: UpdateCollectionData
): Promise<Collection> => {
  try {
    const updateData: DbCollectionUpdate = {};

    if (data.name !== undefined) {
      updateData.name = data.name.trim();
    }
    if (data.description !== undefined) {
      updateData.description = data.description?.trim() || null;
    }
    if (data.metadata !== undefined) {
      updateData.metadata = data.metadata;
    }
    if (data.is_active !== undefined) {
      updateData.is_active = data.is_active;
    }

    const { data: result, error } = await queryCollections()
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`컬렉션 수정 실패: ${error.message}`);
    }

    return dbCollectionToCollection(result);
  } catch (error) {
    console.error('컬렉션 수정 오류:', error);
    throw error;
  }
};

/**
 * 컬렉션 삭제 (관련 문서와 청크도 함께 삭제됨 - CASCADE)
 */
export const deleteCollection = async (id: string): Promise<void> => {
  try {
    const { error } = await queryCollections()
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`컬렉션 삭제 실패: ${error.message}`);
    }
  } catch (error) {
    console.error('컬렉션 삭제 오류:', error);
    throw error;
  }
};

/**
 * 컬렉션 일괄 삭제
 */
export const bulkDeleteCollections = async (ids: string[]): Promise<void> => {
  try {
    if (ids.length === 0) {
      return;
    }

    const { error } = await queryCollections()
      .delete()
      .in('id', ids);

    if (error) {
      throw new Error(`컬렉션 일괄 삭제 실패: ${error.message}`);
    }
  } catch (error) {
    console.error('컬렉션 일괄 삭제 오류:', error);
    throw error;
  }
};

/**
 * 컬렉션 상태 일괄 업데이트
 */
export const bulkUpdateCollectionStatus = async (
  ids: string[],
  isActive: boolean
): Promise<void> => {
  try {
    if (ids.length === 0) {
      return;
    }

    const { error } = await queryCollections()
      .update({ is_active: isActive })
      .in('id', ids);

    if (error) {
      throw new Error(`컬렉션 상태 일괄 업데이트 실패: ${error.message}`);
    }
  } catch (error) {
    console.error('컬렉션 상태 일괄 업데이트 오류:', error);
    throw error;
  }
};

/**
 * 컬렉션 통계 조회
 */
export const getCollectionStats = async (id: string): Promise<CollectionStats> => {
  try {
    // 기본 컬렉션 정보 조회
    const { data: collection, error: collectionError } = await queryCollections()
      .select('*')
      .eq('id', id)
      .single();

    if (collectionError) {
      throw new Error(`컬렉션 조회 실패: ${collectionError.message}`);
    }

    // 문서 통계 조회
    const { data: documentStats, error: statsError } = await queryDocuments()
      .select('file_size, processing_status')
      .eq('collection_id', id);

    if (statsError) {
      throw new Error(`문서 통계 조회 실패: ${statsError.message}`);
    }

    // 통계 계산
    const totalSize = documentStats?.reduce((sum: number, doc: DbDocument) => sum + (doc.file_size || 0), 0) || 0;
    const processingDocuments = documentStats?.filter((doc: DbDocument) => doc.processing_status === 'processing').length || 0;
    const failedDocuments = documentStats?.filter((doc: DbDocument) => doc.processing_status === 'failed').length || 0;

    // 최근 업데이트 시간 조회
    const { data: lastDocument } = await queryDocuments()
      .select('updated_at')
      .eq('collection_id', id)
      .order('updated_at', { ascending: false })
      .limit(1)
      .single();

    const collectionData = collection as DbCollection;
    return {
      id: collectionData.id,
      name: collectionData.name,
      document_count: collectionData.document_count,
      total_chunks: collectionData.total_chunks,
      total_size: totalSize,
      last_updated: lastDocument?.updated_at || collectionData.updated_at,
      processing_documents: processingDocuments,
      failed_documents: failedDocuments
    };
  } catch (error) {
    console.error('컬렉션 통계 조회 오류:', error);
    throw error;
  }
};

/**
 * 컬렉션 메타데이터 업데이트
 */
export const updateCollectionMetadata = async (
  id: string,
  metadata: Record<string, any>
): Promise<void> => {
  try {
    const { error } = await queryCollections()
      .update({ metadata })
      .eq('id', id);

    if (error) {
      throw new Error(`컬렉션 메타데이터 업데이트 실패: ${error.message}`);
    }
  } catch (error) {
    console.error('컬렉션 메타데이터 업데이트 오류:', error);
    throw error;
  }
};

/**
 * 활성 컬렉션 목록 조회 (검색 시 사용)
 */
export const getActiveCollections = async (): Promise<Collection[]> => {
  return getCollections({ is_active: true });
};

/**
 * 컬렉션 이름 중복 확인
 */
export const checkCollectionNameExists = async (
  name: string,
  excludeId?: string
): Promise<boolean> => {
  try {
    let query = queryCollections()
      .select('id')
      .eq('name', name.trim());

    if (excludeId) {
      query = query.neq('id', excludeId);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`컬렉션 이름 확인 실패: ${error.message}`);
    }

    return (data?.length || 0) > 0;
  } catch (error) {
    console.error('컬렉션 이름 확인 오류:', error);
    throw error;
  }
};

/**
 * 컬렉션 검색 (이름 및 설명 기반)
 */
export const searchCollections = async (query: string): Promise<Collection[]> => {
  return getCollections({
    search: query,
    is_active: true,
    sort_by: 'name',
    sort_order: 'asc'
  });
};

/**
 * 컬렉션 통계 실시간 업데이트 (문서 추가 시)
 */
export const incrementCollectionStats = async (
  collectionId: string,
  chunkCount: number = 0
): Promise<void> => {
  try {
    const { error } = await queryCollections()
      .update({
        document_count: supabase.raw('document_count + 1'),
        total_chunks: supabase.raw(`total_chunks + ${chunkCount}`)
      })
      .eq('id', collectionId);

    if (error) {
      throw new Error(`컬렉션 통계 업데이트 실패: ${error.message}`);
    }
  } catch (error) {
    console.error('컬렉션 통계 증가 오류:', error);
    throw error;
  }
};

/**
 * 컬렉션 통계 실시간 업데이트 (문서 삭제 시)
 */
export const decrementCollectionStats = async (
  collectionId: string,
  chunkCount: number = 0
): Promise<void> => {
  try {
    const { error } = await queryCollections()
      .update({
        document_count: supabase.raw('GREATEST(document_count - 1, 0)'),
        total_chunks: supabase.raw(`GREATEST(total_chunks - ${chunkCount}, 0)`)
      })
      .eq('id', collectionId);

    if (error) {
      throw new Error(`컬렉션 통계 업데이트 실패: ${error.message}`);
    }
  } catch (error) {
    console.error('컬렉션 통계 감소 오류:', error);
    throw error;
  }
};

/**
 * 컬렉션 통계 실시간 업데이트 (청크 수 변경 시)
 */
export const updateCollectionChunkCount = async (
  collectionId: string,
  oldChunkCount: number,
  newChunkCount: number
): Promise<void> => {
  try {
    const chunkDiff = newChunkCount - oldChunkCount;
    
    if (chunkDiff === 0) {
      return; // 변경사항 없음
    }

    const { error } = await queryCollections()
      .update({
        total_chunks: chunkDiff > 0 
          ? supabase.raw(`total_chunks + ${chunkDiff}`)
          : supabase.raw(`GREATEST(total_chunks - ${Math.abs(chunkDiff)}, 0)`)
      })
      .eq('id', collectionId);

    if (error) {
      throw new Error(`컬렉션 청크 수 업데이트 실패: ${error.message}`);
    }
  } catch (error) {
    console.error('컬렉션 청크 수 업데이트 오류:', error);
    throw error;
  }
};

/**
 * 컬렉션 통계 재계산 (데이터 불일치 시 사용)
 */
export const recalculateCollectionStats = async (collectionId: string): Promise<void> => {
  try {
    // 실제 문서 수와 청크 수 계산
    const { data: documents, error: docError } = await queryDocuments()
      .select('chunk_count')
      .eq('collection_id', collectionId);

    if (docError) {
      throw new Error(`문서 조회 실패: ${docError.message}`);
    }

    const documentCount = documents?.length || 0;
    const totalChunks = documents?.reduce((sum: number, doc: DbDocument) => sum + (doc.chunk_count || 0), 0) || 0;

    // 컬렉션 통계 업데이트
    const { error: updateError } = await queryCollections()
      .update({
        document_count: documentCount,
        total_chunks: totalChunks
      })
      .eq('id', collectionId);

    if (updateError) {
      throw new Error(`컬렉션 통계 재계산 실패: ${updateError.message}`);
    }
  } catch (error) {
    console.error('컬렉션 통계 재계산 오류:', error);
    throw error;
  }
};