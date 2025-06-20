import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';

export interface Resource {
    id: string;
    title: string;
    description: string | null;
    file_name: string;
    file_url: string;
    file_size: number | null;
    file_type: string | null;
    category: string;
    download_count: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    created_by: string | null;
}

export interface ResourceCategory {
    id: string;
    name: string;
    color: string;
    is_active: boolean;
    created_at: string;
}

export const useResources = () => {
    const [resources, setResources] = useState<Resource[]>([]);
    const [categories, setCategories] = useState<ResourceCategory[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const { toast } = useToast();
    const { user } = useAuth();
    const { isAdmin } = useUserRole();

    const fetchResources = useCallback(async () => {
        try {
            setLoading(true);

            // Build the query - 관리자는 모든 자료, 일반 사용자는 활성화된 자료만
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            let query = (supabase as any)
                .from('resources')
                .select('*');

            // 관리자가 아닌 경우에만 is_active=true 필터 적용
            if (!isAdmin) {
                query = query.eq('is_active', true);
            }

            query = query.order('created_at', { ascending: true });

            const { data, error } = await query;

            if (error) {
                console.error('Error fetching resources:', error);
                setResources([]);
            } else {
                setResources(data as Resource[] || []);
            }

            // Fetch categories
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { data: categoriesData, error: categoriesError } = await (supabase as any)
                .from('resource_categories')
                .select('*')
                .eq('is_active', true)
                .order('name');

            if (categoriesError) {
                console.error('Error fetching categories:', categoriesError);
                setCategories([]);
            } else {
                setCategories(categoriesData as ResourceCategory[] || []);
            }

        } catch (error) {
            console.error('Error fetching resources:', error);
        } finally {
            setLoading(false);
        }
    }, [isAdmin]);

    useEffect(() => {
        fetchResources();
    }, [fetchResources]);

    const downloadResource = async (resource: Resource) => {
        try {
            // Create download link
            const link = document.createElement('a');
            link.href = resource.file_url;
            link.download = resource.file_name;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // Update download count
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await (supabase as any)
                .from('resources')
                .update({ download_count: resource.download_count + 1 })
                .eq('id', resource.id);

            // Log download
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await (supabase as any)
                .from('resource_downloads')
                .insert({
                    resource_id: resource.id,
                    user_id: user?.id || null,
                    downloaded_at: new Date().toISOString()
                });

            // Update local state
            setResources(prev => prev.map(r =>
                r.id === resource.id
                    ? { ...r, download_count: r.download_count + 1 }
                    : r
            ));

            toast({
                title: "다운로드 시작",
                description: `${resource.title} 파일을 다운로드합니다.`
            });

        } catch (error) {
            console.error('Error downloading resource:', error);
            toast({
                title: "다운로드 실패",
                description: "파일 다운로드 중 오류가 발생했습니다.",
                variant: "destructive"
            });
        }
    };

    const filteredResources = resources.filter(resource => {
        const matchesSearch = resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (resource.description && resource.description.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesCategory = selectedCategory === 'all' || resource.category === selectedCategory;

        return matchesSearch && matchesCategory;
    });

    return {
        resources: filteredResources,
        categories,
        loading,
        searchTerm,
        setSearchTerm,
        selectedCategory,
        setSelectedCategory,
        downloadResource,
        refetch: fetchResources
    };
}; 