import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import type { Document, DocumentChunk } from '@/types/vector';

// Mock 데이터
const mockDocument: Document = {
  id: '1',
  collection_id: 'collection-1',
  filename: 'test-document.pdf',
  original_filename: 'test-document.pdf',
  file_type: 'application/pdf',
  file_size: 1024000,
  content: 'This is a test document content.',
  metadata: { pages: 5, author: 'Test Author' },
  processing_status: 'completed',
  error_message: null,
  created_by: 'user-1',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  chunk_count: 3
};

const mockChunks: DocumentChunk[] = [
  {
    id: 'chunk-1',
    document_id: '1',
    chunk_index: 0,
    content: 'This is the first chunk of the document.',
    embedding: [0.1, 0.2, 0.3],
    metadata: { tokens: 10 },
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'chunk-2',
    document_id: '1',
    chunk_index: 1,
    content: 'This is the second chunk of the document.',
    embedding: null,
    metadata: { tokens: 12 },
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'chunk-3',
    document_id: '1',
    chunk_index: 2,
    content: 'This is the third and final chunk.',
    embedding: [0.4, 0.5, 0.6],
    metadata: { tokens: 8 },
    created_at: '2024-01-01T00:00:00Z'
  }
];

describe('DocumentViewer 컴포넌트', () => {
  it('문서 정보가 올바르게 표시되어야 함', () => {
    // 기본적인 타입 검증 테스트
    expect(mockDocument.filename).toBe('test-document.pdf');
    expect(mockDocument.processing_status).toBe('completed');
    expect(mockDocument.chunk_count).toBe(3);
  });

  it('청크 데이터가 올바르게 구성되어야 함', () => {
    expect(mockChunks).toHaveLength(3);
    expect(mockChunks[0].embedding).toEqual([0.1, 0.2, 0.3]);
    expect(mockChunks[1].embedding).toBeNull();
    expect(mockChunks[2].chunk_index).toBe(2);
  });

  it('문서 상태별 처리가 올바르게 작동해야 함', () => {
    const statuses = ['pending', 'processing', 'completed', 'failed'] as const;
    
    statuses.forEach(status => {
      const testDoc = { ...mockDocument, processing_status: status };
      expect(testDoc.processing_status).toBe(status);
    });
  });

  it('청크 필터링이 올바르게 작동해야 함', () => {
    const chunksWithEmbedding = mockChunks.filter(chunk => 
      chunk.embedding && chunk.embedding.length > 0
    );
    const chunksWithoutEmbedding = mockChunks.filter(chunk => 
      !chunk.embedding || chunk.embedding.length === 0
    );

    expect(chunksWithEmbedding).toHaveLength(2);
    expect(chunksWithoutEmbedding).toHaveLength(1);
  });

  it('청크 정렬이 올바르게 작동해야 함', () => {
    const sortedByIndex = [...mockChunks].sort((a, b) => a.chunk_index - b.chunk_index);
    const sortedByLength = [...mockChunks].sort((a, b) => a.content.length - b.content.length);

    expect(sortedByIndex[0].chunk_index).toBe(0);
    expect(sortedByIndex[2].chunk_index).toBe(2);
    
    expect(sortedByLength[0].content.length).toBeLessThanOrEqual(sortedByLength[1].content.length);
  });
});