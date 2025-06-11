
import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { HeroSection } from '../components/sections/HeroSection';
import { FeaturesSection } from '../components/sections/FeaturesSection';
import { CompanyOverview } from '../components/sections/CompanyOverview';

const Index = () => {
  return (
    <div className="min-h-screen bg-white overflow-hidden">
      <Header />
      <HeroSection />
      <FeaturesSection />
      <CompanyOverview />
      <Footer />
    </div>
  );
};

export default Index;
