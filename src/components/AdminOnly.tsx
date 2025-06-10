
import React from 'react';
import { useUserRole } from '@/hooks/useUserRole';

interface AdminOnlyProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

const AdminOnly: React.FC<AdminOnlyProps> = ({ children, fallback = null }) => {
  const { isAdmin, loading } = useUserRole();

  if (loading) {
    return null;
  }

  return isAdmin ? <>{children}</> : <>{fallback}</>;
};

export default AdminOnly;
