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
    // 다국어 지원 필드들
    name_ko?: string;
    name_en?: string;
    name_zh?: string;
    name_id?: string;
    description_ko?: string;
    description_en?: string;
    description_zh?: string;
    description_id?: string;
    features_ko?: string[];
    features_en?: string[];
    features_zh?: string[];
    features_id?: string[];
}

export interface SortableItemProps {
    id: string;
    children: React.ReactNode;
}

export type EquipmentCategory = 'premium' | 'professional' | 'diatool';
export type EquipmentIcon = 'none' | 'settings' | 'wrench';
export type ActiveTab = 'construction' | 'diatool'; 