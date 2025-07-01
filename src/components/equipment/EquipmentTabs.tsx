import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import type { ActiveTab } from '@/types/equipment';

interface EquipmentTabsProps {
    activeTab: ActiveTab;
    onTabChange: (tab: ActiveTab) => void;
}

export function EquipmentTabs({ activeTab, onTabChange }: EquipmentTabsProps): JSX.Element {
    const { t } = useLanguage();

    return (
        <section className="bg-white border-b border-gray-200 sticky top-0 z-50">
            <div className="container mx-auto px-4">
                <div className="flex justify-center">
                    <div className="flex space-x-8 md:space-x-12">
                        <button
                            onClick={() => onTabChange('construction')}
                            className={`py-4 px-2 border-b-2 font-medium text-sm md:text-base transition-colors ${activeTab === 'construction'
                                ? 'border-blue-600 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            {t('equipment_construction_tab')}
                        </button>
                        <button
                            onClick={() => onTabChange('diatool')}
                            className={`py-4 px-2 border-b-2 font-medium text-sm md:text-base transition-colors ${activeTab === 'diatool'
                                ? 'border-blue-600 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            {t('equipment_diatool_tab')}
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
} 