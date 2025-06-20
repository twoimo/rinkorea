
import React, { memo } from 'react';
import { Product } from '@/types/product';

interface DeleteConfirmModalProps {
  product: Product;
  onConfirm: () => void;
  onCancel: () => void;
}

const DeleteConfirmModal = memo(({ product, onConfirm, onCancel }: DeleteConfirmModalProps) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-md">
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
