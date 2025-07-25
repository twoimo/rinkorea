import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  FileText, 
  Upload, 
  RefreshCw, 
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  Database
} from 'lucide-react';
import type { Document, DocumentChunk, Collection, DocumentFilters, UploadResult } from '@/types/vector';
import { DocumentList } from './DocumentList';
import { DocumentViewer } from './DocumentViewer';
import { DocumentUpload } from './DocumentUpload';
import { 
  getDocuments, 
  deleteDocument, 
  bulkDeleteDocuments, 
  reprocessDocument,
  getDocumentById,
  getDocumentChunks,
  updateDocumentChunk,
  deleteDocumentChunk
} from '@/services/documentService';
import { getCollections } from '@/services/collectionService';
import { useToast } from '@/hooks/use-toast';

interface DocumentManagementProps {
  selectedCollection: Collection | null;
  onBack: () => void;
}

export const DocumentManagement: React.FC<DocumentManagementProps> = ({
  selectedCollection: initialSelectedCollection,
  onBack
}) => {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [selectedCollection, setSelectedCollection] = useState<Collection | null>(initialSelectedCollection);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(false);
  const [collectionsLoading, setCollectionsLoading] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [documentChunks, setDocumentChunks] = useState<DocumentChunk[]>([]);
  const [chunksLoading, setChunksLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'list' | 'upload' | 'view'>('list');
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<DocumentFilters>({});
  const { toast } = useToast();

  // 컬렉션 목록 로드
  const loadCollections = async () => {
    setCollectionsLoading(true);
    try {
      const collectionsData = await getCollections();
      setCollections(collectionsData);
      
      // 초기 선택된 컬렉션이 없고 컬렉션이 있다면 첫 번째 컬렉션 선택
      if (!selectedCollection && collectionsData.length > 0) {
        setSelectedCollection(collectionsData[0]);
      }
    } catch (error) {
      console.error('컬렉션 목록 로드 오류:', error);
      toast({
        title: '오류',
        description: '컬렉션 목록을 불러오는데 실패했습니다.',
        variant: 'destructive'
      });
    } finally {
      setCollectionsLoading(false);
    }
  };

  // 문서 목록 로드
  const loadDocuments = async () => {
    if (!selectedCollection) return;
    
    setLoading(true);
    try {
      const docs = await getDocuments(selectedCollection.id, filters);
      setDocuments(docs);
    } catch (error) {
      console.error('문서 목록 로드 오류:', error);
      toast({
        title: '오류',
        description: '문서 목록을 불러오는데 실패했습니다.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // 문서 청크 로드
  const loadDocumentChunks = async (documentId: string) => {
    setChunksLoading(true);
    try {
      const chunks = await getDocumentChunks(documentId);
      setDocumentChunks(chunks);
    } catch (error) {
      console.error('문서 청크 로드 오류:', error);
      toast({
        title: '오류',
        description: '문서 청크를 불러오는데 실패했습니다.',
        variant: 'destructive'
      });
    } finally {
      setChunksLoading(false);
    }
  };

  // 문서 보기
  const handleViewDocument = async (document: Document) => {
    setSelectedDocument(document);
    await loadDocumentChunks(document.id);
    setActiveTab('view');
  };

  // 문서 삭제
  const handleDeleteDocument = async (id: string) => {
    try {
      await deleteDocument(id);
      await loadDocuments();
      toast({
        title: '성공',
        description: '문서가 삭제되었습니다.'
      });
    } catch (error) {
      console.error('문서 삭제 오류:', error);
      toast({
        title: '오류',
        description: '문서 삭제에 실패했습니다.',
        variant: 'destructive'
      });
    }
  };

  // 문서 재처리
  const handleReprocessDocument = async (id: string) => {
    try {
      await reprocessDocument(id);
      await loadDocuments();
      toast({
        title: '성공',
        description: '문서 재처리가 시작되었습니다.'
      });
    } catch (error) {
      console.error('문서 재처리 오류:', error);
      toast({
        title: '오류',
        description: '문서 재처리에 실패했습니다.',
        variant: 'destructive'
      });
    }
  };

  // 일괄 작업
  const handleBulkAction = async (action: 'delete' | 'reprocess', ids: string[]) => {
    try {
      if (action === 'delete') {
        await bulkDeleteDocuments(ids);
        toast({
          title: '성공',
          description: `${ids.length}개의 문서가 삭제되었습니다.`
        });
      } else if (action === 'reprocess') {
        await Promise.all(ids.map(id => reprocessDocument(id)));
        toast({
          title: '성공',
          description: `${ids.length}개의 문서 재처리가 시작되었습니다.`
        });
      }
      await loadDocuments();
    } catch (error) {
      console.error('일괄 작업 오류:', error);
      toast({
        title: '오류',
        description: '일괄 작업에 실패했습니다.',
        variant: 'destructive'
      });
    }
  };

  // 문서 편집 (placeholder)
  const handleEditDocument = (document: Document) => {
    toast({
      title: '알림',
      description: '문서 편집 기능은 곧 구현될 예정입니다.'
    });
  };

  // 문서 다운로드 (placeholder)
  const handleDownloadDocument = (document: Document) => {
    toast({
      title: '알림',
      description: '문서 다운로드 기능은 곧 구현될 예정입니다.'
    });
  };

  // 청크 업데이트
  const handleChunkUpdate = async (chunkId: string, content: string, metadata: Record<string, any>) => {
    try {
      await updateDocumentChunk(chunkId, content, metadata);
      await loadDocumentChunks(selectedDocument!.id);
      toast({
        title: '성공',
        description: '청크가 업데이트되었습니다.'
      });
    } catch (error) {
      console.error('청크 업데이트 오류:', error);
      toast({
        title: '오류',
        description: '청크 업데이트에 실패했습니다.',
        variant: 'destructive'
      });
    }
  };

  // 청크 삭제
  const handleChunkDelete = async (chunkId: string) => {
    try {
      await deleteDocumentChunk(chunkId);
      await loadDocumentChunks(selectedDocument!.id);
      toast({
        title: '성공',
        description: '청크가 삭제되었습니다.'
      });
    } catch (error) {
      console.error('청크 삭제 오류:', error);
      toast({
        title: '오류',
        description: '청크 삭제에 실패했습니다.',
        variant: 'destructive'
      });
    }
  };

  // 업로드 완료 후 문서 목록 새로고침
  const handleUploadComplete = (results: UploadResult[]) => {
    const successCount = results.filter(r => r.success).length;
    const failCount = results.filter(r => !r.success).length;
    
    if (successCount > 0) {
      toast({
        title: '업로드 완료',
        description: `${successCount}개의 파일이 성공적으로 업로드되었습니다.`
      });
    }
    
    if (failCount > 0) {
      toast({
        title: '업로드 실패',
        description: `${failCount}개의 파일 업로드에 실패했습니다.`,
        variant: 'destructive'
      });
    }
    
    loadDocuments();
    setActiveTab('list');
  };

  // 컴포넌트 마운트 시 컬렉션 목록 로드
  useEffect(() => {
    loadCollections();
  }, []);

  // 컬렉션 변경 시 문서 목록 로드
  useEffect(() => {
    if (selectedCollection) {
      loadDocuments();
    }
  }, [selectedCollection, filters]);

  // 컬렉션 선택 핸들러
  const handleCollectionChange = (collectionId: string) => {
    const collection = collections.find(c => c.id === collectionId);
    if (collection) {
      setSelectedCollection(collection);
      setActiveTab('list'); // 컬렉션 변경 시 목록 탭으로 이동
    }
  };

  // 문서 통계 계산
  const documentStats = {
    total: documents.length,
    pending: documents.filter(d => d.processing_status === 'pending').length,
    processing: documents.filter(d => d.processing_status === 'processing').length,
    completed: documents.filter(d => d.processing_status === 'completed').length,
    failed: documents.filter(d => d.processing_status === 'failed').length
  };

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <Button variant="ghost" onClick={onBack} className="mb-2">
            ← 컬렉션 목록으로 돌아가기
          </Button>
          <div className="flex items-center gap-4 mb-2">
            <h2 className="text-2xl font-semibold">문서 관리</h2>
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-muted-foreground" />
              <Select
                value={selectedCollection?.id || ''}
                onValueChange={handleCollectionChange}
                disabled={collectionsLoading}
              >
                <SelectTrigger className="w-64">
                  <SelectValue placeholder="컬렉션을 선택해주세요" />
                </SelectTrigger>
                <SelectContent>
                  {collections.map((collection) => (
                    <SelectItem key={collection.id} value={collection.id}>
                      {collection.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          {selectedCollection && (
            <p className="text-muted-foreground">{selectedCollection.description}</p>
          )}
        </div>
        {selectedCollection && (
          <Button 
            onClick={() => setActiveTab('upload')}
            className="flex items-center gap-2"
          >
            <Upload className="h-4 w-4" />
            문서 업로드
          </Button>
        )}
      </div>

      {!selectedCollection ? (
        <Card>
          <CardContent className="text-center py-12">
            <Database className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">컬렉션을 선택해주세요</h3>
            <p className="text-muted-foreground mb-4">
              문서를 관리하려면 먼저 컬렉션을 선택해야 합니다.
            </p>
            {collections.length === 0 && !collectionsLoading && (
              <p className="text-sm text-muted-foreground">
                사용 가능한 컬렉션이 없습니다. 먼저 컬렉션을 생성해주세요.
              </p>
            )}
          </CardContent>
        </Card>
      ) : (
        <>
          {/* 통계 카드 */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{documentStats.total}</div>
            <div className="text-sm text-muted-foreground">전체 문서</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-1 text-2xl font-bold text-yellow-600">
              <Clock className="h-5 w-5" />
              {documentStats.pending}
            </div>
            <div className="text-sm text-muted-foreground">대기중</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-1 text-2xl font-bold text-blue-600">
              <RefreshCw className="h-5 w-5" />
              {documentStats.processing}
            </div>
            <div className="text-sm text-muted-foreground">처리중</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-1 text-2xl font-bold text-green-600">
              <CheckCircle className="h-5 w-5" />
              {documentStats.completed}
            </div>
            <div className="text-sm text-muted-foreground">완료</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-1 text-2xl font-bold text-red-600">
              <XCircle className="h-5 w-5" />
              {documentStats.failed}
            </div>
            <div className="text-sm text-muted-foreground">실패</div>
          </CardContent>
        </Card>
      </div>

      {/* 탭 컨텐츠 */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="list">문서 목록</TabsTrigger>
          <TabsTrigger value="upload">문서 업로드</TabsTrigger>
          <TabsTrigger value="view" disabled={!selectedDocument}>
            문서 보기
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          <DocumentList
            documents={documents}
            loading={loading}
            onView={handleViewDocument}
            onDelete={handleDeleteDocument}
            onReprocess={handleReprocessDocument}
            onBulkAction={handleBulkAction}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            onFiltersChange={setFilters}
          />
        </TabsContent>

        <TabsContent value="upload" className="space-y-4">
          <DocumentUpload
            collectionId={selectedCollection.id}
            onUploadComplete={handleUploadComplete}
          />
        </TabsContent>

        <TabsContent value="view" className="space-y-4">
          {selectedDocument && (
            <DocumentViewer
              document={selectedDocument}
              chunks={documentChunks}
              loading={chunksLoading}
              onEdit={handleEditDocument}
              onDelete={handleDeleteDocument}
              onReprocess={handleReprocessDocument}
              onDownload={handleDownloadDocument}
              onChunkUpdate={handleChunkUpdate}
              onChunkDelete={handleChunkDelete}
              onClose={() => {
                setSelectedDocument(null);
                setActiveTab('list');
              }}
            />
          )}
        </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
};