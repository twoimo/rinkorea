import React, { useState, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Copy, 
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
  Hash,
  Type,
  Zap,
  RefreshCw
} from 'lucide-react';
import type { DocumentChunk } from '@/types/vector';

interface ChunkViewerProps {
  chunks: DocumentChunk[];
  loading: boolean;
  onChunkUpdate: (chunkId: string, content: string, metadata: Record<string, any>) => void;
  onChunkDelete: (chunkId: string) => void;
}

interface ChunkEditDialogProps {
  chunk: DocumentChunk;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (content: string, metadata: Record<string, any>) => void;
}

const ChunkEditDialog: React.FC<ChunkEditDialogProps> = ({
  chunk,
  open,
  onOpenChange,
  onSave
}) => {
  const [content, setContent] = useState(chunk.content);
  const [metadataJson, setMetadataJson] = useState(
    JSON.stringify(chunk.metadata, null, 2)
  );
  const [isValidJson, setIsValidJson] = useState(true);

  const handleMetadataChange = (value: string) => {
    setMetadataJson(value);
    try {
      JSON.parse(value);
      setIsValidJson(true);
    } catch {
      setIsValidJson(false);
    }
  };

  const handleSave = () => {
    if (!isValidJson) return;
    
    try {
      const metadata = JSON.parse(metadataJson);
      onSave(content, metadata);
      onOpenChange(false);
    } catch (error) {
      console.error('메타데이터 파싱 오류:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>청크 편집 - #{chunk.chunk_index}</DialogTitle>
          <DialogDescription>
            청크 내용과 메타데이터를 수정할 수 있습니다.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 overflow-y-auto">
          <div>
            <label className="text-sm font-medium mb-2 block">내용</label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[200px] font-mono text-sm"
              placeholder="청크 내용을 입력하세요..."
            />
            <p className="text-xs text-muted-foreground mt-1">
              {content.length.toLocaleString()}자
            </p>
          </div>
          
          <div>
            <label className="text-sm font-medium mb-2 block">메타데이터 (JSON)</label>
            <Textarea
              value={metadataJson}
              onChange={(e) => handleMetadataChange(e.target.value)}
              className="min-h-[150px] font-mono text-sm"
              placeholder='{"key": "value"}'
            />
            {!isValidJson && (
              <p className="text-xs text-red-500 mt-1">
                유효하지 않은 JSON 형식입니다.
              </p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            취소
          </Button>
          <Button onClick={handleSave} disabled={!isValidJson}>
            저장
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const ChunkCard: React.FC<{
  chunk: DocumentChunk;
  index: number;
  isSelected: boolean;
  onSelect: (selected: boolean) => void;
  onEdit: () => void;
  onDelete: () => void;
  showContent: boolean;
  onToggleContent: () => void;
}> = ({ 
  chunk, 
  index, 
  isSelected, 
  onSelect, 
  onEdit, 
  onDelete, 
  showContent, 
  onToggleContent 
}) => {
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (error) {
      console.error('클립보드 복사 실패:', error);
    }
  };

  const hasEmbedding = chunk.embedding && chunk.embedding.length > 0;
  const metadataKeys = Object.keys(chunk.metadata || {});

  return (
    <Card className={`transition-colors ${isSelected ? 'ring-2 ring-primary' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Checkbox
              checked={isSelected}
              onCheckedChange={onSelect}
            />
            <div className="flex items-center gap-2">
              <Hash className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">청크 {chunk.chunk_index}</span>
            </div>
            <div className="flex items-center gap-2">
              {hasEmbedding ? (
                <Badge variant="default" className="text-xs bg-green-500 hover:bg-green-600">
                  <Zap className="h-3 w-3 mr-1" />
                  벡터화 완료
                </Badge>
              ) : (
                <Badge variant="secondary" className="text-xs">
                  벡터화 대기
                </Badge>
              )}
              <Badge variant="outline" className="text-xs">
                <Type className="h-3 w-3 mr-1" />
                {chunk.content.length}자
              </Badge>
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleContent}
            >
              {showContent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => copyToClipboard(chunk.content)}
            >
              <Copy className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onEdit}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>청크 삭제</AlertDialogTitle>
                  <AlertDialogDescription>
                    청크 #{chunk.chunk_index}를 삭제하시겠습니까? 
                    이 작업은 되돌릴 수 없습니다.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>취소</AlertDialogCancel>
                  <AlertDialogAction onClick={onDelete}>
                    삭제
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </CardHeader>
      
      {showContent && (
        <CardContent className="pt-0">
          <div className="space-y-3">
            <div>
              <ScrollArea className="h-32 w-full border rounded-md p-3">
                <pre className="whitespace-pre-wrap text-sm font-mono">
                  {chunk.content}
                </pre>
              </ScrollArea>
            </div>
            
            {metadataKeys.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-2">메타데이터</p>
                <div className="flex flex-wrap gap-1">
                  {metadataKeys.map(key => (
                    <Badge key={key} variant="outline" className="text-xs">
                      {key}: {String(chunk.metadata[key])}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            
            {hasEmbedding && (
              <div>
                <p className="text-sm font-medium mb-2">벡터 정보</p>
                <Badge variant="outline" className="text-xs">
                  차원: {chunk.embedding!.length}
                </Badge>
              </div>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
};

export const ChunkViewer: React.FC<ChunkViewerProps> = ({
  chunks,
  loading,
  onChunkUpdate,
  onChunkDelete
}) => {
  const [selectedChunks, setSelectedChunks] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'with_embedding' | 'without_embedding'>('all');
  const [sortBy, setSortBy] = useState<'index' | 'length' | 'created_at'>('index');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [showFilters, setShowFilters] = useState(false);
  const [expandedChunks, setExpandedChunks] = useState<Set<string>>(new Set());
  const [editingChunk, setEditingChunk] = useState<DocumentChunk | null>(null);

  // 필터링 및 정렬된 청크 목록
  const filteredChunks = useMemo(() => {
    let filtered = chunks.filter(chunk => {
      const matchesSearch = searchQuery === '' || 
        chunk.content.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesFilter = filterType === 'all' ||
        (filterType === 'with_embedding' && chunk.embedding && chunk.embedding.length > 0) ||
        (filterType === 'without_embedding' && (!chunk.embedding || chunk.embedding.length === 0));

      return matchesSearch && matchesFilter;
    });

    // 정렬
    filtered.sort((a, b) => {
      let aValue: any = a[sortBy === 'index' ? 'chunk_index' : sortBy === 'length' ? 'content' : 'created_at'];
      let bValue: any = b[sortBy === 'index' ? 'chunk_index' : sortBy === 'length' ? 'content' : 'created_at'];

      if (sortBy === 'length') {
        aValue = aValue.length;
        bValue = bValue.length;
      } else if (sortBy === 'created_at') {
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
  }, [chunks, searchQuery, filterType, sortBy, sortOrder]);

  // 전체 선택/해제
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedChunks(filteredChunks.map(chunk => chunk.id));
    } else {
      setSelectedChunks([]);
    }
  };

  // 개별 선택/해제
  const handleSelectChunk = (chunkId: string, checked: boolean) => {
    if (checked) {
      setSelectedChunks(prev => [...prev, chunkId]);
    } else {
      setSelectedChunks(prev => prev.filter(id => id !== chunkId));
    }
  };

  // 청크 내용 표시 토글
  const toggleChunkContent = (chunkId: string) => {
    setExpandedChunks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(chunkId)) {
        newSet.delete(chunkId);
      } else {
        newSet.add(chunkId);
      }
      return newSet;
    });
  };

  // 청크 편집 저장
  const handleChunkSave = (content: string, metadata: Record<string, any>) => {
    if (editingChunk) {
      onChunkUpdate(editingChunk.id, content, metadata);
      setEditingChunk(null);
    }
  };

  // 일괄 삭제
  const handleBulkDelete = () => {
    selectedChunks.forEach(chunkId => {
      onChunkDelete(chunkId);
    });
    setSelectedChunks([]);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-32">
            <RefreshCw className="h-6 w-6 animate-spin mr-2" />
            청크 목록을 불러오는 중...
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
            <CardTitle className="text-lg">
              청크 관리 ({filteredChunks.length}개)
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="h-4 w-4 mr-1" />
                필터
              </Button>
              {selectedChunks.length > 0 && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Trash2 className="h-4 w-4 mr-1" />
                      선택 삭제 ({selectedChunks.length})
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>청크 일괄 삭제</AlertDialogTitle>
                      <AlertDialogDescription>
                        선택한 {selectedChunks.length}개의 청크를 삭제하시겠습니까? 
                        이 작업은 되돌릴 수 없습니다.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>취소</AlertDialogCancel>
                      <AlertDialogAction onClick={handleBulkDelete}>
                        삭제
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 검색바 */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="청크 내용으로 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* 필터 옵션 */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
              <div>
                <label className="text-sm font-medium mb-2 block">벡터 상태</label>
                <Select value={filterType} onValueChange={(value: any) => setFilterType(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">전체</SelectItem>
                    <SelectItem value="with_embedding">벡터화 완료</SelectItem>
                    <SelectItem value="without_embedding">벡터화 대기</SelectItem>
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
                    <SelectItem value="index">청크 순서</SelectItem>
                    <SelectItem value="length">내용 길이</SelectItem>
                    <SelectItem value="created_at">생성일</SelectItem>
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
                    <SelectItem value="asc">오름차순</SelectItem>
                    <SelectItem value="desc">내림차순</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* 전체 선택 */}
          {filteredChunks.length > 0 && (
            <div className="flex items-center gap-2">
              <Checkbox
                checked={selectedChunks.length === filteredChunks.length}
                onCheckedChange={handleSelectAll}
              />
              <span className="text-sm">전체 선택</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 청크 목록 */}
      <div className="space-y-3">
        {filteredChunks.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8 text-muted-foreground">
              <Hash className="h-8 w-8 mx-auto mb-2 opacity-50" />
              {searchQuery || filterType !== 'all' 
                ? '검색 조건에 맞는 청크가 없습니다.' 
                : '청크가 없습니다.'}
            </CardContent>
          </Card>
        ) : (
          filteredChunks.map((chunk, index) => (
            <ChunkCard
              key={chunk.id}
              chunk={chunk}
              index={index}
              isSelected={selectedChunks.includes(chunk.id)}
              onSelect={(selected) => handleSelectChunk(chunk.id, selected)}
              onEdit={() => setEditingChunk(chunk)}
              onDelete={() => onChunkDelete(chunk.id)}
              showContent={expandedChunks.has(chunk.id)}
              onToggleContent={() => toggleChunkContent(chunk.id)}
            />
          ))
        )}
      </div>

      {/* 청크 편집 다이얼로그 */}
      {editingChunk && (
        <ChunkEditDialog
          chunk={editingChunk}
          open={!!editingChunk}
          onOpenChange={(open) => !open && setEditingChunk(null)}
          onSave={handleChunkSave}
        />
      )}
    </div>
  );
};