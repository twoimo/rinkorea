import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Building, Users, Target, Award, MapPin, Phone, Mail, Calendar, CheckCircle } from 'lucide-react';

const About = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-900 to-blue-700 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-6">회사소개</h1>
            <p className="text-xl max-w-2xl mx-auto">
              건설재료 제조 전문 기업 린코리아는 혁신적인 기술과 품질로 <br className="hidden sm:block" />
              건설업계의 새로운 기준을 제시합니다.
            </p>
          </div>
        </div>
      </section>

      {/* Company Introduction */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">린코리아 소개</h2>
            <p className="text-lg text-gray-600 leading-relaxed mb-8">
              린코리아는 건설재료와 건설기계 분야에서 혁신적인 솔루션을 제공하는 전문 기업으로 성장해왔습니다. <br />
              최고의 품질과 기술력으로 고객의 성공을 위한 최적의 파트너가 되겠습니다.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-8 rounded-2xl">
                <Target className="w-14 h-14 text-blue-600 mx-auto mb-6" />
                <h3 className="text-2xl font-bold text-gray-900 mb-4">비전</h3>
                <p className="text-gray-700 text-lg leading-relaxed">건설업계의 혁신을 <br />선도하는 글로벌 기업</p>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-8 rounded-2xl">
                <Award className="w-14 h-14 text-green-600 mx-auto mb-6" />
                <h3 className="text-2xl font-bold text-gray-900 mb-4">미션</h3>
                <p className="text-gray-700 text-lg leading-relaxed">최고의 품질과 기술로 <br />고객 가치 창출</p>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-8 rounded-2xl">
                <CheckCircle className="w-14 h-14 text-purple-600 mx-auto mb-6" />
                <h3 className="text-2xl font-bold text-gray-900 mb-4">핵심가치</h3>
                <p className="text-gray-700 text-lg leading-relaxed">신뢰, 혁신, 지속가능성</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Business Divisions */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">사업 영역</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              린코리아는 건설재료와 건설기계 두 가지 핵심 사업을 통해 <br />
              건설업계의 발전을 이끌어가고 있습니다.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="bg-white p-10 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-center mb-8">
                <div className="bg-blue-50 p-4 rounded-lg mr-6">
                  <Building className="w-12 h-12 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">건설재료사업부</h3>
                  <p className="text-blue-600 font-medium">핵심 사업 영역</p>
                </div>
              </div>
              <p className="text-gray-600 mb-6 leading-relaxed">
                콘크리트 표면마감 1액형 세라믹코팅제(불연재), 방열도료, 특수목적코팅제 등
                최고 품질의 제품을 생산하는 린코리아의 핵심 사업부입니다.
              </p>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
                  콘크리트 표면 강화제/코팅제(실러)
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
                  특수시멘트/구체방수제(방청)
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
                  탄성도막방수제/침투식 교면방수제
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
                  발수제/에폭시 등 전문 제조
                </li>
              </ul>
            </div>

            <div className="bg-white p-10 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-center mb-8">
                <div className="bg-green-50 p-4 rounded-lg mr-6">
                  <Users className="w-12 h-12 text-green-600" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">건설기계사업부</h3>
                  <p className="text-green-600 font-medium">Shanghai JS Floor Systems 공식 파트너</p>
                </div>
              </div>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Shanghai JS Floor Systems의 공식 파트너사로서 한국 공식 판매업체 및 서비스센터를 운영하고 있습니다.
                세계적인 공사 현장에서 사용되는 콘크리트 연삭기 및 연마기 시장의 선두주자입니다.
              </p>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-600 rounded-full mr-3"></span>
                  건설기계 장비 및 부품 공급
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-600 rounded-full mr-3"></span>
                  공식 서비스센터 운영 (A/S 지원)
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-600 rounded-full mr-3"></span>
                  기술 지원 및 컨설팅
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-600 rounded-full mr-3"></span>
                  합리적인 가격 정책 및 체계적 관리
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Information */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold text-gray-900 mb-12">오시는 길</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="flex flex-col items-center">
                <MapPin className="w-8 h-8 text-blue-600 mb-4" />
                <h3 className="text-lg font-semibold mb-2">주소</h3>
                <p className="text-gray-600">인천광역시 서구 백범로 707 (주안국가산업단지)</p>
              </div>
              <div className="flex flex-col items-center">
                <Phone className="w-8 h-8 text-blue-600 mb-4" />
                <h3 className="text-lg font-semibold mb-2">전화</h3>
                <p className="text-gray-600">032-571-1023</p>
              </div>
              <div className="flex flex-col items-center">
                <Mail className="w-8 h-8 text-blue-600 mb-4" />
                <h3 className="text-lg font-semibold mb-2">이메일</h3>
                <p className="text-gray-600">2019@rinkorea.com</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;
