import React from 'react';
import { Plus } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface EquipmentHeroProps {
    isAdmin: boolean;
    onAddClick: () => void;
}

export function EquipmentHero({ isAdmin, onAddClick }: EquipmentHeroProps): JSX.Element {
    const { t } = useLanguage();

    return (
        <section className="bg-gradient-to-r from-blue-900 to-blue-700 text-white py-12 md:py-20">
            <div className="container mx-auto px-4">
                <div className="text-center">
                    <h1 className="text-3xl md:text-5xl font-bold mb-4 md:mb-6">
                        {t('equipment_hero_title')}
                    </h1>
                    <p className="text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
                        {t('equipment_hero_subtitle')}
                    </p>
                    {isAdmin && (
                        <button
                            onClick={onAddClick}
                            className="mt-6 md:mt-8 bg-green-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-green-700 transition-colors flex items-center mx-auto"
                        >
                            <Plus className="w-5 h-5 mr-2" />
                            {t('equipment_add_btn')}
                        </button>
                    )}
                </div>
            </div>
        </section>
    );
} 