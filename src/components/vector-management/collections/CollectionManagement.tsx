import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Database, 
  Plus, 
  BarChart3, 
  Settings,
  RefreshCw
} from 'lucide-react';
import { CollectionList } from './CollectionList';
import { CollectionForm } from './CollectionForm';
import { CollectionStats } from './CollectionStats';
import { useCollections, useCollectionStats } from '@/hooks/useCollections';
import type { Collection, CreateCollectionData, UpdateCollectionData } from '@/types/vector';

interface CollectionManagementProps {
  onSelectCollection?: (collection: Collection) => void;
}

export const CollectionManagement: React.FC<CollectionManagementProps> = ({
  onSelectCollection
}) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCollection, setEditingCollection] = useState<Collection | null>(null);
  const [selectedCollectionId, setSelectedCollectionId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('list');

  // 컬렉션 데이터 관리
  const {
    collections,
    loading,
    error,
    createCollection,
    updateCollection,
    deleteCollection,
    bulkAction,
    refetch
  } = useCollections();

  // 선택된 컬렉션 통계
  const {
    stats,
    loading: statsLoading,
    error: statsError,
    refetch: refetchStats
  } = useCollectionStats(selectedCollectionId);

  // 새 컬렉션 생성 모달 열기
  const handleCreateClick = () => {
    setEditingCollection(null);
    setIsFormOpen(true);
  };

  // 컬렉션 수정 모달 열기
  const handleEditClick = (collection: Collection) => {
    setEditingCollection(collection);
    setIsFormOpen(true);
  };

  // 컬렉션 삭제
  const handleDeleteClick = async (id: string) => {
    try {
      await deleteCollection(id);
      // 삭제된 컬렉션이 선택되어 있었다면 선택 해제
      if (selectedCollectionId === id) {
        setSelectedCollectionId(null);
      }
    } catch (error) {
      // 에러는 useCollections 훅에서 처리됨
    }
  };

  // 컬렉션 상태 토글
  const handleToggleStatus = async (id: string, isActive: boolean) => {
    try {
      const collection = collections.find(c => c.id === id);
      if (collection) {
        await updateCollection(id, { is_active: isActive });
      }
    } catch (error) {
      // 에러는 useCollections 훅에서 처리됨
    }
  };

  // 일괄 작업 처리
  const handleBulkAction = async (
    action: 'delete' | 'activate' | 'deactivate', 
    ids: string[]
  ) => {
    try {
      await bulkAction(action, ids);
      // 삭제된 컬렉션이 선택되어 있었다면 선택 해제
      if (action === 'delete' && selectedCollectionId && ids.includes(selectedCollectionId)) {
        setSelectedCollectionId(null);
      }
    } catch (error) {
      // 에러는 useCollections 훅에서 처리됨
    }
  };

  // 폼 제출 처리
  const handleFormSubmit = async (data: CreateCollectionData | UpdateCollectionData) => {
    try {
      if (editingCollection) {
        await updateCollection(editingCollection.id, data as UpdateCollectionData);
      } else {
        await createCollection(data as CreateCollectionData);
      }
      setIsFormOpen(false);
      setEditingCollection(null);
    } catch (error) {
      // 에러는 useCollections 훅에서 처리되고 폼에서 다시 throw됨
      throw error;
    }
  };

  // 통계 탭에서 컬렉션 선택
  const handleStatsCollectionSelect = (collectionId: string) => {
    setSelectedCollectionId(collectionId);
    setActiveTab('stats');
  };

  // 전체 새로고침
  const handleRefresh = () => {
    refetch();
    if (selectedCollectionId) {
      refetchStats();
    }
  };

  // 활성 컬렉션 수 계산
  const activeCollectionsCount = collections.filter(c => c.is_active).length;
  const totalDocuments = collections.reduce((sum, c) => sum + c.document_count, 0);
  const totalChunks = collections.reduce((sum, c) => sum + c.total_chunks, 0);

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Database className="h-8 w-8" />
            벡터 데이터베이스 관리
          </h1>
          <p className="text-muted-foreground mt-1">
            문서 컬렉션을 생성하고 관리하여 AI 검색 성능을 최적화하세요
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefresh} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            새로고침
          </Button>
          <Button onClick={handleCreateClick}>
            <Plus className="h-4 w-4 mr-2" />
            새 컬렉션
          </Button>
        </div>
      </div>

      {/* 요약 통계 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-blue-600" />
              <span className="text-sm text-muted-foreground">총 컬렉션</span>
            </div>
            <p className="text-2xl font-bold mt-1">{collections.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Badge variant="default" className="h-4 px-2 text-xs">활성</Badge>
              <span className="text-sm text-muted-foreground">활성 컬렉션</span>
            </div>
            <p className="text-2xl font-bold mt-1">{activeCollectionsCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">총 문서</span>
            </div>
            <p className="text-2xl font-bold mt-1">{totalDocuments.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">총 청크</span>
            </div>
            <p className="text-2xl font-bold mt-1">{totalChunks.toLocaleString()}</p>
          </CardContent>
        </Card>
      </div>

      {/* 메인 콘텐츠 */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="list" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            컬렉션 목록
          </TabsTrigger>
          <TabsTrigger value="stats" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            통계 및 분석
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="mt-6">
          <CollectionList
            collections={collections}
            loading={loading}
            onEdit={handleEditClick}
            onDelete={handleDeleteClick}
            onToggleStatus={handleToggleStatus}
            onBulkAction={handleBulkAction}
            onCreate={handleCreateClick}
            onManageDocuments={onSelectCollection}
          />
        </TabsContent>

        <TabsContent value="stats" className="mt-6">
          <div className="space-y-6">
            {/* 컬렉션 선택 */}
            {!selectedCollectionId && (
              <Card>
                <CardHeader>
                  <CardTitle>통계를 볼 컬렉션을 선택하세요</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-2">
                    {collections.map((collection) => (
                      <Button
                        key={collection.id}
                        variant="outline"
                        className="justify-start h-auto p-4"
                        onClick={() => handleStatsCollectionSelect(collection.id)}
                      >
                        <div className="flex items-center justify-between w-full">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{collection.name}</span>
                            <Badge variant={collection.is_active ? 'default' : 'secondary'}>
                              {collection.is_active ? '활성' : '비활성'}
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {collection.document_count}개 문서
                          </div>
                        </div>
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 선택된 컬렉션 통계 */}
            {selectedCollectionId && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">컬렉션 통계</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedCollectionId(null)}
                  >
                    다른 컬렉션 선택
                  </Button>
                </div>
                <CollectionStats
                  stats={stats}
                  loading={statsLoading}
                  error={statsError}
                  onRefresh={refetchStats}
                />
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* 컬렉션 생성/수정 폼 */}
      <CollectionForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingCollection(null);
        }}
        onSubmit={handleFormSubmit}
        collection={editingCollection}
        loading={loading}
      />
    </div>
  );
};