import React from 'react';
import { useUserRole } from '@/hooks/useUserRole';

interface AdminOnlyProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

const AdminOnly: React.FC<AdminOnlyProps> = ({ children, fallback = null }) => {
  const { isAdmin, loading } = useUserRole();

  // 로딩 중이거나 관리자가 아니면 fallback 또는 null 반환
  if (loading || !isAdmin) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

export default AdminOnly;
