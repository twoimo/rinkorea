import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    maxWidth?: string;
}

const Modal: React.FC<ModalProps> = ({
    isOpen,
    onClose,
    title,
    children,
    maxWidth = "max-w-4xl"
}) => {
    // Portal과 body scroll 차단으로 완벽한 중앙 정렬
    useEffect(() => {
        if (isOpen) {
            // 1. 강제로 맨 위로 스크롤
            window.scrollTo({ top: 0, behavior: 'instant' });

            // 2. Body scroll 완전 차단
            const originalOverflow = document.body.style.overflow;
            const originalPosition = document.body.style.position;
            const originalTop = document.body.style.top;
            const scrollY = window.scrollY;

            document.body.style.overflow = 'hidden';
            document.body.style.position = 'fixed';
            document.body.style.top = `-${scrollY}px`;
            document.body.style.width = '100%';

            // 청소 함수
            return () => {
                document.body.style.overflow = originalOverflow;
                document.body.style.position = originalPosition;
                document.body.style.top = originalTop;
                document.body.style.width = '';
                window.scrollTo(0, scrollY);
            };
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return createPortal(
        <div
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 9999,
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                margin: 0
            }}
            onClick={onClose}
        >
            <div
                className={`bg-white rounded-lg shadow-lg w-full ${maxWidth} max-h-[90vh] overflow-hidden flex flex-col`}
                style={{
                    position: 'relative',
                    margin: 'auto',
                    transform: 'none'
                }}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between p-4 md:p-6 border-b">
                    <h2 className="text-lg md:text-xl font-bold text-gray-900">{title}</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-700 p-1 touch-manipulation"
                        aria-label="닫기"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {children}
                </div>
            </div>
        </div>,
        document.body
    );
};

export default Modal;
