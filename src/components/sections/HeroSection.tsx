
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Shield, Building2, Wrench } from 'lucide-react';
import { OptimizedImage } from '@/components/ui/image';

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <OptimizedImage
          src="/images/homepage-main.jpg"
          alt="린코리아 건설 현장"
          className="w-full h-full object-cover"
          loadingClassName="bg-gradient-to-r from-blue-900 to-blue-700"
          errorClassName="bg-gradient-to-r from-blue-900 to-blue-700"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/90 via-blue-800/80 to-blue-700/90"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/30"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center text-white">
        <div className="max-w-5xl mx-auto">
          {/* Company Badge */}
          <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-6 py-3 mb-8">
            <Shield className="w-5 h-5 text-yellow-400" />
            <span className="text-sm font-medium">since 2019 | 건설업계 전문기업</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold mb-8 leading-tight">
            <span className="block text-white drop-shadow-2xl">더 나은</span>
            <span className="block bg-gradient-to-r from-yellow-400 via-yellow-300 to-orange-400 bg-clip-text text-transparent drop-shadow-2xl">
              건설환경을
            </span>
            <span className="block text-white drop-shadow-2xl">만들어갑니다</span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-gray-200 mb-12 leading-relaxed max-w-3xl mx-auto">
            린코리아는 혁신적인 건설재료와 첨단 건설기계를 통해<br />
            건설업계의 미래를 선도하는 종합 솔루션 제공업체입니다.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <Link
              to="/products"
              className="group bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-2xl flex items-center space-x-2"
            >
              <span>제품 둘러보기</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/about"
              className="group border-2 border-white text-white hover:bg-white hover:text-blue-900 px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 transform hover:scale-105 backdrop-blur-sm"
            >
              회사소개
            </Link>
          </div>

          {/* Key Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="group bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 hover:bg-white/20 transition-all duration-300">
              <div className="bg-gradient-to-br from-red-500 to-red-600 w-16 h-16 rounded-2xl flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">건설재료사업부</h3>
              <p className="text-gray-200 text-sm leading-relaxed">
                친환경 고성능 콘크리트 보호 솔루션 RIN-COAT로 구조물의 내구성을 극대화합니다.
              </p>
            </div>

            <div className="group bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 hover:bg-white/20 transition-all duration-300">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 w-16 h-16 rounded-2xl flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform">
                <Building2 className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">건설기계사업부</h3>
              <p className="text-gray-200 text-sm leading-relaxed">
                JS FLOOR SYSTEMS 공식 파트너로서 최첨단 연삭기와 연마기를 공급합니다.
              </p>
            </div>

            <div className="group bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 hover:bg-white/20 transition-all duration-300">
              <div className="bg-gradient-to-br from-green-500 to-green-600 w-16 h-16 rounded-2xl flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform">
                <Wrench className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">전문 서비스</h3>
              <p className="text-gray-200 text-sm leading-relaxed">
                판매부터 A/S까지 원스톱 서비스로 고객의 성공적인 프로젝트를 지원합니다.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10">
        <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white rounded-full mt-2 animate-bounce"></div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
