
import React from 'react';
import { Shield, Leaf, Award, CheckCircle, Factory, Zap } from 'lucide-react';

const FeaturesSection = () => {
  const features = [
    {
      icon: <Shield className="w-8 h-8" />,
      title: "불연재 인증",
      description: "국토교통부 불연재 인증을 받은 안전한 세라믹 코팅제",
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
      textColor: "text-blue-600"
    },
    {
      icon: <Leaf className="w-8 h-8" />,
      title: "친환경 소재",
      description: "환경을 생각하는 친환경 1액형 신소재 세라믹 코팅",
      color: "from-green-500 to-green-600",
      bgColor: "bg-green-50",
      textColor: "text-green-600"
    },
    {
      icon: <Award className="w-8 h-8" />,
      title: "우수한 품질",
      description: "다양한 시험성적서와 인증으로 검증된 품질",
      color: "from-orange-500 to-orange-600",
      bgColor: "bg-orange-50",
      textColor: "text-orange-600"
    },
    {
      icon: <Factory className="w-8 h-8" />,
      title: "산업용 적용",
      description: "다양한 건설 현장에서 검증된 신뢰성",
      color: "from-gray-500 to-gray-600",
      bgColor: "bg-gray-50",
      textColor: "text-gray-600"
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "빠른 시공",
      description: "1액형으로 간편하고 신속한 시공 가능",
      color: "from-yellow-500 to-yellow-600",
      bgColor: "bg-yellow-50",
      textColor: "text-yellow-600"
    },
    {
      icon: <CheckCircle className="w-8 h-8" />,
      title: "검증된 성능",
      description: "엄격한 품질 테스트를 통과한 제품",
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50",
      textColor: "text-purple-600"
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="container mx-auto px-6 lg:px-8 relative">
        {/* Section Header */}
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <div className="inline-block bg-red-600 text-white px-4 py-2 rounded-full text-sm font-bold mb-6 tracking-wider">
            RIN-COAT 특징
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-6 leading-tight">
            린코리아만의 
            <span className="text-red-600"> 특별함</span>
          </h2>
          <p className="text-xl text-gray-600 leading-relaxed">
            최고 품질의 세라믹 코팅제로 안전하고 친환경적인 건설환경을 만들어갑니다
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-gray-200 transform hover:-translate-y-2"
            >
              {/* Icon Container */}
              <div className={`w-16 h-16 rounded-2xl ${feature.bgColor} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                <div className={feature.textColor}>
                  {feature.icon}
                </div>
              </div>

              {/* Content */}
              <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-red-600 transition-colors">
                {feature.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>

              {/* Hover Effect Background */}
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity duration-300`} />
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <div className="inline-flex items-center gap-2 bg-gray-100 px-6 py-3 rounded-full text-gray-700">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <span className="font-semibold">국토교통부 인증 완료</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
