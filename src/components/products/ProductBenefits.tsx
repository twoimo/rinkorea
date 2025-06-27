import React, { memo } from 'react';
import { Shield, Zap, Star, Palette } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const ProductBenefits = memo(() => {
  const { t } = useLanguage();

const benefits = [
  {
    icon: Shield,
      title: t('product_benefits_fire_resistant_title', '불연재 인증'),
      description: t('product_benefits_fire_resistant_desc', '안전한 순수 무기질 세라믹 코팅제'),
    color: 'text-blue-600'
  },
  {
    icon: Zap,
      title: t('product_benefits_easy_construction_title', '간편한 시공'),
      description: t('product_benefits_easy_construction_desc', '1액형으로 간편하게 시공 가능'),
    color: 'text-yellow-600'
  },
  {
    icon: Star,
      title: t('product_benefits_quality_title', '우수한 품질'),
      description: t('product_benefits_quality_desc', '엄격한 품질 관리를 통한 우수한 품질'),
    color: 'text-green-600'
  },
  {
    icon: Palette,
      title: t('product_benefits_variety_title', '다양한 선택'),
      description: t('product_benefits_variety_desc', '용도와 요구사항에 맞는 다양한 제품군'),
    color: 'text-purple-600'
  }
];

  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 lg:mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
            {t('product_benefits_title', '제품의 장점')}
          </h2>
          <p className="text-lg sm:text-xl text-gray-600">
            {t('product_benefits_subtitle', '린코리아 세라믹 코팅제가 선택받는 이유')}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {benefits.map((benefit, index) => {
            const IconComponent = benefit.icon;
            return (
              <div key={index} className="text-center">
                <div className="bg-white w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-lg">
                  <IconComponent className={`w-6 h-6 sm:w-8 sm:h-8 ${benefit.color}`} />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2">{benefit.title}</h3>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed">{benefit.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
});

ProductBenefits.displayName = 'ProductBenefits';

export default ProductBenefits;
