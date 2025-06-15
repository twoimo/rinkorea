
import React, { memo, useState, useCallback, Suspense } from 'react';
import { Plus, Wrench, Settings, Zap } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useOptimizedIntersectionObserver } from '@/hooks/useOptimizedIntersectionObserver';
import { OptimizedImage } from '@/components/ui/image';
import { useUserRole } from '../hooks/useUserRole';
import MobileOptimizedModal from '@/components/ui/mobile-optimized-modal';
import OptimizedButton from '@/components/ui/optimized-button';

interface Equipment {
  id: string;
  name: string;
  description: string;
  image_url: string;
  specifications: string[];
  category: string;
}

const EquipmentCard = memo(({ equipment, index }: { equipment: Equipment; index: number }) => {
  const { targetRef, isIntersecting } = useOptimizedIntersectionObserver();
  const [showDetails, setShowDetails] = useState(false);

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'coating':
        return <Wrench className="w-6 h-6 text-blue-600" />;
      case 'mixing':
        return <Settings className="w-6 h-6 text-green-600" />;
      default:
        return <Zap className="w-6 h-6 text-purple-600" />;
    }
  };

  return (
    <div 
      ref={targetRef}
      className={`transition-all duration-700 transform ${
        isIntersecting ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow group">
        <div className="relative aspect-video overflow-hidden">
          <Suspense fallback={<LoadingSpinner />}>
            <OptimizedImage
              src={equipment.image_url}
              alt={equipment.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          </Suspense>
          <div className="absolute top-4 left-4 bg-white p-2 rounded-full shadow-lg">
            {getCategoryIcon(equipment.category)}
          </div>
        </div>
        
        <div className="p-4 sm:p-6">
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">
            {equipment.name}
          </h3>
          <p className="text-sm sm:text-base text-gray-600 mb-4 leading-relaxed line-clamp-2">
            {equipment.description}
          </p>
          
          <OptimizedButton
            onClick={() => setShowDetails(true)}
            className="w-full"
            size="sm"
          >
            상세 정보 보기
          </OptimizedButton>
        </div>
      </div>

      <MobileOptimizedModal
        isOpen={showDetails}
        onClose={() => setShowDetails(false)}
        title={equipment.name}
        maxWidth="lg"
      >
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          <Suspense fallback={<LoadingSpinner />}>
            <OptimizedImage
              src={equipment.image_url}
              alt={equipment.name}
              className="w-full h-48 sm:h-64 object-cover rounded-lg"
              loading="lazy"
            />
          </Suspense>
          
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-3">장비 설명</h4>
            <p className="text-gray-600 leading-relaxed">{equipment.description}</p>
          </div>
          
          {equipment.specifications.length > 0 && (
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-3">주요 사양</h4>
              <ul className="space-y-2">
                {equipment.specifications.map((spec, index) => (
                  <li key={index} className="flex items-start text-gray-600">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mr-3 mt-2 flex-shrink-0" />
                    <span className="leading-relaxed">{spec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </MobileOptimizedModal>
    </div>
  );
});

EquipmentCard.displayName = 'EquipmentCard';

const Equipment = memo(() => {
  const { isAdmin } = useUserRole();
  const [equipmentList] = useState<Equipment[]>([
    {
      id: '1',
      name: '자동 코팅 장비',
      description: '고효율 자동 세라믹 코팅 시스템으로 대규모 시공에 최적화된 장비입니다.',
      image_url: '/images/850GTMAIN.jpg',
      specifications: [
        '시공 속도: 500㎡/시간',
        '코팅 두께: 1-5mm 조절 가능',
        '전력 소비: 15kW',
        '작업 온도: -10°C ~ 40°C'
      ],
      category: 'coating'
    },
    {
      id: '2',
      name: '이동식 믹싱 장비',
      description: '현장에서 직접 세라믹 코팅제를 혼합할 수 있는 이동식 장비입니다.',
      image_url: '/images/950GTMAIN.jpg',
      specifications: [
        '혼합 용량: 100L',
        '혼합 시간: 5-10분',
        '이동성: 트레일러 탑재',
        '전력: 220V/380V 겸용'
      ],
      category: 'mixing'
    }
  ]);

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-900 to-blue-700 text-white py-12 sm:py-16 lg:py-20">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 lg:mb-6">
              장비소개
            </h1>
            <p className="text-lg sm:text-xl max-w-3xl mx-auto leading-relaxed">
              린코리아의 전문 시공 장비를 통해 <br className="hidden sm:inline" />
              효율적이고 정확한 세라믹 코팅 작업을 수행하세요.
            </p>
            {isAdmin && (
              <OptimizedButton
                className="mt-6 lg:mt-8 bg-green-600 hover:bg-green-700"
                size="lg"
              >
                <Plus className="w-5 h-5 mr-2" />
                장비 추가
              </OptimizedButton>
            )}
          </div>
        </div>
      </section>

      {/* Equipment Grid */}
      <section className="py-12 sm:py-16 lg:py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {equipmentList.map((equipment, index) => (
              <EquipmentCard 
                key={equipment.id} 
                equipment={equipment} 
                index={index}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Equipment Benefits */}
      <section className="bg-gray-50 py-12 sm:py-16 lg:py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 lg:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              장비의 장점
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
              린코리아 장비의 우수성을 확인하세요
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {[
              {
                icon: '⚡',
                title: '고효율',
                description: '빠르고 정확한 시공으로 작업 효율성 극대화'
              },
              {
                icon: '🎯',
                title: '정밀성',
                description: '균일한 코팅 두께와 품질 보장'
              },
              {
                icon: '📱',
                title: '스마트 제어',
                description: '디지털 제어 시스템으로 간편한 조작'
              },
              {
                icon: '🔧',
                title: '쉬운 유지보수',
                description: '모듈화 설계로 간편한 관리'
              }
            ].map((benefit, index) => (
              <div key={index} className="text-center p-6 bg-white rounded-lg shadow-lg">
                <div className="text-4xl sm:text-5xl mb-4">{benefit.icon}</div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">
                  {benefit.title}
                </h3>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
});

Equipment.displayName = 'Equipment';

export default Equipment;
