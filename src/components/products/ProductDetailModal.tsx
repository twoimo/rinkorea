import React, { memo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { OptimizedImage } from '@/components/ui/image';
import { Product } from '@/types/product';

interface ProductDetailModalProps {
  product: Product;
  onClose: () => void;
}

const ProductDetailModal = memo(({ product, onClose }: ProductDetailModalProps) => {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'instant' });

      const originalOverflow = document.body.style.overflow;
      const originalPosition = document.body.style.position;
      const originalTop = document.body.style.top;
      const scrollY = window.scrollY;

      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';

      return () => {
        document.body.style.overflow = originalOverflow;
        document.body.style.position = originalPosition;
        document.body.style.top = originalTop;
        document.body.style.width = '';
        window.scrollTo(0, scrollY);
      };
    }
  }, []);

  const getImageUrl = (imagePath: string) => {
    if (imagePath.includes('://') || imagePath.startsWith('@')) return imagePath;
    return `/images/${imagePath}`;
  };

  // SSR 환경에서 안전하게 처리
  if (typeof window === 'undefined' || !document.body) return null;

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
        className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
        style={{
          position: 'relative',
          margin: 'auto',
          transform: 'none'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-4 sm:p-6 border-b">
          <h2 className="text-lg sm:text-2xl font-bold text-gray-900 leading-tight">
            {product.name} 상세 정보
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 touch-manipulation p-1"
            aria-label="닫기"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="space-y-4 sm:space-y-6">
            {product.detail_images && product.detail_images.length > 0 ? (
              product.detail_images.map((image, index) => (
                <div key={index} className="w-full">
                  <OptimizedImage
                    src={getImageUrl(image)}
                    alt={`${product.name} 상세 이미지 ${index + 1}`}
                    className="w-full h-auto object-contain rounded-lg shadow-sm"
                    loading="lazy"
                  />
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg">
                <div className="text-lg sm:text-xl font-medium mb-2">상세 이미지가 없습니다</div>
                <p className="text-sm">이 제품에 대한 추가 이미지가 준비되지 않았습니다.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
});

ProductDetailModal.displayName = 'ProductDetailModal';

export default ProductDetailModal;
