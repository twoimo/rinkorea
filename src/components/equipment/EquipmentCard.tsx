import React from 'react';
import { Settings, Wrench, Star, Edit, Trash2, EyeOff, Eye } from 'lucide-react';
import { useLanguage, getLocalizedValue, getLocalizedArray } from '@/contexts/LanguageContext';
import type { Equipment } from '@/types/equipment';

interface EquipmentCardProps {
    equipment: Equipment;
    isAdmin: boolean;
    isHidden: boolean;
    onEdit: (equipment: Equipment) => void;
    onDelete: (equipment: Equipment) => void;
    onToggleVisibility: (equipment: Equipment) => void;
}

function getImageUrl(imagePath: string): string {
    if (imagePath.includes('://') || imagePath.startsWith('@')) return imagePath;
    return `/images/${imagePath}`;
}

function renderIcon(iconType: string): React.ReactNode {
    switch (iconType) {
        case 'settings':
            return <Settings className="w-6 h-6 text-blue-600" />;
        case 'wrench':
            return <Wrench className="w-6 h-6 text-blue-600" />;
        default:
            return null;
    }
}

export function EquipmentCard({
    equipment,
    isAdmin,
    isHidden,
    onEdit,
    onDelete,
    onToggleVisibility
}: EquipmentCardProps): JSX.Element {
    const { t, language } = useLanguage();

    // 언어별 데이터 가져오기
    const localizedName = getLocalizedValue(equipment, 'name', language);
    const localizedDescription = getLocalizedValue(equipment, 'description', language);
    const localizedFeatures = getLocalizedArray(equipment, 'features', language);

    // 디버깅: 장비 데이터 확인 (특정 장비만)
    React.useEffect(() => {
        // 수정된 장비가 있을 때만 로그 (equipment ID는 실제 테스트할 때 확인)
        console.log(`🔧 EquipmentCard[${equipment.id}] rendering:`, {
            equipmentName: equipment.name,
            equipmentName_ko: equipment.name_ko,
            equipmentName_en: equipment.name_en,
            equipmentName_zh: equipment.name_zh,
            localizedName,
            language,
            updated_at: equipment.updated_at,
            getLocalizedValueResult: getLocalizedValue(equipment, 'name', language)
        });
    }, [equipment.name, equipment.name_ko, equipment.name_en, equipment.name_zh, localizedName, language, equipment.updated_at, equipment.id]);

    return (
        <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
            <div className="relative overflow-hidden aspect-[3/4] md:aspect-[2/3]">
                <img
                    src={getImageUrl(equipment.image_url)}
                    alt={localizedName}
                    className="w-full h-full object-cover transition-transform hover:scale-105"
                    loading="lazy"
                />

                {/* Admin Controls */}
                {isAdmin && (
                    <div className="absolute top-2 md:top-4 right-2 md:right-4 flex flex-col space-y-2">
                        <button
                            onClick={() => onToggleVisibility(equipment)}
                            className="bg-white p-2 rounded-full hover:bg-gray-100 transition-colors"
                            title={isHidden ? t('show_equipment') : t('hide_equipment')}
                        >
                            {isHidden ? (
                                <Eye className="w-4 h-4 text-gray-600" />
                            ) : (
                                <EyeOff className="w-4 h-4 text-gray-600" />
                            )}
                        </button>
                        <button
                            onClick={() => onEdit(equipment)}
                            className="bg-white p-2 rounded-full hover:bg-gray-100 transition-colors"
                            title={t('edit_equipment')}
                        >
                            <Edit className="w-4 h-4 text-blue-600" />
                        </button>
                        <button
                            onClick={() => onDelete(equipment)}
                            className="bg-white p-2 rounded-full hover:bg-gray-100 transition-colors"
                            title={t('delete_equipment')}
                        >
                            <Trash2 className="w-4 h-4 text-red-600" />
                        </button>
                    </div>
                )}

                {/* Equipment Icon */}
                {equipment.icon && equipment.icon !== 'none' && (
                    <div className="absolute top-2 md:top-4 left-2 md:left-4 bg-white p-2 rounded-full">
                        {renderIcon(equipment.icon)}
                    </div>
                )}
            </div>

            {/* Card Content */}
            <div className="p-4 md:p-6">
                <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-3">
                    {localizedName}
                </h3>
                <p className="text-gray-600 mb-4 text-sm md:text-base">
                    {localizedDescription}
                </p>

                {/* Features */}
                {equipment.features && equipment.features.length > 0 && (
                    <div className="space-y-2">
                        <h4 className="font-semibold text-gray-900">{t('equipment_features_label')}</h4>
                        <ul className="space-y-2">
                            {localizedFeatures.map((feature, index) => (
                                <li key={index} className="flex items-center text-gray-600 text-sm md:text-base">
                                    <Star className="w-3 h-3 md:w-4 md:h-4 text-blue-600 mr-2 flex-shrink-0" />
                                    {feature}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
} 