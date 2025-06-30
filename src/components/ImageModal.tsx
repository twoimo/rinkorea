import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import Portal from '@/components/ui/portal';

interface ImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageSrc: string;
  imageAlt: string;
  imageTitle: string;
}

const ImageModal = ({ isOpen, onClose, imageSrc, imageAlt, imageTitle }: ImageModalProps) => {
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <Portal>
      <div className="fixed inset-0 bg-black bg-opacity-75 z-[120] flex items-center justify-center p-4" onClick={onClose}>
        <div className="relative max-w-4xl max-h-full bg-white rounded-lg overflow-hidden" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="text-lg font-semibold text-gray-900">{imageTitle}</h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="닫기"
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
    </Portal>
  );
};

export default ImageModal;
