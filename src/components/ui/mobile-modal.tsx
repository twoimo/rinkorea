import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

interface MobileModalProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
    title?: string;
    showCloseButton?: boolean;
    className?: string;
    overlayClassName?: string;
    preventClose?: boolean;
    swipeToClose?: boolean;
}

const MobileModal: React.FC<MobileModalProps> = ({
    isOpen,
    onClose,
    children,
    title,
    showCloseButton = true,
    className,
    overlayClassName,
    preventClose = false,
    swipeToClose = true
}) => {
    const isMobile = useIsMobile();
    const modalRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [dragDistance, setDragDistance] = useState(0);
    const [startY, setStartY] = useState(0);

    // Lock body scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            const originalStyle = window.getComputedStyle(document.body).overflow;
            document.body.style.overflow = 'hidden';
            document.body.style.position = 'fixed';
            document.body.style.width = '100%';
            document.body.style.height = '100%';

            return () => {
                document.body.style.overflow = originalStyle;
                document.body.style.position = '';
                document.body.style.width = '';
                document.body.style.height = '';
            };
        }
    }, [isOpen]);

    // Handle swipe to close
    const handleTouchStart = (e: React.TouchEvent) => {
        if (!swipeToClose || !isMobile) return;
        setStartY(e.touches[0].clientY);
        setIsDragging(true);
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (!isDragging || !swipeToClose || !isMobile) return;

        const currentY = e.touches[0].clientY;
        const distance = currentY - startY;

        if (distance > 0) {
            setDragDistance(distance);
            e.preventDefault();
        }
    };

    const handleTouchEnd = () => {
        if (!isDragging || !swipeToClose || !isMobile) return;

        setIsDragging(false);

        if (dragDistance > 150) {
            onClose();
        }

        setDragDistance(0);
    };

    // Close on escape key
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && !preventClose) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            return () => document.removeEventListener('keydown', handleEscape);
        }
    }, [isOpen, onClose, preventClose]);

    if (!isOpen) return null;

    const modalContent = (
        <div
            className={cn(
                'fixed inset-0 z-[9999] flex items-end justify-center',
                'sm:items-center sm:p-4',
                overlayClassName
            )}
            onClick={(e) => {
                if (e.target === e.currentTarget && !preventClose) {
                    onClose();
                }
            }}
        >
            {/* Backdrop */}
            <div
                className={cn(
                    'fixed inset-0 bg-black transition-opacity duration-300',
                    isOpen ? 'opacity-50' : 'opacity-0'
                )}
            />

            {/* Modal */}
            <div
                ref={modalRef}
                className={cn(
                    'relative w-full bg-white shadow-xl transition-transform duration-300',
                    // Mobile styles
                    'max-h-[90vh] rounded-t-3xl',
                    'sm:max-h-[80vh] sm:max-w-md sm:rounded-2xl',
                    // Desktop styles for larger modals
                    'lg:max-w-2xl xl:max-w-4xl',
                    'mobile-modal keyboard-adaptive',
                    className
                )}
                style={{
                    transform: `translateY(${dragDistance}px)`,
                    transition: isDragging ? 'none' : 'transform 0.3s ease-out'
                }}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
            >
                {/* Swipe indicator (mobile only) */}
                {isMobile && swipeToClose && (
                    <div className="flex justify-center pt-3 pb-2">
                        <div className="w-12 h-1 bg-gray-300 rounded-full" />
                    </div>
                )}

                {/* Header */}
                {(title || showCloseButton) && (
                    <div className="flex items-center justify-between p-4 border-b border-gray-200">
                        {title && (
                            <h2 className="text-lg font-semibold text-gray-900 line-clamp-1">
                                {title}
                            </h2>
                        )}
                        {showCloseButton && (
                            <button
                                onClick={onClose}
                                className={cn(
                                    'p-2 rounded-full hover:bg-gray-100 transition-colors',
                                    'touch-manipulation touch-feedback',
                                    'min-w-[44px] min-h-[44px] flex items-center justify-center'
                                )}
                                aria-label="모달 닫기"
                            >
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        )}
                    </div>
                )}

                {/* Content */}
                <div className={cn(
                    'overflow-y-auto overscroll-contain',
                    'max-h-[calc(90vh-120px)] sm:max-h-[calc(80vh-80px)]',
                    !title && !showCloseButton && 'max-h-[90vh] sm:max-h-[80vh]'
                )}>
                    {children}
                </div>
            </div>
        </div>
    );

    return createPortal(modalContent, document.body);
};

export default MobileModal; 