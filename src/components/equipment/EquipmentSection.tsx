import React from 'react';
import { EquipmentCard } from './EquipmentCard';
import type { Equipment, EquipmentCategory } from '@/types/equipment';

interface EquipmentSectionProps {
    title: string;
    subtitle: string;
    category: EquipmentCategory;
    equipment: Equipment[];
    isAdmin: boolean;
    hiddenEquipmentIds: string[];
    bgClass?: string;
    onEdit: (equipment: Equipment) => void;
    onDelete: (equipment: Equipment) => void;
    onToggleVisibility: (equipment: Equipment) => void;
}

export function EquipmentSection({
    title,
    subtitle,
    category,
    equipment,
    isAdmin,
    hiddenEquipmentIds,
    bgClass = '',
    onEdit,
    onDelete,
    onToggleVisibility
}: EquipmentSectionProps): JSX.Element | null {

    // Filter equipment by category
    const categoryEquipment = equipment.filter(e => e.category === category);

    // Don't render section if no equipment
    if (categoryEquipment.length === 0) {
        return null;
    }

    return (
        <section className={`py-12 md:py-20 ${bgClass}`}>
            <div className="container mx-auto px-4">
                <div className="text-center mb-8 md:mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                        {title}
                    </h2>
                    <p className="text-lg md:text-xl text-gray-600">
                        {subtitle}
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                    {categoryEquipment.map((item) => (
                        <EquipmentCard
                            key={item.id}
                            equipment={item}
                            isAdmin={isAdmin}
                            isHidden={hiddenEquipmentIds.includes(item.id)}
                            onEdit={onEdit}
                            onDelete={onDelete}
                            onToggleVisibility={onToggleVisibility}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
} 