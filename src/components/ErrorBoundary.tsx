import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  AlertTriangle, 
  RefreshCw, 
  Bug, 
  Home,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { handleReactError, type AppError } from '@/lib/errorHandler';
import { logger } from '@/lib/logger';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: AppError) => void;
}

interface State {
  hasError: boolean;
  error: AppError | null;
  showDetails: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      showDetails: false
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error: null,
      showDetails: false
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const appError = handleReactError(error, errorInfo);
    
    this.setState({
      error: appError,
      hasError: true,
      showDetails: false
    });

    // 부모 컴포넌트에 오류 알림
    this.props.onError?.(appError);

    logger.error('React Error Boundary caught an error', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack
    });
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      showDetails: false
    });
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  toggleDetails = () => {
    this.setState(prev => ({
      showDetails: !prev.showDetails
    }));
  };

  render() {
    if (this.state.hasError) {
      // 커스텀 fallback이 제공된 경우
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // 기본 오류 UI
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <CardTitle className="text-xl text-red-900">
                    페이지 오류가 발생했습니다
                  </CardTitle>
                  <p className="text-sm text-red-700 mt-1">
                    {this.state.error?.userMessage || '예상치 못한 오류가 발생했습니다.'}
                  </p>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* 오류 정보 */}
              {this.state.error && (
                <Alert>
                  <Bug className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">오류 ID: {this.state.error.id}</span>
                        <span className="text-xs text-muted-foreground">
                          {this.state.error.timestamp.toLocaleString()}
                        </span>
                      </div>
                      
                      {this.state.showDetails && (
                        <div className="mt-3 p-3 bg-muted rounded-md">
                          <div className="space-y-2 text-sm">
                            <div>
                              <span className="font-medium">타입:</span> {this.state.error.type}
                            </div>
                            <div>
                              <span className="font-medium">심각도:</span> {this.state.error.severity}
                            </div>
                            <div>
                              <span className="font-medium">메시지:</span> {this.state.error.message}
                            </div>
                            {this.state.error.stack && (
                              <div>
                                <span className="font-medium">스택 트레이스:</span>
                                <pre className="mt-1 text-xs bg-gray-100 p-2 rounded overflow-x-auto">
                                  {this.state.error.stack}
                                </pre>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={this.toggleDetails}
                        className="mt-2"
                      >
                        {this.state.showDetails ? (
                          <>
                            <ChevronUp className="h-4 w-4 mr-1" />
                            세부사항 숨기기
                          </>
                        ) : (
                          <>
                            <ChevronDown className="h-4 w-4 mr-1" />
                            세부사항 보기
                          </>
                        )}
                      </Button>
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              {/* 해결 방법 제안 */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-medium text-blue-900 mb-2">해결 방법</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• 페이지를 새로고침해보세요</li>
                  <li>• 브라우저 캐시를 삭제해보세요</li>
                  <li>• 다른 브라우저에서 시도해보세요</li>
                  <li>• 문제가 지속되면 관리자에게 문의하세요</li>
                </ul>
              </div>

              {/* 액션 버튼 */}
              <div className="flex gap-3">
                <Button onClick={this.handleRetry} className="flex-1">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  다시 시도
                </Button>
                <Button variant="outline" onClick={this.handleGoHome} className="flex-1">
                  <Home className="w-4 w-4 mr-2" />
                  홈으로 이동
                </Button>
              </div>

              {/* 지원 정보 */}
              <div className="text-center text-sm text-muted-foreground">
                <p>
                  문제가 계속 발생하면{' '}
                  <a 
                    href="mailto:support@example.com" 
                    className="text-primary hover:underline"
                  >
                    기술 지원팀
                  </a>
                  에 문의하세요.
                </p>
                <p className="mt-1">
                  오류 ID를 함께 알려주시면 더 빠른 해결이 가능합니다.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

// 함수형 컴포넌트용 HOC
export const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, 'children'>
) => {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  return WrappedComponent;
};

// 간단한 오류 표시 컴포넌트
export const SimpleErrorDisplay: React.FC<{
  error: AppError;
  onRetry?: () => void;
  onDismiss?: () => void;
}> = ({ error, onRetry, onDismiss }) => {
  return (
    <Alert variant="destructive" className="mb-4">
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">{error.userMessage}</p>
            <p className="text-xs text-muted-foreground mt-1">
              오류 ID: {error.id}
            </p>
          </div>
          <div className="flex gap-2">
            {onRetry && error.retryable && (
              <Button size="sm" variant="outline" onClick={onRetry}>
                <RefreshCw className="h-3 w-3 mr-1" />
                재시도
              </Button>
            )}
            {onDismiss && (
              <Button size="sm" variant="ghost" onClick={onDismiss}>
                ✕
              </Button>
            )}
          </div>
        </div>
      </AlertDescription>
    </Alert>
  );
};