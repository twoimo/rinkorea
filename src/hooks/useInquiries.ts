import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { invalidateQueries, queryClient, QUERY_KEYS } from '@/lib/query-client';

interface Inquiry {
  id: string;
  user_id: string | null;
  name: string;
  email: string;
  phone: string | null;
  title: string;
  content: string;
  category?: string;
  status: string;
  admin_reply: string | null;
  created_at: string;
  updated_at: string;
  is_private: boolean;
  profiles?: {
    name: string;
  };
}

export interface Reply {
  id: string;
  inquiry_id: string;
  admin_id: string | null;
  content: string;
  created_at: string;
  updated_at: string;
}

export const useInquiries = () => {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchInquiries = useCallback(async () => {
    try {
      console.log('🔍 Fetching inquiries...');
      const { data, error } = await supabase
        .from('inquiries')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching inquiries:', error);
      } else {
        console.log('✅ Inquiries fetched successfully:', data?.length || 0, 'items');
        console.log('📝 Sample inquiry data:', data?.[0]);
        setInquiries(data || []);
      }
    } catch (error) {
      console.error('💥 Exception in fetchInquiries:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInquiries();
  }, [fetchInquiries, user]);

  // React Query 캐시 변경 이벤트 구독
  useEffect(() => {
    const unsubscribe = queryClient.getQueryCache().subscribe(({ query, type }) => {
      // Inquiries 관련 쿼리 캐시가 무효화되면 데이터 새로고침
      if (type === 'removed' || type === 'updated') {
        const queryKey = query.queryKey[0];
        if (typeof queryKey === 'string' && (
          queryKey === QUERY_KEYS.INQUIRIES.ALL ||
          queryKey.startsWith('inquiry-') ||
          queryKey.startsWith('inquiry-replies-')
        )) {
          console.log('Inquiries cache invalidated, refetching...');
          fetchInquiries();
        }
      }
    });

    return unsubscribe;
  }, [fetchInquiries]);

  const createInquiry = async (inquiry: {
    name: string;
    email: string;
    phone?: string;
    title: string;
    content: string;
    category: string;
    is_private?: boolean;
  }) => {
    try {
      const { data, error } = await supabase
        .from('inquiries')
        .insert({
          ...inquiry,
          user_id: user?.id || null
        })
        .select()
        .single();

      if (error) {
        return { error };
      }

      setInquiries(prev => [data, ...prev]);

      // 캐시 무효화 - 즉시 UI 반영
      invalidateQueries.inquiries();

      return { data };
    } catch (error) {
      return { error };
    }
  };

  const updateInquiry = async (id: string, updates: {
    status?: string;
    admin_reply?: string;
    name?: string;
    email?: string;
    phone?: string;
    title?: string;
    content?: string;
    is_private?: boolean;
  }) => {
    try {
      const { data, error } = await supabase
        .from('inquiries')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return { error };
      }

      setInquiries(prev => prev.map(inquiry =>
        inquiry.id === id ? data : inquiry
      ));

      // 캐시 무효화 - 즉시 UI 반영
      invalidateQueries.inquiries();
      invalidateQueries.inquiry(id);

      return { data };
    } catch (error) {
      return { error };
    }
  };

  const deleteInquiry = async (id: string) => {
    try {
      const { error } = await supabase
        .from('inquiries')
        .delete()
        .eq('id', id);

      if (error) {
        return { error };
      }

      setInquiries(prev => prev.filter(inquiry => inquiry.id !== id));

      // 캐시 무효화 - 즉시 UI 반영
      invalidateQueries.inquiries();
      invalidateQueries.inquiry(id);

      return { success: true };
    } catch (error) {
      return { error };
    }
  };

  const getReplies = useCallback(async (inquiryId: string): Promise<Reply[]> => {
    console.log('🔍 Getting replies for inquiry:', inquiryId);
    const { data, error } = await supabase
      .from('replies')
      .select('*')
      .eq('inquiry_id', inquiryId)
      .order('created_at', { ascending: true });
    if (error) throw error;
    return data || [];
  }, []);

  const createReply = async (inquiryId: string, content: string): Promise<Reply | null> => {
    try {
      // First create the reply
      const { data: replyData, error: replyError } = await supabase
        .from('replies')
        .insert({ inquiry_id: inquiryId, content })
        .select()
        .single();

      if (replyError) throw replyError;

      // Then update the inquiry status
      const { data: inquiryData, error: inquiryError } = await supabase
        .from('inquiries')
        .update({
          status: '답변완료',
          updated_at: new Date().toISOString()
        })
        .eq('id', inquiryId)
        .select()
        .single();

      if (inquiryError) throw inquiryError;

      // Update local state
      setInquiries(prev => prev.map(inquiry =>
        inquiry.id === inquiryId ? inquiryData : inquiry
      ));

      // 캐시 무효화 - 즉시 UI 반영
      invalidateQueries.inquiries();
      invalidateQueries.inquiry(inquiryId);
      invalidateQueries.inquiryReplies(inquiryId);

      return replyData;
    } catch (error) {
      console.error('Error in createReply:', error);
      throw error;
    }
  };

  const updateReply = async (replyId: string, content: string): Promise<Reply | null> => {
    const { data, error } = await supabase
      .from('replies')
      .update({ content, updated_at: new Date().toISOString() })
      .eq('id', replyId)
      .select()
      .single();

    if (error) throw error;

    // 캐시 무효화 - 즉시 UI 반영
    invalidateQueries.inquiries();

    return data;
  };

  const deleteReply = async (replyId: string): Promise<void> => {
    try {
      // First get the inquiry_id for this reply
      const { data: reply, error: replyError } = await supabase
        .from('replies')
        .select('inquiry_id')
        .eq('id', replyId)
        .single();

      if (replyError) throw replyError;

      // Delete the reply
      const { error: deleteError } = await supabase
        .from('replies')
        .delete()
        .eq('id', replyId);

      if (deleteError) throw deleteError;

      // Check if there are any remaining replies
      const { data: remainingReplies, error: countError } = await supabase
        .from('replies')
        .select('id')
        .eq('inquiry_id', reply.inquiry_id);

      if (countError) throw countError;

      // If no replies left, update inquiry status to '답변대기'
      if (!remainingReplies || remainingReplies.length === 0) {
        const { data: inquiryData, error: updateError } = await supabase
          .from('inquiries')
          .update({
            status: '답변대기',
            updated_at: new Date().toISOString()
          })
          .eq('id', reply.inquiry_id)
          .select()
          .single();

        if (updateError) throw updateError;

        // Update local state
        setInquiries(prev => prev.map(inquiry =>
          inquiry.id === reply.inquiry_id ? inquiryData : inquiry
        ));
      }

      // 캐시 무효화 - 즉시 UI 반영
      invalidateQueries.inquiries();
      invalidateQueries.inquiry(reply.inquiry_id);
      invalidateQueries.inquiryReplies(reply.inquiry_id);

    } catch (error) {
      console.error('Error in deleteReply:', error);
      throw error;
    }
  };

  return {
    inquiries,
    loading,
    createInquiry,
    updateInquiry,
    deleteInquiry,
    refetch: fetchInquiries,
    getReplies,
    createReply,
    updateReply,
    deleteReply
  };
};
