
import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import HeroSection from '@/components/sections/HeroSection';
import FeaturesSection from '@/components/sections/FeaturesSection';
import CompanyOverview from '@/components/sections/CompanyOverview';
import SEOHead from '@/components/seo/SEOHead';
import { useLanguage } from '@/contexts/LanguageContext';

const Index = () => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-white">
      <SEOHead
        title={t('hero_title_line1') + ' ' + t('hero_title_line2')}
        description={t('about_intro_description')}
        keywords={[
          t('feature_fire_resistant_title'),
          t('feature_eco_friendly_title'),
          t('feature_quality_title'),
          'ceramic coating',
          'construction materials',
          'RIN Korea'
        ]}
        type="website"
        image="/images/site-icon-512.png"
      />
      <Header />
      <main>
        <HeroSection />
        <FeaturesSection />
        <CompanyOverview />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
