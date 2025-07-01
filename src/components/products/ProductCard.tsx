import React, { useState } from 'react';
import { Shield, Palette, Star, Zap, Leaf, Edit, Trash2, EyeOff, Eye, ChevronDown, ChevronUp } from 'lucide-react';
import { OptimizedImage } from '@/components/ui/image';
import { Product } from '@/types/product';
import { useLanguage, getLocalizedValue, getLocalizedArray } from '@/contexts/LanguageContext';

interface ProductCardProps {
  product: Product;
  _index: number;
  isHidden: boolean;
  isAdmin: boolean;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  onToggleHide: (product: Product) => void;
  onViewDetail: (product: Product) => void;
}

const iconMap = {
  'Shield': Shield,
  'shield': Shield,
  'Palette': Palette,
  'palette': Palette,
  'Star': Star,
  'star': Star,
  'Zap': Zap,
  'zap': Zap,
  'Leaf': Leaf,
  'leaf': Leaf,
  'none': null,
  'None': null
} as const;

const ProductCard: React.FC<ProductCardProps> = React.memo(({
  product,
  _index,
  isHidden,
  isAdmin,
  onEdit,
  onDelete,
  onToggleHide,
  onViewDetail
}: ProductCardProps) => {
  const { language, t } = useLanguage();
  const [isExpanded, setIsExpanded] = useState(false);
  const IconComponent = iconMap[product.icon as keyof typeof iconMap];

  if (!IconComponent && product.icon && product.icon !== 'none' && product.icon !== 'None') {
    console.warn(`Unknown icon type: ${product.icon}`);
  }

  const getImageUrl = (imagePath: string) => {
    if (imagePath.includes('://') || imagePath.startsWith('@')) return imagePath;
    return `/images/${imagePath}`;
  };

  // 언어별 데이터 가져오기
  const localizedName = getLocalizedValue(product, 'name', language);
  const localizedDescription = getLocalizedValue(product, 'description', language);
  const localizedFeatures = getLocalizedArray(product, 'features', language);

  const handleToggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow flex flex-col">
      <div className="relative aspect-square overflow-hidden">
        <OptimizedImage
          src={getImageUrl(product.image_url)}
          alt={localizedName}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
          width={800}
          height={800}
        />
        {product.icon && IconComponent && (
          <div className="absolute top-3 sm:top-4 left-3 sm:left-4 bg-white p-1.5 sm:p-2 rounded-full">
            <IconComponent className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" aria-hidden="true" />
          </div>
        )}

        {/* Admin Controls */}
        {isAdmin && (
          <div className="absolute top-3 sm:top-4 right-3 sm:right-4 flex gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleHide(product);
              }}
              className={`p-2 rounded-full shadow-lg transition-colors ${isHidden
                ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                : 'bg-white text-blue-600 hover:bg-blue-50'
                }`}
              title={isHidden ? t('product_card_show', '표시하기') : t('product_card_hide', '숨기기')}
            >
              {isHidden ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(product);
              }}
              className="p-2 bg-white text-green-600 rounded-full hover:bg-green-50 shadow-lg transition-colors"
              title={t('product_card_edit', '편집')}
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(product);
              }}
              className="p-2 bg-white text-red-600 rounded-full hover:bg-red-50 shadow-lg transition-colors"
              title={t('product_card_delete', '삭제')}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      <div className="p-4 sm:p-6 flex-1 flex flex-col">
        <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3 line-clamp-2">
          {localizedName}
        </h3>

        <p className="text-sm sm:text-base text-gray-600 mb-4 line-clamp-3">
          {localizedDescription}
        </p>

        {/* Features */}
        {localizedFeatures && localizedFeatures.length > 0 && (
          <div className="mb-4">
            <ul className="space-y-1">
              {(isExpanded ? localizedFeatures : localizedFeatures.slice(0, 3)).map((feature, featureIndex) => (
                <li key={featureIndex} className="text-xs sm:text-sm text-gray-500 flex items-center">
                  <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mr-2 flex-shrink-0"></span>
                  <span className="line-clamp-1">{feature}</span>
                </li>
              ))}
              {localizedFeatures.length > 3 && (
                <li>
                  <button
                    onClick={handleToggleExpand}
                    className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors touch-manipulation"
                  >
                    {isExpanded ? (
                      <>
                        <ChevronUp className="w-3 h-3" />
                        {t('product_card_show_less', '접기')}
                      </>
                    ) : (
                      <>
                        <ChevronDown className="w-3 h-3" />
                        +{localizedFeatures.length - 3}{t('product_card_more_items', '개 더')}
                      </>
                    )}
                  </button>
                </li>
              )}
            </ul>
          </div>
        )}

        <button
          onClick={() => onViewDetail(product)}
          className="w-full bg-blue-600 text-white py-2 sm:py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm sm:text-base touch-manipulation mt-auto"
        >
          {t('product_card_view_detail', '자세히 보기')}
        </button>
      </div>
    </div>
  );
});

ProductCard.displayName = 'ProductCard';

export default ProductCard;
