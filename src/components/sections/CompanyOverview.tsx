
import React from 'react';
import { Link } from 'react-router-dom';
import { Building2, Shield, Users, ArrowRight, MapPin, Phone, Mail } from 'lucide-react';

const CompanyOverview = () => {
  const stats = [
    { number: '2019', label: '설립년도', description: '건설업계 전문기업으로 시작' },
    { number: '100+', label: '프로젝트', description: '성공적인 프로젝트 수행' },
    { number: '3', label: '인증', description: '친환경 관련 인증 보유' },
    { number: '24/7', label: '지원', description: '언제나 준비된 고객 서비스' }
  ];

  const businessInfo = [
    {
      icon: <MapPin className="w-5 h-5" />,
      title: '본사 위치',
      content: '인천광역시 서구 백범로 707 (주안국가산업단지)',
      subContent: '천안 테크노파크 산업단지 입주예정 (2026~)'
    },
    {
      icon: <Phone className="w-5 h-5" />,
      title: '연락처',
      content: '032-571-1023',
      subContent: '평일 09:00 - 18:00'
    },
    {
      icon: <Mail className="w-5 h-5" />,
      title: '이메일',
      content: '2019@rinkorea.com',
      subContent: '24시간 문의 접수'
    }
  ];

  return (
    <section className="py-24 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center space-x-2 bg-blue-100 text-blue-700 rounded-full px-4 py-2 mb-6">
            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
            <span className="text-sm font-semibold">COMPANY OVERVIEW</span>
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            <span className="text-blue-600">린코리아</span>와 함께하는<br />
            더 나은 건설환경
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            2019년 설립 이후 건설재료와 건설기계 분야에서 축적된 전문성을 바탕으로<br />
            고객의 성공적인 프로젝트를 지원하고 있습니다.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
          {stats.map((stat, index) => (
            <div 
              key={index} 
              className="group text-center p-8 bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100"
            >
              <div className="text-4xl lg:text-5xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                {stat.number}
              </div>
              <div className="text-lg font-semibold text-gray-800 mb-2">{stat.label}</div>
              <div className="text-sm text-gray-600">{stat.description}</div>
            </div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
          {/* Left: Company Description */}
          <div className="space-y-8">
            <div>
              <h3 className="text-3xl font-bold text-gray-900 mb-6">
                건설업계의 <span className="text-red-600">혁신을 선도</span>하는<br />
                전문기업
              </h3>
              <p className="text-lg text-gray-600 leading-relaxed mb-6">
                린코리아는 건설재료사업부와 건설기계사업부를 통해 건설 프로젝트의 
                모든 단계에서 필요한 전문적인 솔루션을 제공합니다.
              </p>
              <p className="text-gray-600 leading-relaxed">
                친환경 고성능 콘크리트 보호제 RIN-COAT와 세계 최고 수준의 건설기계를 
                통해 고객의 성공적인 프로젝트 완수를 지원하며, 지속가능한 건설환경 
                구현을 위해 끊임없이 노력하고 있습니다.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-4 p-6 bg-gradient-to-r from-red-50 to-red-100 rounded-2xl border border-red-200">
                <div className="bg-gradient-to-br from-red-500 to-red-600 w-12 h-12 rounded-xl flex items-center justify-center">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-gray-900">친환경 건설재료</h4>
                  <p className="text-gray-600">RIN-COAT 콘크리트 보호제</p>
                </div>
              </div>

              <div className="flex items-center space-x-4 p-6 bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl border border-blue-200">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 w-12 h-12 rounded-xl flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-gray-900">첨단 건설기계</h4>
                  <p className="text-gray-600">JS FLOOR SYSTEMS 파트너</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/about"
                className="group inline-flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-4 rounded-full font-semibold transition-all duration-300 transform hover:scale-105"
              >
                <span>회사소개 자세히보기</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/contact"
                className="group inline-flex items-center justify-center space-x-2 border-2 border-gray-300 hover:border-gray-400 text-gray-700 hover:text-gray-900 px-8 py-4 rounded-full font-semibold transition-all duration-300"
              >
                <span>문의하기</span>
              </Link>
            </div>
          </div>

          {/* Right: Business Information */}
          <div className="bg-white rounded-3xl p-8 shadow-2xl border border-gray-100">
            <div className="mb-8">
              <h4 className="text-2xl font-bold text-gray-900 mb-2">사업자 정보</h4>
              <p className="text-gray-600">린코리아 주요 연락처 및 사업자 정보</p>
            </div>

            <div className="space-y-6 mb-8">
              {businessInfo.map((info, index) => (
                <div key={index} className="flex items-start space-x-4 p-4 hover:bg-gray-50 rounded-xl transition-colors">
                  <div className="bg-gradient-to-br from-gray-100 to-gray-200 w-10 h-10 rounded-lg flex items-center justify-center text-gray-600">
                    {info.icon}
                  </div>
                  <div>
                    <h5 className="font-semibold text-gray-900 mb-1">{info.title}</h5>
                    <p className="text-gray-800 font-medium">{info.content}</p>
                    <p className="text-sm text-gray-500">{info.subContent}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-6 border border-gray-200">
              <h5 className="font-semibold text-gray-900 mb-3 flex items-center">
                <Building2 className="w-5 h-5 mr-2 text-gray-600" />
                사업자 세부정보
              </h5>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">상호:</span>
                  <span className="text-gray-900 font-medium">린코리아</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">사업자등록번호:</span>
                  <span className="text-gray-900 font-medium">747-42-00526</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">대표:</span>
                  <span className="text-gray-900 font-medium">김정희</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-gradient-to-r from-blue-600 to-blue-700 rounded-3xl p-12 text-white">
          <h3 className="text-3xl font-bold mb-4">린코리아와 함께 시작하세요</h3>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            건설 프로젝트의 성공을 위한 전문적인 솔루션과 서비스를 경험해보세요.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/products"
              className="group bg-white text-blue-700 hover:bg-blue-50 px-8 py-4 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 inline-flex items-center justify-center space-x-2"
            >
              <span>제품 카탈로그 보기</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/contact"
              className="group border-2 border-white text-white hover:bg-white hover:text-blue-700 px-8 py-4 rounded-full font-semibold transition-all duration-300 inline-flex items-center justify-center space-x-2"
            >
              <span>상담 문의하기</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CompanyOverview;
