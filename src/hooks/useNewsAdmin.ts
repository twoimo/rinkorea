import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { SupabaseClient } from '@supabase/supabase-js';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { QUERY_KEYS } from '@/lib/query-client';

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

interface NewsData {
  title: string;
  content: string;
  published: boolean;
  // 다국어 필드들
  title_ko?: string;
  title_en?: string;
  title_zh?: string;
  title_id?: string;
  content_ko?: string;
  content_en?: string;
  content_zh?: string;
  content_id?: string;
}

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

export const useNewsAdmin = () => {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // 뉴스 생성 mutation
  const createNewsMutation = useMutation({
    mutationFn: async (newsData: NewsData) => {
      const insertPayload = {
        ...newsData,
        author_id: user?.id || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data, error } = await (supabase as unknown as SupabaseClient)
        .from('news')
        .insert([insertPayload])
        .select(SELECT_COLUMNS)
        .single();

      if (error) throw error;
      return data;
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

      toast({
        title: "공지사항이 작성되었습니다",
        description: newNews.published ? "공지사항이 게시되었습니다." : "초안으로 저장되었습니다."
      });
    },
    onError: (error) => {
      console.error('Error creating news:', error);
      toast({
        title: "공지사항 작성 실패",
        description: "다시 시도해주세요.",
        variant: "destructive"
      });
    }
  });

  // 뉴스 업데이트 mutation
  const updateNewsMutation = useMutation({
    mutationFn: async ({ id, newsData }: { id: string; newsData: NewsData }) => {
      const payload = {
        ...newsData,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await (supabase as unknown as SupabaseClient)
        .from('news')
        .update(payload)
        .eq('id', id)
        .select(SELECT_COLUMNS)
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (updatedNews, { id }) => {
      // 모든 관련 쿼리 캐시 무효화
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.NEWS?.ALL || 'news-all'] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.NEWS?.PUBLISHED || 'news-published'] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.NEWS?.BY_ID?.(id) || `news-${id}`] });

      // Optimistic update로 즉시 반영
      queryClient.setQueryData([QUERY_KEYS.NEWS?.ALL || 'news-all'], (oldData: NewsItem[] | undefined) => {
        if (!oldData) return [updatedNews];
        return oldData.map(n => n.id === id ? updatedNews : n);
      });

      queryClient.setQueryData([QUERY_KEYS.NEWS?.PUBLISHED || 'news-published'], (oldData: NewsItem[] | undefined) => {
        if (!oldData) return updatedNews.published ? [updatedNews] : [];
        if (updatedNews.published) {
          // 발행된 뉴스로 업데이트되었을 때
          const exists = oldData.some(n => n.id === id);
          if (exists) {
            return oldData.map(n => n.id === id ? updatedNews : n);
          } else {
            return [updatedNews, ...oldData];
          }
        } else {
          // 발행 취소된 경우
          return oldData.filter(n => n.id !== id);
        }
      });

      toast({
        title: "공지사항이 수정되었습니다",
        description: "변경사항이 저장되었습니다."
      });
    },
    onError: (error) => {
      console.error('Error updating news:', error);
      toast({
        title: "공지사항 수정 실패",
        description: "다시 시도해주세요.",
        variant: "destructive"
      });
    }
  });

  // 뉴스 삭제 mutation
  const deleteNewsMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as unknown as SupabaseClient)
        .from('news')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return id;
    },
    onSuccess: (id) => {
      // 모든 관련 쿼리 캐시 무효화
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.NEWS?.ALL || 'news-all'] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.NEWS?.PUBLISHED || 'news-published'] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.NEWS?.BY_ID?.(id) || `news-${id}`] });

      // Optimistic update로 즉시 반영
      queryClient.setQueryData([QUERY_KEYS.NEWS?.ALL || 'news-all'], (oldData: NewsItem[] | undefined) => {
        if (!oldData) return [];
        return oldData.filter(n => n.id !== id);
      });

      queryClient.setQueryData([QUERY_KEYS.NEWS?.PUBLISHED || 'news-published'], (oldData: NewsItem[] | undefined) => {
        if (!oldData) return [];
        return oldData.filter(n => n.id !== id);
      });

      toast({
        title: "공지사항이 삭제되었습니다",
        description: "공지사항이 성공적으로 삭제되었습니다."
      });
    },
    onError: (error) => {
      console.error('Error deleting news:', error);
      toast({
        title: "공지사항 삭제 실패",
        description: "다시 시도해주세요.",
        variant: "destructive"
      });
    }
  });

  const createNews = async (newsData: NewsData) => {
    setLoading(true);
    try {
      const result = await createNewsMutation.mutateAsync(newsData);
      return { data: result };
    } catch (error) {
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const updateNews = async (id: string, newsData: NewsData) => {
    setLoading(true);
    try {
      const result = await updateNewsMutation.mutateAsync({ id, newsData });
      return { data: result };
    } catch (error) {
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const deleteNews = async (id: string) => {
    setLoading(true);
    try {
      await deleteNewsMutation.mutateAsync(id);
      return { success: true };
    } catch (error) {
      return { error };
    } finally {
      setLoading(false);
    }
  };

  return {
    createNews,
    updateNews,
    deleteNews,
    loading
  };
};
