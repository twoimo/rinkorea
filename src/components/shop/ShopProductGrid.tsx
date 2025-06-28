import React from 'react';
import { ShoppingCart, Star, Edit, Trash2, EyeOff, Eye } from 'lucide-react';
import { useLanguage, getLocalizedValue } from '@/contexts/LanguageContext';

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
  name_ko?: string;
  name_en?: string;
  name_zh?: string;
  name_id?: string;
  description_ko?: string;
  description_en?: string;
  description_zh?: string;
  description_id?: string;
  [key: string]: unknown;
}

interface ShopProductGridProps {
  products: Product[];
  gridCols: number;
  hiddenProductIds: string[];
  isAdmin: boolean;
  formLoading: boolean;
  onProductClick: (url: string) => void;
  onEditProduct: (product: Product) => void;
  onDeleteProduct: (product: Product) => void;
  onToggleHide: (product: Product) => void;
}

const ShopProductGrid = ({
  products,
  gridCols,
  hiddenProductIds,
  isAdmin,
  formLoading,
  onProductClick,
  onEditProduct,
  onDeleteProduct,
  onToggleHide,
}: ShopProductGridProps) => {
  const { t, language } = useLanguage();

  const formatPrice = (price: number) => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  return (
    <div className={`grid gap-4 sm:gap-6 lg:gap-8 grid-cols-1 sm:grid-cols-2 md:grid-cols-${Math.min(gridCols, 3)} lg:grid-cols-${gridCols}`}>
      {products.map((product) => {
        const isSoldOut = !product.stock_quantity || product.stock_quantity <= 0;
        const isHidden = hiddenProductIds.includes(product.id);

        const localizedName = getLocalizedValue(product, 'name', language);
        const localizedDescription = getLocalizedValue(product, 'description', language);

        return (
          <div key={product.id} className="bg-white rounded-xl shadow-lg overflow-hidden group relative">
            {/* 뱃지 영역 */}
            <div className="absolute top-3 sm:top-4 left-3 sm:left-4 flex flex-col gap-1 sm:gap-2 z-10">
              {product.discount && (
                <span className="bg-red-600 text-white px-2 sm:px-3 py-1 rounded-full text-xs font-bold shadow">
                  -{product.discount}%
                </span>
              )}
              {product.is_best && (
                <span className="bg-yellow-400 text-yellow-900 px-2 sm:px-3 py-1 rounded-full text-xs font-bold shadow">
                  BEST
                </span>
              )}
              {product.is_new && (
                <span className="bg-blue-600 text-white px-2 sm:px-3 py-1 rounded-full text-xs font-bold shadow">
                  NEW
                </span>
              )}
            </div>

            {/* 상품 이미지 */}
            <div className="relative aspect-square w-full overflow-hidden">
              <img
                src={product.image_url}
                alt={localizedName}
                className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
              />
            </div>

            {/* 상품 정보 */}
            <div className="p-4 sm:p-6 flex flex-col flex-grow">
              <div className="mb-3">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                  {localizedName}
                </h3>
                <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                  {localizedDescription}
                </p>
              </div>

              {/* 평점 및 리뷰 */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <div className="flex items-center">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="ml-1 text-sm font-medium text-gray-900">{product.rating}</span>
                  </div>
                  <span className="text-gray-300">|</span>
                  <span className="text-sm text-gray-600">{product.reviews} {t('reviews', '리뷰')}</span>
                </div>
              </div>

              {/* 가격 및 구매 버튼 */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-auto">
                <div className="flex flex-col">
                  {product.original_price && (
                    <del className="text-sm text-gray-400">
                      {formatPrice(product.original_price)}{t('currency_won', '원')}
                    </del>
                  )}
                  <span className="text-xl font-bold text-blue-600">
                    {formatPrice(product.price)}{t('currency_won', '원')}
                  </span>
                </div>
                <button
                  onClick={() => onProductClick(product.naver_url || '')}
                  className={`w-full sm:w-auto px-4 py-3 sm:py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center space-x-2 hover:scale-105 touch-manipulation ${isSoldOut
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                  disabled={isSoldOut}
                  aria-label={isSoldOut ? t('shop_product_out_of_stock', '품절') : t('shop_product_buy_now', '제품 구매하기')}
                >
                  {isSoldOut ? (
                    <>{t('shop_product_out_of_stock', '품절')}</>
                  ) : (
                    <>
                      {t('shop_product_buy_now', '구매하기')}
                      <ShoppingCart className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* 관리자 버튼들 - 모바일 최적화 */}
            {isAdmin && (
              <div className="absolute top-3 sm:top-4 right-3 sm:right-4 flex flex-col sm:flex-row gap-1 sm:gap-2 z-10">
                <button
                  className={`bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full p-2 shadow touch-manipulation ${formLoading ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  onClick={() => onToggleHide(product)}
                  title={isHidden ? t('show', '노출 해제') : t('hide', '숨기기')}
                  disabled={formLoading}
                  aria-label={isHidden ? t('show', '노출 해제') : t('hide', '숨기기')}
                >
                  {isHidden ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
                <button
                  className="bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-full p-2 shadow touch-manipulation"
                  onClick={() => onEditProduct(product)}
                  title={t('edit', '수정')}
                  disabled={formLoading}
                  aria-label={t('edit', '수정')}
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  className="bg-red-100 hover:bg-red-200 text-red-700 rounded-full p-2 shadow touch-manipulation"
                  onClick={() => onDeleteProduct(product)}
                  title={t('delete', '삭제')}
                  disabled={formLoading}
                  aria-label={t('delete', '삭제')}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default ShopProductGrid;
