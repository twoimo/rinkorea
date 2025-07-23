import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff, 
  Search,
  Plus,
  FileText,
  Database
} from 'lucide-react';
import type { Collection } from '@/types/vector';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';

interface CollectionListProps {
  collections: Collection[];
  loading: boolean;
  onEdit: (collection: Collection) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string, isActive: boolean) => void;
  onBulkAction: (action: 'delete' | 'activate' | 'deactivate', ids: string[]) => void;
  onCreate: () => void;
}

export const CollectionList: React.FC<CollectionListProps> = ({
  collections,
  loading,
  onEdit,
  onDelete,
  onToggleStatus,
  onBulkAction,
  onCreate
}) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    collectionId?: string;
    collectionName?: string;
  }>({ isOpen: false });

  // 검색 필터링
  const filteredCollections = collections.filter(collection =>
    collection.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    collection.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // 전체 선택/해제
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(filteredCollections.map(c => c.id));
    } else {
      setSelectedIds([]);
    }
  };

  // 개별 선택/해제
  const handleSelectItem = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds(prev => [...prev, id]);
    } else {
      setSelectedIds(prev => prev.filter(selectedId => selectedId !== id));
    }
  };

  // 삭제 확인 다이얼로그 열기
  const handleDeleteClick = (collection: Collection) => {
    setDeleteConfirm({
      isOpen: true,
      collectionId: collection.id,
      collectionName: collection.name
    });
  };

  // 삭제 실행
  const handleDeleteConfirm = () => {
    if (deleteConfirm.collectionId) {
      onDelete(deleteConfirm.collectionId);
    }
    setDeleteConfirm({ isOpen: false });
  };

  // 일괄 작업 실행
  const handleBulkAction = (action: 'delete' | 'activate' | 'deactivate') => {
    if (selectedIds.length > 0) {
      onBulkAction(action, selectedIds);
      setSelectedIds([]);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <LoadingSpinner />
        <span className="ml-2">컬렉션을 불러오는 중...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 헤더 및 검색 */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">컬렉션 관리</h2>
          <p className="text-muted-foreground">
            문서를 논리적으로 그룹화하여 관리합니다
          </p>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="컬렉션 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          <Button onClick={onCreate}>
            <Plus className="h-4 w-4 mr-2" />
            새 컬렉션
          </Button>
        </div>
      </div>

      {/* 일괄 작업 바 */}
      {selectedIds.length > 0 && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="py-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                {selectedIds.length}개 컬렉션 선택됨
              </span>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleBulkAction('activate')}
                >
                  <Eye className="h-4 w-4 mr-1" />
                  활성화
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleBulkAction('deactivate')}
                >
                  <EyeOff className="h-4 w-4 mr-1" />
                  비활성화
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleBulkAction('delete')}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  삭제
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 컬렉션 목록 */}
      {filteredCollections.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <Database className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">컬렉션이 없습니다</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery ? '검색 결과가 없습니다' : '첫 번째 컬렉션을 생성해보세요'}
            </p>
            {!searchQuery && (
              <Button onClick={onCreate}>
                <Plus className="h-4 w-4 mr-2" />
                새 컬렉션 만들기
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {/* 전체 선택 체크박스 */}
          <div className="flex items-center gap-2 px-1">
            <Checkbox
              checked={selectedIds.length === filteredCollections.length}
              onCheckedChange={handleSelectAll}
            />
            <span className="text-sm text-muted-foreground">
              전체 선택
            </span>
          </div>

          {/* 컬렉션 카드들 */}
          <div className="grid gap-4">
            {filteredCollections.map((collection) => (
              <Card key={collection.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <Checkbox
                        checked={selectedIds.includes(collection.id)}
                        onCheckedChange={(checked) => 
                          handleSelectItem(collection.id, checked as boolean)
                        }
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <CardTitle className="text-lg">{collection.name}</CardTitle>
                          <Badge variant={collection.is_active ? 'default' : 'secondary'}>
                            {collection.is_active ? '활성' : '비활성'}
                          </Badge>
                        </div>
                        {collection.description && (
                          <p className="text-sm text-muted-foreground">
                            {collection.description}
                          </p>
                        )}
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEdit(collection)}>
                          <Edit className="h-4 w-4 mr-2" />
                          수정
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => onToggleStatus(collection.id, !collection.is_active)}
                        >
                          {collection.is_active ? (
                            <>
                              <EyeOff className="h-4 w-4 mr-2" />
                              비활성화
                            </>
                          ) : (
                            <>
                              <Eye className="h-4 w-4 mr-2" />
                              활성화
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDeleteClick(collection)}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          삭제
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">문서:</span>
                      <span className="font-medium">{collection.document_count}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Database className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">청크:</span>
                      <span className="font-medium">{collection.total_chunks}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">생성일:</span>
                      <span className="ml-1 font-medium">
                        {formatDistanceToNow(new Date(collection.created_at), {
                          addSuffix: true,
                          locale: ko
                        })}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">수정일:</span>
                      <span className="ml-1 font-medium">
                        {formatDistanceToNow(new Date(collection.updated_at), {
                          addSuffix: true,
                          locale: ko
                        })}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* 삭제 확인 다이얼로그 */}
      <AlertDialog open={deleteConfirm.isOpen} onOpenChange={(open) => 
        setDeleteConfirm({ isOpen: open })
      }>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>컬렉션 삭제</AlertDialogTitle>
            <AlertDialogDescription>
              "{deleteConfirm.collectionName}" 컬렉션을 삭제하시겠습니까?
              <br />
              <strong className="text-destructive">
                이 작업은 되돌릴 수 없으며, 컬렉션에 포함된 모든 문서와 데이터가 함께 삭제됩니다.
              </strong>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              삭제
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};