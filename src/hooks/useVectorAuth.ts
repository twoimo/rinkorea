import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserRole } from './useUserRole';
import { useAuth } from '@/contexts/AuthContext';

/**
 * 벡터 데이터베이스 관리 시스템 전용 관리자 권한 확인 훅
 * 기존 Supabase 인증과 연동하여 관리자 권한을 확인하고
 * 권한이 없는 사용자의 접근을 차단합니다.
 */
export const useVectorAuth = () => {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: roleLoading } = useUserRole();
  const navigate = useNavigate();

  // 전체 로딩 상태
  const loading = authLoading || roleLoading;

  // 권한 확인 및 리다이렉트
  useEffect(() => {
    // 로딩 중이면 대기
    if (loading) return;

    // 로그인하지 않은 사용자는 로그인 페이지로 리다이렉트
    if (!user) {
      navigate('/auth', { 
        replace: true,
        state: { 
          message: '벡터 데이터베이스 관리 기능을 사용하려면 로그인이 필요합니다.',
          returnUrl: window.location.pathname 
        }
      });
      return;
    }

    // 관리자가 아닌 사용자는 메인 페이지로 리다이렉트
    if (!isAdmin) {
      navigate('/', { 
        replace: true,
        state: { 
          message: '관리자 권한이 필요한 페이지입니다.' 
        }
      });
      return;
    }
  }, [user, isAdmin, loading, navigate]);

  return {
    user,
    isAdmin,
    loading,
    hasAccess: !loading && user && isAdmin
  };
};

/**
 * 벡터 관리 페이지 접근 권한 확인 훅
 * 컴포넌트에서 간단하게 권한을 확인할 수 있도록 합니다.
 */
export const useVectorAccess = () => {
  const { user } = useAuth();
  const { isAdmin, loading } = useUserRole();

  return {
    hasAccess: !loading && !!user && isAdmin,
    isLoading: loading,
    isAuthenticated: !!user,
    isAdmin
  };
};