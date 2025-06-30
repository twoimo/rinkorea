import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import HeroSection from '@/components/sections/HeroSection';
import FeaturesSection from '@/components/sections/FeaturesSection';
import CompanyOverview from '@/components/sections/CompanyOverview';
import { SEOHead } from '@/components/seo/SEOHead';

const Index = () => {
  return (
    <div className="min-h-screen bg-white">
      <SEOHead />
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
