
import React from 'react';
import { X } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  description: string;
  image_url: string;
  price: number;
  original_price?: number;
  discount?: number;
  rating?: number;
  reviews?: number;
  naver_url?: string;
  is_new?: boolean;
  is_best?: boolean;
  stock_quantity?: number;
  sales?: number;
  created_at?: string;
  is_active?: boolean;
}

interface ShopProductFormProps {
  editingProduct: Product | null;
  formValues: Partial<Product>;
  formLoading: boolean;
  formError: string | null;
  formSuccess: string | null;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onFormValueChange: (key: keyof Product, value: unknown) => void;
}

const ShopProductForm = ({
  editingProduct,
  formValues,
  formLoading,
  formError,
  formSuccess,
  onClose,
  onSubmit,
  onFormValueChange,
}: ShopProductFormProps) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start sm:items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-lg my-4 sm:my-0 relative max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white px-6 py-4 border-b flex items-center justify-between">
          <h2 className="text-xl font-bold">{editingProduct ? '상품 수정' : '상품 추가'}</h2>
          <button
            className="text-gray-400 hover:text-gray-700 p-1 touch-manipulation"
            onClick={onClose}
            aria-label="닫기"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form className="p-6 space-y-4" onSubmit={onSubmit}>
          <div>
            <label className="block text-sm font-medium mb-2">상품명</label>
            <input
              type="text"
              className="w-full border border-gray-300 px-3 py-3 rounded-lg text-base touch-manipulation"
              value={formValues.name || ''}
              onChange={e => onFormValueChange('name', e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">설명</label>
            <textarea
              className="w-full border border-gray-300 px-3 py-3 rounded-lg text-base touch-manipulation min-h-[100px]"
              value={formValues.description || ''}
              onChange={e => onFormValueChange('description', e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">이미지 URL 또는 파일명</label>
            <input
              type="text"
              className="w-full border border-gray-300 px-3 py-3 rounded-lg text-base touch-manipulation"
              value={formValues.image_url || ''}
              onChange={e => onFormValueChange('image_url', e.target.value)}
              placeholder="예: image.jpg 또는 https://example.com/image.jpg"
            />
            <p className="text-xs text-gray-500 mt-1">
              파일명만 입력하면 자동으로 /images/ 경로가 추가됩니다
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">판매가(원)</label>
              <input
                type="number"
                className="w-full border border-gray-300 px-3 py-3 rounded-lg text-base touch-manipulation"
                value={formValues.price || ''}
                onChange={e => onFormValueChange('price', Number(e.target.value))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">정가(원)</label>
              <input
                type="number"
                className="w-full border border-gray-300 px-3 py-3 rounded-lg text-base touch-manipulation"
                value={formValues.original_price || ''}
                onChange={e => onFormValueChange('original_price', Number(e.target.value))}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">할인율(%)</label>
              <input
                type="number"
                className="w-full border border-gray-300 px-3 py-3 rounded-lg bg-gray-100 text-base"
                value={formValues.discount || ''}
                readOnly
                tabIndex={-1}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">재고</label>
              <input
                type="number"
                className="w-full border border-gray-300 px-3 py-3 rounded-lg text-base touch-manipulation"
                value={formValues.stock_quantity || ''}
                onChange={e => onFormValueChange('stock_quantity', Number(e.target.value))}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">평점</label>
              <input
                type="number"
                step="0.01"
                className="w-full border border-gray-300 px-3 py-3 rounded-lg text-base touch-manipulation"
                value={formValues.rating || ''}
                onChange={e => onFormValueChange('rating', Number(e.target.value))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">리뷰 수</label>
              <input
                type="number"
                className="w-full border border-gray-300 px-3 py-3 rounded-lg text-base touch-manipulation"
                value={formValues.reviews || ''}
                onChange={e => onFormValueChange('reviews', Number(e.target.value))}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">네이버 스토어 URL</label>
            <input
              type="text"
              className="w-full border border-gray-300 px-3 py-3 rounded-lg text-base touch-manipulation"
              value={formValues.naver_url || ''}
              onChange={e => onFormValueChange('naver_url', e.target.value)}
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <label className="inline-flex items-center gap-2 touch-manipulation">
              <input
                type="checkbox"
                className="w-4 h-4"
                checked={!!formValues.is_new}
                onChange={e => onFormValueChange('is_new', e.target.checked)}
              />
              <span className="text-sm font-medium">신상품</span>
            </label>
            <label className="inline-flex items-center gap-2 touch-manipulation">
              <input
                type="checkbox"
                className="w-4 h-4"
                checked={!!formValues.is_best}
                onChange={e => onFormValueChange('is_best', e.target.checked)}
              />
              <span className="text-sm font-medium">베스트</span>
            </label>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <button
              type="button"
              className="w-full sm:w-auto px-6 py-3 rounded-lg bg-gray-200 text-gray-700 font-medium touch-manipulation"
              onClick={onClose}
              disabled={formLoading}
            >
              취소
            </button>
            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-3 rounded-lg bg-blue-600 text-white font-semibold disabled:opacity-50 touch-manipulation"
              disabled={formLoading}
            >
              {formLoading ? '저장 중...' : '저장'}
            </button>
          </div>

          {formError && <div className="mt-4 text-sm text-red-600 p-3 bg-red-50 rounded-lg">{formError}</div>}
          {formSuccess && <div className="mt-4 text-sm text-green-700 p-3 bg-green-50 rounded-lg">{formSuccess}</div>}
        </form>
      </div>
    </div>
  );
};

export default ShopProductForm;
