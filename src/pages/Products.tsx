import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Shield, Palette, Star, Zap } from 'lucide-react';

const Products = () => {
  const products = [
    {
      name: "RIN-COAT",
      image: '/images/main-18.jpg',
      icon: <Shield className="w-8 h-8 text-blue-600" />,
      description: "기본형 세라믹 코팅제로 우수한 불연성능과 내구성을 제공합니다.",
      features: ["불연재 인증", "우수한 내구성", "간편한 시공", "친환경 소재"]
    },
    {
      name: "RIN-COAT COLOR",
      image: '/images/main-8.jpg',
      icon: <Palette className="w-8 h-8 text-green-600" />,
      description: "다양한 색상을 적용할 수 있는 컬러형 세라믹 코팅제입니다.",
      features: ["다양한 색상", "미적 효과", "불연 성능", "장기 내구성"]
    },
    {
      name: "RIN-HARD PLUS",
      image: '/images/main-11.jpg',
      icon: <Star className="w-8 h-8 text-yellow-600" />,
      description: "강화된 성능의 프리미엄 세라믹 코팅제로 최고의 품질을 제공합니다.",
      features: ["프리미엄 품질", "향상된 강도", "특수 용도", "고성능 불연재"]
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-900 to-blue-700 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-6">제품소개</h1>
            <p className="text-xl max-w-2xl mx-auto">
              린코리아의 혁신적인 세라믹 코팅제 제품군을 만나보세요. <br />
              최고 품질의 불연재로 안전한 건설환경을 만들어갑니다.
            </p>
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {products.map((product, index) => (
              <div key={index} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform hover:scale-105"
                  />
                  <div className="absolute top-4 right-4 bg-white p-2 rounded-full">
                    {product.icon}
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">{product.name}</h3>
                  <p className="text-gray-600 mb-4">{product.description}</p>
                  <div className="space-y-2">
                    <h4 className="font-semibold text-gray-900">주요 특징:</h4>
                    <ul className="space-y-1">
                      {product.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-center text-gray-600">
                          <div className="w-2 h-2 bg-blue-600 rounded-full mr-2"></div>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Product Benefits */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">제품의 장점</h2>
            <p className="text-xl text-gray-600">
              린코리아 세라믹 코팅제가 선택받는 이유
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Shield className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">불연재 인증</h3>
              <p className="text-gray-600">국토교통부 불연재 인증을 받은 안전한 제품</p>
            </div>

            <div className="text-center">
              <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Zap className="w-8 h-8 text-yellow-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">간편한 시공</h3>
              <p className="text-gray-600">1액형으로 혼합 없이 간편하게 시공 가능</p>
            </div>

            <div className="text-center">
              <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Star className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">우수한 품질</h3>
              <p className="text-gray-600">엄격한 품질관리를 통한 일정한 품질 보장</p>
            </div>

            <div className="text-center">
              <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Palette className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">다양한 선택</h3>
              <p className="text-gray-600">용도와 요구사항에 맞는 다양한 제품군</p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Products;
