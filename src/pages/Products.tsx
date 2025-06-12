
import React, { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ImageModal from '../components/ImageModal';
import { Shield, Palette, Star, Zap, Building2, Wrench, Youtube, FileText, Eye, Award, Droplets, TreePine, Truck, Settings, MapPin } from 'lucide-react';
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
      subtitle: "침투형 실란(Silane) 계열 콘크리트 보호용 특수 코팅제",
      slogan: "친환경 고성능 콘크리트 보호 솔루션",
      image: '/lovable-uploads/9365c776-c5da-4c08-84fd-965295599d20.png',
      detailImage: '/lovable-uploads/d93839c8-4ba0-4830-ac20-3507e982608a.png',
      marketingImage: '/lovable-uploads/74b74c16-ca85-4199-a1ea-39868e640e57.png',
      processImage: '/lovable-uploads/3a8b47a5-c515-4652-8b0c-c03fb9a06c40.png',
      icon: <Shield className="w-8 h-8 text-blue-600" />,
      description: "콘크리트 구조물의 성능 저하 및 노후화를 방지하는 침투형 실란(Silane) 계열 특수 코팅제입니다. 염소 이온 침투 억제를 통한 철근 부식 방지 및 구조물 내구성을 증진시킵니다.",
      protectionFeatures: [
        "염화물 침투 방지",
        "탄산화 억제",
        "동결융해 저항성",
        "화학적 침식 방지"
      ],
      features: [
        "우수한 침투력과 접착력",
        "무색 투명하여 외관을 해치지 않음",
        "염소 이온 침투 억제로 철근 부식 방지",
        "동결융해 및 화학적 침해 저항성 향상",
        "간편한 시공 및 유지보수 비용 절감",
        "친환경 인증 (녹색기술, GR, 환경표지)",
        "콘크리트 구조물 수명 연장"
      ],
      applications: [
        "교량 및 고가도로",
        "터널 구조물",
        "항만 및 해안 시설",
        "지하주차장",
        "아파트 외벽",
        "옥상 슬래브",
        "산업시설 바닥",
        "기타 콘크리트 구조물"
      ],
      testResults: [
        "염소이온 침투 저항성 시험 통과",
        "동결융해 저항성 시험 우수",
        "쇼어 경도 시험 합격",
        "부착강도 시험 우수",
        "내구성 시험 통과"
      ],
      specifications: {
        "제품 유형": "침투형 실란(Silane) 계열",
        "적용 방식": "무색 투명 코팅",
        "주요 기능": "방수, 내구성 강화, 염해·탄산화 방지",
        "환경 인증": "녹색기술, GR, 환경표지 인증",
        "적용 온도": "5°C ~ 35°C",
        "건조 시간": "24시간 (완전 경화)",
        "기대 효과": "구조물 수명 연장, 유지관리 비용 절감"
      },
      certifications: ["녹색기술 인증", "GR(Good Recycled) 인증", "환경표지 인증", "친환경 건설자재"]
    }
  ];

  const machinery = [
    {
      name: "950GT",
      subtitle: "스파이더 리프트 (Spider Lift) / 고소작업대",
      category: "크롤러형 고소작업대",
      image: '/lovable-uploads/1952f9ba-da64-4acd-a2d9-68435e80c8f3.png',
      videoUrl: 'https://www.youtube.com/watch?v=ubJawtaailA',
      icon: <Building2 className="w-8 h-8 text-blue-600" />,
      description: "컴팩트한 사이즈로 협소한 공간 진입이 용이하며, 자동 레벨링 기능으로 안전성을 확보한 고소작업대입니다. 좁은 공간 및 험지에서도 작업 가능한 강력한 성능을 제공합니다.",
      features: [
        "컴팩트한 사이즈로 협소한 공간 진입 용이",
        "자동 레벨링 기능으로 안전성 확보",
        "좁은 공간 및 험지 작업 가능",
        "크롤러(궤도) 방식으로 안정성 우수",
        "리모콘 조작 가능",
        "강력한 성능과 내구성"
      ],
      specifications: {
        "최대 작업 높이": "9.5m",
        "최대 작업 반경": "4.7m",
        "플랫폼 최대 적재 하중": "200kg",
        "장비 중량": "1,380kg",
        "구동 방식": "크롤러(궤도형)",
        "조작 방식": "리모콘 + 직접 조작",
        "적용 분야": "건물 유지보수, 외벽 작업, 나무 관리"
      },
      isBestSeller: true
    },
    {
      name: "850GT",
      subtitle: "스파이더 리프트 (Spider Lift) / 고소작업대",
      category: "크롤러형 고소작업대",
      image: '/lovable-uploads/5240ceaa-87d8-403c-892e-976017a8b77e.png',
      videoUrl: 'https://www.youtube.com/watch?v=CtO1nh1gu04',
      icon: <Building2 className="w-8 h-8 text-green-600" />,
      description: "950GT보다 약간 작은 모델로, 역시 좁은 공간에서의 작업에 특화되었습니다. 뛰어난 기동성과 안정성을 겸비한 중형 고소작업대입니다.",
      features: [
        "중형 사이즈로 다양한 현장 적용",
        "950GT 대비 경량화된 설계",
        "좁은 공간 작업 특화",
        "자동 레벨링 시스템",
        "크롤러 방식의 안정된 이동",
        "효율적인 연료 소비"
      ],
      specifications: {
        "최대 작업 높이": "8.5m",
        "최대 작업 반경": "4.7m",
        "플랫폼 최대 적재 하중": "200kg",
        "장비 중량": "1,280kg",
        "구동 방식": "크롤러(궤도형)",
        "조작 방식": "리모콘 + 직접 조작",
        "적용 분야": "중소형 건물 작업, 실내 작업"
      }
    },
    {
      name: "Falcon",
      subtitle: "스파이더 리프트 (Spider Lift) / 다목적 고소작업대",
      category: "소형 다목적 고소작업대",
      image: '/lovable-uploads/af78a9bb-6ad6-4e78-bc7a-8ad799467cf6.png',
      videoUrl: 'https://www.youtube.com/watch?v=UIg2SfTHnGw&t=2s',
      icon: <Wrench className="w-8 h-8 text-yellow-600" />,
      description: "좁고 복잡한 환경에서 높은 곳에 접근하여 작업하는데 특화된 소형 다목적 고소작업대입니다. 도시 환경과 소규모 건설현장에 최적화되어 빠른 작업 전환이 가능합니다.",
      features: [
        "소형 경량 설계로 이동성 우수",
        "복잡한 환경에서의 높은 접근성",
        "빠른 작업 전환 가능",
        "도시형 환경 및 소규모 현장 최적화",
        "다목적 활용 가능",
        "간편한 조작과 유지보수"
      ],
      specifications: {
        "Type": "소형 다목적 스파이더 리프트",
        "적용 환경": "도시형 환경, 소규모 현장, 실내",
        "작업 특성": "빠른 작업 전환, 고효율",
        "구동 방식": "크롤러 또는 바퀴형",
        "특화 분야": "건물 유지보수, 간판 작업, 조경"
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
                <p className="text-xl text-gray-600">콘크리트 구조물 보호 전문 솔루션</p>
              </div>

              {materials.map((product, index) => (
                <div key={index} className="bg-white rounded-2xl shadow-2xl overflow-hidden">
                  {/* Product Header */}
                  <div className="bg-gradient-to-r from-red-600 to-red-700 text-white p-8">
                    <div className="flex items-center space-x-4 mb-4">
                      {product.icon}
                      <div>
                        <h3 className="text-3xl font-bold">{product.name}</h3>
                        <p className="text-red-100 mb-2">{product.subtitle}</p>
                        <p className="text-lg font-medium text-yellow-200">{product.slogan}</p>
                      </div>
                    </div>
                    <p className="text-lg leading-relaxed">{product.description}</p>
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
                        <h4 className="text-xl font-bold text-gray-900">보호 기능</h4>
                        <div className="grid grid-cols-2 gap-4">
                          {product.protectionFeatures.map((feature, featureIndex) => (
                            <div key={featureIndex} className="bg-blue-50 rounded-lg p-4 text-center">
                              <Shield className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                              <span className="text-sm font-medium text-gray-800">{feature}</span>
                            </div>
                          ))}
                        </div>

                        <h4 className="text-xl font-bold text-gray-900 mt-6">주요 특징</h4>
                        <ul className="space-y-3">
                          {product.features.map((feature, featureIndex) => (
                            <li key={featureIndex} className="flex items-start space-x-3">
                              <div className="w-2 h-2 bg-red-600 rounded-full mt-2 flex-shrink-0"></div>
                              <span className="text-gray-700">{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Applications Section */}
                    <div className="mb-12">
                      <h4 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                        <MapPin className="w-6 h-6 mr-2 text-red-600" />
                        적용 분야
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {product.applications.map((application, appIndex) => (
                          <div key={appIndex} className="bg-blue-50 rounded-lg p-4 flex items-center space-x-3 hover:bg-blue-100 transition-colors">
                            <Building2 className="w-5 h-5 text-blue-600 flex-shrink-0" />
                            <span className="text-gray-800 font-medium text-sm">{application}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Test Results */}
                    <div className="mb-12">
                      <h4 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                        <Award className="w-6 h-6 mr-2 text-red-600" />
                        시험 성과
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {product.testResults.map((result, resultIndex) => (
                          <div key={resultIndex} className="bg-green-50 rounded-lg p-4 flex items-center space-x-3">
                            <div className="w-3 h-3 bg-green-500 rounded-full flex-shrink-0"></div>
                            <span className="text-gray-800 font-medium text-sm">{result}</span>
                          </div>
                        ))}
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

                    {/* Specifications and Certifications */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      <div className="bg-gray-50 rounded-xl p-8">
                        <h4 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                          <FileText className="w-6 h-6 mr-2 text-red-600" />
                          제품 사양
                        </h4>
                        <div className="space-y-4">
                          {Object.entries(product.specifications).map(([key, value], specIndex) => (
                            <div key={specIndex} className="flex justify-between items-center py-3 border-b border-gray-200 last:border-b-0">
                              <span className="font-medium text-gray-700">{key}</span>
                              <span className="text-gray-900">{value}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="bg-green-50 rounded-xl p-8">
                        <h4 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                          <Award className="w-6 h-6 mr-2 text-green-600" />
                          인증 현황
                        </h4>
                        <div className="space-y-4">
                          {product.certifications.map((cert, certIndex) => (
                            <div key={certIndex} className="flex items-center space-x-3 p-3 bg-white rounded-lg">
                              <div className="w-3 h-3 bg-green-500 rounded-full flex-shrink-0"></div>
                              <span className="text-gray-800 font-medium">{cert}</span>
                            </div>
                          ))}
                        </div>
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
                <p className="text-xl text-gray-600 mb-4">JS FLOOR SYSTEMS 한국 공식 판매업체 & 서비스센터</p>
                <div className="inline-block bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium">
                  "세상과 사람을 연결하는 기술" - JS 린코리아
                </div>
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
                      {machine.isBestSeller && (
                        <div className="absolute top-4 left-4">
                          <span className="bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-xs font-bold shadow">Best Seller</span>
                        </div>
                      )}
                      <div className="absolute bottom-4 left-4 bg-black bg-opacity-75 text-white px-3 py-1 rounded-full text-sm">
                        {machine.category}
                      </div>
                    </div>

                    {/* Machine Content */}
                    <div className="p-6">
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">{machine.name}</h3>
                      <p className="text-sm text-blue-600 font-medium mb-3">{machine.subtitle}</p>
                      <p className="text-gray-600 mb-6 leading-relaxed">{machine.description}</p>

                      {/* Features */}
                      <div className="mb-6">
                        <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                          <Settings className="w-4 h-4 mr-2" />
                          주요 특징
                        </h4>
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
                        <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                          <FileText className="w-4 h-4 mr-2" />
                          주요 사양
                        </h4>
                        <div className="space-y-2 text-sm">
                          {Object.entries(machine.specifications).slice(0, 4).map(([key, value], specIndex) => (
                            <div key={specIndex} className="flex justify-between items-center">
                              <span className="text-gray-600">{key}:</span>
                              <span className="text-gray-900 font-medium">{value}</span>
                            </div>
                          ))}
                          {Object.keys(machine.specifications).length > 4 && (
                            <div className="text-center pt-2 border-t border-gray-200">
                              <span className="text-xs text-gray-500">+ 더 많은 사양 정보</span>
                            </div>
                          )}
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
                  스파이더 리프트(Spider Lift) 고소작업대와 전문적인 기술 지원을 제공합니다.
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
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <span>A/S 서비스</span>
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
              {selectedCategory === 'materials' ? 'RIN-COAT가 선택받는 이유' : '스파이더 리프트가 선택받는 이유'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {selectedCategory === 'materials' ? (
              <>
                <div className="text-center">
                  <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <Shield className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">다중 보호 기능</h3>
                  <p className="text-gray-600">염해, 탄산화, 동결융해, 화학적 침식 종합 방지</p>
                </div>
                <div className="text-center">
                  <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <Droplets className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">투명 적용</h3>
                  <p className="text-gray-600">무색 투명하여 구조물 외관을 전혀 해치지 않음</p>
                </div>
                <div className="text-center">
                  <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <Star className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">우수한 침투력</h3>
                  <p className="text-gray-600">실란계 특수 성분으로 깊이 침투하여 지속적 보호</p>
                </div>
                <div className="text-center">
                  <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <TreePine className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">친환경 인증</h3>
                  <p className="text-gray-600">녹색기술, GR, 환경표지 등 다중 친환경 인증</p>
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
                  <h3 className="text-lg font-bold text-gray-900 mb-2">협소 공간 특화</h3>
                  <p className="text-gray-600">좁은 공간과 험지에서도 작업 가능한 스파이더 설계</p>
                </div>
                <div className="text-center">
                  <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <Star className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">안전성 보장</h3>
                  <p className="text-gray-600">자동 레벨링과 크롤러 방식으로 안정성 극대화</p>
                </div>
                <div className="text-center">
                  <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <Settings className="w-8 h-8 text-purple-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">리모콘 제어</h3>
                  <p className="text-gray-600">원격 조작으로 작업자 안전성과 편의성 제공</p>
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
