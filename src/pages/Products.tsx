
import React, { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ImageModal from '../components/ImageModal';
import { Shield, Palette, Star, Zap, Building2, Wrench, Youtube, FileText, Eye, Award, CheckCircle, Truck, Settings } from 'lucide-react';
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
        "불연재 인증 (국토교통부 고시 제2020-573호)",
        "특허 제 10-2312833호 등록",
        "상표 제 40-1678504호 등록",
        "1액형으로 간편한 시공 (별도 혼합 불필요)",
        "친환경 무기질 소재 (VOC FREE)",
        "우수한 내구성과 내화성능 (KS F 2271 기준 적합)",
        "다양한 바닥재 적용 가능 (콘크리트, 목재, 철재 등)",
        "방수 및 방습 효과",
        "미끄럼 방지 기능"
      ],
      technicalSpecs: [
        "건조막 두께: 0.3~0.5mm",
        "도포량: 0.5~0.7kg/㎡ (1회 도포 기준)", 
        "건조시간: 표면건조 2시간, 완전건조 24시간",
        "재도장 간격: 4시간 이상",
        "희석제: 물 (최대 5% 희석 가능)",
        "보관온도: 5~35℃",
        "점도: 100±10 KU (25℃)",
        "고형분: 60±2%"
      ],
      specifications: {
        "제품명": "RIN-COAT 세라믹 코팅제",
        "용량": "18kg (1포)",
        "색상": "투명, 회색, 갈색, 녹색",
        "적용면적": "약 25-35㎡ (1회 도포 기준)",
        "건조시간": "표면 2시간 / 완전 24시간",
        "보관방법": "서늘하고 건조한 곳 (직사광선 피함)",
        "유효기간": "제조일로부터 12개월",
        "시공온도": "5℃~35℃ (습도 85% 이하)"
      },
      certifications: [
        "국토교통부 불연재 인증 (KFI-4321)",
        "KC 안전인증 마크",
        "친환경 건축자재 인증",
        "ISO 9001 품질경영시스템",
        "KS F 2271 바닥재 품질기준 적합"
      ],
      applications: [
        "공공건물 바닥재 (학교, 병원, 관공서)",
        "상업시설 바닥재 (쇼핑몰, 사무실)",
        "산업시설 바닥재 (공장, 창고)",
        "주거시설 바닥재 (아파트, 주택)",
        "지하공간 바닥재 (지하주차장, 지하상가)"
      ]
    }
  ];

  const machinery = [
    {
      name: "950GT",
      subtitle: "Planetary Remote Control Floor Grinder",
      image: '/lovable-uploads/1952f9ba-da64-4acd-a2d9-68435e80c8f3.png',
      videoUrl: 'https://www.youtube.com/watch?v=ubJawtaailA',
      icon: <Building2 className="w-8 h-8 text-blue-600" />,
      description: "JS FLOOR SYSTEMS의 대표 모델로, 강력한 연마력과 정밀한 제어를 통해 고품질 바닥 마감을 제공합니다. 최신 서보 모터와 고속 기어박스가 적용된 프리미엄 모델입니다.",
      features: [
        "무선 리모콘 제어 시스템",
        "최신형 고속 기어박스 적용",
        "완벽한 보조휠을 통한 편리한 구역 이동",
        "Best Seller 제품",
        "4개의 360mm 연마 디스크",
        "24개 연마 패드 장착",
        "가변 속도 제어 (0-1800 RPM)",
        "강력한 30HP 모터",
        "효율적인 집진 시스템"
      ],
      specifications: {
        "모델명": "950GT",
        "무게": "760kg (기본) / 790kg (풀옵션)",
        "크기(L×W×H)": "2,870 × 950 × 1,350 mm",
        "모터 출력": "30HP (22.4kW)",
        "전압": "380V 3상",
        "최대 전류": "47A",
        "연마 디스크 속도": "0-1,800 RPM (가변)",
        "인버터": "30HP 벡터 인버터",
        "연마 디스크": "360mm × 4개",
        "연마 패드": "24개",
        "연마 폭": "950mm",
        "집진 포트": "2인치 × 1개",
        "이동 속도": "0-50m/min",
        "작업 효율": "950㎡/시간"
      },
      advantages: [
        "대형 연마 폭으로 작업 효율성 극대화",
        "정밀한 압력 제어로 균일한 마감",
        "리모콘 조작으로 안전한 작업 환경",
        "내구성 있는 부품으로 낮은 유지비용"
      ]
    },
    {
      name: "850GT",
      subtitle: "Planetary Remote Control Floor Grinder",
      image: '/lovable-uploads/5240ceaa-87d8-403c-892e-976017a8b77e.png',
      videoUrl: 'https://www.youtube.com/watch?v=CtO1nh1gu04',
      icon: <Building2 className="w-8 h-8 text-green-600" />,
      description: "중형 프로젝트에 최적화된 효율적인 연마 장비로, 뛰어난 기동성과 강력한 성능을 동시에 제공합니다.",
      features: [
        "무선 리모콘 제어",
        "최신형 고속 기어박스 적용",
        "완벽한 보조휠을 통한 편리한 구역 이동",
        "4개의 320mm 연마 디스크",
        "24개 연마 패드 장착",
        "25HP 고출력 모터",
        "컴팩트한 설계로 좁은 공간 작업 가능"
      ],
      specifications: {
        "모델명": "850GT",
        "무게": "580kg (기본) / 610kg (풀옵션)",
        "크기(L×W×H)": "2,100 × 820 × 1,100 mm",
        "모터 출력": "25HP (18.6kW)",
        "전압": "380V 3상",
        "최대 전류": "37A",
        "연마 디스크 속도": "0-1,800 RPM (가변)",
        "인버터": "25HP 벡터 인버터",
        "연마 디스크": "320mm × 4개",
        "연마 패드": "24개",
        "연마 폭": "820mm",
        "집진 포트": "2인치 × 1개",
        "이동 속도": "0-45m/min",
        "작업 효율": "820㎡/시간"
      },
      advantages: [
        "중형 프로젝트에 최적화된 크기",
        "우수한 기동성과 접근성",
        "효율적인 전력 소비",
        "다양한 현장 조건에 적응 가능"
      ]
    },
    {
      name: "Falcon",
      subtitle: "Floor Surface Treatment System Equipment",
      image: '/lovable-uploads/af78a9bb-6ad6-4e78-bc7a-8ad799467cf6.png',
      videoUrl: 'https://www.youtube.com/watch?v=UIg2SfTHnGw&t=2s',
      icon: <Wrench className="w-8 h-8 text-yellow-600" />,
      description: "대형 공간 전용 승차식 연마기로, 넓은 면적의 바닥 작업에 최적화된 고성능 장비입니다. 운전자의 피로도를 최소화하면서 최대의 작업 효율을 제공합니다.",
      features: [
        "승차식 대형 연마기",
        "넓은 면적 작업 최적화",
        "고성능 연마 시스템",
        "효율적인 작업 속도",
        "편안한 운전석과 조작 시스템",
        "강력한 집진 및 청소 기능",
        "다양한 연마 도구 호환"
      ],
      specifications: {
        "타입": "승차식 연마기",
        "적용 면적": "대형 공간 (창고, 공장, 쇼핑몰 등)",
        "작업 폭": "대형 연마 헤드",
        "조작 방식": "승차식 조작",
        "작업 효율": "고속 연마 (기존 대비 3-5배 빠름)",
        "연료": "전기 또는 하이브리드",
        "집진 시스템": "고성능 HEPA 필터",
        "소음 수준": "85dB 이하"
      },
      advantages: [
        "대형 공간 작업 시 최고의 효율성",
        "운전자 피로도 최소화",
        "일관된 마감 품질",
        "환경 친화적 작업"
      ]
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
                  <div className="bg-gradient-to-r from-red-600 to-red-700 text-white p-8">
                    <div className="flex items-center space-x-4 mb-4">
                      {product.icon}
                      <div>
                        <h3 className="text-3xl font-bold">{product.name}</h3>
                        <p className="text-red-100">{product.subtitle}</p>
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
                        <h4 className="text-xl font-bold text-gray-900">주요 특징</h4>
                        <ul className="space-y-3">
                          {product.features.map((feature, featureIndex) => (
                            <li key={featureIndex} className="flex items-start space-x-3">
                              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
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

                    {/* Technical Specifications */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                      <div className="bg-blue-50 rounded-xl p-6">
                        <h5 className="font-semibold text-gray-900 mb-4 flex items-center">
                          <Settings className="w-5 h-5 mr-2 text-blue-600" />
                          기술적 사양
                        </h5>
                        <div className="space-y-3">
                          {product.technicalSpecs.map((spec, specIndex) => (
                            <div key={specIndex} className="flex items-center space-x-2">
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              <span className="text-sm text-gray-700">{spec}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="bg-green-50 rounded-xl p-6">
                        <h5 className="font-semibold text-gray-900 mb-4 flex items-center">
                          <Truck className="w-5 h-5 mr-2 text-green-600" />
                          적용 분야
                        </h5>
                        <div className="space-y-3">
                          {product.applications.map((app, appIndex) => (
                            <div key={appIndex} className="flex items-center space-x-2">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <span className="text-sm text-gray-700">{app}</span>
                            </div>
                          ))}
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
                              <CheckCircle className="w-4 h-4 text-green-600 mr-2 flex-shrink-0" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Advantages */}
                      {machine.advantages && (
                        <div className="mb-6 bg-blue-50 rounded-lg p-4">
                          <h4 className="font-semibold text-gray-900 mb-3">핵심 장점:</h4>
                          <ul className="space-y-2">
                            {machine.advantages.map((advantage, advIndex) => (
                              <li key={advIndex} className="flex items-center text-gray-600 text-sm">
                                <Star className="w-4 h-4 text-blue-600 mr-2 flex-shrink-0" />
                                {advantage}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Specifications Preview */}
                      <div className="bg-gray-50 rounded-lg p-4 mb-6">
                        <h4 className="font-semibold text-gray-900 mb-3">주요 사양:</h4>
                        <div className="grid grid-cols-1 gap-2 text-sm">
                          {Object.entries(machine.specifications).slice(0, 6).map(([key, value], specIndex) => (
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
