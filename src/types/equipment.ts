export interface Equipment {
    id: string;
    name: string;
    description: string;
    image_url: string;
    icon: string;
    features: string[];
    category: 'premium' | 'professional' | 'diatool';
    is_active?: boolean;
    created_at?: string;
    updated_at?: string;
    [key: string]: unknown;
}

export interface EquipmentFormData {
    name?: string;
    description?: string;
    image_url?: string;
    icon?: EquipmentIcon;
    category?: EquipmentCategory;
    features?: string[];
}

export interface SortableItemProps {
    id: string;
    children: React.ReactNode;
}

export type EquipmentCategory = 'premium' | 'professional' | 'diatool';
export type EquipmentIcon = 'none' | 'settings' | 'wrench';
export type ActiveTab = 'construction' | 'diatool'; 