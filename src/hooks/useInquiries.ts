
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

  return {
    inquiries,
    loading,
    createInquiry,
    refetch: fetchInquiries
  };
};
