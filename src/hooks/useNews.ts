import { useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { SupabaseClient } from '@supabase/supabase-js';
import { QUERY_KEYS } from '@/lib/query-client';

interface NewsItem {
  id: string;
  title: string;
  content: string;
  author_id: string | null;
  published: boolean;
  created_at: string;
  updated_at: string;
  // 언어별 필드
  title_ko?: string;
  title_en?: string;
  title_zh?: string;
  title_id?: string;
  content_ko?: string;
  content_en?: string;
  content_zh?: string;
  content_id?: string;
}

// 언어별 컬럼을 포함한 전체 선택 쿼리
const SELECT_COLUMNS = `
  *,
  title_ko,
  title_en,
  title_zh,
  title_id,
  content_ko,
  content_en,
  content_zh,
  content_id
`;

// 모든 뉴스 데이터 가져오기
const fetchAllNews = async (): Promise<NewsItem[]> => {
  const { data, error } = await (supabase as unknown as SupabaseClient)
    .from('news')
    .select(SELECT_COLUMNS)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
};

// 발행된 뉴스만 가져오기
const fetchPublishedNews = async (): Promise<NewsItem[]> => {
  const { data, error } = await (supabase as unknown as SupabaseClient)
    .from('news')
    .select(SELECT_COLUMNS)
    .eq('published', true)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
};

export const useNews = () => {
  const queryClient = useQueryClient();

  // 모든 뉴스 쿼리
  const {
    data: allNews = [],
    isLoading: loadingAll,
    error: _errorAll,
    refetch: refetchAllNews
  } = useQuery({
    queryKey: [QUERY_KEYS.NEWS?.ALL || 'news-all'],
    queryFn: fetchAllNews,
    staleTime: 5 * 60 * 1000, // 5분
  });

  // 발행된 뉴스만 쿼리
  const {
    data: publishedNews = [],
    isLoading: loadingPublished,
    error: errorPublished,
    refetch: refetchPublishedNews
  } = useQuery({
    queryKey: [QUERY_KEYS.NEWS?.PUBLISHED || 'news-published'],
    queryFn: fetchPublishedNews,
    staleTime: 5 * 60 * 1000, // 5분
  });

  // 기본적으로 발행된 뉴스를 반환 (기존 API 호환성)
  const news = publishedNews;
  const loading = loadingPublished;
  const error = errorPublished;

  // 뉴스 생성 mutation
  const createNewsMutation = useMutation({
    mutationFn: async (newsData: Omit<NewsItem, 'id' | 'created_at' | 'updated_at'>) => {
      const insertPayload = {
        ...newsData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        published: newsData.published || false
      };

      const { data, error } = await (supabase as unknown as SupabaseClient)
        .from('news')
        .insert([insertPayload])
        .select(SELECT_COLUMNS);

      if (error) throw error;
      if (!data || !data[0]) throw new Error('Failed to create news');

      return data[0];
    },
    onSuccess: (newNews) => {
      // 모든 관련 쿼리 캐시 무효화
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.NEWS?.ALL || 'news-all'] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.NEWS?.PUBLISHED || 'news-published'] });

      // Optimistic update로 즉시 반영
      queryClient.setQueryData([QUERY_KEYS.NEWS?.ALL || 'news-all'], (oldData: NewsItem[] | undefined) => {
        if (!oldData) return [newNews];
        return [newNews, ...oldData];
      });

      if (newNews.published) {
        queryClient.setQueryData([QUERY_KEYS.NEWS?.PUBLISHED || 'news-published'], (oldData: NewsItem[] | undefined) => {
          if (!oldData) return [newNews];
          return [newNews, ...oldData];
        });
      }

      console.log('News created successfully:', newNews);
    },
    onError: (error) => {
      console.error('Error creating news:', error);
    }
  });

  // 뉴스 업데이트 mutation
  const updateNewsMutation = useMutation({
    mutationFn: async ({ newsId, updates }: { newsId: string; updates: Partial<NewsItem> }) => {
      const payload = {
        ...updates,
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await (supabase as unknown as SupabaseClient)
        .from('news')
        .update(payload)
        .eq('id', newsId)
        .select(SELECT_COLUMNS);

      if (error) throw error;
      if (!data || !data[0]) throw new Error('Failed to update news');

      return data[0];
    },
    onSuccess: (updatedNews, { newsId }) => {
      // 모든 관련 쿼리 캐시 무효화
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.NEWS?.ALL || 'news-all'] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.NEWS?.PUBLISHED || 'news-published'] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.NEWS?.BY_ID?.(newsId) || `news-${newsId}`] });

      // Optimistic update로 즉시 반영
      queryClient.setQueryData([QUERY_KEYS.NEWS?.ALL || 'news-all'], (oldData: NewsItem[] | undefined) => {
        if (!oldData) return [updatedNews];
        return oldData.map(n => n.id === newsId ? updatedNews : n);
      });

      queryClient.setQueryData([QUERY_KEYS.NEWS?.PUBLISHED || 'news-published'], (oldData: NewsItem[] | undefined) => {
        if (!oldData) return updatedNews.published ? [updatedNews] : [];
        if (updatedNews.published) {
          // 발행된 뉴스로 업데이트되었을 때
          const exists = oldData.some(n => n.id === newsId);
          if (exists) {
            return oldData.map(n => n.id === newsId ? updatedNews : n);
          } else {
            return [updatedNews, ...oldData];
          }
        } else {
          // 발행 취소된 경우
          return oldData.filter(n => n.id !== newsId);
        }
      });

      console.log('News updated successfully:', updatedNews);
    },
    onError: (error) => {
      console.error('Error updating news:', error);
    }
  });

  // 뉴스 삭제 mutation
  const deleteNewsMutation = useMutation({
    mutationFn: async (newsId: string) => {
      const { error } = await (supabase as unknown as SupabaseClient)
        .from('news')
        .delete()
        .eq('id', newsId);

      if (error) throw error;
      return newsId;
    },
    onSuccess: (newsId) => {
      // 모든 관련 쿼리 캐시 무효화
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.NEWS?.ALL || 'news-all'] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.NEWS?.PUBLISHED || 'news-published'] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.NEWS?.BY_ID?.(newsId) || `news-${newsId}`] });

      // Optimistic update로 즉시 반영
      queryClient.setQueryData([QUERY_KEYS.NEWS?.ALL || 'news-all'], (oldData: NewsItem[] | undefined) => {
        if (!oldData) return [];
        return oldData.filter(n => n.id !== newsId);
      });

      queryClient.setQueryData([QUERY_KEYS.NEWS?.PUBLISHED || 'news-published'], (oldData: NewsItem[] | undefined) => {
        if (!oldData) return [];
        return oldData.filter(n => n.id !== newsId);
      });

      console.log('News deleted successfully:', newsId);
    },
    onError: (error) => {
      console.error('Error deleting news:', error);
    }
  });

  // 래퍼 함수들 (기존 API 유지)
  const createNews = useCallback(async (newsData: Omit<NewsItem, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const result = await createNewsMutation.mutateAsync(newsData);
      return { data: result };
    } catch (error) {
      return { error };
    }
  }, [createNewsMutation]);

  const updateNews = useCallback(async (newsId: string, updates: Partial<NewsItem>) => {
    try {
      const result = await updateNewsMutation.mutateAsync({ newsId, updates });
      return { data: result };
    } catch (error) {
      return { error };
    }
  }, [updateNewsMutation]);

  const deleteNews = useCallback(async (newsId: string) => {
    try {
      await deleteNewsMutation.mutateAsync(newsId);
      return { success: true };
    } catch (error) {
      return { error };
    }
  }, [deleteNewsMutation]);

  // 발행 상태 토글
  const togglePublished = useCallback(async (newsId: string, published: boolean) => {
    try {
      const result = await updateNewsMutation.mutateAsync({ newsId, updates: { published } });
      return { data: result };
    } catch (error) {
      return { error };
    }
  }, [updateNewsMutation]);

  // 수동 refetch 함수
  const refetch = useCallback(async () => {
    await Promise.all([refetchAllNews(), refetchPublishedNews()]);
  }, [refetchAllNews, refetchPublishedNews]);

  return {
    // 기존 API 호환성
    news,
    loading,
    error: error ? (error instanceof Error ? error.message : 'Failed to fetch news') : null,
    refetch,

    // 확장된 API
    allNews,
    publishedNews,
    loadingAll,
    loadingPublished,
    createNews,
    updateNews,
    deleteNews,
    togglePublished
  };
};
