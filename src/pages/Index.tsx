
import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import HeroSection from '../components/sections/HeroSection';
import FeaturesSection from '../components/sections/FeaturesSection';
import CompanyOverview from '../components/sections/CompanyOverview';
import { ChevronDown } from 'lucide-react';

const Index = () => {
  const [currentSection, setCurrentSection] = useState(0);
  const sections = ['hero', 'features', 'company'];

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const windowHeight = window.innerHeight;
      const sectionIndex = Math.round(scrollPosition / windowHeight);
      setCurrentSection(Math.min(sectionIndex, sections.length - 1));
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (index: number) => {
    const targetY = index * window.innerHeight;
    window.scrollTo({
      top: targetY,
      behavior: 'smooth'
    });
  };

  return (
    <div className="relative">
      <Header />
      
      {/* Navigation Dots */}
      <div className="fixed right-6 top-1/2 transform -translate-y-1/2 z-40 space-y-3">
        {sections.map((_, index) => (
          <button
            key={index}
            onClick={() => scrollToSection(index)}
            className={`w-3 h-3 rounded-full border-2 transition-all duration-300 ${
              currentSection === index
                ? 'bg-white border-white scale-125'
                : 'bg-transparent border-white/50 hover:border-white'
            }`}
            aria-label={`섹션 ${index + 1}로 이동`}
          />
        ))}
      </div>

      {/* Scroll Down Indicator */}
      {currentSection < sections.length - 1 && (
        <button
          onClick={() => scrollToSection(currentSection + 1)}
          className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-40 text-white animate-bounce hover:scale-110 transition-transform"
          aria-label="다음 섹션으로 스크롤"
        >
          <ChevronDown className="w-8 h-8" />
        </button>
      )}

      {/* Hero Section */}
      <section className="h-screen relative snap-start">
        <HeroSection />
      </section>

      {/* Features Section */}
      <section className="h-screen relative snap-start flex items-center">
        <div className="w-full">
          <FeaturesSection />
        </div>
      </section>

      {/* Company Overview Section */}
      <section className="h-screen relative snap-start flex items-center">
        <div className="w-full">
          <CompanyOverview />
        </div>
      </section>

      {/* Footer */}
      <footer className="relative">
        <Footer />
      </footer>
    </div>
  );
};

export default Index;
