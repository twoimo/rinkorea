import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { 
  FileText, 
  Download, 
  Edit, 
  Trash2, 
  RefreshCw, 
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  EyeOff,
  Copy,
  ExternalLink,
  Settings
} from 'lucide-react';
import type { Document, DocumentChunk } from '@/types/vector';
import { formatFileSize, formatDate } from '@/lib/utils';
import { ChunkViewer } from './ChunkViewer';

interface DocumentViewerProps {
  document: Document;
  chunks: DocumentChunk[];
  loading: boolean;
  onEdit: (document: Document) => void;
  onDelete: (id: string) => void;
  onReprocess: (id: string) => void;
  onDownload: (document: Document) => void;
  onChunkUpdate: (chunkId: string, content: string, metadata: Record<string, any>) => void;
  onChunkDelete: (chunkId: string) => void;
  onClose: () => void;
}

const getStatusIcon = (status: Document['processing_status']) => {
  switch (status) {
    case 'pending':
      return <Clock className="h-4 w-4 text-yellow-500" />;
    case 'processing':
      return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
    case 'completed':
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    case 'failed':
      return <XCircle className="h-4 w-4 text-red-500" />;
    default:
      return <AlertCircle className="h-4 w-4 text-gray-500" />;
  }
};

const getStatusBadge = (status: Document['processing_status']) => {
  const variants = {
    pending: 'secondary',
    processing: 'default',
    completed: 'default',
    failed: 'destructive'
  } as const;

  const labels = {
    pending: '대기중',
    processing: '처리중',
    completed: '완료',
    failed: '실패'
  };

  return (
    <Badge 
      variant={variants[status] || 'secondary'} 
      className={`flex items-center gap-1 ${status === 'completed' ? 'bg-green-500 hover:bg-green-600 text-white' : ''}`}
    >
      {getStatusIcon(status)}
      {labels[status]}
    </Badge>
  );
};

export const DocumentViewer: React.FC<DocumentViewerProps> = ({
  document,
  chunks,
  loading,
  onEdit,
  onDelete,
  onReprocess,
  onDownload,
  onChunkUpdate,
  onChunkDelete,
  onClose
}) => {
  const [showContent, setShowContent] = useState(false);
  const [selectedTab, setSelectedTab] = useState('info');

  // 문서 메타데이터 파싱
  const metadata = typeof document.metadata === 'object' ? document.metadata : {};
  
  // 청크 통계 계산
  const chunkStats = {
    total: chunks.length,
    withEmbedding: chunks.filter(chunk => chunk.embedding && chunk.embedding.length > 0).length,
    avgLength: chunks.length > 0 
      ? Math.round(chunks.reduce((sum, chunk) => sum + chunk.content.length, 0) / chunks.length)
      : 0
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // TODO: 토스트 알림 추가
    } catch (error) {
      console.error('클립보드 복사 실패:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FileText className="h-6 w-6 text-muted-foreground" />
          <div>
            <h2 className="text-2xl font-semibold">{document.filename}</h2>
            {document.filename !== document.original_filename && (
              <p className="text-sm text-muted-foreground">
                원본: {document.original_filename}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => onDownload(document)}>
            <Download className="h-4 w-4 mr-1" />
            다운로드
          </Button>
          <Button variant="outline" size="sm" onClick={() => onEdit(document)}>
            <Edit className="h-4 w-4 mr-1" />
            편집
          </Button>
          {document.processing_status === 'failed' && (
            <Button variant="outline" size="sm" onClick={() => onReprocess(document.id)}>
              <RefreshCw className="h-4 w-4 mr-1" />
              재처리
            </Button>
          )}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Trash2 className="h-4 w-4 mr-1" />
                삭제
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>문서 삭제</AlertDialogTitle>
                <AlertDialogDescription>
                  "{document.filename}" 문서를 삭제하시겠습니까? 
                  이 작업은 되돌릴 수 없으며, 모든 청크와 벡터 데이터도 함께 삭제됩니다.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>취소</AlertDialogCancel>
                <AlertDialogAction onClick={() => onDelete(document.id)}>
                  삭제
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <Button variant="ghost" size="sm" onClick={onClose}>
            ✕
          </Button>
        </div>
      </div>

      {/* 상태 및 기본 정보 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            문서 정보
            {getStatusBadge(document.processing_status)}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">파일 타입</p>
              <Badge variant="outline">
                {document.file_type.split('/')[1]?.toUpperCase() || document.file_type}
              </Badge>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">파일 크기</p>
              <p className="text-sm">{formatFileSize(document.file_size)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">청크 수</p>
              <p className="text-sm">{document.chunk_count}개</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">생성일</p>
              <p className="text-sm">{formatDate(document.created_at)}</p>
            </div>
          </div>

          {document.error_message && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <div className="flex items-center gap-2">
                <XCircle className="h-4 w-4 text-red-500" />
                <p className="text-sm font-medium text-red-800">처리 오류</p>
              </div>
              <p className="text-sm text-red-700 mt-1">{document.error_message}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 탭 컨텐츠 */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="info">상세 정보</TabsTrigger>
          <TabsTrigger value="content">문서 내용</TabsTrigger>
          <TabsTrigger value="chunks">청크 관리</TabsTrigger>
          <TabsTrigger value="metadata">메타데이터</TabsTrigger>
        </TabsList>

        {/* 상세 정보 탭 */}
        <TabsContent value="info" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>처리 통계</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">{chunkStats.total}</p>
                  <p className="text-sm text-muted-foreground">총 청크 수</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">{chunkStats.withEmbedding}</p>
                  <p className="text-sm text-muted-foreground">벡터화 완료</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <p className="text-2xl font-bold text-purple-600">{chunkStats.avgLength}</p>
                  <p className="text-sm text-muted-foreground">평균 청크 길이</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>파일 정보</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm font-medium">원본 파일명:</span>
                <span className="text-sm">{document.original_filename}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">저장된 파일명:</span>
                <span className="text-sm">{document.filename}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">MIME 타입:</span>
                <span className="text-sm">{document.file_type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">생성자:</span>
                <span className="text-sm">{document.created_by || '시스템'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">최종 수정:</span>
                <span className="text-sm">{formatDate(document.updated_at)}</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 문서 내용 탭 */}
        <TabsContent value="content" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                문서 내용
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowContent(!showContent)}
                  >
                    {showContent ? <EyeOff className="h-4 w-4 mr-1" /> : <Eye className="h-4 w-4 mr-1" />}
                    {showContent ? '숨기기' : '보기'}
                  </Button>
                  {document.content && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(document.content || '')}
                    >
                      <Copy className="h-4 w-4 mr-1" />
                      복사
                    </Button>
                  )}
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!document.content ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>추출된 텍스트 내용이 없습니다.</p>
                  {document.processing_status === 'failed' && (
                    <p className="text-sm mt-1">문서 처리가 실패했습니다.</p>
                  )}
                </div>
              ) : showContent ? (
                <ScrollArea className="h-96 w-full border rounded-md p-4">
                  <pre className="whitespace-pre-wrap text-sm font-mono">
                    {document.content}
                  </pre>
                </ScrollArea>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>내용을 보려면 "보기" 버튼을 클릭하세요.</p>
                  <p className="text-sm mt-1">
                    문서 크기: {document.content.length.toLocaleString()}자
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 청크 관리 탭 */}
        <TabsContent value="chunks" className="space-y-4">
          <ChunkViewer
            chunks={chunks}
            loading={loading}
            onChunkUpdate={onChunkUpdate}
            onChunkDelete={onChunkDelete}
          />
        </TabsContent>

        {/* 메타데이터 탭 */}
        <TabsContent value="metadata" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                메타데이터
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(JSON.stringify(metadata, null, 2))}
                >
                  <Copy className="h-4 w-4 mr-1" />
                  JSON 복사
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {Object.keys(metadata).length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Settings className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>메타데이터가 없습니다.</p>
                </div>
              ) : (
                <ScrollArea className="h-64 w-full">
                  <pre className="text-sm font-mono bg-muted/50 p-4 rounded-md">
                    {JSON.stringify(metadata, null, 2)}
                  </pre>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};