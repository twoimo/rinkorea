import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface Inquiry {
  id: string;
  user_id: string | null;
  name: string;
  email: string;
  phone: string | null;
  title: string;
  content: string;
  status: string;
  admin_reply: string | null;
  created_at: string;
  updated_at: string;
  is_private: boolean;
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

  useEffect(() => {
    fetchInquiries();
  }, [user]);

  const fetchInquiries = async () => {
    try {
      const { data, error } = await supabase
        .from('inquiries')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching inquiries:', error);
      } else {
        setInquiries(data || []);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const createInquiry = async (inquiry: {
    name: string;
    email: string;
    phone?: string;
    title: string;
    content: string;
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
      return { success: true };
    } catch (error) {
      return { error };
    }
  };

  const getReplies = async (inquiryId: string): Promise<Reply[]> => {
    const { data, error } = await supabase
      .from('replies')
      .select('*')
      .eq('inquiry_id', inquiryId)
      .order('created_at', { ascending: true });
    if (error) throw error;
    return data || [];
  };

  const createReply = async (inquiryId: string, content: string): Promise<Reply | null> => {
    const { data, error } = await supabase
      .from('replies')
      .insert({ inquiry_id: inquiryId, content })
      .select()
      .single();
    if (error) throw error;
    return data;
  };

  const updateReply = async (replyId: string, content: string): Promise<Reply | null> => {
    const { data, error } = await supabase
      .from('replies')
      .update({ content, updated_at: new Date().toISOString() })
      .eq('id', replyId)
      .select()
      .single();
    if (error) throw error;
    return data;
  };

  const deleteReply = async (replyId: string): Promise<void> => {
    const { error } = await supabase
      .from('replies')
      .delete()
      .eq('id', replyId);
    if (error) throw error;
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
