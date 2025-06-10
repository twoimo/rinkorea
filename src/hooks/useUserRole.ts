import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export type UserRole = 'admin' | 'user';

export const useUserRole = () => {
  const [role, setRole] = useState<UserRole>('user');
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchUserRole();
    } else {
      setRole('user');
      setLoading(false);
    }
  }, [user]);

  const fetchUserRole = async () => {
    try {
      console.log('Fetching role for user:', user?.id);
      const { data, error } = await supabase
        .rpc('get_user_role', { _user_id: user?.id });

      if (error) {
        console.error('Error fetching user role:', error);
        setRole('user');
      } else {
        console.log('User role:', data);
        setRole(data || 'user');
      }
    } catch (error) {
      console.error('Error:', error);
      setRole('user');
    } finally {
      setLoading(false);
    }
  };

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
