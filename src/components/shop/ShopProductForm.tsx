import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, Save, AlertCircle, Upload, Plus, Trash2 } from 'lucide-react';
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
  // 다국어 필드들 추가
  name_ko?: string;
  name_en?: string;
  name_zh?: string;
  name_id?: string;
  description_ko?: string;
  description_en?: string;
  description_zh?: string;
  description_id?: string;
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

const ShopProductForm: React.FC<ShopProductFormProps> = ({
  editingProduct,
  formValues,
  formLoading,
  formError,
  formSuccess,
  onClose,
  onSubmit,
  onFormValueChange,
}) => {
  const { t } = useLanguage();
  const modalRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number>();
  const [loading, setLoading] = useState(formLoading);

  useEffect(() => {
    // 스크롤 차단 강화
    const originalBodyOverflow = document.body.style.overflow;
    const originalHtmlOverflow = document.documentElement.style.overflow;
    const originalBodyTouchAction = document.body.style.touchAction;

    // CSS로 스크롤 차단
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    document.body.style.touchAction = 'none';

    // 모달 내부 요소인지 확인하는 함수
    const isInsideModal = (target: EventTarget | null): boolean => {
      if (!target || !modalRef.current) return false;
      const element = target as Element;
      return modalRef.current.contains(element);
    };

    // 마우스 휠 스크롤 차단 (모달 외부만)
    const preventWheel = (e: WheelEvent) => {
      if (!isInsideModal(e.target)) {
        e.preventDefault();
      }
    };

    // 터치 스크롤 차단 (모달 외부만)
    const preventTouch = (e: TouchEvent) => {
      if (e.touches.length > 1) return; // 멀티터치는 허용
      if (!isInsideModal(e.target)) {
        e.preventDefault();
      }
    };

    // 키보드 스크롤 차단 (모달 외부만)
    const preventKeyScroll = (e: KeyboardEvent) => {
      const scrollKeys = [32, 33, 34, 35, 36, 37, 38, 39, 40]; // space, pageup, pagedown, end, home, left, up, right, down
      if (scrollKeys.includes(e.keyCode) && !isInsideModal(e.target)) {
        e.preventDefault();
      }
    };

    // 뷰포트 위치 계속 업데이트
    const updateModalPosition = () => {
      if (!modalRef.current) return;

      // 현재 뷰포트 정보 가져오기
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;

      // 모달을 현재 뷰포트 중앙에 정확히 배치
      const modalElement = modalRef.current;
      modalElement.style.position = 'absolute';
      modalElement.style.top = `${scrollTop}px`;
      modalElement.style.left = `${scrollLeft}px`;
      modalElement.style.width = `${viewportWidth}px`;
      modalElement.style.height = `${viewportHeight}px`;
      modalElement.style.zIndex = '2147483647';
      modalElement.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
      modalElement.style.display = 'flex';
      modalElement.style.alignItems = viewportWidth >= 640 ? 'center' : 'start';
      modalElement.style.justifyContent = 'center';
      modalElement.style.padding = '16px';
      modalElement.style.boxSizing = 'border-box';
      modalElement.style.overflowY = 'auto';

      // 다음 프레임에서도 계속 업데이트
      animationFrameRef.current = requestAnimationFrame(updateModalPosition);
    };

    // 첫 위치 설정
    updateModalPosition();

    // ESC 키 이벤트
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !loading) {
        onClose();
      }
    };

    // 이벤트 리스너 등록
    document.addEventListener('keydown', handleEscape);
    document.addEventListener('wheel', preventWheel, { passive: false });
    document.addEventListener('touchmove', preventTouch, { passive: false });
    document.addEventListener('keydown', preventKeyScroll, { passive: false });

    return () => {
      // 이벤트 리스너 제거
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('wheel', preventWheel);
      document.removeEventListener('touchmove', preventTouch);
      document.removeEventListener('keydown', preventKeyScroll);

      // 스타일 복원
      document.body.style.overflow = originalBodyOverflow;
      document.documentElement.style.overflow = originalHtmlOverflow;
      document.body.style.touchAction = originalBodyTouchAction;

      // 애니메이션 프레임 정리
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [onClose, loading]);

  const modalContent = (
    <div
      ref={modalRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 2147483647,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        boxSizing: 'border-box',
        overflowY: 'auto'
      }}
      onClick={!loading ? onClose : undefined}
    >
      <div
        className="bg-white rounded-lg shadow-lg w-full max-w-6xl my-4 sm:my-8"
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

        <form className="p-6 space-y-8" onSubmit={onSubmit}>
          {/* 기본 정보 섹션을 2열로 배치 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* 좌측: 이미지 및 URL 정보 */}
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
            </div>

            {/* 우측: 제품명 및 설명 */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">제품 정보</h3>

              <div>
                <label className="block text-sm font-medium mb-2">{t('shop_form_product_name', '상품명')}</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 px-3 py-3 rounded-lg text-base touch-manipulation"
                  value={formValues.name || ''}
                  onChange={e => onFormValueChange('name', e.target.value)}
                  placeholder="제품명을 입력하세요"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">{t('shop_form_description', '설명')}</label>
                <textarea
                  className="w-full border border-gray-300 px-3 py-3 rounded-lg text-base touch-manipulation min-h-[120px]"
                  value={formValues.description || ''}
                  onChange={e => onFormValueChange('description', e.target.value)}
                  placeholder="제품 설명을 입력하세요"
                />
              </div>
            </div>
          </div>

          {/* 가격 및 기타 정보 섹션 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* 좌측: 가격 및 재고 정보 */}
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

            {/* 우측: 평점 및 리뷰 정보 */}
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

              {/* 제품 옵션을 여기로 이동 */}
              <div>
                <h4 className="text-md font-semibold text-gray-900 mb-3">{t('shop_form_product_options', '제품 옵션')}</h4>
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
            </div>
          </div>

          {/* 버튼 섹션 */}
          <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              className="w-full sm:w-auto px-6 py-3 rounded-lg bg-gray-200 text-gray-700 font-medium touch-manipulation"
              onClick={onClose}
              disabled={loading}
            >
              {t('cancel', '취소')}
            </button>
            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-3 rounded-lg bg-blue-600 text-white font-semibold disabled:opacity-50 touch-manipulation"
              disabled={loading}
            >
              {loading ? t('shop_form_saving', '저장 중...') : t('save', '저장')}
            </button>
          </div>

          {formError && <div className="mt-4 text-sm text-red-600 p-3 bg-red-50 rounded-lg">{formError}</div>}
          {formSuccess && <div className="mt-4 text-sm text-green-700 p-3 bg-green-50 rounded-lg">{formSuccess}</div>}
        </form>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default ShopProductForm;
