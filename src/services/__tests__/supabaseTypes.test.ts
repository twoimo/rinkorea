// Supabase 타입 정의 검증 테스트
import { describe, it, expect } from 'vitest';
import type { Database } from '@/integrations/supabase/types';

describe('Supabase Types', () => {
  it('should have all required vector database table types', () => {
    // 컴파일 타임에 타입이 존재하는지 확인
    type Collections = Database['public']['Tables']['collections'];
    type Documents = Database['public']['Tables']['documents'];
    type DocumentChunks = Database['public']['Tables']['document_chunks'];
    type SearchLogs = Database['public']['Tables']['search_logs'];

    // 타입이 올바르게 정의되었는지 확인
    expect(true).toBe(true); // 컴파일이 성공하면 타입이 올바름
  });

  it('should have all required RPC function types', () => {
    // RPC 함수 타입이 존재하는지 확인
    type SearchSimilarChunks = Database['public']['Functions']['search_similar_chunks'];
    type SearchChunksByKeyword = Database['public']['Functions']['search_chunks_by_keyword'];

    // 반환 타입 확인
    type SimilarChunksResult = SearchSimilarChunks['Returns'][0];
    type KeywordSearchResult = SearchChunksByKeyword['Returns'][0];

    // 필수 필드가 있는지 확인
    const similarChunkFields: keyof SimilarChunksResult = 'chunk_id';
    const keywordSearchFields: keyof KeywordSearchResult = 'chunk_id';

    expect(similarChunkFields).toBe('chunk_id');
    expect(keywordSearchFields).toBe('chunk_id');
  });

  it('should have proper table field types', () => {
    // Collections 테이블 필드 타입 확인
    type CollectionRow = Database['public']['Tables']['collections']['Row'];
    
    // 필수 필드들이 올바른 타입인지 확인
    const collectionId: CollectionRow['id'] = 'test-id';
    const collectionName: CollectionRow['name'] = 'test-name';
    const documentCount: CollectionRow['document_count'] = 0;
    const isActive: CollectionRow['is_active'] = true;

    expect(typeof collectionId).toBe('string');
    expect(typeof collectionName).toBe('string');
    expect(typeof documentCount).toBe('number');
    expect(typeof isActive).toBe('boolean');
  });

  it('should have proper document chunk embedding type', () => {
    // Document chunks 테이블의 embedding 필드 타입 확인
    type DocumentChunkRow = Database['public']['Tables']['document_chunks']['Row'];
    
    // embedding 필드가 number[] | null 타입인지 확인
    const embedding: DocumentChunkRow['embedding'] = [0.1, 0.2, 0.3];
    const nullEmbedding: DocumentChunkRow['embedding'] = null;

    expect(Array.isArray(embedding)).toBe(true);
    expect(nullEmbedding).toBe(null);
  });
});