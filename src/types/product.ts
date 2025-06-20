export interface Product {
    id: string;
    name: string;
    description: string;
    image_url: string;
    icon: string;
    features: string[];
    is_active?: boolean;
    created_at?: string;
    updated_at?: string;
    detail_images?: string[];
}

export interface ProductFormData {
    name: string;
    description: string;
    image_url: string;
    icon: string;
    features: string[];
    detail_images?: string[];
    is_active?: boolean;
} 