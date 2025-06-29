import React, { memo, useEffect } from 'react';
import { Product } from '@/types/product';
import { createPortal } from 'react-dom';

interface DeleteConfirmModalProps {
  product: Product;
  onConfirm: () => void;
  onCancel: () => void;
}

const DeleteConfirmModal = memo(({ product, onConfirm, onCancel }: DeleteConfirmModalProps) => {
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
        className="bg-white rounded-lg w-full max-w-md"
        style={{
          position: 'relative',
          margin: 'auto',
          transform: 'none'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">제품 삭제</h2>
          <p className="text-gray-600 mb-6 leading-relaxed">
            정말로 "<span className="font-semibold">{product.name}</span>" 제품을 삭제하시겠습니까?
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={onCancel}
              className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors touch-manipulation"
            >
              취소
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors touch-manipulation"
            >
              삭제
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

DeleteConfirmModal.displayName = 'DeleteConfirmModal';

export default DeleteConfirmModal;
