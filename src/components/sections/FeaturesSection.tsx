
import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Award, Users, Zap, ArrowRight, CheckCircle } from 'lucide-react';
import { OptimizedImage } from '@/components/ui/image';

const FeaturesSection = () => {
  const features = [
    {
      icon: <Shield className="w-8 h-8" />,
      title: "친환경 인증 제품",
      description: "녹색기술, GR, 환경표지 인증을 받은 친환경 건설재료로 지속가능한 건설환경을 구현합니다.",
      color: "from-green-500 to-green-600",
      stats: "3개 인증"
    },
    {
      icon: <Award className="w-8 h-8" />,
      title: "세계적 파트너십",
      description: "Shanghai JS Floor Systems의 공식 파트너로서 세계 최고 수준의 건설기계를 공급합니다.",
      color: "from-blue-500 to-blue-600",
      stats: "글로벌 품질"
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "전문 기술팀",
      description: "풍부한 경험과 전문성을 갖춘 기술팀이 프로젝트 성공을 위해 최선을 다합니다.",
      color: "from-purple-500 to-purple-600",
      stats: "10년+ 경험"
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "혁신적 솔루션",
      description: "최신 기술과 혁신적인 접근 방식으로 건설업계의 새로운 표준을 제시합니다.",
      color: "from-orange-500 to-orange-600",
      stats: "혁신 기술"
    }
  ];

  return (
    <section className="py-24 bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center space-x-2 bg-red-100 text-red-700 rounded-full px-4 py-2 mb-6">
            <span className="w-2 h-2 bg-red-500 rounded-full"></span>
            <span className="text-sm font-semibold">WHY CHOOSE US</span>
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            린코리아가 <span className="text-red-600">특별한 이유</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            건설업계 전문기업으로서 축적된 노하우와 혁신적인 기술력으로<br />
            고객의 성공적인 프로젝트를 지원합니다.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="group bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100"
            >
              <div className={`bg-gradient-to-br ${feature.color} w-16 h-16 rounded-2xl flex items-center justify-center mb-6 text-white group-hover:scale-110 transition-transform duration-300`}>
                {feature.icon}
              </div>
              
              <div className="mb-4">
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed mb-4">{feature.description}</p>
                <div className="inline-flex items-center space-x-2 bg-gray-100 rounded-full px-3 py-1">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm font-medium text-gray-700">{feature.stats}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Business Areas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div>
              <div className="inline-flex items-center space-x-2 bg-blue-100 text-blue-700 rounded-full px-4 py-2 mb-6">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                <span className="text-sm font-semibold">BUSINESS AREAS</span>
              </div>
              <h3 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
                두 개의 전문 사업부로<br />
                <span className="text-blue-600">종합 솔루션</span> 제공
              </h3>
              <p className="text-lg text-gray-600 leading-relaxed mb-8">
                건설재료사업부와 건설기계사업부를 통해 건설 프로젝트의 모든 단계에서 
                필요한 전문적인 솔루션을 원스톱으로 제공합니다.
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex items-start space-x-4 p-6 bg-white rounded-2xl shadow-lg border border-gray-100">
                <div className="bg-gradient-to-br from-red-500 to-red-600 w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-gray-900 mb-2">건설재료사업부</h4>
                  <p className="text-gray-600">친환경 고성능 콘크리트 보호제 RIN-COAT 전문</p>
                </div>
              </div>

              <div className="flex items-start space-x-4 p-6 bg-white rounded-2xl shadow-lg border border-gray-100">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-gray-900 mb-2">건설기계사업부</h4>
                  <p className="text-gray-600">JS FLOOR SYSTEMS 공식 파트너, 연삭기·연마기 전문</p>
                </div>
              </div>
            </div>

            <Link
              to="/about"
              className="group inline-flex items-center space-x-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-8 py-4 rounded-full font-semibold transition-all duration-300 transform hover:scale-105"
            >
              <span>자세히 알아보기</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Right Image */}
          <div className="relative">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl">
              <OptimizedImage
                src="/images/company_intro.jpg"
                alt="린코리아 회사 소개"
                className="w-full h-96 lg:h-[500px] object-cover"
                loadingClassName="bg-gradient-to-br from-gray-200 to-gray-300"
                errorClassName="bg-gradient-to-br from-gray-200 to-gray-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
            </div>
            
            {/* Floating Stats Card */}
            <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl p-6 shadow-2xl border border-gray-100">
              <div className="flex items-center space-x-4">
                <div className="bg-gradient-to-br from-green-500 to-green-600 w-12 h-12 rounded-xl flex items-center justify-center">
                  <Award className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">2019+</div>
                  <div className="text-sm text-gray-600">설립 이후 지속 성장</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
