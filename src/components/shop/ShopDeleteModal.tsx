import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useLanguage } from '@/contexts/LanguageContext';

interface Product {
  id: string;
  name: string;
}

interface ShopDeleteModalProps {
  product: Product;
  formLoading: boolean;
  formError: string | null;
  formSuccess: string | null;
  onConfirm: () => void;
  onCancel: () => void;
}

const ShopDeleteModal = ({
  product,
  formLoading,
  formError,
  formSuccess,
  onConfirm,
  onCancel,
}: ShopDeleteModalProps) => {
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
      onClick={onCancel}
    >
      <div
        className="bg-white rounded-lg shadow-lg w-full max-w-sm text-center p-6"
        style={{
          position: 'relative',
          margin: 'auto',
          transform: 'none'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-lg font-bold text-red-700 mb-4">{t('shop_delete_title', '상품 삭제')}</div>
        <div className="mb-6 text-gray-800">
          {t('shop_delete_confirm', '정말로')} <strong>{product.name}</strong> {t('shop_delete_confirm_product', '상품을 삭제하시겠습니까?')}
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={onCancel}
            className="w-full px-4 py-3 bg-gray-300 text-gray-700 rounded-lg font-medium touch-manipulation"
            disabled={formLoading}
          >
            {t('cancel', '취소')}
          </button>
          <button
            className="w-full px-4 py-3 bg-red-600 text-white rounded-lg font-medium disabled:opacity-50 touch-manipulation"
            onClick={onConfirm}
            disabled={formLoading}
          >
            {formLoading ? t('shop_deleting', '삭제 중...') : t('delete', '삭제')}
          </button>
        </div>
        {formError && <div className="mt-4 text-sm text-red-600 p-3 bg-red-50 rounded-lg">{formError}</div>}
        {formSuccess && <div className="mt-4 text-sm text-green-700 p-3 bg-green-50 rounded-lg">{formSuccess}</div>}
      </div>
    </div>,
    document.body
  );
};

export default ShopDeleteModal;
