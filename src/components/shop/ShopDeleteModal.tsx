
import React from 'react';

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
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-sm text-center p-6">
        <div className="text-lg font-bold text-red-700 mb-4">상품 삭제</div>
        <div className="mb-6 text-gray-800">
          정말로 <strong>{product.name}</strong> 상품을 삭제하시겠습니까?
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <button 
            onClick={onCancel} 
            className="w-full px-4 py-3 bg-gray-300 text-gray-700 rounded-lg font-medium touch-manipulation" 
            disabled={formLoading}
          >
            취소
          </button>
          <button 
            className="w-full px-4 py-3 bg-red-600 text-white rounded-lg font-medium disabled:opacity-50 touch-manipulation" 
            onClick={onConfirm} 
            disabled={formLoading}
          >
            {formLoading ? '삭제 중...' : '삭제'}
          </button>
        </div>
        {formError && <div className="mt-4 text-sm text-red-600 p-3 bg-red-50 rounded-lg">{formError}</div>}
        {formSuccess && <div className="mt-4 text-sm text-green-700 p-3 bg-green-50 rounded-lg">{formSuccess}</div>}
      </div>
    </div>
  );
};

export default ShopDeleteModal;
