
import React from 'react';
import { useCounter } from '@/hooks/useCounter';
import { useLanguage } from '@/contexts/LanguageContext';

const ProjectsStats: React.FC = () => {
  const { t } = useLanguage();
  const projectCount = useCounter(1000);
  const satisfactionRate = useCounter(100);
  const yearsOfExperience = useCounter(20);

  return (
    <section className="py-12 sm:py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            {t('projects_stats_title')}
          </h2>
          <p className="text-lg sm:text-xl text-gray-600">
            {t('projects_stats_subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
          <div className="text-center bg-white p-6 rounded-lg shadow-sm">
            <div className="text-3xl sm:text-4xl font-bold text-blue-600 mb-2">{projectCount}+</div>
            <div className="text-gray-600">{t('projects_stats_construction_projects')}</div>
          </div>
          <div className="text-center bg-white p-6 rounded-lg shadow-sm">
            <div className="text-3xl sm:text-4xl font-bold text-green-600 mb-2">{satisfactionRate}%</div>
            <div className="text-gray-600">{t('projects_stats_customer_satisfaction')}</div>
          </div>
          <div className="text-center bg-white p-6 rounded-lg shadow-sm">
            <div className="text-3xl sm:text-4xl font-bold text-purple-600 mb-2">{yearsOfExperience}+</div>
            <div className="text-gray-600">{t('projects_stats_product_lineup')}</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProjectsStats;
