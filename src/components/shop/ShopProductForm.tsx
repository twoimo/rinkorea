import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

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
  // 인덱스 시그니처 추가
  [key: string]: unknown;
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
  const { t } = useLanguage();

  // Portal과 body scroll 차단으로 완벽한 중앙 정렬
  useEffect(() => {
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
  }, []);

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
        className="bg-white rounded-lg shadow-lg w-full max-w-4xl relative max-h-[90vh] overflow-y-auto"
        style={{
          position: 'relative',
          margin: 'auto',
          transform: 'none'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white px-6 py-4 border-b flex items-center justify-between">
          <h2 className="text-xl font-bold">{editingProduct ? t('shop_edit_product', '상품 수정') : t('shop_add_product', '상품 추가')}</h2>
          <button
            className="text-gray-400 hover:text-gray-700 p-1 touch-manipulation"
            onClick={onClose}
            aria-label={t('close', '닫기')}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form className="p-6 space-y-6" onSubmit={onSubmit}>
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">{t('shop_form_basic_info', '기본 정보')}</h3>

            <div>
              <label className="block text-sm font-medium mb-2">{t('shop_form_image_url', '이미지 URL 또는 파일명')}</label>
              <input
                type="text"
                className="w-full border border-gray-300 px-3 py-3 rounded-lg text-base touch-manipulation"
                value={formValues.image_url || ''}
                onChange={e => onFormValueChange('image_url', e.target.value)}
                placeholder={t('shop_form_image_placeholder', '예: image.jpg 또는 https://example.com/image.jpg')}
              />
              <p className="text-xs text-gray-500 mt-1">
                {t('shop_form_image_note', '파일명만 입력하면 자동으로 /images/ 경로가 추가됩니다')}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">{t('shop_form_naver_url', '네이버 스토어 URL')}</label>
              <input
                type="text"
                className="w-full border border-gray-300 px-3 py-3 rounded-lg text-base touch-manipulation"
                value={formValues.naver_url || ''}
                onChange={e => onFormValueChange('naver_url', e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">{t('shop_form_product_name', '상품명')}</label>
              <input
                type="text"
                className="w-full border border-gray-300 px-3 py-3 rounded-lg text-base touch-manipulation"
                value={formValues.name || ''}
                onChange={e => onFormValueChange('name', e.target.value)}
                placeholder="상품명을 입력하세요"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">{t('shop_form_description', '상품 설명')}</label>
              <textarea
                className="w-full border border-gray-300 px-3 py-3 rounded-lg text-base touch-manipulation min-h-[100px]"
                value={formValues.description || ''}
                onChange={e => onFormValueChange('description', e.target.value)}
                placeholder="상품 설명을 입력하세요"
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">{t('shop_form_price_info', '가격 및 재고 정보')}</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">{t('shop_form_price', '판매가(원)')}</label>
                <input
                  type="number"
                  className="w-full border border-gray-300 px-3 py-3 rounded-lg text-base touch-manipulation"
                  value={formValues.price || ''}
                  onChange={e => onFormValueChange('price', Number(e.target.value))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">{t('shop_form_original_price', '정가(원)')}</label>
                <input
                  type="number"
                  className="w-full border border-gray-300 px-3 py-3 rounded-lg text-base touch-manipulation"
                  value={formValues.original_price || ''}
                  onChange={e => onFormValueChange('original_price', Number(e.target.value))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">{t('shop_form_discount', '할인율(%)')}</label>
                <input
                  type="number"
                  className="w-full border border-gray-300 px-3 py-3 rounded-lg bg-gray-100 text-base"
                  value={formValues.discount || ''}
                  readOnly
                  tabIndex={-1}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">{t('shop_form_stock', '재고')}</label>
                <input
                  type="number"
                  className="w-full border border-gray-300 px-3 py-3 rounded-lg text-base touch-manipulation"
                  value={formValues.stock_quantity || ''}
                  onChange={e => onFormValueChange('stock_quantity', Number(e.target.value))}
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">{t('shop_form_review_info', '평점 및 리뷰 정보')}</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">{t('shop_form_rating', '평점')}</label>
                <input
                  type="number"
                  step="0.01"
                  className="w-full border border-gray-300 px-3 py-3 rounded-lg text-base touch-manipulation"
                  value={formValues.rating || ''}
                  onChange={e => onFormValueChange('rating', Number(e.target.value))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">{t('shop_form_reviews', '리뷰 수')}</label>
                <input
                  type="number"
                  className="w-full border border-gray-300 px-3 py-3 rounded-lg text-base touch-manipulation"
                  value={formValues.reviews || ''}
                  onChange={e => onFormValueChange('reviews', Number(e.target.value))}
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">{t('shop_form_product_options', '제품 옵션')}</h3>

            <div className="flex flex-col sm:flex-row gap-4">
              <label className="inline-flex items-center gap-2 touch-manipulation">
                <input
                  type="checkbox"
                  className="w-4 h-4"
                  checked={!!formValues.is_new}
                  onChange={e => onFormValueChange('is_new', e.target.checked)}
                />
                <span className="text-sm font-medium">{t('shop_form_new_product', '신상품')}</span>
              </label>
              <label className="inline-flex items-center gap-2 touch-manipulation">
                <input
                  type="checkbox"
                  className="w-4 h-4"
                  checked={!!formValues.is_best}
                  onChange={e => onFormValueChange('is_best', e.target.checked)}
                />
                <span className="text-sm font-medium">{t('shop_form_best_product', '베스트')}</span>
              </label>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <button
              type="button"
              className="w-full sm:w-auto px-6 py-3 rounded-lg bg-gray-200 text-gray-700 font-medium touch-manipulation"
              onClick={onClose}
              disabled={formLoading}
            >
              {t('cancel', '취소')}
            </button>
            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-3 rounded-lg bg-blue-600 text-white font-semibold disabled:opacity-50 touch-manipulation"
              disabled={formLoading}
            >
              {formLoading ? t('shop_form_saving', '저장 중...') : t('save', '저장')}
            </button>
          </div>

          {formError && <div className="mt-4 text-sm text-red-600 p-3 bg-red-50 rounded-lg">{formError}</div>}
          {formSuccess && <div className="mt-4 text-sm text-green-700 p-3 bg-green-50 rounded-lg">{formSuccess}</div>}
        </form>
      </div>
    </div>,
    document.body
  );
};

export default ShopProductForm;
