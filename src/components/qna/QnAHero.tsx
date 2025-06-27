import React from 'react';
import { Plus } from 'lucide-react';
import { User } from '@supabase/supabase-js';
import { useLanguage } from '@/contexts/LanguageContext';

interface QnAHeroProps {
  user: User | null;
  setShowForm: (show: boolean) => void;
}

const QnAHero: React.FC<QnAHeroProps> = ({ user, setShowForm }) => {
  const { t } = useLanguage();

  return (
    <section className="bg-gradient-to-r from-blue-900 to-blue-700 text-white py-12 sm:py-20">
      <div className="container mx-auto px-4">
        <div className="text-center">
          <h1 className="text-3xl sm:text-5xl font-bold mb-4 sm:mb-6">{t('qna_hero_title', '고객상담')}</h1>
          <p className="text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed">
            {t('qna_hero_subtitle', '궁금한 것이 있으시면 언제든지 문의해 주세요. 전문가가 신속하고 정확하게 답변드립니다.')}
          </p>
          {user && (
            <button
              className="mt-6 sm:mt-8 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 mx-auto touch-manipulation"
              onClick={() => setShowForm(true)}
              aria-label={t('qna_ask_question', '질문하기')}
            >
              <Plus className="w-5 h-5" /> {t('qna_ask_question', '질문하기')}
            </button>
          )}
        </div>
      </div>
    </section>
  );
};

export default QnAHero;
