import React from 'react';
import { Plus } from 'lucide-react';
import { useUserRole } from '@/hooks/useUserRole';
import { useLanguage } from '@/contexts/LanguageContext';

interface NewsHeroProps {
  setShowForm: (show: boolean) => void;
}

const NewsHero: React.FC<NewsHeroProps> = ({ setShowForm }) => {
  const { isAdmin } = useUserRole();
  const { t } = useLanguage();

  return (
    <section className="bg-gradient-to-r from-blue-900 to-blue-700 text-white py-12 sm:py-20">
      <div className="container mx-auto px-4">
        <div className="text-center">
          <h1 className="text-3xl sm:text-5xl font-bold mb-4 sm:mb-6">{t('news_hero_title', '공지사항')}</h1>
          <p className="text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed">
            {t('news_hero_subtitle', '린코리아의 최신 소식과 중요한 공지사항을 확인하세요.')}
          </p>
          {isAdmin && (
            <button
              className="mt-6 sm:mt-8 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 mx-auto touch-manipulation"
              onClick={() => setShowForm(true)}
              aria-label={t('news_add_btn', '공지 추가')}
            >
              <Plus className="w-5 h-5" /> {t('news_add_btn', '공지 추가')}
            </button>
          )}
        </div>
      </div>
    </section>
  );
};

export default NewsHero;
