import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, FileText, Building2, ArrowRight, Phone } from 'lucide-react';
import { FastImage } from '@/components/ui/fast-image';
import { useLanguage } from '@/contexts/LanguageContext';

const CompanyOverview = () => {
  const { t } = useLanguage();

  // Image URL helper function (consistent with other components)
  const getImageUrl = (imagePath: string) => {
    if (imagePath.includes('://') || imagePath.startsWith('@')) return imagePath;
    return `/images/${imagePath}`;
  };

  // Get location text and create JSX separately
  const locationTextRaw = t('company_overview_location_value', '인천광역시 서구 백범로 707 (주안국가산업단지)\n천안 테크노파크 산업단지 입주예정 (2026~)');
  const locationText = typeof locationTextRaw === 'string' ? locationTextRaw : String(locationTextRaw);
  const locationElements = locationText.split('\n').map((line, index) => (
    <span key={index} className="block">
      {line}
    </span>
  ));

  const companyInfo = [
    {
      icon: <MapPin className="w-5 h-5 sm:w-6 sm:h-6" />,
      label: String(t('company_overview_location_label', '본사 위치')),
      value: locationElements,
      color: "text-blue-600"
    },
    {
      icon: <FileText className="w-5 h-5 sm:w-6 sm:h-6" />,
      label: String(t('company_overview_business_number_label', '사업자등록번호')),
      value: "747-42-00526",
      color: "text-green-600"
    },
    {
      icon: <Building2 className="w-5 h-5 sm:w-6 sm:h-6" />,
      label: String(t('company_overview_business_division_label', '사업부문')),
      value: String(t('company_overview_business_division_value', '건설재료사업부 / 건설기계사업부')),
      color: "text-orange-600"
    }
  ];

  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-white relative">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 right-10 w-24 h-24 sm:w-32 sm:h-32 bg-blue-100 rounded-full opacity-50" />
        <div className="absolute bottom-20 left-10 w-16 h-16 sm:w-24 sm:h-24 bg-red-100 rounded-full opacity-50" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 sm:gap-16 items-center max-w-7xl mx-auto">

          {/* Content */}
          <div className="order-2 lg:order-1">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 mb-4 sm:mb-6 leading-tight">
              {String(t('company_overview_title_reliable', '신뢰할 수 있는'))}
              <span className="text-red-600"> {String(t('company_overview_title_partner', '파트너'))}</span>
            </h2>

            <p className="text-base sm:text-lg text-gray-600 mb-6 sm:mb-8 leading-relaxed">
              {String(t('company_overview_description', '린코리아는 건설재료사업부와 2024년 신설된 건설기계사업부를 통해 종합적인 건설 솔루션을 제공합니다.'))}
            </p>

            {/* Company Info Cards */}
            <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
              {companyInfo.map((info, index) => (
                <div
                  key={index}
                  className="group bg-gray-50 hover:bg-white rounded-xl p-4 sm:p-5 transition-all duration-300 border border-gray-100 hover:border-gray-200 hover:shadow-lg touch-manipulation"
                >
                  <div className="flex items-start gap-3 sm:gap-4">
                    <div className={`${info.color} bg-white rounded-lg p-2 shadow-sm group-hover:scale-110 transition-transform`}>
                      {info.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs sm:text-sm font-semibold text-gray-500 mb-1">{info.label}</div>
                      <div className="text-sm sm:text-base text-gray-900 font-medium break-words">{info.value}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <Link
                to="/about"
                onClick={() => window.scrollTo(0, 0)}
                className="group bg-red-600 hover:bg-red-700 text-white px-6 py-4 sm:px-8 rounded-xl font-bold transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-red-500/25 hover:scale-105 touch-manipulation text-sm sm:text-base"
              >
                {String(t('company_overview_learn_more', '회사소개 자세히 보기'))}
                <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/contact"
                onClick={() => window.scrollTo(0, 0)}
                className="group bg-white hover:bg-gray-50 text-gray-900 border-2 border-gray-200 hover:border-gray-300 px-6 py-4 sm:px-8 rounded-xl font-bold transition-all duration-300 flex items-center justify-center hover:scale-105 touch-manipulation text-sm sm:text-base"
              >
                <Phone className="mr-2 w-4 h-4 sm:w-5 sm:h-5" />
                {String(t('company_overview_contact', '연락하기'))}
              </Link>
            </div>
          </div>

          {/* Image */}
          <div className="order-1 lg:order-2">
            <div className="relative">
              {/* Main Image Container */}
              <div className="relative rounded-2xl overflow-hidden shadow-2xl transform hover:scale-105 transition-transform duration-700">
                <FastImage
                  src={getImageUrl("company_intro")}
                  alt="린코리아 제품"
                  className="w-full h-auto object-contain"
                  priority={true}
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
