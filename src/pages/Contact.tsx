import React from 'react';
import { MapPin, Phone, Mail } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { FastImage } from '@/components/ui/fast-image';
import { useLanguage } from '../contexts/LanguageContext';
import { SEOHead } from '@/components/seo/SEOHead';
import LocationMap from '@/components/ui/LocationMap';

const Contact = () => {
  const { t, language } = useLanguage();

  const seoData = {
    ko: {
      title: '연락처 | 린코리아 - 건설재료 전문업체 연락처 정보',
      description: '린코리아 연락처 정보입니다. 인천광역시 서구 백범로 707에 위치하며, 전화 032-571-1023으로 문의하실 수 있습니다. 세라믹 코팅 관련 문의 환영합니다.',
      keywords: '린코리아 연락처, 인천 건설재료, 세라믹 코팅 문의, 032-571-1023, 백범로 707'
    },
    en: {
      title: 'Contact Us | RIN Korea - Construction Materials Company Contact Information',
      description: 'Contact information for RIN Korea. Located at 707 Baekbeom-ro, Seo-gu, Incheon. Contact us at 032-571-1023 for ceramic coating inquiries.',
      keywords: 'RIN Korea contact, Incheon construction materials, ceramic coating inquiry, 032-571-1023, Baekbeom-ro 707'
    },
    zh: {
      title: '联系我们 | 林韩国 - 建筑材料公司联系信息',
      description: '林韩国联系信息。位于仁川广域市西区白凡路707号。有关陶瓷涂层咨询请致电032-571-1023。',
      keywords: '林韩国联系方式, 仁川建筑材料, 陶瓷涂层咨询, 032-571-1023, 白凡路707'
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title={seoData[language].title}
        description={seoData[language].description}
        keywords={seoData[language].keywords}
        url={`${window.location.origin}/contact`}
        type="website"
      />
      <Header />

      {/* Hero Section - 모바일 최적화 */}
      <section className="bg-gradient-to-r from-blue-900 to-blue-700 text-white py-12 md:py-20">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-3xl md:text-5xl font-bold mb-4 md:mb-6">{t('contact_hero_title')}</h1>
            <p className="text-base md:text-xl max-w-2xl mx-auto px-2" style={{ whiteSpace: 'pre-line' }}>
              {t('contact_hero_subtitle')}
            </p>
          </div>
        </div>
      </section>

      {/* Contact Info - 모바일 최적화 */}
      <section className="py-12 md:py-20">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 md:mb-8 text-center">{t('contact_company_info')}</h2>

          <div className="space-y-6 md:space-y-8">
            {/* 주소 */}
            <div className="bg-white border border-gray-200 rounded-xl p-4 md:p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start">
                <div className="bg-blue-100 p-3 rounded-lg mr-4 flex-shrink-0">
                  <MapPin className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-2">{t('contact_address_label')}</h3>
                  <p className="text-sm md:text-base text-gray-600 leading-relaxed" style={{ whiteSpace: 'pre-line' }}>
                    {t('contact_address_value')}
                  </p>
                </div>
              </div>
            </div>

            {/* 전화번호 */}
            <div className="bg-white border border-gray-200 rounded-xl p-4 md:p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start">
                <div className="bg-green-100 p-3 rounded-lg mr-4 flex-shrink-0">
                  <Phone className="w-5 h-5 md:w-6 md:h-6 text-green-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-2">{t('contact_phone_label')}</h3>
                  <a
                    href={`tel:${String(t('phone_number')).replace(/[^\d]/g, '')}`}
                    className="text-sm md:text-base text-blue-600 hover:text-blue-700 font-medium transition-colors"
                  >
                    {t('phone_number')}
                  </a>
                </div>
              </div>
            </div>

            {/* 이메일 */}
            <div className="bg-white border border-gray-200 rounded-xl p-4 md:p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start">
                <div className="bg-red-100 p-3 rounded-lg mr-4 flex-shrink-0">
                  <Mail className="w-5 h-5 md:w-6 md:h-6 text-red-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-2">{t('contact_email_label')}</h3>
                  <a
                    href="mailto:2019@rinkorea.com"
                    className="text-sm md:text-base text-blue-600 hover:text-blue-700 font-medium transition-colors break-all"
                  >
                    2019@rinkorea.com
                  </a>
                </div>
              </div>
            </div>

            {/* 위치 지도 */}
            <div className="bg-white border border-gray-200 rounded-xl p-4 md:p-6 shadow-sm">
              <div className="flex items-center mb-4">
                <div className="bg-indigo-100 p-3 rounded-lg mr-4 flex-shrink-0">
                  <MapPin className="w-5 h-5 md:w-6 md:h-6 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-base md:text-lg font-semibold text-gray-900">
                    {language === 'ko' ? '오시는 길' :
                      language === 'en' ? 'Location & Directions' :
                        '位置及交通路线'}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {language === 'ko' ? '지도에서 정확한 위치를 확인하세요' :
                      language === 'en' ? 'Check our exact location on the map' :
                        '在地图上查看我们的确切位置'}
                  </p>
                </div>
              </div>
              <LocationMap className="h-96" />
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  {language === 'ko' ? '💡 마커를 클릭하면 구글 지도에서 길찾기를 할 수 있습니다.' :
                    language === 'en' ? '💡 Click the marker to get directions on Google Maps.' :
                      '💡 点击标记可在谷歌地图中获取路线指引。'}
                </p>
              </div>
            </div>

            {/* 소셜 미디어 - 모바일 최적화 */}
            <div className="bg-white border border-gray-200 rounded-xl p-4 md:p-6 shadow-sm">
              <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-4">{t('contact_social_media')}</h3>
              <div className="grid grid-cols-3 gap-4 md:flex md:space-x-6">
                <a
                  href="https://www.instagram.com/rinkorea_kr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col md:flex-row items-center group p-3 rounded-lg hover:bg-gray-50 transition-colors"
                  aria-label="Instagram"
                >
                  <FastImage
                    src="/images/instagram-icon"
                    alt="Instagram"
                    className="h-8 w-8 md:h-6 md:w-6 mb-2 md:mb-0 md:mr-2"
                  />
                  <span className="text-xs md:text-sm text-gray-600 group-hover:text-gray-900 transition-colors">Instagram</span>
                </a>
                <a
                  href="https://blog.naver.com/rinkorea"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col md:flex-row items-center group p-3 rounded-lg hover:bg-gray-50 transition-colors"
                  aria-label="Naver Blog"
                >
                  <FastImage
                    src="/images/blog-logo-hq"
                    alt="Naver Blog"
                    className="h-8 w-8 md:h-6 md:w-6 mb-2 md:mb-0 md:mr-2"
                  />
                  <span className="text-xs md:text-sm text-gray-600 group-hover:text-gray-900 transition-colors">Blog</span>
                </a>
                <a
                  href="https://www.youtube.com/@rinkorea"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col md:flex-row items-center group p-3 rounded-lg hover:bg-gray-50 transition-colors"
                  aria-label="YouTube"
                >
                  <FastImage
                    src="/images/youtube-icon"
                    alt="YouTube"
                    className="h-8 w-8 md:h-6 md:w-6 mb-2 md:mb-0 md:mr-2"
                  />
                  <span className="text-xs md:text-sm text-gray-600 group-hover:text-gray-900 transition-colors">YouTube</span>
                </a>
              </div>
            </div>

            {/* 사업자 정보 */}
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 md:p-6">
              <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-4">{t('contact_business_info')}</h3>
              <div className="space-y-2 md:space-y-3 text-gray-600">
                <div className="flex flex-col md:flex-row">
                  <span className="font-medium text-gray-700 mb-1 md:mb-0 md:mr-2 text-sm md:text-base">{t('contact_company_name')}:</span>
                  <span className="text-sm md:text-base">{t('contact_company_name_value')}</span>
                </div>
                <div className="flex flex-col md:flex-row">
                  <span className="font-medium text-gray-700 mb-1 md:mb-0 md:mr-2 text-sm md:text-base">{t('contact_business_number')}:</span>
                  <span className="text-sm md:text-base">{t('contact_business_number_value')}</span>
                </div>
                <div className="flex flex-col md:flex-row">
                  <span className="font-medium text-gray-700 mb-1 md:mb-0 md:mr-2 text-sm md:text-base">{t('contact_ceo')}:</span>
                  <span className="text-sm md:text-base">{t('contact_ceo_value')}</span>
                </div>
              </div>
            </div>


            {/* 빠른 연락 버튼 - 모바일 전용 */}
            <div className="block md:hidden">
              <div className="grid grid-cols-2 gap-4">
                <a
                  href={`tel:${String(t('phone_number')).replace(/[^\d]/g, '')}`}
                  className="flex items-center justify-center bg-green-600 hover:bg-green-700 text-white px-4 py-4 rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  <Phone className="w-5 h-5 mr-2" />
                  {t('contact_call_button')}
                </a>
                <a
                  href="mailto:2019@rinkorea.com"
                  className="flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-4 rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  <Mail className="w-5 h-5 mr-2" />
                  {t('contact_email_button')}
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Contact;
