import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { 
  Collection, 
  CreateCollectionData, 
  UpdateCollectionData, 
  CollectionStats,
  CollectionFilters,
  UseCollectionsReturn 
} from '@/types/vector';
import {
  getCollections,
  createCollection,
  updateCollection,
  deleteCollection,
  bulkDeleteCollections,
  bulkUpdateCollectionStatus,
  getCollectionStats
} from '@/services/collectionService';

export const useCollections = (filters?: CollectionFilters): UseCollectionsReturn => {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  // 컬렉션 목록 조회
  const {
    data: collections = [],
    isLoading: loading,
    refetch
  } = useQuery({
    queryKey: ['collections', filters],
    queryFn: () => getCollections(filters),
    staleTime: 30000, // 30초
    onError: (err: any) => {
      const errorMessage = err?.message || '컬렉션을 불러오는 중 오류가 발생했습니다';
      setError(errorMessage);
      toast.error(errorMessage);
    }
  });

  // 컬렉션 생성
  const createMutation = useMutation({
    mutationFn: createCollection,
    onSuccess: (newCollection) => {
      queryClient.invalidateQueries({ queryKey: ['collections'] });
      toast.success(`"${newCollection.name}" 컬렉션이 생성되었습니다`);
    },
    onError: (err: any) => {
      const errorMessage = err?.message || '컬렉션 생성 중 오류가 발생했습니다';
      toast.error(errorMessage);
      throw err;
    }
  });

  // 컬렉션 수정
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCollectionData }) =>
      updateCollection(id, data),
    onSuccess: (updatedCollection) => {
      queryClient.invalidateQueries({ queryKey: ['collections'] });
      queryClient.invalidateQueries({ queryKey: ['collection-stats', updatedCollection.id] });
      toast.success(`"${updatedCollection.name}" 컬렉션이 수정되었습니다`);
    },
    onError: (err: any) => {
      const errorMessage = err?.message || '컬렉션 수정 중 오류가 발생했습니다';
      toast.error(errorMessage);
      throw err;
    }
  });

  // 컬렉션 삭제
  const deleteMutation = useMutation({
    mutationFn: deleteCollection,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collections'] });
      toast.success('컬렉션이 삭제되었습니다');
    },
    onError: (err: any) => {
      const errorMessage = err?.message || '컬렉션 삭제 중 오류가 발생했습니다';
      toast.error(errorMessage);
    }
  });

  // 컬렉션 일괄 삭제
  const bulkDeleteMutation = useMutation({
    mutationFn: bulkDeleteCollections,
    onSuccess: (_, ids) => {
      queryClient.invalidateQueries({ queryKey: ['collections'] });
      toast.success(`${ids.length}개 컬렉션이 삭제되었습니다`);
    },
    onError: (err: any) => {
      const errorMessage = err?.message || '컬렉션 일괄 삭제 중 오류가 발생했습니다';
      toast.error(errorMessage);
    }
  });

  // 컬렉션 상태 일괄 업데이트
  const bulkStatusMutation = useMutation({
    mutationFn: ({ ids, isActive }: { ids: string[]; isActive: boolean }) =>
      bulkUpdateCollectionStatus(ids, isActive),
    onSuccess: (_, { ids, isActive }) => {
      queryClient.invalidateQueries({ queryKey: ['collections'] });
      toast.success(
        `${ids.length}개 컬렉션이 ${isActive ? '활성화' : '비활성화'}되었습니다`
      );
    },
    onError: (err: any) => {
      const errorMessage = err?.message || '컬렉션 상태 변경 중 오류가 발생했습니다';
      toast.error(errorMessage);
    }
  });

  // 컬렉션 생성 함수
  const handleCreateCollection = useCallback(
    async (data: CreateCollectionData): Promise<Collection> => {
      return createMutation.mutateAsync(data);
    },
    [createMutation]
  );

  // 컬렉션 수정 함수
  const handleUpdateCollection = useCallback(
    async (id: string, data: UpdateCollectionData): Promise<Collection> => {
      return updateMutation.mutateAsync({ id, data });
    },
    [updateMutation]
  );

  // 컬렉션 삭제 함수
  const handleDeleteCollection = useCallback(
    async (id: string): Promise<void> => {
      return deleteMutation.mutateAsync(id);
    },
    [deleteMutation]
  );

  // 컬렉션 일괄 삭제 함수
  const handleBulkDeleteCollections = useCallback(
    async (ids: string[]): Promise<void> => {
      return bulkDeleteMutation.mutateAsync(ids);
    },
    [bulkDeleteMutation]
  );

  // 컬렉션 통계 조회 함수
  const handleGetCollectionStats = useCallback(
    async (id: string): Promise<CollectionStats> => {
      return getCollectionStats(id);
    },
    []
  );

  // 일괄 작업 처리 함수
  const handleBulkAction = useCallback(
    async (action: 'delete' | 'activate' | 'deactivate', ids: string[]): Promise<void> => {
      if (action === 'delete') {
        return handleBulkDeleteCollections(ids);
      } else {
        const isActive = action === 'activate';
        return bulkStatusMutation.mutateAsync({ ids, isActive });
      }
    },
    [handleBulkDeleteCollections, bulkStatusMutation]
  );

  // 데이터 새로고침 함수
  const handleRefetch = useCallback(async (): Promise<void> => {
    setError(null);
    await refetch();
  }, [refetch]);

  // 에러 상태 초기화
  useEffect(() => {
    if (collections.length > 0) {
      setError(null);
    }
  }, [collections]);

  return {
    collections,
    loading: loading || createMutation.isPending || updateMutation.isPending || 
             deleteMutation.isPending || bulkDeleteMutation.isPending || 
             bulkStatusMutation.isPending,
    error,
    createCollection: handleCreateCollection,
    updateCollection: handleUpdateCollection,
    deleteCollection: handleDeleteCollection,
    bulkDeleteCollections: handleBulkDeleteCollections,
    getCollectionStats: handleGetCollectionStats,
    bulkAction: handleBulkAction,
    refetch: handleRefetch
  };
};

// 개별 컬렉션 통계를 위한 훅
export const useCollectionStats = (collectionId: string | null) => {
  const {
    data: stats,
    isLoading: loading,
    error,
    refetch
  } = useQuery({
    queryKey: ['collection-stats', collectionId],
    queryFn: () => collectionId ? getCollectionStats(collectionId) : null,
    enabled: !!collectionId,
    staleTime: 60000, // 1분
    onError: (err: any) => {
      toast.error(err?.message || '통계를 불러오는 중 오류가 발생했습니다');
    }
  });

  return {
    stats: stats || null,
    loading,
    error: error?.message || null,
    refetch
  };
};