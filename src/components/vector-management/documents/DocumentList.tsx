import React, { useState, useMemo, useCallback } from 'react';
import { InfiniteScroll } from '@/components/ui/infinite-scroll';
import { LoadingSpinner } from '@/components/ui/loading';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
  Search, 
  Filter, 
  Trash2, 
  RefreshCw, 
  Eye, 
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import type { Document, DocumentFilters } from '@/types/vector';
import { formatFileSize, formatDate } from '@/lib/utils';

interface DocumentListProps {
  documents?: Document[];
  loading?: boolean;
  onView: (document: Document) => void;
  onDelete: (id: string) => void;
  onReprocess: (id: string) => void;
  onBulkAction: (action: 'delete' | 'reprocess', ids: string[]) => void;
  onFiltersChange?: (filters: DocumentFilters) => void;
  // 무한 스크롤 지원
  loadDocuments?: (page: number) => Promise<Document[]>;
  useInfiniteScroll?: boolean;
  initialPage?: number;
}

const ITEMS_PER_PAGE = 10;

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

export const DocumentList: React.FC<DocumentListProps> = ({
  documents = [],
  loading = false,
  onView,
  onDelete,
  onReprocess,
  onBulkAction,
  onFiltersChange,
  loadDocuments,
  useInfiniteScroll = false,
  initialPage = 1
}) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<Document['processing_status'] | 'all'>('all');
  const [fileTypeFilter, setFileTypeFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'filename' | 'created_at' | 'file_size' | 'chunk_count'>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(initialPage);

  // 문서 아이템 렌더링 함수
  const renderDocumentItem = useCallback((document: Document, index: number) => (
    <TableRow key={document.id} className="hover:bg-muted/50">
      <TableCell className="w-12">
        <Checkbox
          checked={selectedIds.includes(document.id)}
          onCheckedChange={(checked) => 
            handleSelectDocument(document.id, checked as boolean)
          }
        />
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-muted-foreground" />
          <div>
            <div className="font-medium text-sm">{document.original_filename}</div>
            <div className="text-xs text-muted-foreground">{document.filename}</div>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <Badge variant="outline" className="text-xs">
          {document.file_type}
        </Badge>
      </TableCell>
      <TableCell className="text-sm">
        {formatFileSize(document.file_size)}
      </TableCell>
      <TableCell className="text-sm">
        {document.chunk_count || 0}
      </TableCell>
      <TableCell>
        {getStatusBadge(document.processing_status)}
      </TableCell>
      <TableCell className="text-sm text-muted-foreground">
        {formatDate(document.created_at)}
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onView(document)}
          >
            <Eye className="h-4 w-4" />
          </Button>
          {document.processing_status === 'failed' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onReprocess(document.id)}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          )}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="sm">
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>문서 삭제</AlertDialogTitle>
                <AlertDialogDescription>
                  '{document.original_filename}' 문서를 삭제하시겠습니까?
                  이 작업은 되돌릴 수 없습니다.
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
        </div>
      </TableCell>
    </TableRow>
  ), [selectedIds, onView, onReprocess, onDelete]);

  // 개별 선택/해제
  const handleSelectDocument = useCallback((id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds(prev => [...prev, id]);
    } else {
      setSelectedIds(prev => prev.filter(selectedId => selectedId !== id));
    }
  }, []);

  // 필터링된 문서 목록
  const filteredDocuments = useMemo(() => {
    let filtered = documents.filter(doc => {
      const matchesSearch = searchQuery === '' || 
        doc.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.original_filename.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || doc.processing_status === statusFilter;
      
      const matchesFileType = fileTypeFilter === 'all' || doc.file_type.includes(fileTypeFilter);

      return matchesSearch && matchesStatus && matchesFileType;
    });

    // 정렬
    filtered.sort((a, b) => {
      let aValue: any = a[sortBy];
      let bValue: any = b[sortBy];

      if (sortBy === 'created_at') {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [documents, searchQuery, statusFilter, fileTypeFilter, sortBy, sortOrder]);

  // 페이지네이션 (무한 스크롤이 아닌 경우에만)
  const totalPages = useInfiniteScroll ? 0 : Math.ceil(filteredDocuments.length / ITEMS_PER_PAGE);
  const startIndex = useInfiniteScroll ? 0 : ((currentPage || 1) - 1) * ITEMS_PER_PAGE;
  const paginatedDocuments = useInfiniteScroll ? filteredDocuments : filteredDocuments.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // 전체 선택/해제
  const handleSelectAll = useCallback((checked: boolean) => {
    if (checked) {
      setSelectedIds(paginatedDocuments.map(doc => doc.id));
    } else {
      setSelectedIds([]);
    }
  }, [paginatedDocuments]);

  // 페이지 변경
  const onPageChange = useCallback((page: number) => {
    setCurrentPage(page);
    setSelectedIds([]); // 페이지 변경 시 선택 초기화
  }, []);



  // 필터 변경 시 상위 컴포넌트에 알림
  const handleFiltersChange = useCallback(() => {
    if (onFiltersChange) {
      const filters: DocumentFilters = {
        search: searchQuery || undefined,
        processing_status: statusFilter !== 'all' ? statusFilter : undefined,
        file_type: fileTypeFilter !== 'all' ? fileTypeFilter : undefined,
        sort_by: sortBy,
        sort_order: sortOrder
      };
      onFiltersChange(filters);
    }
  }, [searchQuery, statusFilter, fileTypeFilter, sortBy, sortOrder, onFiltersChange]);

  // 필터 초기화
  const handleResetFilters = useCallback(() => {
    setSearchQuery('');
    setStatusFilter('all');
    setFileTypeFilter('all');
    setSortBy('created_at');
    setSortOrder('desc');
    setSelectedIds([]);
  }, []);

  // 고유한 파일 타입 목록
  const fileTypes = useMemo(() => {
    const types = new Set(documents.map(doc => doc.file_type));
    return Array.from(types);
  }, [documents]);

  React.useEffect(() => {
    handleFiltersChange();
  }, [handleFiltersChange]);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-32">
            <RefreshCw className="h-6 w-6 animate-spin mr-2" />
            문서 목록을 불러오는 중...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* 검색 및 필터 */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">문서 관리</CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="h-4 w-4 mr-1" />
                필터
              </Button>
              {selectedIds.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    {selectedIds.length}개 선택됨
                  </span>
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
                          선택한 {selectedIds.length}개의 문서를 삭제하시겠습니까? 
                          이 작업은 되돌릴 수 없습니다.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>취소</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => {
                            onBulkAction('delete', selectedIds);
                            setSelectedIds([]);
                          }}
                        >
                          삭제
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      onBulkAction('reprocess', selectedIds);
                      setSelectedIds([]);
                    }}
                  >
                    <RefreshCw className="h-4 w-4 mr-1" />
                    재처리
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 검색바 */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="파일명으로 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* 필터 옵션 */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg">
              <div>
                <label className="text-sm font-medium mb-2 block">상태</label>
                <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">전체</SelectItem>
                    <SelectItem value="pending">대기중</SelectItem>
                    <SelectItem value="processing">처리중</SelectItem>
                    <SelectItem value="completed">완료</SelectItem>
                    <SelectItem value="failed">실패</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">파일 타입</label>
                <Select value={fileTypeFilter} onValueChange={setFileTypeFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">전체</SelectItem>
                    {fileTypes.map(type => (
                      <SelectItem key={type} value={type}>
                        {type.split('/')[1]?.toUpperCase() || type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">정렬 기준</label>
                <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="filename">파일명</SelectItem>
                    <SelectItem value="created_at">생성일</SelectItem>
                    <SelectItem value="file_size">파일 크기</SelectItem>
                    <SelectItem value="chunk_count">청크 수</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">정렬 순서</label>
                <Select value={sortOrder} onValueChange={(value: any) => setSortOrder(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="desc">내림차순</SelectItem>
                    <SelectItem value="asc">오름차순</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="md:col-span-4 flex justify-end">
                <Button variant="outline" size="sm" onClick={handleResetFilters}>
                  필터 초기화
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 문서 목록 - 무한 스크롤 또는 테이블 */}
      {useInfiniteScroll && loadDocuments ? (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedIds.length > 0}
                      onCheckedChange={(checked) => {
                        // 무한 스크롤에서는 전체 선택 기능 제한
                        if (!checked) setSelectedIds([]);
                      }}
                    />
                  </TableHead>
                  <TableHead>파일명</TableHead>
                  <TableHead>파일 타입</TableHead>
                  <TableHead>크기</TableHead>
                  <TableHead>청크 수</TableHead>
                  <TableHead>상태</TableHead>
                  <TableHead>생성일</TableHead>
                  <TableHead className="w-32">작업</TableHead>
                </TableRow>
              </TableHeader>
            </Table>
            <InfiniteScroll
              loadItems={loadDocuments}
              renderItem={renderDocumentItem}
              initialPage={initialPage}
              getItemKey={(item) => item.id}
              emptyComponent={
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  업로드된 문서가 없습니다.
                </div>
              }
              loadingComponent={
                <div className="py-4 flex justify-center">
                  <LoadingSpinner size="sm" text="문서를 불러오는 중..." />
                </div>
              }
            />
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedIds.length === paginatedDocuments.length && paginatedDocuments.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>파일명</TableHead>
                  <TableHead>파일 타입</TableHead>
                  <TableHead>크기</TableHead>
                  <TableHead>청크 수</TableHead>
                  <TableHead>상태</TableHead>
                  <TableHead>생성일</TableHead>
                  <TableHead className="w-32">작업</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedDocuments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      {searchQuery || statusFilter !== 'all' || fileTypeFilter !== 'all' 
                        ? '검색 조건에 맞는 문서가 없습니다.' 
                        : '업로드된 문서가 없습니다.'}
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedDocuments.map((document) => renderDocumentItem(document, 0))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* 페이지네이션 - 무한 스크롤이 아닌 경우에만 표시 */}
      {!useInfiniteScroll && totalPages > 1 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                전체 {filteredDocuments.length}개 중 {startIndex + 1}-{Math.min(startIndex + pageSize, filteredDocuments.length)}개 표시
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange?.(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  이전
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const page = i + 1;
                    return (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => onPageChange?.(page)}
                      >
                        {page}
                      </Button>
                    );
                  })}
                  {totalPages > 5 && (
                    <>
                      <span className="px-2">...</span>
                      <Button
                        variant={currentPage === totalPages ? "default" : "outline"}
                        size="sm"
                        onClick={() => onPageChange?.(totalPages)}
                      >
                        {totalPages}
                      </Button>
                    </>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange?.(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  다음
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};