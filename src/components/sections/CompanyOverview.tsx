
import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, FileText, Building2, ArrowRight, Phone } from 'lucide-react';
import { OptimizedImage } from '@/components/ui/image';

const CompanyOverview = () => {
  const companyInfo = [
    {
      icon: <MapPin className="w-6 h-6" />,
      label: "본사 위치",
      value: <>
        인천광역시 서구 백범로 707 (주안국가산업단지)<br />
        천안 테크노파크 산업단지 입주예정 (2026~)
      </>,
      color: "text-blue-600"
    },
    {
      icon: <FileText className="w-6 h-6" />,
      label: "사업자등록번호",
      value: "747-42-00526",
      color: "text-green-600"
    },
    {
      icon: <Building2 className="w-6 h-6" />,
      label: "사업부문",
      value: "건설재료사업부 / 건설기계사업부",
      color: "text-orange-600"
    }
  ];

  return (
    <section className="min-h-screen flex items-center justify-center bg-white relative py-20">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 right-10 w-32 h-32 bg-blue-100 rounded-full opacity-50" />
        <div className="absolute bottom-20 left-10 w-24 h-24 bg-red-100 rounded-full opacity-50" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          {/* Content */}
          <div className="order-2 lg:order-1">
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-gray-900 mb-6 leading-tight">
              신뢰할 수 있는
              <span className="text-red-600"> 파트너</span>
            </h2>

            <p className="text-lg sm:text-xl text-gray-600 mb-8 leading-relaxed">
              린코리아는 건설재료사업부와 2024년 신설된 건설기계사업부를 통해
              종합적인 건설 솔루션을 제공합니다.
            </p>

            {/* Company Info Cards */}
            <div className="space-y-4 mb-8">
              {companyInfo.map((info, index) => (
                <div
                  key={index}
                  className="group bg-gray-50 hover:bg-white rounded-xl p-6 transition-all duration-300 border border-gray-100 hover:border-gray-200 hover:shadow-lg"
                >
                  <div className="flex items-start gap-4">
                    <div className={`${info.color} bg-white rounded-lg p-2 shadow-sm group-hover:scale-110 transition-transform`}>
                      {info.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-gray-500 mb-1">{info.label}</div>
                      <div className="text-base text-gray-900 font-medium break-words">{info.value}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/about"
                onClick={() => window.scrollTo(0, 0)}
                className="group bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-xl font-bold transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-red-500/25 hover:scale-105"
              >
                회사소개 자세히 보기
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/contact"
                onClick={() => window.scrollTo(0, 0)}
                className="group bg-white hover:bg-gray-50 text-gray-900 border-2 border-gray-200 hover:border-gray-300 px-8 py-4 rounded-xl font-bold transition-all duration-300 flex items-center justify-center hover:scale-105"
              >
                <Phone className="mr-2 w-5 h-5" />
                연락하기
              </Link>
            </div>
          </div>

          {/* Image */}
          <div className="order-1 lg:order-2">
            <div className="relative">
              {/* Main Image Container */}
              <div className="relative rounded-2xl overflow-hidden shadow-2xl transform hover:scale-105 transition-transform duration-700">
                <OptimizedImage
                  src="/images/company_intro.jpg"
                  alt="린코리아 제품"
                  className="w-full h-auto object-contain"
                  loadingClassName="bg-gray-100"
                  errorClassName="bg-gray-100"
                />

                {/* Overlay Content */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CompanyOverview;
