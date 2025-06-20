import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export type UserRole = 'admin' | 'user';

export const useUserRole = () => {
  const [role, setRole] = useState<UserRole>('user');
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchUserRole = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .rpc('get_user_role', { _user_id: user?.id });

      if (error) {
        setRole('user');
      } else {
        setRole(data || 'user');
      }
    } catch (error) {
      setRole('user');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchUserRole();
    } else {
      setRole('user');
      setLoading(false);
    }
  }, [user, fetchUserRole]);

  const isAdmin = role === 'admin';
  const isUser = role === 'user';

  return {
    role,
    isAdmin,
    isUser,
    loading,
    refetch: fetchUserRole
  };
};
