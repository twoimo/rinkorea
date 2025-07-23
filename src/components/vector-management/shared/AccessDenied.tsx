import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, ArrowLeft, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';

interface AccessDeniedProps {
  message?: string;
  showLoginButton?: boolean;
}

/**
 * 권한 없는 사용자 접근 차단 컴포넌트
 * 벡터 데이터베이스 관리 기능에 접근 권한이 없는 사용자에게 표시됩니다.
 */
const AccessDenied: React.FC<AccessDeniedProps> = ({ 
  message = '이 페이지에 접근할 권한이 없습니다.',
  showLoginButton = false 
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleGoHome = () => {
    navigate('/', { replace: true });
  };

  const handleLogin = () => {
    navigate('/auth', { 
      state: { 
        returnUrl: window.location.pathname,
        message: '벡터 데이터베이스 관리 기능을 사용하려면 관리자 권한이 필요합니다.'
      }
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <Shield className="w-8 h-8 text-red-600" />
          </div>
          <CardTitle className="text-xl font-semibold text-gray-900">
            접근 권한 없음
          </CardTitle>
          <CardDescription className="text-gray-600">
            {message}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {!user && showLoginButton && (
            <Button 
              onClick={handleLogin}
              className="w-full"
              variant="default"
            >
              <LogIn className="w-4 h-4 mr-2" />
              로그인
            </Button>
          )}
          
          {user && (
            <div className="text-sm text-gray-600 text-center p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <p className="font-medium text-yellow-800">관리자 권한이 필요합니다</p>
              <p className="mt-1">
                벡터 데이터베이스 관리 기능은 관리자만 사용할 수 있습니다.
              </p>
            </div>
          )}
          
          <Button 
            onClick={handleGoHome}
            variant="outline"
            className="w-full"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            메인 페이지로 돌아가기
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default AccessDenied;