import React, { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ImageModal from '../components/ImageModal';
import { Award, FileText, Shield, CheckCircle } from 'lucide-react';

const Certificates = () => {
  const [selectedImage, setSelectedImage] = useState<{
    src: string;
    alt: string;
    title: string;
  } | null>(null);

  const certificates = [
    {
      title: "국토교통부 불연재 인증",
      type: "인증서",
      icon: <Shield className="w-8 h-8 text-blue-600" />,
      description: "국토교통부에서 발급한 공식 불연재 인증서로 제품의 안전성을 보증합니다."
    },
    {
      title: "품질시험성적서",
      type: "시험성적서",
      icon: <FileText className="w-8 h-8 text-green-600" />,
      description: "공인시험기관에서 실시한 각종 품질 시험 결과를 확인할 수 있습니다."
    },
    {
      title: "특허 등록증",
      type: "특허",
      icon: <Award className="w-8 h-8 text-yellow-600" />,
      description: "세라믹 코팅 기술에 대한 특허 등록으로 기술력을 인정받았습니다."
    },
    {
      title: "환경친화성 인증",
      type: "환경인증",
      icon: <CheckCircle className="w-8 h-8 text-purple-600" />,
      description: "친환경 제품으로서의 품질과 안전성을 공식적으로 인정받았습니다."
    }
  ];

  const patentImages = [
    {
      title: "특허등록증",
      src: "/images/scan-0025.jpg",
      alt: "린코리아 특허등록증"
    },
    {
      title: "상표등록증",
      src: "/images/rin-coat.jpg",
      alt: "RIN-COAT 상표등록증"
    },
    {
      title: "유통표준코드 회원증",
      src: "/images/scan-0024.jpg",
      alt: "유통표준코드 회원증"
    }
  ];

  const testReportImages = [
    {
      title: "시험성적서 1페이지",
      src: "/images/rin-coat-test-report-page-01.jpg",
      alt: "린코리아 RIN-COAT 시험성적서 1페이지"
    },
    {
      title: "시험성적서 2페이지",
      src: "/images/rin-coat-test-report-page-02.jpg",
      alt: "린코리아 RIN-COAT 시험성적서 2페이지"
    },
    {
      title: "시험성적서 3페이지",
      src: "/images/rin-coat-test-report-page-03.jpg",
      alt: "린코리아 RIN-COAT 시험성적서 3페이지"
    },
    {
      title: "시험성적서 4페이지",
      src: "/images/rin-coat-test-report-page-04.jpg",
      alt: "린코리아 RIN-COAT 시험성적서 4페이지"
    },
    {
      title: "시험성적서 5페이지",
      src: "/images/rin-coat-test-report-page-05.jpg",
      alt: "린코리아 RIN-COAT 시험성적서 5페이지"
    },
    {
      title: "시험성적서 6페이지",
      src: "/images/rin-coat-test-report-page-06.jpg",
      alt: "린코리아 RIN-COAT 시험성적서 6페이지"
    },
    {
      title: "시험성적서 7페이지",
      src: "/images/rin-coat-test-report-page-07.jpg",
      alt: "린코리아 RIN-COAT 시험성적서 7페이지"
    },
    {
      title: "시험성적서 8페이지",
      src: "/images/rin-coat-test-report-page-08.jpg",
      alt: "린코리아 RIN-COAT 시험성적서 8페이지"
    },
    {
      title: "시험성적서 9페이지",
      src: "/images/rin-coat-test-report-page-09.jpg",
      alt: "린코리아 RIN-COAT 시험성적서 9페이지"
    },
    {
      title: "시험성적서 10페이지",
      src: "/images/rin-coat-test-report-page-10.jpg",
      alt: "린코리아 RIN-COAT 시험성적서 10페이지"
    }
  ];

  const handleImageClick = (src: string, alt: string, title: string) => {
    setSelectedImage({ src, alt, title });
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-900 to-blue-700 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-6">시험성적서/인증</h1>
            <p className="text-xl max-w-2xl mx-auto">
              린코리아 제품의 우수한 품질과 안전성을 증명하는 <br />
              각종 인증서와 시험성적서를 확인하세요.
            </p>
          </div>
        </div>
      </section>

      {/* Certificates Grid */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            {certificates.map((cert, index) => (
              <div key={index} className="bg-white p-8 rounded-lg shadow-lg border hover:shadow-xl transition-shadow">
                <div className="flex items-center mb-6">
                  <div className="bg-gray-50 p-3 rounded-full mr-4">
                    {cert.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{cert.title}</h3>
                    <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">{cert.type}</span>
                  </div>
                </div>
                <p className="text-gray-600">{cert.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Patents and Trademarks */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">특허 및 상표 등록증</h2>
            <p className="text-xl text-gray-600">
              린코리아의 기술력과 브랜드를 보증하는 공식 문서들
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {patentImages.map((image, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
                <div
                  className="cursor-pointer"
                  onClick={() => handleImageClick(image.src, image.alt, image.title)}
                >
                  <img
                    src={image.src}
                    alt={image.alt}
                    className="w-full h-80 object-contain rounded-lg mb-4 border hover:border-blue-300 transition-colors"
                  />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2 text-center">{image.title}</h3>
                <p className="text-sm text-gray-500 text-center">클릭하여 확대보기</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Test Reports */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">RIN-COAT 시험성적서</h2>
            <p className="text-xl text-gray-600">
              공인시험기관에서 실시한 품질 시험 결과 전체 문서
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {testReportImages.map((image, index) => (
              <div key={index} className="bg-white p-4 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
                <div
                  className="cursor-pointer"
                  onClick={() => handleImageClick(image.src, image.alt, image.title)}
                >
                  <img
                    src={image.src}
                    alt={image.alt}
                    className="w-full h-96 object-contain rounded-lg mb-4 border hover:border-blue-300 transition-colors"
                  />
                </div>
                <h3 className="text-base font-bold text-gray-900 text-center mb-1">{image.title}</h3>
                <p className="text-xs text-gray-500 text-center">클릭하여 확대보기</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Test Results Info */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="bg-blue-50 p-8 rounded-lg">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">시험성적서 상세 정보</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">불연재 시험</h3>
                <ul className="space-y-2 text-gray-600">
                  <li>• 시험기관: 한국건설생활환경시험연구원</li>
                  <li>• 시험방법: KS F 2271</li>
                  <li>• 등급: 불연재료 1급</li>
                  <li>• 유효기간: 2027년까지</li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">환경성 시험</h3>
                <ul className="space-y-2 text-gray-600">
                  <li>• 시험기관: 한국환경공단</li>
                  <li>• VOC 방출량: 기준치 이하</li>
                  <li>• 중금속 함량: 검출되지 않음</li>
                  <li>• 친환경 인증 취득</li>
                </ul>
              </div>
            </div>
            <div className="text-center mt-8">
              <a
                href="https://rinkorea.com/시험성적서/"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
              >
                시험성적서 상세보기
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Image Modal */}
      <ImageModal
        isOpen={selectedImage !== null}
        onClose={() => setSelectedImage(null)}
        imageSrc={selectedImage?.src || ''}
        imageAlt={selectedImage?.alt || ''}
        imageTitle={selectedImage?.title || ''}
      />

      <Footer />
    </div>
  );
};

export default Certificates;
