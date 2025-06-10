
import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Building, Users, Target, Award } from 'lucide-react';

const About = () => {
  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-900 to-blue-700 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-6">회사소개</h1>
            <p className="text-xl max-w-2xl mx-auto">
              세라믹 코팅 전문 기업 린코리아는 혁신적인 기술과 품질로 <br />
              건설업계의 새로운 기준을 제시합니다.
            </p>
          </div>
        </div>
      </section>

      {/* Company Info */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">린코리아 소개</h2>
              <p className="text-lg text-gray-600 mb-6">
                린코리아는 친환경 불연재(1액형) 신소재 세라믹 코팅제를 전문으로 하는
                건설재료 제조업체입니다. 최고 품질의 제품과 서비스로 고객의 신뢰를 얻고 있습니다.
              </p>
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-xl font-bold text-gray-900 mb-4">회사 정보</h3>
                <div className="space-y-3">
                  <div className="flex">
                    <span className="font-semibold text-gray-700 w-32">주소:</span>
                    <span className="text-gray-600">인천광역시 서구 백범로 707 (주안국가산업단지)</span>
                  </div>
                  <div className="flex">
                    <span className="font-semibold text-gray-700 w-32">사업자등록번호:</span>
                    <span className="text-gray-600">747-42-00526</span>
                  </div>
                  <div className="flex">
                    <span className="font-semibold text-gray-700 w-32">설립:</span>
                    <span className="text-gray-600">2021년</span>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <img
                src="https://images.unsplash.com/photo-1487958449943-2429e8be8625"
                alt="린코리아 사옥"
                className="rounded-lg shadow-lg w-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Business Divisions */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">사업부문</h2>
            <p className="text-xl text-gray-600">
              다양한 사업 영역을 통해 종합적인 건설 솔루션을 제공합니다
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-lg shadow-lg">
              <div className="flex items-center mb-6">
                <Building className="w-12 h-12 text-blue-600 mr-4" />
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">건설재료사업부</h3>
                  <p className="text-gray-600">핵심 사업 영역</p>
                </div>
              </div>
              <p className="text-gray-600 mb-4">
                세라믹 코팅제를 중심으로 한 건설재료 제조 및 공급을 담당하는
                린코리아의 핵심 사업부입니다.
              </p>
              <ul className="space-y-2 text-gray-600">
                <li>• RIN-COAT 시리즈 제품 개발 및 제조</li>
                <li>• 불연재 세라믹 코팅제 전문</li>
                <li>• 친환경 건설자재 솔루션</li>
              </ul>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-lg">
              <div className="flex items-center mb-6">
                <Users className="w-12 h-12 text-green-600 mr-4" />
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">건설기계사업부</h3>
                  <p className="text-gray-600">2024년 신설</p>
                </div>
              </div>
              <p className="text-gray-600 mb-4">
                2024년 신설된 사업부로, 건설기계 분야로의 사업 확장을 통해
                더욱 다양한 건설 솔루션을 제공합니다.
              </p>
              <ul className="space-y-2 text-gray-600">
                <li>• 건설기계 장비 공급</li>
                <li>• 기술 지원 서비스</li>
                <li>• 통합 건설 솔루션 제공</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="text-center">
              <Target className="w-16 h-16 text-blue-600 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-gray-900 mb-4">미션</h3>
              <p className="text-gray-600">
                친환경적이고 안전한 건설재료를 통해 더 나은 건설환경을 만들어가며,
                고객에게 최고의 품질과 서비스를 제공합니다.
              </p>
            </div>

            <div className="text-center">
              <Award className="w-16 h-16 text-green-600 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-gray-900 mb-4">비전</h3>
              <p className="text-gray-600">
                세라믹 코팅 분야의 선도기업으로서 지속적인 혁신과 기술 개발을 통해
                국내외 건설업계에서 신뢰받는 기업이 되겠습니다.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;
