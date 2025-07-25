import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  FileText, 
  Database, 
  Eye, 
  Copy, 
  ExternalLink,
  Download,
  Star,
  Clock,
  Hash
} from 'lucide-react';
import type { SearchResult, SearchType } from '@/types/vector';
import { formatDate } from '@/lib/utils';

interface SearchResultsProps {
  results: SearchResult[];
  loading: boolean;
  searchType: SearchType;
  query: string;
  onExport?: () => void;
  onViewDocument?: (documentId: string) => void;
}

interface SearchResultItemProps {
  result: SearchResult;
  index: number;
  searchType: SearchType;
  onViewDocument?: (documentId: string) => void;
}

const SearchResultItem: React.FC<SearchResultItemProps> = ({
  result,
  index,
  searchType,
  onViewDocument
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (error) {
      console.error('클립보드 복사 실패:', error);
    }
  };

  const getScoreDisplay = () => {
    if (searchType === 'semantic' && result.similarity_score !== undefined) {
      return {
        label: '유사도',
        value: (result.similarity_score * 100).toFixed(1) + '%',
        color: result.similarity_score > 0.8 ? 'text-green-600' : 
               result.similarity_score > 0.6 ? 'text-yellow-600' : 'text-red-600'
      };
    } else if (searchType === 'keyword' && result.rank !== undefined) {
      return {
        label: '순위',
        value: result.rank.toFixed(2),
        color: 'text-blue-600'
      };
    } else if (searchType === 'hybrid' && result.rank !== undefined) {
      return {
        label: '점수',
        value: result.rank.toFixed(2),
        color: 'text-purple-600'
      };
    }
    return null;
  };

  const scoreDisplay = getScoreDisplay();

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-medium text-blue-600">#{index + 1}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-medium text-sm truncate">{result.document_name}</h3>
                <Badge variant="outline" className="text-xs">
                  <Database className="h-3 w-3 mr-1" />
                  {result.collection_name}
                </Badge>
              </div>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Hash className="h-3 w-3" />
                  청크 {result.chunk_id.slice(-8)}
                </div>
                {scoreDisplay && (
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3" />
                    <span className={scoreDisplay.color}>
                      {scoreDisplay.label}: {scoreDisplay.value}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => copyToClipboard(result.content)}
            >
              <Copy className="h-4 w-4" />
            </Button>
            {onViewDocument && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onViewDocument(result.document_id)}
              >
                <Eye className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          {/* 내용 미리보기 */}
          <div>
            <div 
              className={`text-sm leading-relaxed ${!isExpanded ? 'line-clamp-3' : ''}`}
              dangerouslySetInnerHTML={{
                __html: result.highlighted_content || result.content
              }}
            />
            {result.content.length > 200 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className="mt-2 h-auto p-0 text-xs text-muted-foreground hover:text-foreground"
              >
                {isExpanded ? '접기' : '더 보기'}
              </Button>
            )}
          </div>

          {/* 메타데이터 */}
          {result.metadata && Object.keys(result.metadata).length > 0 && (
            <div>
              <Separator className="mb-2" />
              <div className="flex flex-wrap gap-1">
                {Object.entries(result.metadata).slice(0, 3).map(([key, value]) => (
                  <Badge key={key} variant="secondary" className="text-xs">
                    {key}: {String(value)}
                  </Badge>
                ))}
                {Object.keys(result.metadata).length > 3 && (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Badge variant="outline" className="text-xs cursor-pointer">
                        +{Object.keys(result.metadata).length - 3} 더보기
                      </Badge>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>메타데이터</DialogTitle>
                        <DialogDescription>
                          {result.document_name} - 청크 {result.chunk_id.slice(-8)}
                        </DialogDescription>
                      </DialogHeader>
                      <ScrollArea className="h-64 w-full">
                        <pre className="text-sm font-mono bg-muted/50 p-4 rounded-md">
                          {JSON.stringify(result.metadata, null, 2)}
                        </pre>
                      </ScrollArea>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export const SearchResults: React.FC<SearchResultsProps> = ({
  results,
  loading,
  searchType,
  query,
  onExport,
  onViewDocument
}) => {
  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mr-2"></div>
            검색 중...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (results.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h3 className="text-lg font-medium mb-2">검색 결과가 없습니다</h3>
          <p className="text-muted-foreground mb-4">
            "{query}"에 대한 검색 결과를 찾을 수 없습니다.
          </p>
          <div className="text-sm text-muted-foreground">
            <p>다음을 시도해보세요:</p>
            <ul className="mt-2 space-y-1">
              <li>• 다른 키워드로 검색해보세요</li>
              <li>• 검색어를 줄여보세요</li>
              <li>• 다른 검색 타입을 사용해보세요</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getSearchTypeLabel = () => {
    switch (searchType) {
      case 'semantic': return '의미 검색';
      case 'keyword': return '키워드 검색';
      case 'hybrid': return '하이브리드 검색';
      default: return '검색';
    }
  };

  return (
    <div className="space-y-4">
      {/* 검색 결과 헤더 */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">검색 결과</CardTitle>
              <p className="text-sm text-muted-foreground">
                "{query}"에 대한 {getSearchTypeLabel()} 결과 {results.length}개
              </p>
            </div>
            <div className="flex items-center gap-2">
              {onExport && (
                <Button variant="outline" size="sm" onClick={onExport}>
                  <Download className="h-4 w-4 mr-1" />
                  내보내기
                </Button>
              )}
              <Badge variant="secondary">
                {getSearchTypeLabel()}
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* 검색 결과 목록 */}
      <div className="space-y-3">
        {results.map((result, index) => (
          <SearchResultItem
            key={result.chunk_id}
            result={result}
            index={index}
            searchType={searchType}
            onViewDocument={onViewDocument}
          />
        ))}
      </div>

      {/* 결과 요약 */}
      {results.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  검색 완료
                </div>
                <div>
                  총 {results.length}개 결과
                </div>
              </div>
              <div>
                {searchType === 'semantic' && '유사도 기준 정렬'}
                {searchType === 'keyword' && '관련성 기준 정렬'}
                {searchType === 'hybrid' && '통합 점수 기준 정렬'}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};