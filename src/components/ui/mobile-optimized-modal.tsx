
import React, { memo, useEffect, useCallback } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MobileOptimizedModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

const MobileOptimizedModal = memo(({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  className,
  maxWidth = 'lg'
}: MobileOptimizedModalProps) => {
  const handleEscape = useCallback((event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      onClose();
    }
  }, [onClose]);

  const handleBackdropClick = useCallback((event: React.MouseEvent) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
      
      return () => {
        document.removeEventListener('keydown', handleEscape);
        document.body.style.overflow = 'unset';
      };
    }
  }, [isOpen, handleEscape]);

  if (!isOpen) return null;

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    full: 'max-w-full'
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className={cn(
        'bg-white rounded-lg shadow-xl w-full max-h-[90vh] overflow-hidden flex flex-col',
        maxWidthClasses[maxWidth],
        className
      )}>
        <div className="flex justify-between items-center p-4 sm:p-6 border-b bg-white sticky top-0 z-10">
          <h2 
            id="modal-title"
            className="text-lg sm:text-xl font-semibold text-gray-900 truncate pr-4"
          >
            {title}
          </h2>
          <button
            onClick={onClose}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors p-1 touch-manipulation"
            aria-label="닫기"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
});

MobileOptimizedModal.displayName = 'MobileOptimizedModal';

export default MobileOptimizedModal;
