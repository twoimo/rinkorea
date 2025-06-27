import React from 'react';
import { Plus, ShoppingBag } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface ShopHeroProps {
  isAdmin: boolean;
  onAddProduct: () => void;
}

const ShopHero: React.FC<ShopHeroProps> = ({ isAdmin, onAddProduct }) => {
  const { t } = useLanguage();

  return (
    <section className="bg-gradient-to-r from-blue-900 to-blue-700 text-white py-12 sm:py-20">
      <div className="container mx-auto px-4">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <ShoppingBag className="w-16 h-16 text-white/80" />
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold mb-4 sm:mb-6">{t('shop_hero_title', '온라인 쇼핑몰')}</h1>
          <p className="text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed">
            {t('shop_hero_subtitle', '린코리아 제품을 온라인으로 주문하고 구매할 수 있습니다.')}
          </p>
          {isAdmin && (
            <button
              className="mt-6 sm:mt-8 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 mx-auto touch-manipulation"
              onClick={onAddProduct}
              aria-label={t('shop_add_product', '제품 추가')}
            >
              <Plus className="w-5 h-5" /> {t('shop_add_product', '제품 추가')}
            </button>
          )}
        </div>
      </div>
    </section>
  );
};

export default ShopHero;
