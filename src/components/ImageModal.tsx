import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

interface ImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageSrc: string;
  imageAlt: string;
  imageTitle: string;
}

const ImageModal = ({ isOpen, onClose, imageSrc, imageAlt, imageTitle }: ImageModalProps) => {
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
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        margin: 0
      }}
      onClick={onClose}
    >
      <div
        className="relative max-w-[90vw] max-h-[90vh] bg-white rounded-lg overflow-hidden"
        style={{
          position: 'relative',
          margin: 'auto',
          transform: 'none'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">{imageTitle}</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4">
          <img
            src={imageSrc}
            alt={imageAlt}
            className="w-full h-auto max-h-[70vh] object-contain rounded"
          />
        </div>
      </div>
    </div>
  );
};

export default ImageModal;
