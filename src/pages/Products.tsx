import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Shield, Palette, Star, Zap, Leaf } from 'lucide-react';

const Products = () => {
  const products = [
    {
      name: "RIN-COAT",
      image: '/images/main-18.jpg',
      icon: <Shield className="w-8 h-8 text-blue-600" />,
      description: "세라믹계 고분자화합물을 주원료로 개발된 자연경화형 친환경 무기질코팅제입니다. 표면경도, 내마모성, 내화학성, 내열성, 내오염성 등의 물리적, 화학적 특성을 고루 갖춘 콘크리트 표면마감 일액형 세라믹코팅제입니다.",
      features: ["불연재 인증", "1액형 타입", "표면경도, 내마모성 강화", "친환경 마감 공법"]
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
    },
    {
      name: "RIN-COAT PRIMER",
      image: '/images/main-18.jpg',
      icon: <Shield className="w-8 h-8 text-purple-600" />,
      description: "콘크리트 표면의 전처리를 위한 프라이머 코팅제입니다.",
      features: ["표면 전처리", "접착력 강화", "내구성 향상", "시공성 개선"]
    },
    {
      name: "RIN-COAT SEALER",
      image: '/images/main-8.jpg',
      icon: <Shield className="w-8 h-8 text-red-600" />,
      description: "표면 보호와 광택을 위한 상도 실러 코팅제입니다.",
      features: ["표면 보호", "광택 효과", "내구성 강화", "유지관리 용이"]
    },
    {
      name: "RIN-COAT ANTI-STATIC",
      image: '/images/main-11.jpg',
      icon: <Zap className="w-8 h-8 text-blue-600" />,
      description: "정전기 방지 기능이 추가된 특수 목적 코팅제입니다.",
      features: ["정전기 방지", "전도성 확보", "안전성 강화", "특수 환경 적합"]
    },
    {
      name: "RIN-COAT WATERPROOF",
      image: '/images/main-18.jpg',
      icon: <Shield className="w-8 h-8 text-green-600" />,
      description: "방수 기능이 강화된 특수 코팅제입니다.",
      features: ["방수 성능", "내수성 강화", "구조물 보호", "장기 내구성"]
    },
    {
      name: "RIN-COAT HEAT-RESIST",
      image: '/images/main-8.jpg',
      icon: <Shield className="w-8 h-8 text-yellow-600" />,
      description: "고온 환경에 적합한 내열성 코팅제입니다.",
      features: ["내열성 강화", "온도 저항성", "열화 방지", "특수 환경용"]
    },
    {
      name: "RIN-COAT ECO-FRESH",
      image: '/images/main-11.jpg',
      icon: <Leaf className="w-8 h-8 text-green-600" />,
      description: "친환경 성능이 더욱 강화된 프리미엄 코팅제입니다.",
      features: ["친환경 인증", "무독성", "환경 친화적", "지속가능성"]
    },
    {
      name: "RIN-COAT QUICK-SET",
      image: '/images/main-18.jpg',
      icon: <Zap className="w-8 h-8 text-purple-600" />,
      description: "빠른 경화가 가능한 속경화형 코팅제입니다.",
      features: ["빠른 경화", "신속 시공", "조기 강도 발현", "공기 단축"]
    },
    {
      name: "RIN-COAT FLEX",
      image: '/images/main-8.jpg',
      icon: <Star className="w-8 h-8 text-blue-600" />,
      description: "유연성이 향상된 탄성 코팅제입니다.",
      features: ["고탄성", "크랙 저항성", "충격 흡수", "변형 대응"]
    },
    {
      name: "RIN-COAT ULTRA-HARD",
      image: '/images/main-11.jpg',
      icon: <Shield className="w-8 h-8 text-red-600" />,
      description: "초고강도 성능을 제공하는 특수 코팅제입니다.",
      features: ["초고강도", "내마모성 극대화", "중하중 적용", "산업용 특화"]
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

      {/* Product Benefits */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">린코리아 제품의 장점</h2>
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
              <p className="text-gray-600">안전한 순수 무기질 세라믹 코팅제</p>
            </div>

            <div className="text-center">
              <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Zap className="w-8 h-8 text-yellow-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">간편한 시공</h3>
              <p className="text-gray-600">1액형으로 간편하게 시공 가능</p>
            </div>

            <div className="text-center">
              <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Star className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">우수한 품질</h3>
              <p className="text-gray-600">엄격한 품질 관리를 통한 우수한 품질</p>
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

      <Footer />
    </div>
  );
};

export default Products;
