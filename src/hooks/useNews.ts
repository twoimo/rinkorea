import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { queryClient, QUERY_KEYS } from '@/lib/query-client';

interface NewsItem {
  id: string;
  title: string;
  content: string;
  author_id: string | null;
  published: boolean;
  created_at: string;
  updated_at: string;
}

export const useNews = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNews();
  }, []);

  // React Query 캐시 변경 이벤트 구독
  useEffect(() => {
    const unsubscribe = queryClient.getQueryCache().subscribe(({ query, type }) => {
      // News 관련 쿼리 캐시가 무효화되면 데이터 새로고침
      if (type === 'removed' || type === 'updated') {
        const queryKey = query.queryKey[0];
        if (typeof queryKey === 'string' && (
          queryKey === QUERY_KEYS.NEWS.ALL ||
          queryKey === QUERY_KEYS.NEWS.PUBLISHED ||
          queryKey.startsWith('news-')
        )) {
          console.log('News cache invalidated, refetching...');
          fetchNews();
        }
      }
    });

    return unsubscribe;
  }, []);

  const fetchNews = async () => {
    try {
      const { data, error } = await supabase
        .from('news')
        .select('*')
        .eq('published', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching news:', error);
      } else {
        setNews(data || []);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    news,
    loading,
    refetch: fetchNews
  };
};
