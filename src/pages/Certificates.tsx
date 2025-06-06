
import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Award, FileText, Shield, CheckCircle } from 'lucide-react';

const Certificates = () => {
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

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-900 to-blue-700 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-6">시험성적서/인증</h1>
            <p className="text-xl max-w-2xl mx-auto">
              린코리아 제품의 우수한 품질과 안전성을 증명하는 
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

      {/* Certificate Images */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">인증서 및 특허</h2>
            <p className="text-xl text-gray-600">
              린코리아 제품의 품질을 보증하는 공식 문서들
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <img 
                src="https://rinkorea.com/wp-content/uploads/2022/04/1-메인-17-80x80.jpg" 
                alt="인증서" 
                className="w-full h-64 object-cover rounded-lg mb-4"
              />
              <h3 className="text-lg font-bold text-gray-900 mb-2">특허증</h3>
              <p className="text-gray-600">세라믹 코팅 기술 특허</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <div className="w-full h-64 bg-gray-100 rounded-lg mb-4 flex items-center justify-center">
                <FileText className="w-16 h-16 text-gray-400" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">시험성적서</h3>
              <p className="text-gray-600">불연재 시험 결과</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <div className="w-full h-64 bg-gray-100 rounded-lg mb-4 flex items-center justify-center">
                <Award className="w-16 h-16 text-gray-400" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">품질인증서</h3>
              <p className="text-gray-600">품질관리 시스템 인증</p>
            </div>
          </div>
        </div>
      </section>

      {/* Test Results Info */}
      <section className="py-20">
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

      <Footer />
    </div>
  );
};

export default Certificates;
