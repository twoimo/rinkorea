
import React from 'react';
import { Plus } from 'lucide-react';

interface ShopHeroProps {
  isAdmin: boolean;
  onAddProduct: () => void;
}

const ShopHero = ({ isAdmin, onAddProduct }: ShopHeroProps) => {
  return (
    <section className="bg-gradient-to-r from-blue-900 to-blue-700 text-white py-12 sm:py-16 lg:py-20">
      <div className="container mx-auto px-4">
        <div className="text-center">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6">온라인 스토어</h1>
          <p className="text-base sm:text-lg lg:text-xl max-w-2xl mx-auto px-4">
            안전하고 친환경적인 건설재료를 온라인에서 편리하게 구매하세요.
          </p>
          {isAdmin && (
            <button
              className="mt-6 sm:mt-8 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 mx-auto touch-manipulation"
              onClick={onAddProduct}
              aria-label="상품 추가"
            >
              <Plus className="w-5 h-5" /> 상품 추가
            </button>
          )}
        </div>
      </div>
    </section>
  );
};

export default ShopHero;
