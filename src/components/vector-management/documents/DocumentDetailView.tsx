import React, { useState, useEffect } from 'react';
import { DocumentViewer } from './DocumentViewer';
import { getDocumentById, getDocumentChunks, updateDocumentChunk, deleteDocumentChunk } from '@/services/documentService';
import type { Document, DocumentChunk } from '@/types/vector';

interface DocumentDetailViewProps {
  documentId: string;
  onEdit: (document: Document) => void;
  onDelete: (id: string) => void;
  onReprocess: (id: string) => void;
  onClose: () => void;
}

export const DocumentDetailView: React.FC<DocumentDetailViewProps> = ({
  documentId,
  onEdit,
  onDelete,
  onReprocess,
  onClose
}) => {
  const [document, setDocument] = useState<Document | null>(null);
  const [chunks, setChunks] = useState<DocumentChunk[]>([]);
  const [loading, setLoading] = useState(true);
  const [chunksLoading, setChunksLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 문서 정보 로드
  useEffect(() => {
    const loadDocument = async () => {
      try {
        setLoading(true);
        const doc = await getDocumentById(documentId);
        setDocument(doc);
      } catch (error) {
        console.error('문서 로드 오류:', error);
        setError('문서를 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    loadDocument();
  }, [documentId]);

  // 청크 목록 로드
  useEffect(() => {
    const loadChunks = async () => {
      try {
        setChunksLoading(true);
        const chunkList = await getDocumentChunks(documentId);
        setChunks(chunkList);
      } catch (error) {
        console.error('청크 로드 오류:', error);
        // 청크 로드 실패는 치명적이지 않으므로 빈 배열로 설정
        setChunks([]);
      } finally {
        setChunksLoading(false);
      }
    };

    loadChunks();
  }, [documentId]);

  // 문서 다운로드
  const handleDownload = async (document: Document) => {
    try {
      // 문서 내용을 Blob으로 생성하여 다운로드
      const content = document.content || '내용이 없습니다.';
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = document.original_filename;
      link.style.display = 'none';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('다운로드 오류:', error);
    }
  };

  // 청크 업데이트
  const handleChunkUpdate = async (chunkId: string, content: string, metadata: Record<string, any>) => {
    try {
      await updateDocumentChunk(chunkId, content, metadata);
      
      // 로컬 상태 업데이트
      setChunks(prev => prev.map(chunk => 
        chunk.id === chunkId 
          ? { ...chunk, content, metadata }
          : chunk
      ));
    } catch (error) {
      console.error('청크 업데이트 오류:', error);
    }
  };

  // 청크 삭제
  const handleChunkDelete = async (chunkId: string) => {
    try {
      await deleteDocumentChunk(chunkId);
      
      // 로컬 상태에서 제거
      setChunks(prev => prev.filter(chunk => chunk.id !== chunkId));
      
      // 문서의 청크 수 업데이트
      if (document) {
        setDocument(prev => prev ? { ...prev, chunk_count: prev.chunk_count - 1 } : null);
      }
    } catch (error) {
      console.error('청크 삭제 오류:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-muted-foreground">문서를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error || !document) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-500 mb-2">{error || '문서를 찾을 수 없습니다.'}</p>
          <button 
            onClick={onClose}
            className="text-primary hover:underline"
          >
            돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <DocumentViewer
      document={document}
      chunks={chunks}
      loading={chunksLoading}
      onEdit={onEdit}
      onDelete={onDelete}
      onReprocess={onReprocess}
      onDownload={handleDownload}
      onChunkUpdate={handleChunkUpdate}
      onChunkDelete={handleChunkDelete}
      onClose={onClose}
    />
  );
};