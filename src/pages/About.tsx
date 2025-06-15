
import React, { memo, Suspense } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useOptimizedIntersectionObserver } from '@/hooks/useOptimizedIntersectionObserver';
import { OptimizedImage } from '@/components/ui/image';

const AboutSection = memo(({ children, className = '' }: { children: React.ReactNode; className?: string }) => {
  const { targetRef, isIntersecting } = useOptimizedIntersectionObserver();
  
  return (
    <section 
      ref={targetRef}
      className={`transition-opacity duration-700 ${isIntersecting ? 'opacity-100' : 'opacity-0'} ${className}`}
    >
      {children}
    </section>
  );
});

AboutSection.displayName = 'AboutSection';

const About = memo(() => {
  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main>
        {/* Hero Section */}
        <AboutSection className="bg-gradient-to-r from-blue-900 to-blue-700 text-white py-12 sm:py-16 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="text-center">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 lg:mb-6">
                회사소개
              </h1>
              <p className="text-lg sm:text-xl max-w-3xl mx-auto leading-relaxed">
                린코리아는 친환경 불연재(1액형) 신소재 세라믹 코팅제를 전문으로 하는 
                <br className="hidden sm:inline" />
                건설재료 제조업체입니다.
              </p>
            </div>
          </div>
        </AboutSection>

        {/* Company Overview */}
        <AboutSection className="py-12 sm:py-16 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              <div className="order-2 lg:order-1">
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 lg:mb-6">
                  린코리아 소개
                </h2>
                <div className="space-y-4 text-base sm:text-lg text-gray-600 leading-relaxed">
                  <p>
                    린코리아는 2010년 설립된 이후 지속적인 연구개발을 통해 
                    친환경 세라믹 코팅제 분야의 선두주자로 성장해왔습니다.
                  </p>
                  <p>
                    우리의 제품은 국토교통부 불연재 인증을 받은 순수 무기질 소재로, 
                    건설 현장에서 안전하고 효율적인 시공을 가능하게 합니다.
                  </p>
                  <p>
                    1액형 제품으로 간편한 시공이 가능하며, 
                    뛰어난 내구성과 방화 성능을 제공합니다.
                  </p>
                </div>
              </div>
              <div className="order-1 lg:order-2">
                <Suspense fallback={<LoadingSpinner />}>
                  <OptimizedImage
                    src="/images/company_intro.jpg"
                    alt="린코리아 회사 소개"
                    className="w-full h-auto rounded-lg shadow-lg"
                    loading="lazy"
                  />
                </Suspense>
              </div>
            </div>
          </div>
        </AboutSection>

        {/* Mission & Vision */}
        <AboutSection className="bg-gray-50 py-12 sm:py-16 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12 lg:mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                미션 & 비전
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
              <div className="bg-white p-6 sm:p-8 rounded-lg shadow-lg">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-white text-2xl font-bold">M</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">미션</h3>
                </div>
                <p className="text-base sm:text-lg text-gray-600 leading-relaxed text-center">
                  친환경 세라믹 코팅제를 통해 안전하고 지속가능한 건설환경을 조성하여 
                  더 나은 미래를 만들어갑니다.
                </p>
              </div>
              <div className="bg-white p-6 sm:p-8 rounded-lg shadow-lg">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-white text-2xl font-bold">V</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">비전</h3>
                </div>
                <p className="text-base sm:text-lg text-gray-600 leading-relaxed text-center">
                  세계적인 친환경 건설재료 전문기업으로 성장하여 
                  글로벌 시장을 선도하는 기업이 되겠습니다.
                </p>
              </div>
            </div>
          </div>
        </AboutSection>

        {/* Core Values */}
        <AboutSection className="py-12 sm:py-16 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12 lg:mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                핵심가치
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {[
                {
                  title: '안전',
                  description: '모든 제품과 서비스에서 안전을 최우선으로 생각합니다.',
                  icon: '🛡️'
                },
                {
                  title: '혁신',
                  description: '지속적인 연구개발을 통해 혁신적인 제품을 개발합니다.',
                  icon: '💡'
                },
                {
                  title: '품질',
                  description: '최고 품질의 제품으로 고객 만족을 실현합니다.',
                  icon: '⭐'
                },
                {
                  title: '환경',
                  description: '친환경 제품으로 지속가능한 미래를 만듭니다.',
                  icon: '🌱'
                },
                {
                  title: '신뢰',
                  description: '고객과의 신뢰를 바탕으로 함께 성장합니다.',
                  icon: '🤝'
                },
                {
                  title: '성장',
                  description: '끊임없는 도전과 학습으로 지속적으로 성장합니다.',
                  icon: '📈'
                }
              ].map((value, index) => (
                <div key={index} className="text-center p-6 bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow">
                  <div className="text-4xl sm:text-5xl mb-4">{value.icon}</div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">{value.title}</h3>
                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed">{value.description}</p>
                </div>
              ))}
            </div>
          </div>
        </AboutSection>

        {/* Contact Info */}
        <AboutSection className="bg-gray-900 text-white py-12 sm:py-16 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="text-center">
              <h2 className="text-3xl sm:text-4xl font-bold mb-8 lg:mb-12">
                연락처
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
                <div className="text-center">
                  <h3 className="text-lg sm:text-xl font-semibold mb-2">전화번호</h3>
                  <p className="text-base sm:text-lg text-gray-300">02-1234-5678</p>
                </div>
                <div className="text-center">
                  <h3 className="text-lg sm:text-xl font-semibold mb-2">이메일</h3>
                  <p className="text-base sm:text-lg text-gray-300">info@rinkorea.co.kr</p>
                </div>
                <div className="text-center">
                  <h3 className="text-lg sm:text-xl font-semibold mb-2">주소</h3>
                  <p className="text-base sm:text-lg text-gray-300">서울시 강남구 테헤란로 123</p>
                </div>
              </div>
            </div>
          </div>
        </AboutSection>
      </main>

      <Footer />
    </div>
  );
});

About.displayName = 'About';

export default About;
