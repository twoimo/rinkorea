import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { SEOHead } from '../components/seo/SEOHead';
import { Building, Users, Target, Award, MapPin, Phone, Mail, CheckCircle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const About = () => {
  const { t, language } = useLanguage();

  // SEO content by language
  const seoContent = {
    ko: {
      title: '회사소개 - 린코리아 | 건설재료 및 건설기계 전문기업',
      description: '린코리아는 친환경 불연재 세라믹 코팅제와 건설기계를 전문으로 하는 건설업계 전문기업입니다. 혁신적인 기술과 품질로 건설업계의 새로운 기준을 제시합니다.',
      keywords: '린코리아, 회사소개, 건설재료, 건설기계, 세라믹 코팅, 불연재, 건설업체, 인천 주안산업단지'
    },
    en: {
      title: 'About Us - RIN Korea | Construction Materials & Equipment Specialist',
      description: 'RIN Korea specializes in eco-friendly fire-resistant ceramic coatings and construction equipment. We set new standards in the construction industry with innovative technology and quality.',
      keywords: 'RIN Korea, about us, construction materials, construction equipment, ceramic coating, fire resistant, construction company, Incheon industrial park'
    },
    zh: {
      title: '公司介绍 - 林韩国 | 建筑材料与设备专家',
      description: '林韩国专业从事环保阻燃陶瓷涂层和建筑设备。我们以创新技术和质量为建筑行业树立新标准。',
      keywords: '林韩国, 公司介绍, 建筑材料, 建筑设备, 陶瓷涂层, 阻燃材料, 建筑公司, 仁川工业园区'
    }
  };

  const currentSEO = seoContent[language];

  return (
    <div className="min-h-screen bg-gray-50">
      <SEOHead
        title={currentSEO.title}
        description={currentSEO.description}
        keywords={currentSEO.keywords}
        type="website"
        image="/images/optimized/rin-korea-logo-black.webp"
      />

      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-900 to-blue-700 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-6">{t('about_hero_title')}</h1>
            <p className="text-xl max-w-2xl mx-auto">
              {t('about_hero_subtitle')}
            </p>
          </div>
        </div>
      </section>

      {/* Company Introduction */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">{t('about_intro_title')}</h2>
            <p className="text-lg text-gray-600 leading-relaxed mb-8">
              {t('about_intro_description')}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-8 rounded-2xl">
                <Target className="w-14 h-14 text-blue-600 mx-auto mb-6" />
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{t('about_vision')}</h3>
                <p className="text-gray-700 text-lg leading-relaxed">{t('about_vision_desc')}</p>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-8 rounded-2xl">
                <Award className="w-14 h-14 text-green-600 mx-auto mb-6" />
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{t('about_mission')}</h3>
                <p className="text-gray-700 text-lg leading-relaxed">{t('about_mission_desc')}</p>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-8 rounded-2xl">
                <CheckCircle className="w-14 h-14 text-purple-600 mx-auto mb-6" />
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{t('about_core_values')}</h3>
                <p className="text-gray-700 text-lg leading-relaxed">{t('about_core_values_desc')}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Business Divisions */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">{t('about_business_title')}</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {t('about_business_subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="bg-white p-10 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-center mb-8">
                <div className="bg-blue-50 p-4 rounded-lg mr-6">
                  <Building className="w-12 h-12 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">{t('about_materials_title')}</h3>
                  <p className="text-blue-600 font-medium">{t('about_materials_subtitle')}</p>
                </div>
              </div>
              <p className="text-gray-600 mb-6 leading-relaxed">
                {t('about_materials_desc')}
              </p>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
                  {t('about_materials_item1', '콘크리트 표면 강화제/코팅제(실러)')}
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
                  {t('about_materials_item2', '특수시멘트/구체방수제(방청)')}
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
                  {t('about_materials_item3', '탄성도막방수제/침투식 교면방수제')}
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
                  {t('about_materials_item4', '발수제/에폭시 등 전문 제조')}
                </li>
              </ul>
            </div>

            <div className="bg-white p-10 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-center mb-8">
                <div className="bg-green-50 p-4 rounded-lg mr-6">
                  <Users className="w-12 h-12 text-green-600" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">{t('about_equipment_title')}</h3>
                  <p className="text-green-600 font-medium">{t('about_equipment_subtitle')}</p>
                </div>
              </div>
              <p className="text-gray-600 mb-6 leading-relaxed">
                {t('about_equipment_desc')}
              </p>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-600 rounded-full mr-3"></span>
                  {t('about_equipment_item1', '건설기계 장비 및 부품 공급')}
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-600 rounded-full mr-3"></span>
                  {t('about_equipment_item2', '공식 서비스센터 운영 (A/S 지원)')}
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-600 rounded-full mr-3"></span>
                  {t('about_equipment_item3', '기술 지원 및 컨설팅')}
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-600 rounded-full mr-3"></span>
                  {t('about_equipment_item4', '합리적인 가격 정책 및 체계적 관리')}
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
            <h2 className="text-4xl font-bold text-gray-900 mb-12">{t('about_location_title')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="flex flex-col items-center">
                <MapPin className="w-8 h-8 text-blue-600 mb-4" />
                <h3 className="text-lg font-semibold mb-2">{t('about_address_label')}</h3>
                <p className="text-gray-600">{t('footer_address')}</p>
              </div>
              <div className="flex flex-col items-center">
                <Phone className="w-8 h-8 text-blue-600 mb-4" />
                <h3 className="text-lg font-semibold mb-2">{t('about_phone_label')}</h3>
                <p className="text-gray-600">{t('phone_number')}</p>
              </div>
              <div className="flex flex-col items-center">
                <Mail className="w-8 h-8 text-blue-600 mb-4" />
                <h3 className="text-lg font-semibold mb-2">{t('about_email_label')}</h3>
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