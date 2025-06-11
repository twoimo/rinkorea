
import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Leaf, Award, ArrowRight, Zap, CheckCircle } from 'lucide-react';

export const FeaturesSection = () => {
  const features = [
    {
      icon: <Shield className="w-16 h-16 text-blue-600" />,
      title: "불연재 인증",
      description: "국토교통부 불연재 인증을 받은 안전한 세라믹 코팅제",
      gradient: "from-blue-500 to-blue-700",
      bgColor: "bg-blue-50",
      highlight: "안전성 보장"
    },
    {
      icon: <Leaf className="w-16 h-16 text-emerald-600" />,
      title: "친환경 소재",
      description: "환경을 생각하는 친환경 1액형 신소재 세라믹 코팅",
      gradient: "from-emerald-500 to-emerald-700",
      bgColor: "bg-emerald-50",
      highlight: "지속 가능"
    },
    {
      icon: <Award className="w-16 h-16 text-amber-600" />,
      title: "우수한 품질",
      description: "다양한 시험성적서와 인증으로 검증된 품질",
      gradient: "from-amber-500 to-amber-700",
      bgColor: "bg-amber-50",
      highlight: "품질 검증"
    }
  ];

  return (
    <section className="py-32 bg-gradient-to-br from-gray-50 via-white to-blue-50 relative overflow-hidden">
      {/* Enhanced Background */}
      <div className="absolute inset-0">
        <div className="absolute top-20 right-20 w-96 h-96 bg-gradient-to-br from-blue-200/40 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-gradient-to-tr from-emerald-200/40 to-transparent rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-blue-100/20 to-emerald-100/20 rounded-full blur-3xl" />
      </div>
      
      <div className="container mx-auto px-6 lg:px-8 relative z-10">
        {/* Enhanced Header */}
        <div className="text-center mb-24">
          <div className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-100 to-emerald-100 rounded-full px-8 py-4 mb-8 shadow-lg">
            <Shield className="w-6 h-6 text-blue-600" />
            <span className="text-blue-800 font-bold text-lg">린코리아의 차별화된 기술력</span>
            <Zap className="w-6 h-6 text-amber-500" />
          </div>
          
          <h2 className="text-6xl md:text-7xl font-black text-gray-900 mb-8 leading-tight">
            <span className="block bg-gradient-to-r from-blue-600 to-emerald-600 bg-clip-text text-transparent">
              린코리아만의
            </span>
            <span className="block bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
              특별함
            </span>
          </h2>
          
          <p className="text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed font-light">
            최고 품질의 세라믹 코팅제로 안전하고 친환경적인 
            <span className="font-semibold text-blue-600"> 건설환경을 만들어갑니다</span>
          </p>
        </div>
        
        {/* Enhanced Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-16 mb-20">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative bg-white p-12 rounded-3xl shadow-2xl border border-gray-100 text-center hover:shadow-3xl transition-all duration-700 transform hover:-translate-y-6 overflow-hidden"
            >
              {/* Enhanced Background Effects */}
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-700 rounded-3xl`} />
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-white to-gray-100 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-700 transform group-hover:scale-150" />
              
              {/* Highlight Badge */}
              <div className="absolute top-6 right-6 bg-gradient-to-r from-white to-gray-50 text-gray-700 px-4 py-2 rounded-full text-sm font-semibold shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-2 group-hover:translate-y-0">
                {feature.highlight}
              </div>
              
              {/* Enhanced Icon */}
              <div className="relative z-10 flex justify-center mb-10">
                <div className={`relative w-32 h-32 rounded-3xl ${feature.bgColor} flex items-center justify-center group-hover:scale-110 transition-all duration-700 shadow-2xl group-hover:shadow-3xl`}>
                  {feature.icon}
                  <div className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-20 transition-opacity duration-700`} />
                  
                  {/* Pulsing ring */}
                  <div className={`absolute inset-0 rounded-3xl border-4 border-transparent group-hover:border-current opacity-0 group-hover:opacity-30 transition-all duration-700 animate-pulse`} />
                </div>
              </div>
              
              {/* Enhanced Content */}
              <h3 className="text-3xl font-black text-gray-900 mb-6 group-hover:text-blue-700 transition-colors duration-500">
                {feature.title}
              </h3>
              <p className="text-gray-600 text-lg leading-relaxed mb-8 group-hover:text-gray-700 transition-colors duration-300">
                {feature.description}
              </p>
              
              {/* Check Icon */}
              <div className="flex justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-4 group-hover:translate-y-0">
                <CheckCircle className="w-8 h-8 text-emerald-500" />
              </div>
              
              {/* Enhanced Bottom Indicator */}
              <div className={`absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r ${feature.gradient} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-700 rounded-b-3xl`} />
            </div>
          ))}
        </div>

        {/* Enhanced CTA */}
        <div className="text-center">
          <Link
            to="/products"
            className="group inline-flex items-center gap-4 bg-gradient-to-r from-blue-600 via-blue-700 to-emerald-600 hover:from-blue-700 hover:via-blue-800 hover:to-emerald-700 text-white px-12 py-6 rounded-3xl font-black text-xl transition-all duration-500 shadow-2xl hover:shadow-3xl transform hover:-translate-y-3 hover:scale-105"
          >
            <Award className="w-8 h-8 group-hover:rotate-12 transition-transform duration-300" />
            <span>제품 상세정보 보기</span>
            <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform duration-300" />
          </Link>
        </div>
      </div>
    </section>
  );
};
