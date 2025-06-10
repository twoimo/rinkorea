
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export const useNewsAdmin = () => {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const createNews = async (newsData: {
    title: string;
    content: string;
    published: boolean;
  }) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('news')
        .insert({
          ...newsData,
          author_id: user?.id || null
        })
        .select()
        .single();

      if (error) {
        toast({
          title: "공지사항 작성 실패",
          description: "다시 시도해주세요.",
          variant: "destructive"
        });
        return { error };
      }

      toast({
        title: "공지사항이 작성되었습니다",
        description: newsData.published ? "공지사항이 게시되었습니다." : "초안으로 저장되었습니다."
      });

      return { data };
    } catch (error) {
      toast({
        title: "오류가 발생했습니다",
        description: "다시 시도해주세요.",
        variant: "destructive"
      });
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const updateNews = async (id: string, newsData: {
    title: string;
    content: string;
    published: boolean;
  }) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('news')
        .update({
          ...newsData,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        toast({
          title: "공지사항 수정 실패",
          description: "다시 시도해주세요.",
          variant: "destructive"
        });
        return { error };
      }

      toast({
        title: "공지사항이 수정되었습니다",
        description: "변경사항이 저장되었습니다."
      });

      return { data };
    } catch (error) {
      toast({
        title: "오류가 발생했습니다",
        description: "다시 시도해주세요.",
        variant: "destructive"
      });
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const deleteNews = async (id: string) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('news')
        .delete()
        .eq('id', id);

      if (error) {
        toast({
          title: "공지사항 삭제 실패",
          description: "다시 시도해주세요.",
          variant: "destructive"
        });
        return { error };
      }

      toast({
        title: "공지사항이 삭제되었습니다",
        description: "공지사항이 성공적으로 삭제되었습니다."
      });

      return { success: true };
    } catch (error) {
      toast({
        title: "오류가 발생했습니다",
        description: "다시 시도해주세요.",
        variant: "destructive"
      });
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
