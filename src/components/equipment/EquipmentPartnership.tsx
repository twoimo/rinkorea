import React from 'react';
import { Award } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export function EquipmentPartnership(): JSX.Element {
    const { t } = useLanguage();

    return (
        <section className="py-12 md:py-20 bg-gray-50">
            <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6 md:gap-8">
                    <div className="w-full md:w-1/2">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center mb-4">
                            <Award className="w-6 h-6 md:w-8 md:h-8 text-blue-600 mr-0 sm:mr-3 mb-2 sm:mb-0" />
                            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                                {t('equipment_partnership_title')}
                            </h2>
                        </div>
                        <div className="text-base md:text-lg text-gray-600 leading-relaxed">
                            <p className="mb-4">
                                {t('equipment_partnership_desc')}
                            </p>
                            <div style={{ whiteSpace: 'pre-line' }}>
                                {t('equipment_partnership_contact')}
                            </div>
                        </div>
                    </div>
                    <div className="w-full md:w-1/2">
                        <img
                            src="/images/optimized/js-floor-systems.webp"
                            alt="Shanghai JS Floor Systems Partnership"
                            className="w-full h-auto rounded-lg shadow-xl"
                            loading="lazy"
                        />
                    </div>
                </div>
            </div>
        </section>
    );
} 