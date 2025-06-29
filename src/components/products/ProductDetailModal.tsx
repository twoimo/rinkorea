import React, { memo } from 'react';
import { X } from 'lucide-react';
import { OptimizedImage } from '@/components/ui/image';

interface Product {
  id: string;
  name: string;
  description: string;
  image_url: string;
  icon: string;
  features: string[];
  detail_images?: string[];
}

interface ProductDetailModalProps {
  product: Product;
  onClose: () => void;
}

const ProductDetailModal = memo(({ product, onClose }: ProductDetailModalProps) => {
  const getImageUrl = (imagePath: string) => {
    if (imagePath.includes('://') || imagePath.startsWith('@')) return imagePath;
    return `/images/${imagePath}`;
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[120] p-4"
      style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
    >
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
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
    </div>
  );
});

ProductDetailModal.displayName = 'ProductDetailModal';

export default ProductDetailModal;
