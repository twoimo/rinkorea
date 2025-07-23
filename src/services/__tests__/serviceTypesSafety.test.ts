// 서비스 레이어 타입 안전성 검증 테스트
import { describe, it, expect } from 'vitest';
import type { Database } from '@/integrations/supabase/types';
import type { Collection, Document, DocumentChunk } from '@/types/vector';

describe('서비스 레이어 타입 안전성', () => {
  it('Collection 타입이 DbCollection과 호환되어야 함', () => {
    // DbCollection 타입 정의
    type DbCollection = Database['public']['Tables']['collections']['Row'];
    
    // 타입 변환 함수 시뮬레이션
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

    // 테스트 데이터
    const mockDbCollection: DbCollection = {
      id: 'test-id',
      name: 'Test Collection',
      description: 'Test Description',
      metadata: { test: 'data' },
      created_by: 'user-id',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
      is_active: true,
      document_count: 5,
      total_chunks: 100
    };

    const collection = dbCollectionToCollection(mockDbCollection);
    
    expect(collection.id).toBe('test-id');
    expect(collection.name).toBe('Test Collection');
    expect(collection.document_count).toBe(5);
    expect(collection.is_active).toBe(true);
  });

  it('Document 타입이 DbDocument와 호환되어야 함', () => {
    type DbDocument = Database['public']['Tables']['documents']['Row'];
    
    const dbDocumentToDocument = (dbDocument: DbDocument): Document => ({
      id: dbDocument.id,
      collection_id: dbDocument.collection_id,
      filename: dbDocument.filename,
      original_filename: dbDocument.original_filename,
      file_type: dbDocument.file_type,
      file_size: dbDocument.file_size,
      content: dbDocument.content,
      metadata: dbDocument.metadata as Record<string, any>,
      processing_status: dbDocument.processing_status as Document['processing_status'],
      error_message: dbDocument.error_message,
      created_by: dbDocument.created_by,
      created_at: dbDocument.created_at,
      updated_at: dbDocument.updated_at,
      chunk_count: dbDocument.chunk_count
    });

    const mockDbDocument: DbDocument = {
      id: 'doc-id',
      collection_id: 'collection-id',
      filename: 'test.pdf',
      original_filename: 'test.pdf',
      file_type: 'application/pdf',
      file_size: 1024,
      content: 'Test content',
      metadata: { pages: 1 },
      processing_status: 'completed',
      error_message: null,
      created_by: 'user-id',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
      chunk_count: 3
    };

    const document = dbDocumentToDocument(mockDbDocument);
    
    expect(document.id).toBe('doc-id');
    expect(document.filename).toBe('test.pdf');
    expect(document.processing_status).toBe('completed');
    expect(document.chunk_count).toBe(3);
  });

  it('DocumentChunk 타입이 DbDocumentChunk와 호환되어야 함', () => {
    type DbDocumentChunk = Database['public']['Tables']['document_chunks']['Row'];
    
    const dbDocumentChunkToDocumentChunk = (dbChunk: DbDocumentChunk): DocumentChunk => ({
      id: dbChunk.id,
      document_id: dbChunk.document_id,
      chunk_index: dbChunk.chunk_index,
      content: dbChunk.content,
      embedding: dbChunk.embedding,
      metadata: dbChunk.metadata as Record<string, any>,
      created_at: dbChunk.created_at
    });

    const mockDbChunk: DbDocumentChunk = {
      id: 'chunk-id',
      document_id: 'doc-id',
      chunk_index: 0,
      content: 'Test chunk content',
      embedding: [0.1, 0.2, 0.3],
      metadata: { tokens: 50 },
      created_at: '2024-01-01T00:00:00Z'
    };

    const chunk = dbDocumentChunkToDocumentChunk(mockDbChunk);
    
    expect(chunk.id).toBe('chunk-id');
    expect(chunk.content).toBe('Test chunk content');
    expect(chunk.embedding).toEqual([0.1, 0.2, 0.3]);
    expect(chunk.chunk_index).toBe(0);
  });

  it('RPC 함수 타입이 올바르게 정의되어야 함', () => {
    // RPC 함수 반환 타입 검증
    type SearchSimilarChunksResult = Database['public']['Functions']['search_similar_chunks']['Returns'][0];
    type SearchChunksByKeywordResult = Database['public']['Functions']['search_chunks_by_keyword']['Returns'][0];

    // 필수 필드 존재 확인
    const similarChunkFields: (keyof SearchSimilarChunksResult)[] = [
      'chunk_id', 'document_id', 'collection_id', 'content', 
      'similarity', 'document_name', 'collection_name', 'metadata'
    ];

    const keywordSearchFields: (keyof SearchChunksByKeywordResult)[] = [
      'chunk_id', 'document_id', 'collection_id', 'content', 
      'rank', 'document_name', 'collection_name', 'metadata'
    ];

    expect(similarChunkFields.length).toBe(8);
    expect(keywordSearchFields.length).toBe(8);
  });

  it('Insert 및 Update 타입이 올바르게 정의되어야 함', () => {
    type DbCollectionInsert = Database['public']['Tables']['collections']['Insert'];
    type DbCollectionUpdate = Database['public']['Tables']['collections']['Update'];
    type DbDocumentInsert = Database['public']['Tables']['documents']['Insert'];
    type DbDocumentUpdate = Database['public']['Tables']['documents']['Update'];

    // Insert 타입 테스트
    const collectionInsert: DbCollectionInsert = {
      name: 'New Collection',
      description: 'Description',
      metadata: { test: true }
    };

    // Update 타입 테스트
    const collectionUpdate: DbCollectionUpdate = {
      name: 'Updated Collection',
      is_active: false
    };

    // Document Insert 타입 테스트
    const documentInsert: DbDocumentInsert = {
      collection_id: 'collection-id',
      filename: 'test.pdf',
      original_filename: 'test.pdf',
      file_type: 'application/pdf',
      file_size: 1024
    };

    // Document Update 타입 테스트
    const documentUpdate: DbDocumentUpdate = {
      processing_status: 'completed',
      chunk_count: 5
    };

    expect(collectionInsert.name).toBe('New Collection');
    expect(collectionUpdate.is_active).toBe(false);
    expect(documentInsert.file_size).toBe(1024);
    expect(documentUpdate.processing_status).toBe('completed');
  });
});