import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { 
  FileText, 
  Database, 
  HardDrive, 
  Clock, 
  AlertTriangle,
  TrendingUp,
  Activity
} from 'lucide-react';
import type { CollectionStats } from '@/types/vector';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';

interface CollectionStatsProps {
  stats: CollectionStats | null;
  loading: boolean;
  error?: string | null;
  onRefresh?: () => void;
}

// 파일 크기 포맷팅 함수
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

// 처리 상태에 따른 색상 반환
const getProcessingStatusColor = (processing: number, failed: number) => {
  if (failed > 0) return 'destructive';
  if (processing > 0) return 'warning';
  return 'default';
};

export const CollectionStats: React.FC<CollectionStatsProps> = ({
  stats,
  loading,
  error,
  onRefresh
}) => {
  if (loading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="flex items-center justify-center">
            <LoadingSpinner />
            <span className="ml-2">통계를 불러오는 중...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive">
        <CardContent className="py-8">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 mx-auto text-destructive mb-4" />
            <h3 className="text-lg font-medium mb-2">통계 로드 실패</h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            {onRefresh && (
              <button
                onClick={onRefresh}
                className="text-primary hover:underline"
              >
                다시 시도
              </button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!stats) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center">
            <Database className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">통계 없음</h3>
            <p className="text-muted-foreground">
              컬렉션 통계를 표시할 수 없습니다
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // 처리 진행률 계산
  const totalDocuments = stats.document_count;
  const processingProgress = totalDocuments > 0 
    ? ((totalDocuments - stats.processing_documents - stats.failed_documents) / totalDocuments) * 100 
    : 100;

  return (
    <div className="space-y-6">
      {/* 컬렉션 기본 정보 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            {stats.name}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 문서 수 */}
            <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-50">
              <div className="p-2 rounded-full bg-blue-100">
                <FileText className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">문서 수</p>
                <p className="text-2xl font-bold text-blue-600">
                  {stats.document_count.toLocaleString()}
                </p>
              </div>
            </div>

            {/* 청크 수 */}
            <div className="flex items-center gap-3 p-3 rounded-lg bg-green-50">
              <div className="p-2 rounded-full bg-green-100">
                <Database className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">청크 수</p>
                <p className="text-2xl font-bold text-green-600">
                  {stats.total_chunks.toLocaleString()}
                </p>
              </div>
            </div>

            {/* 총 크기 */}
            <div className="flex items-center gap-3 p-3 rounded-lg bg-purple-50">
              <div className="p-2 rounded-full bg-purple-100">
                <HardDrive className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">총 크기</p>
                <p className="text-2xl font-bold text-purple-600">
                  {formatFileSize(stats.total_size)}
                </p>
              </div>
            </div>

            {/* 마지막 업데이트 */}
            <div className="flex items-center gap-3 p-3 rounded-lg bg-orange-50">
              <div className="p-2 rounded-full bg-orange-100">
                <Clock className="h-4 w-4 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">마지막 업데이트</p>
                <p className="text-sm font-medium text-orange-600">
                  {formatDistanceToNow(new Date(stats.last_updated), {
                    addSuffix: true,
                    locale: ko
                  })}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 처리 상태 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            처리 상태
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 진행률 바 */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">전체 처리 진행률</span>
              <span className="text-sm text-muted-foreground">
                {processingProgress.toFixed(1)}%
              </span>
            </div>
            <Progress 
              value={processingProgress} 
              className="h-2"
            />
          </div>

          {/* 상태별 통계 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 처리 중 */}
            {stats.processing_documents > 0 && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-yellow-50">
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                  처리 중
                </Badge>
                <span className="font-medium">{stats.processing_documents}개</span>
              </div>
            )}

            {/* 실패 */}
            {stats.failed_documents > 0 && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50">
                <Badge variant="destructive">
                  실패
                </Badge>
                <span className="font-medium">{stats.failed_documents}개</span>
              </div>
            )}

            {/* 완료 */}
            <div className="flex items-center gap-2 p-3 rounded-lg bg-green-50">
              <Badge variant="default" className="bg-green-100 text-green-800">
                완료
              </Badge>
              <span className="font-medium">
                {totalDocuments - stats.processing_documents - stats.failed_documents}개
              </span>
            </div>
          </div>

          {/* 상태 메시지 */}
          {stats.processing_documents > 0 && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-blue-50 border border-blue-200">
              <TrendingUp className="h-4 w-4 text-blue-600" />
              <span className="text-sm text-blue-700">
                {stats.processing_documents}개 문서가 현재 처리 중입니다
              </span>
            </div>
          )}

          {stats.failed_documents > 0 && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <span className="text-sm text-red-700">
                {stats.failed_documents}개 문서 처리에 실패했습니다
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 성능 지표 */}
      {stats.total_chunks > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              성능 지표
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 문서당 평균 청크 수 */}
              <div className="p-3 rounded-lg bg-gray-50">
                <p className="text-sm text-muted-foreground mb-1">
                  문서당 평균 청크 수
                </p>
                <p className="text-xl font-bold">
                  {stats.document_count > 0 
                    ? (stats.total_chunks / stats.document_count).toFixed(1)
                    : '0'
                  }개
                </p>
              </div>

              {/* 청크당 평균 크기 */}
              <div className="p-3 rounded-lg bg-gray-50">
                <p className="text-sm text-muted-foreground mb-1">
                  청크당 평균 크기
                </p>
                <p className="text-xl font-bold">
                  {stats.total_chunks > 0 
                    ? formatFileSize(stats.total_size / stats.total_chunks)
                    : '0 B'
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};