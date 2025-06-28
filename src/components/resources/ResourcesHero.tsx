import React from 'react';
import { Plus } from 'lucide-react';
import { useUserRole } from '@/hooks/useUserRole';
import { useLanguage } from '@/contexts/LanguageContext';

interface ResourcesHeroProps {
    setShowForm: (show: boolean) => void;
}

const ResourcesHero: React.FC<ResourcesHeroProps> = ({ setShowForm }) => {
    const { isAdmin } = useUserRole();
    const { t } = useLanguage();

    return (
        <section className="bg-gradient-to-r from-blue-900 to-blue-700 text-white py-12 sm:py-20">
            <div className="container mx-auto px-4">
                <div className="text-center">
                    <h1 className="text-3xl sm:text-5xl font-bold mb-4 sm:mb-6">{t('resources_hero_title', '자료실')}</h1>
                    <p className="text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed">
                        {t('resources_hero_subtitle', '제품 카탈로그, 기술 자료, 인증서 등 다양한 자료를 확인하세요.')}
                    </p>
                    {isAdmin && (
                        <button
                            className="mt-6 sm:mt-8 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 mx-auto touch-manipulation"
                            onClick={() => setShowForm(true)}
                            aria-label={t('resources_add_btn', '자료 추가')}
                        >
                            <Plus className="w-5 h-5" /> {t('resources_add_btn', '자료 추가')}
                        </button>
                    )}
                </div>
            </div>
        </section>
    );
};

export default ResourcesHero; 