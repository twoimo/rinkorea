
import React, { useState, useCallback, memo } from 'react';
import { X } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  description: string;
  image_url: string;
  icon: string;
  features: string[];
  detail_images?: string[];
}

interface ProductFormProps {
  product?: Product | null;
  onSave: (formData: Partial<Product>) => Promise<void>;
  onClose: () => void;
  loading: boolean;
  error: string | null;
  success: string | null;
}

const ProductForm = memo(({ product, onSave, onClose, loading, error, success }: ProductFormProps) => {
  const [formValues, setFormValues] = useState<Partial<Product>>({
    name: product?.name || '',
    description: product?.description || '',
    image_url: product?.image_url || '',
    icon: product?.icon || '',
    features: product?.features || [],
    detail_images: product?.detail_images || []
  });

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(formValues);
  }, [formValues, onSave]);

  const handleFeaturesChange = useCallback((value: string) => {
    const features = value.split(',').map(f => f.trim()).filter(f => f);
    setFormValues(prev => ({ ...prev, features }));
  }, []);

  const handleDetailImagesChange = useCallback((value: string) => {
    const detail_images = value.split(',').map(f => f.trim()).filter(f => f);
    setFormValues(prev => ({ ...prev, detail_images }));
  }, []);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-lg max-h-[90vh] overflow-y-auto relative">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl sm:text-2xl font-bold">
            {product ? '제품 수정' : '제품 추가'}
          </h2>
          <button 
            className="text-gray-400 hover:text-gray-700 touch-manipulation" 
            onClick={onClose}
            aria-label="닫기"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        <form className="p-6 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium mb-2" htmlFor="product-name">제품명</label>
            <input 
              id="product-name"
              type="text" 
              className="w-full border border-gray-300 px-3 py-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base" 
              value={formValues.name || ''} 
              onChange={e => setFormValues(prev => ({ ...prev, name: e.target.value }))} 
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2" htmlFor="product-description">설명</label>
            <textarea 
              id="product-description"
              className="w-full border border-gray-300 px-3 py-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base min-h-[80px]" 
              value={formValues.description || ''} 
              onChange={e => setFormValues(prev => ({ ...prev, description: e.target.value }))} 
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2" htmlFor="product-image">이미지 URL 또는 파일명</label>
            <input 
              id="product-image"
              type="text" 
              className="w-full border border-gray-300 px-3 py-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base" 
              value={formValues.image_url || ''} 
              onChange={e => setFormValues(prev => ({ ...prev, image_url: e.target.value }))} 
              placeholder="예: https://example.com/image.jpg 또는 image.jpg"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2" htmlFor="product-icon">아이콘</label>
            <select
              id="product-icon"
              value={formValues.icon || ''}
              onChange={e => setFormValues(prev => ({ ...prev, icon: e.target.value }))}
              className="w-full border border-gray-300 px-3 py-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
              required
            >
              <option value="">아이콘 선택</option>
              <option value="shield">Shield</option>
              <option value="palette">Palette</option>
              <option value="star">Star</option>
              <option value="zap">Zap</option>
              <option value="leaf">Leaf</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2" htmlFor="product-features">주요 특징 (쉼표로 구분)</label>
            <textarea
              id="product-features"
              className="w-full border border-gray-300 px-3 py-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base min-h-[80px]"
              value={formValues.features?.join(', ') || ''} 
              onChange={e => handleFeaturesChange(e.target.value)}
              placeholder="특징을 쉼표로 구분하여 입력하세요"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2" htmlFor="product-detail-images">상세 이미지 URL 또는 파일명 (쉼표로 구분)</label>
            <textarea
              id="product-detail-images"
              className="w-full border border-gray-300 px-3 py-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base min-h-[80px]"
              value={formValues.detail_images?.join(', ') || ''} 
              onChange={e => handleDetailImagesChange(e.target.value)}
              placeholder="예: detail1.jpg, https://example.com/detail2.jpg"
            />
          </div>
          {error && (
            <div className="mt-2 text-sm text-red-600 bg-red-50 p-3 rounded-lg" role="alert">
              {error}
            </div>
          )}
          {success && (
            <div className="mt-2 text-sm text-green-700 bg-green-50 p-3 rounded-lg" role="alert">
              {success}
            </div>
          )}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <button 
              type="button" 
              className="flex-1 px-4 py-2.5 rounded-lg bg-gray-200 text-gray-700 font-medium hover:bg-gray-300 transition-colors touch-manipulation" 
              onClick={onClose} 
              disabled={loading}
            >
              취소
            </button>
            <button 
              type="submit" 
              className="flex-1 px-4 py-2.5 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors touch-manipulation" 
              disabled={loading}
            >
              {loading ? '저장 중...' : '저장'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
});

ProductForm.displayName = 'ProductForm';

export default ProductForm;
