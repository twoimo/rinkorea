import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CompanyOverview from '@/components/sections/CompanyOverviewFixed';
import { useLanguage } from '@/contexts/LanguageContext';
import { SEOHead } from '@/components/seo/SEOHead';

const About = () => {
  const { t, language } = useLanguage();

  const seoData = {
    ko: {
      title: '회사소개 | 린코리아 - 건설재료 전문기업',
      description: '린코리아는 건설재료와 건설기계 분야에서 혁신적인 솔루션을 제공하는 전문기업입니다. 최고의 품질과 기술력으로 고객의 성공을 위한 최적의 파트너가 되겠습니다.',
      keywords: '린코리아 회사소개, 건설재료 제조, 건설기계, 세라믹 코팅, 기업정보'
    },
    en: {
      title: 'About Us | RIN Korea - Construction Materials Specialist',
      description: 'RIN Korea is a specialized company providing innovative solutions in construction materials and construction machinery. We strive to be the optimal partner for customer success with the highest quality and technology.',
      keywords: 'RIN Korea about, construction materials manufacturer, construction machinery, ceramic coating, company information'
    },
    zh: {
      title: '公司介绍 | 林韩国 - 建筑材料专家',
      description: '林韩国是在建筑材料和建筑机械领域提供创新解决方案的专业公司。我们以最高的质量和技术成为客户成功的最佳合作伙伴。',
      keywords: '林韩国公司介绍, 建筑材料制造, 建筑机械, 陶瓷涂层, 企业信息'
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <SEOHead
        title={seoData[language].title}
        description={seoData[language].description}
        keywords={seoData[language].keywords}
        url={`${window.location.origin}/about`}
      />
      <Header />
      <main className="pt-20">
        <section className="py-16 bg-gradient-to-b from-blue-50 to-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                {t('about_hero_title')}
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                {t('about_hero_subtitle')}
              </p>
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                  {t('about_intro_title')}
                </h2>
                <p className="text-gray-600 text-lg leading-relaxed mb-8">
                  {t('about_intro_description')}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-4">
                    <h3 className="font-bold text-blue-600 mb-2">{t('about_vision')}</h3>
                    <p className="text-sm text-gray-600">{t('about_vision_desc')}</p>
                  </div>
                  <div className="text-center p-4">
                    <h3 className="font-bold text-blue-600 mb-2">{t('about_mission')}</h3>
                    <p className="text-sm text-gray-600">{t('about_mission_desc')}</p>
                  </div>
                  <div className="text-center p-4">
                    <h3 className="font-bold text-blue-600 mb-2">{t('about_core_values')}</h3>
                    <p className="text-sm text-gray-600">{t('about_core_values_desc')}</p>
                  </div>
                </div>
              </div>

              <div className="relative">
                <img
                  src="/images/optimized/homepage-main.webp"
                  alt="린코리아 회사 전경"
                  className="w-full h-96 object-cover rounded-lg shadow-lg"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                {t('about_business_title')}
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                {t('about_business_subtitle')}
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white rounded-lg shadow-lg p-8">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                    <span className="text-blue-600 font-bold text-xl">🏗️</span>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">{t('about_materials_title')}</h3>
                    <p className="text-blue-600 font-medium">{t('about_materials_subtitle')}</p>
                  </div>
                </div>
                <p className="text-gray-600 mb-6">{t('about_materials_desc')}</p>
                <ul className="space-y-2">
                  <li className="flex items-center text-gray-600">
                    <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
                    {t('about_materials_item1')}
                  </li>
                  <li className="flex items-center text-gray-600">
                    <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
                    {t('about_materials_item2')}
                  </li>
                  <li className="flex items-center text-gray-600">
                    <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
                    {t('about_materials_item3')}
                  </li>
                  <li className="flex items-center text-gray-600">
                    <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
                    {t('about_materials_item4')}
                  </li>
                </ul>
              </div>

              <div className="bg-white rounded-lg shadow-lg p-8">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                    <span className="text-green-600 font-bold text-xl">🏭</span>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">{t('about_equipment_title')}</h3>
                    <p className="text-green-600 font-medium">{t('about_equipment_subtitle')}</p>
                  </div>
                </div>
                <p className="text-gray-600 mb-6">{t('about_equipment_desc')}</p>
                <ul className="space-y-2">
                  <li className="flex items-center text-gray-600">
                    <span className="w-2 h-2 bg-green-600 rounded-full mr-3"></span>
                    {t('about_equipment_item1')}
                  </li>
                  <li className="flex items-center text-gray-600">
                    <span className="w-2 h-2 bg-green-600 rounded-full mr-3"></span>
                    {t('about_equipment_item2')}
                  </li>
                  <li className="flex items-center text-gray-600">
                    <span className="w-2 h-2 bg-green-600 rounded-full mr-3"></span>
                    {t('about_equipment_item3')}
                  </li>
                  <li className="flex items-center text-gray-600">
                    <span className="w-2 h-2 bg-green-600 rounded-full mr-3"></span>
                    {t('about_equipment_item4')}
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                {t('about_location_title')}
              </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div className="space-y-8">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">{t('about_address_label')}</h3>
                  <p className="text-gray-600 whitespace-pre-line">{t('about_address_value')}</p>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">{t('about_phone_label')}</h3>
                  <p className="text-gray-600">{t('phone_number')}</p>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">{t('about_email_label')}</h3>
                  <p className="text-gray-600">info@rinkorea.com</p>
                </div>
              </div>

              <div className="bg-gray-100 rounded-lg h-96 flex items-center justify-center">
                <p className="text-gray-500">지도가 여기에 표시됩니다</p>
              </div>
            </div>
          </div>
        </section>

        <CompanyOverview />
      </main>
      <Footer />
    </div>
  );
};

export default About;
