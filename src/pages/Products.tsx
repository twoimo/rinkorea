import React, { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ImageModal from '../components/ImageModal';
import { Shield, Palette, Star, Zap, Building2, Wrench, Youtube, FileText, Eye, Award } from 'lucide-react';
import { OptimizedImage } from '@/components/ui/image';

const Products = () => {
  const [selectedCategory, setSelectedCategory] = useState<'materials' | 'machinery'>('materials');
  const [modalImage, setModalImage] = useState<{isOpen: boolean, src: string, alt: string, title: string}>({
    isOpen: false,
    src: '',
    alt: '',
    title: ''
  });

  const openModal = (src: string, alt: string, title: string) => {
    setModalImage({ isOpen: true, src, alt, title });
  };

  const closeModal = () => {
    setModalImage({ isOpen: false, src: '', alt: '', title: '' });
  };

  const materials = [
    {
      name: "RIN-COAT",
      subtitle: "신소재 불연재 무기질 세라믹 코팅제 (1액형)",
      image: '/lovable-uploads/9365c776-c5da-4c08-84fd-965295599d20.png',
      detailImage: '/lovable-uploads/d93839c8-4ba0-4830-ac20-3507e982608a.png',
      marketingImage: '/lovable-uploads/74b74c16-ca85-4199-a1ea-39868e640e57.png',
      processImage: '/lovable-uploads/3a8b47a5-c515-4652-8b0c-c03fb9a06c40.png',
      icon: <Shield className="w-8 h-8 text-blue-600" />,
      description: "국토교통부 불연재 인증을 받은 친환경 1액형 세라믹 코팅제로, 우수한 불연성능과 내구성을 제공합니다.",
      features: [
        "불연재 인증 (특허 제 10-2312833호, 상표 제 40-1678504호)",
        "1액형으로 간편한 시공",
        "친환경 무기질 소재",
        "우수한 내구성과 내화성능",
        "다양한 바닥재 적용 가능"
      ],
      specifications: {
        "제품명": "RIN-COAT 세라믹 코팅제",
        "용량": "18kg",
        "적용면적": "약 30-40㎡ (1회 도포 기준)",
        "건조시간": "24시간",
        "보관방법": "서늘하고 건조한 곳"
      },
      certifications: ["국토교통부 불연재 인증", "KC 안전인증", "친환경 인증"]
    }
  ];

  const machinery = [
    {
      name: "950GT",
      subtitle: "Planetary Remote Control Floor Grinder",
      image: '/lovable-uploads/1952f9ba-da64-4acd-a2d9-68435e80c8f3.png',
      videoUrl: 'https://www.youtube.com/watch?v=ubJawtaailA',
      icon: <Building2 className="w-8 h-8 text-blue-600" />,
      description: "강력한 연마력을 통해 고품질 바닥 마감을 경험해보세요. 최신 서보 모터가 적용된 모델로 정밀한 제어가 가능한 모델입니다.",
      features: [
        "무선 리모콘 제어",
        "최신형 고속 기어박스 적용",
        "완벽한 보조휠 통해 편리한 구역 이동",
        "Best Seller 제품"
      ],
      specifications: {
        "Weight(KG)": "760 / 790",
        "Size(MM)": "2870*950*1350",
        "Motor(HP)": "30",
        "Voltage(V)": "380",
        "Current(Max)(A)": "47",
        "Disc speed(RPM)": "0-1800",
        "Inverter(HP)": "30",
        "Grinding disc qty": "360mm*4",
        "Grinding pad qty": "24",
        "Grinding width(MM)": "950",
        "Dust port": "2inches*1"
      }
    },
    {
      name: "850GT",
      subtitle: "Planetary Remote Control Floor Grinder",
      image: '/lovable-uploads/5240ceaa-87d8-403c-892e-976017a8b77e.png',
      videoUrl: 'https://www.youtube.com/watch?v=CtO1nh1gu04',
      icon: <Building2 className="w-8 h-8 text-green-600" />,
      description: "강력한 연마력을 통해 고품질 바닥 마감을 경험해보세요. 최신 서보 모터가 적용된 모델로 정밀한 제어가 가능한 모델입니다.",
      features: [
        "무선 리모콘 제어",
        "최신형 고속 기어박스 적용",
        "완벽한 보조휠 통해 편리한 구역 이동"
      ],
      specifications: {
        "Weight(KG)": "580 / 610",
        "Size(MM)": "2100*820*1100",
        "Motor(HP)": "25",
        "Voltage(V)": "380",
        "Current(Max)(A)": "37",
        "Disc speed(RPM)": "0-1800",
        "Inverter(HP)": "25",
        "Grinding disc qty": "320mm*4",
        "Grinding pad qty": "24",
        "Grinding width(MM)": "820",
        "Dust port": "2inches*1"
      }
    },
    {
      name: "Falcon",
      subtitle: "Floor Surface Treatment System Equipment",
      image: '/lovable-uploads/af78a9bb-6ad6-4e78-bc7a-8ad799467cf6.png',
      videoUrl: 'https://www.youtube.com/watch?v=UIg2SfTHnGw&t=2s',
      icon: <Wrench className="w-8 h-8 text-yellow-600" />,
      description: "승차식 대형 연마기로 넓은 면적의 바닥 작업에 최적화된 고성능 장비입니다.",
      features: [
        "승차식 대형 연마기",
        "넓은 면적 작업 최적화",
        "고성능 연마 시스템",
        "효율적인 작업 속도"
      ],
      specifications: {
        "Type": "승차식 연마기",
        "적용 면적": "대형 공간",
        "작업 효율": "고속 연마",
        "조작 방식": "승차식 조작"
      }
    }
  ];

  const categories = [
    { id: 'materials', name: '건설재료사업부', icon: <Shield className="w-5 h-5" /> },
    { id: 'machinery', name: '건설기계사업부', icon: <Building2 className="w-5 h-5" /> }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-900 to-blue-700 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-6">제품소개</h1>
            <p className="text-xl max-w-3xl mx-auto leading-relaxed">
              린코리아의 혁신적인 제품군을 만나보세요.<br />
              건설재료사업부와 건설기계사업부를 통해 종합적인 건설 솔루션을 제공합니다.
            </p>
          </div>
        </div>
      </section>

      {/* Category Navigation */}
      <section className="py-8 bg-gray-50 border-b">
        <div className="container mx-auto px-4">
          <div className="flex justify-center space-x-4">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id as 'materials' | 'machinery')}
                className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
                  selectedCategory === category.id
                    ? 'bg-red-600 text-white shadow-lg transform scale-105'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {category.icon}
                <span>{category.name}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          {selectedCategory === 'materials' && (
            <div className="space-y-16">
              <div className="text-center mb-12">
                <h2 className="text-4xl font-bold text-gray-900 mb-4">건설재료사업부</h2>
                <p className="text-xl text-gray-600">친환경 불연재 세라믹 코팅제</p>
              </div>

              {materials.map((product, index) => (
                <div key={index} className="bg-white rounded-2xl shadow-2xl overflow-hidden">
                  {/* Product Header */}
                  <div className="bg-gradient-to-r from-red-600 to-red-700 text-white p-8 shadow-lg">
                    <div className="flex items-center space-x-4 mb-6">
                      <div className="bg-white bg-opacity-20 rounded-full p-3">
                        {product.icon}
                      </div>
                      <div>
                        <h3 className="text-4xl font-black mb-2 tracking-tight drop-shadow-lg">{product.name}</h3>
                        <p className="text-red-50 text-lg font-semibold leading-relaxed drop-shadow-md">{product.subtitle}</p>
                      </div>
                    </div>
                    <p className="text-xl leading-relaxed font-medium text-white drop-shadow-md">{product.description}</p>
                  </div>

                  {/* Product Content */}
                  <div className="p-8">
                    {/* Main Product Images */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                      <div className="space-y-4">
                        <h4 className="text-xl font-bold text-gray-900 mb-4">제품 이미지</h4>
                        <div 
                          className="relative rounded-xl overflow-hidden shadow-lg cursor-pointer hover:shadow-xl transition-shadow"
                          onClick={() => openModal(product.image, product.name, '제품 이미지')}
                        >
                          <OptimizedImage
                            src={product.image}
                            alt={`${product.name} 제품`}
                            className="w-full h-80 object-cover"
                            loadingClassName="bg-gray-100"
                            errorClassName="bg-gray-100"
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                            <Eye className="w-8 h-8 text-white opacity-0 hover:opacity-100 transition-opacity" />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-6">
                        <h4 className="text-xl font-bold text-gray-900">주요 특징</h4>
                        <ul className="space-y-3">
                          {product.features.map((feature, featureIndex) => (
                            <li key={featureIndex} className="flex items-start space-x-3">
                              <div className="w-2 h-2 bg-red-600 rounded-full mt-2 flex-shrink-0"></div>
                              <span className="text-gray-700">{feature}</span>
                            </li>
                          ))}
                        </ul>

                        <div className="bg-gray-50 rounded-lg p-6 mt-6">
                          <h5 className="font-semibold text-gray-900 mb-3 flex items-center">
                            <Award className="w-5 h-5 mr-2 text-red-600" />
                            인증 현황
                          </h5>
                          <div className="space-y-2">
                            {product.certifications.map((cert, certIndex) => (
                              <div key={certIndex} className="flex items-center space-x-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <span className="text-sm text-gray-700">{cert}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Detailed Images Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                      <div className="space-y-2">
                        <h5 className="font-semibold text-gray-900">제품 상세정보</h5>
                        <div 
                          className="relative rounded-lg overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                          onClick={() => openModal(product.detailImage, product.name, '제품 상세정보')}
                        >
                          <OptimizedImage
                            src={product.detailImage}
                            alt={`${product.name} 상세정보`}
                            className="w-full h-48 object-cover"
                            loadingClassName="bg-gray-100"
                            errorClassName="bg-gray-100"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <h5 className="font-semibold text-gray-900">마케팅 자료</h5>
                        <div 
                          className="relative rounded-lg overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                          onClick={() => openModal(product.marketingImage, product.name, '마케팅 자료')}
                        >
                          <OptimizedImage
                            src={product.marketingImage}
                            alt={`${product.name} 마케팅 자료`}
                            className="w-full h-48 object-cover"
                            loadingClassName="bg-gray-100"
                            errorClassName="bg-gray-100"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <h5 className="font-semibold text-gray-900">시공 과정</h5>
                        <div 
                          className="relative rounded-lg overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                          onClick={() => openModal(product.processImage, product.name, '시공 과정')}
                        >
                          <OptimizedImage
                            src={product.processImage}
                            alt={`${product.name} 시공 과정`}
                            className="w-full h-48 object-cover"
                            loadingClassName="bg-gray-100"
                            errorClassName="bg-gray-100"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Specifications */}
                    <div className="bg-gray-50 rounded-xl p-8">
                      <h4 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                        <FileText className="w-6 h-6 mr-2 text-red-600" />
                        제품 사양
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {Object.entries(product.specifications).map(([key, value], specIndex) => (
                          <div key={specIndex} className="flex justify-between items-center py-3 border-b border-gray-200 last:border-b-0">
                            <span className="font-medium text-gray-700">{key}</span>
                            <span className="text-gray-900">{value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {selectedCategory === 'machinery' && (
            <div className="space-y-16">
              <div className="text-center mb-12">
                <h2 className="text-4xl font-bold text-gray-900 mb-4">건설기계사업부</h2>
                <p className="text-xl text-gray-600">JS FLOOR SYSTEMS 한국 공식 판매업체 & 서비스센터</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {machinery.map((machine, index) => (
                  <div key={index} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300">
                    {/* Machine Image */}
                    <div className="relative h-80 overflow-hidden">
                      <OptimizedImage
                        src={machine.image}
                        alt={machine.name}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        loadingClassName="bg-gray-100"
                        errorClassName="bg-gray-100"
                      />
                      <div className="absolute top-4 right-4 bg-white p-3 rounded-full shadow-lg">
                        {machine.icon}
                      </div>
                      {machine.name === '950GT' && (
                        <div className="absolute top-4 left-4">
                          <span className="bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-xs font-bold shadow">Best Seller</span>
                        </div>
                      )}
                    </div>

                    {/* Machine Content */}
                    <div className="p-6">
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">{machine.name}</h3>
                      <p className="text-sm text-blue-600 font-medium mb-3">{machine.subtitle}</p>
                      <p className="text-gray-600 mb-6 leading-relaxed">{machine.description}</p>

                      {/* Features */}
                      <div className="mb-6">
                        <h4 className="font-semibold text-gray-900 mb-3">주요 특징:</h4>
                        <ul className="space-y-2">
                          {machine.features.map((feature, featureIndex) => (
                            <li key={featureIndex} className="flex items-center text-gray-600 text-sm">
                              <div className="w-2 h-2 bg-blue-600 rounded-full mr-3 flex-shrink-0"></div>
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Specifications Preview */}
                      <div className="bg-gray-50 rounded-lg p-4 mb-6">
                        <h4 className="font-semibold text-gray-900 mb-3">주요 사양:</h4>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          {Object.entries(machine.specifications).slice(0, 4).map(([key, value], specIndex) => (
                            <div key={specIndex} className="flex justify-between">
                              <span className="text-gray-600">{key}:</span>
                              <span className="text-gray-900 font-medium">{value}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Action Button */}
                      {machine.videoUrl && (
                        <a
                          href={machine.videoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center space-x-2 hover:scale-105"
                        >
                          <Youtube className="w-5 h-5" />
                          <span>소개 영상 보기</span>
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Additional Info */}
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl p-8 text-center">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">JS FLOOR SYSTEMS 공식 파트너</h3>
                <p className="text-gray-700 mb-6 leading-relaxed">
                  린코리아는 JS FLOOR SYSTEMS의 한국 공식 판매업체이자 서비스센터로서,<br />
                  최고 품질의 바닥 연마 장비와 전문적인 기술 지원을 제공합니다.
                </p>
                <div className="flex justify-center space-x-8 text-sm text-gray-600">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span>공식 판매업체</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span>전문 서비스센터</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span>기술 지원</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Product Benefits */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">린코리아의 장점</h2>
            <p className="text-xl text-gray-600">
              {selectedCategory === 'materials' ? '세라믹 코팅제가 선택받는 이유' : '건설기계가 선택받는 이유'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {selectedCategory === 'materials' ? (
              <>
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
                  <h3 className="text-lg font-bold text-gray-900 mb-2">친환경 소재</h3>
                  <p className="text-gray-600">환경을 생각하는 친환경 무기질 소재</p>
                </div>
              </>
            ) : (
              <>
                <div className="text-center">
                  <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <Building2 className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">공식 파트너</h3>
                  <p className="text-gray-600">JS FLOOR SYSTEMS 한국 공식 판매업체</p>
                </div>
                <div className="text-center">
                  <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <Wrench className="w-8 h-8 text-yellow-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">전문 서비스</h3>
                  <p className="text-gray-600">전문적인 A/S 및 기술 지원 서비스</p>
                </div>
                <div className="text-center">
                  <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <Star className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">검증된 품질</h3>
                  <p className="text-gray-600">해외에서 검증된 고품질 장비</p>
                </div>
                <div className="text-center">
                  <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <Zap className="w-8 h-8 text-purple-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">효율적 작업</h3>
                  <p className="text-gray-600">뛰어난 성능으로 작업 효율성 극대화</p>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      <ImageModal
        isOpen={modalImage.isOpen}
        onClose={closeModal}
        imageSrc={modalImage.src}
        imageAlt={modalImage.alt}
        imageTitle={modalImage.title}
      />

      <Footer />
    </div>
  );
};

export default Products;
