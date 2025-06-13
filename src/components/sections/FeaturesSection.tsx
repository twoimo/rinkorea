
import React from 'react';
import { Shield, Leaf, Award, CheckCircle, Factory, Zap } from 'lucide-react';

const FeaturesSection = () => {
  const features = [
    {
      icon: <Shield className="w-6 h-6 sm:w-8 sm:h-8" />,
      title: "불연재 인증",
      description: "안전한 순수 무기질 세라믹 코팅제로 화재로부터 보호",
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
      textColor: "text-blue-600"
    },
    {
      icon: <Leaf className="w-6 h-6 sm:w-8 sm:h-8" />,
      title: "친환경 마감 공법",
      description: "환경을 생각하는 친환경적인 1액형 신소재 세라믹 코팅마감",
      color: "from-green-500 to-green-600",
      bgColor: "bg-green-50",
      textColor: "text-green-600"
    },
    {
      icon: <Award className="w-6 h-6 sm:w-8 sm:h-8" />,
      title: "우수한 품질",
      description: "다양한 시험성적서와 인증, 1000여 곳 이상의 현장 적용을 통해 검증된 품질",
      color: "from-orange-500 to-orange-600",
      bgColor: "bg-orange-50",
      textColor: "text-orange-600"
    },
    {
      icon: <Factory className="w-6 h-6 sm:w-8 sm:h-8" />,
      title: "산업용 적용",
      description: "공장, 창고, 주차장 등 다양한 건설 현장에서 검증된 신뢰성",
      color: "from-gray-500 to-gray-600",
      bgColor: "bg-gray-50",
      textColor: "text-gray-600"
    },
    {
      icon: <Zap className="w-6 h-6 sm:w-8 sm:h-8" />,
      title: "공기 단축",
      description: "콘크리트 폴리싱의 단계를 획기적으로 단축시켜 간편하고 신속한 시공 가능",
      color: "from-yellow-500 to-yellow-600",
      bgColor: "bg-yellow-50",
      textColor: "text-yellow-600"
    },
    {
      icon: <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8" />,
      title: "검증된 성능",
      description: "엄격한 품질 테스트와 현장 검증을 통해 입증된 뛰어난 성능",
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50",
      textColor: "text-purple-600"
    }
  ];

  return (
    <section className="h-screen flex flex-col bg-gradient-to-br from-blue-50 to-blue-100 relative overflow-hidden">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-12 sm:py-16 relative">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative text-center">
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-black mb-4 leading-tight">
            린코리아만의
            <span className="text-yellow-300"> 특별함</span>
          </h2>
          <p className="text-xl sm:text-2xl text-blue-100 leading-relaxed max-w-3xl mx-auto">
            최고 품질의 세라믹 코팅제로 안전하고 친환경적인 건설환경을 만들어갑니다
          </p>
        </div>
      </div>

      {/* Content Section */}
      <div className="flex-1 flex items-center justify-center py-8 sm:py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group relative bg-white rounded-2xl p-6 sm:p-8 shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-gray-200 transform hover:-translate-y-2"
              >
                {/* Icon Container */}
                <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl ${feature.bgColor} flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <div className={feature.textColor}>
                    {feature.icon}
                  </div>
                </div>

                {/* Content */}
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                  {feature.description}
                </p>

                {/* Hover Effect Background */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity duration-300`} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
