import React, { useState, useEffect } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  AlertTriangle, 
  RefreshCw, 
  X, 
  CheckCircle, 
  Clock,
  Wifi,
  WifiOff,
  Database,
  FileX,
  Zap
} from 'lucide-react';
import { type AppError, ErrorType, ErrorSeverity } from '@/lib/errorHandler';

interface ErrorNotificationProps {
  error: AppError;
  onRetry?: () => void;
  onDismiss?: () => void;
  autoRetry?: boolean;
  autoRetryDelay?: number;
  showProgress?: boolean;
}

export const ErrorNotification: React.FC<ErrorNotificationProps> = ({
  error,
  onRetry,
  onDismiss,
  autoRetry = false,
  autoRetryDelay = 5000,
  showProgress = false
}) => {
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryCountdown, setRetryCountdown] = useState(0);
  const [progress, setProgress] = useState(0);

  // 자동 재시도 카운트다운
  useEffect(() => {
    if (autoRetry && error.retryable && onRetry && !isRetrying) {
      setRetryCountdown(autoRetryDelay / 1000);
      
      const interval = setInterval(() => {
        setRetryCountdown(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            handleRetry();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [autoRetry, error.retryable, onRetry, autoRetryDelay, isRetrying]);

  // 진행률 표시
  useEffect(() => {
    if (showProgress && retryCountdown > 0) {
      const progressValue = ((autoRetryDelay / 1000 - retryCountdown) / (autoRetryDelay / 1000)) * 100;
      setProgress(progressValue);
    }
  }, [retryCountdown, autoRetryDelay, showProgress]);

  const handleRetry = async () => {
    if (!onRetry) return;
    
    setIsRetrying(true);
    setRetryCountdown(0);
    
    try {
      await onRetry();
    } catch (error) {
      console.error('재시도 실패:', error);
    } finally {
      setIsRetrying(false);
    }
  };

  const getErrorIcon = () => {
    switch (error.type) {
      case ErrorType.NETWORK:
        return <WifiOff className="h-4 w-4" />;
      case ErrorType.DATABASE:
        return <Database className="h-4 w-4" />;
      case ErrorType.FILE_PROCESSING:
        return <FileX className="h-4 w-4" />;
      case ErrorType.VECTOR_GENERATION:
        return <Zap className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getAlertVariant = () => {
    switch (error.severity) {
      case ErrorSeverity.LOW:
        return 'default';
      case ErrorSeverity.MEDIUM:
        return 'default';
      case ErrorSeverity.HIGH:
      case ErrorSeverity.CRITICAL:
        return 'destructive';
      default:
        return 'default';
    }
  };

  const getSeverityColor = () => {
    switch (error.severity) {
      case ErrorSeverity.LOW:
        return 'text-blue-600';
      case ErrorSeverity.MEDIUM:
        return 'text-yellow-600';
      case ErrorSeverity.HIGH:
        return 'text-orange-600';
      case ErrorSeverity.CRITICAL:
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getRetryMessage = () => {
    if (isRetrying) {
      return '재시도 중...';
    }
    if (retryCountdown > 0) {
      return `${retryCountdown}초 후 자동 재시도`;
    }
    return '재시도';
  };

  return (
    <Alert variant={getAlertVariant()} className="mb-4">
      {getErrorIcon()}
      <AlertDescription>
        <div className="space-y-3">
          {/* 오류 메시지 */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="font-medium">{error.userMessage}</p>
              <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                <span className={getSeverityColor()}>
                  {error.severity}
                </span>
                <span>•</span>
                <span>{error.type}</span>
                <span>•</span>
                <span>{error.timestamp.toLocaleTimeString()}</span>
              </div>
            </div>
            
            {onDismiss && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onDismiss}
                className="h-6 w-6 p-0"
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>

          {/* 재시도 진행률 */}
          {showProgress && retryCountdown > 0 && (
            <div className="space-y-1">
              <Progress value={progress} className="h-1" />
              <p className="text-xs text-muted-foreground text-center">
                자동 재시도까지 {retryCountdown}초
              </p>
            </div>
          )}

          {/* 재시도 정보 */}
          {error.retryable && error.retryCount !== undefined && error.maxRetries && (
            <div className="text-xs text-muted-foreground">
              재시도 {error.retryCount}/{error.maxRetries}
            </div>
          )}

          {/* 액션 버튼 */}
          <div className="flex gap-2">
            {onRetry && error.retryable && (
              <Button
                size="sm"
                variant="outline"
                onClick={handleRetry}
                disabled={isRetrying || retryCountdown > 0}
                className="h-7"
              >
                {isRetrying ? (
                  <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                ) : (
                  <RefreshCw className="h-3 w-3 mr-1" />
                )}
                {getRetryMessage()}
              </Button>
            )}
            
            {/* 네트워크 오류 시 연결 상태 확인 */}
            {error.type === ErrorType.NETWORK && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => window.location.reload()}
                className="h-7"
              >
                <Wifi className="h-3 w-3 mr-1" />
                새로고침
              </Button>
            )}
          </div>

          {/* 추가 도움말 */}
          {error.type === ErrorType.FILE_PROCESSING && (
            <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">
              💡 파일이 손상되었거나 지원되지 않는 형식일 수 있습니다. 
              다른 파일로 시도해보세요.
            </div>
          )}
          
          {error.type === ErrorType.NETWORK && (
            <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">
              💡 인터넷 연결을 확인하고 잠시 후 다시 시도해주세요.
            </div>
          )}
          
          {error.type === ErrorType.VECTOR_GENERATION && (
            <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">
              💡 AI 서비스가 일시적으로 사용할 수 없습니다. 
              잠시 후 다시 시도해주세요.
            </div>
          )}
        </div>
      </AlertDescription>
    </Alert>
  );
};

// 성공 알림 컴포넌트
export const SuccessNotification: React.FC<{
  message: string;
  onDismiss?: () => void;
  autoHide?: boolean;
  autoHideDelay?: number;
}> = ({ message, onDismiss, autoHide = true, autoHideDelay = 3000 }) => {
  useEffect(() => {
    if (autoHide && onDismiss) {
      const timer = setTimeout(onDismiss, autoHideDelay);
      return () => clearTimeout(timer);
    }
  }, [autoHide, autoHideDelay, onDismiss]);

  return (
    <Alert className="mb-4 border-green-200 bg-green-50">
      <CheckCircle className="h-4 w-4 text-green-600" />
      <AlertDescription>
        <div className="flex items-center justify-between">
          <span className="text-green-800">{message}</span>
          {onDismiss && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onDismiss}
              className="h-6 w-6 p-0 text-green-600 hover:text-green-800"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
      </AlertDescription>
    </Alert>
  );
};

// 알림 컨테이너 (여러 알림 관리)
export const NotificationContainer: React.FC<{
  errors: AppError[];
  onRetry?: (errorId: string) => void;
  onDismiss?: (errorId: string) => void;
  maxVisible?: number;
}> = ({ errors, onRetry, onDismiss, maxVisible = 3 }) => {
  const visibleErrors = errors.slice(0, maxVisible);
  const hiddenCount = errors.length - maxVisible;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-md">
      {visibleErrors.map((error) => (
        <ErrorNotification
          key={error.id}
          error={error}
          onRetry={onRetry ? () => onRetry(error.id) : undefined}
          onDismiss={onDismiss ? () => onDismiss(error.id) : undefined}
          autoRetry={error.retryable}
          showProgress={true}
        />
      ))}
      
      {hiddenCount > 0 && (
        <Alert>
          <Clock className="h-4 w-4" />
          <AlertDescription>
            <span className="text-sm text-muted-foreground">
              +{hiddenCount}개의 추가 알림이 있습니다
            </span>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};