import React from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  text?: string;
  variant?: 'default' | 'primary' | 'secondary';
}

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
  xl: 'h-12 w-12'
};

const variantClasses = {
  default: 'text-muted-foreground',
  primary: 'text-primary',
  secondary: 'text-secondary-foreground'
};

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  className,
  text,
  variant = 'default'
}) => {
  return (
    <div className="flex items-center justify-center gap-2">
      <Loader2 
        className={cn(
          'animate-spin',
          sizeClasses[size],
          variantClasses[variant],
          className
        )} 
      />
      {text && (
        <span className={cn('text-sm', variantClasses[variant])}>
          {text}
        </span>
      )}
    </div>
  );
};

// 전체 화면 로딩 오버레이
export const LoadingOverlay: React.FC<{
  isVisible: boolean;
  text?: string;
  progress?: number;
  onCancel?: () => void;
}> = ({ isVisible, text = '로딩 중...', progress, onCancel }) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4 shadow-xl">
        <div className="text-center space-y-4">
          <LoadingSpinner size="lg" text={text} />
          
          {progress !== undefined && (
            <div className="space-y-2">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                {Math.round(progress)}% 완료
              </p>
            </div>
          )}
          
          {onCancel && (
            <button
              onClick={onCancel}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              취소
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// 인라인 로딩 상태
export const InlineLoading: React.FC<{
  text?: string;
  size?: 'sm' | 'md';
}> = ({ text = '로딩 중...', size = 'sm' }) => {
  return (
    <div className="flex items-center justify-center py-8">
      <LoadingSpinner size={size} text={text} />
    </div>
  );
};

// 스켈레톤 로더
export const SkeletonLoader: React.FC<{
  className?: string;
  lines?: number;
  avatar?: boolean;
}> = ({ className, lines = 3, avatar = false }) => {
  return (
    <div className={cn('animate-pulse', className)}>
      {avatar && (
        <div className="flex items-center space-x-4 mb-4">
          <div className="rounded-full bg-gray-300 h-10 w-10"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-300 rounded w-3/4"></div>
            <div className="h-3 bg-gray-300 rounded w-1/2"></div>
          </div>
        </div>
      )}
      
      <div className="space-y-3">
        {Array.from({ length: lines }).map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="h-4 bg-gray-300 rounded"></div>
            <div className="h-4 bg-gray-300 rounded w-5/6"></div>
          </div>
        ))}
      </div>
    </div>
  );
};

// 카드 스켈레톤
export const CardSkeleton: React.FC<{
  count?: number;
}> = ({ count = 1 }) => {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="border rounded-lg p-4">
          <SkeletonLoader lines={2} avatar />
        </div>
      ))}
    </div>
  );
};

// 테이블 스켈레톤
export const TableSkeleton: React.FC<{
  rows?: number;
  columns?: number;
}> = ({ rows = 5, columns = 4 }) => {
  return (
    <div className="space-y-2">
      {/* 헤더 */}
      <div className="flex space-x-4 p-2 border-b">
        {Array.from({ length: columns }).map((_, i) => (
          <div key={i} className="flex-1">
            <div className="h-4 bg-gray-300 rounded animate-pulse"></div>
          </div>
        ))}
      </div>
      
      {/* 행들 */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex space-x-4 p-2">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <div key={colIndex} className="flex-1">
              <div className="h-3 bg-gray-200 rounded animate-pulse"></div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};