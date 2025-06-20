import React, { memo } from 'react';
import { Shield, Palette, Star, Zap, Leaf, Edit, Trash2, EyeOff, Eye } from 'lucide-react';
import { OptimizedImage } from '@/components/ui/image';
import { Product } from '@/types/product';

interface ProductCardProps {
  product: Product;
  index: number;
  isHidden: boolean;
  isAdmin: boolean;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  onToggleHide: (product: Product) => void;
  onViewDetail: (product: Product) => void;
}

const iconMap = {
  'Shield': Shield,
  'Palette': Palette,
  'Star': Star,
  'Zap': Zap,
  'Leaf': Leaf
} as const;

const ProductCard = memo(({
  product,
  index,
  isHidden,
  isAdmin,
  onEdit,
  onDelete,
  onToggleHide,
  onViewDetail
}: ProductCardProps) => {
  const IconComponent = iconMap[product.icon as keyof typeof iconMap];

  if (!IconComponent) {
    console.warn(`Unknown icon type: ${product.icon}`);
  }

  const getImageUrl = (imagePath: string) => {
    if (imagePath.includes('://') || imagePath.startsWith('@')) return imagePath;
    return `/images/${imagePath}`;
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow flex flex-col">
      <div className="relative aspect-square overflow-hidden">
        <OptimizedImage
          src={getImageUrl(product.image_url)}
          alt={product.name}
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
        {isAdmin && (
          <div className="absolute top-3 sm:top-4 right-3 sm:right-4 flex flex-col sm:flex-row space-y-1 sm:space-y-0 sm:space-x-2">
            <button
              onClick={() => onToggleHide(product)}
              className="bg-white p-1.5 sm:p-2 rounded-full hover:bg-gray-100 transition-colors touch-manipulation"
              aria-label={isHidden ? "제품 보이기" : "제품 숨기기"}
            >
              {isHidden ? (
                <Eye className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
              ) : (
                <EyeOff className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
              )}
            </button>
            <button
              onClick={() => onEdit(product)}
              className="bg-white p-1.5 sm:p-2 rounded-full hover:bg-gray-100 transition-colors touch-manipulation"
              aria-label="제품 수정"
            >
              <Edit className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
            </button>
            <button
              onClick={() => onDelete(product)}
              className="bg-white p-1.5 sm:p-2 rounded-full hover:bg-gray-100 transition-colors touch-manipulation"
              aria-label="제품 삭제"
            >
              <Trash2 className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
            </button>
          </div>
        )}
      </div>
      <div className="p-4 sm:p-6 flex flex-col flex-grow">
        <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 sm:mb-3">{product.name}</h3>
        <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4 leading-relaxed">{product.description}</p>
        <div className="space-y-2 flex-grow">
          <h4 className="font-semibold text-gray-900 text-sm sm:text-base">주요 특징:</h4>
          <ul className="space-y-1">
            {product.features.map((feature, featureIndex) => (
              <li key={featureIndex} className="flex items-start text-sm sm:text-base text-gray-600">
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-600 rounded-full mr-2 mt-1.5 sm:mt-2 flex-shrink-0"></div>
                <span className="leading-relaxed">{feature}</span>
              </li>
            ))}
          </ul>
        </div>
        <button
          onClick={() => onViewDetail(product)}
          className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 sm:py-2 rounded-lg font-semibold transition-colors text-sm sm:text-base touch-manipulation"
        >
          자세히 보기
        </button>
      </div>
    </div>
  );
});

ProductCard.displayName = 'ProductCard';

export default ProductCard;
