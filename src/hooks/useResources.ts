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
    const [allResources, setAllResources] = useState<Resource[]>([]);
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
                setAllResources([]);
            } else {
                setAllResources(data as Resource[] || []);
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
        console.log('Starting download for resource:', resource);

        try {
            // Update download count first
            console.log('Updating download count from', resource.download_count, 'to', resource.download_count + 1);

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { error: updateError } = await (supabase as any)
                .from('resources')
                .update({ download_count: resource.download_count + 1 })
                .eq('id', resource.id);

            if (updateError) {
                console.error('Error updating download count:', updateError);
                toast({
                    title: "카운트 업데이트 실패",
                    description: "다운로드 카운트 업데이트에 실패했습니다.",
                    variant: "destructive"
                });
                // 카운트 업데이트 실패해도 다운로드는 진행
            } else {
                console.log('Download count updated successfully');
            }

            // Create download link
            console.log('Creating download link for:', resource.file_url);
            const link = document.createElement('a');
            link.href = resource.file_url;
            link.download = resource.file_name;
            link.target = '_blank'; // 새 탭에서 열기
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // Log download (optional, may fail if table doesn't exist)
            try {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                await (supabase as any)
                    .from('resource_downloads')
                    .insert({
                        resource_id: resource.id,
                        user_id: user?.id || null,
                        downloaded_at: new Date().toISOString()
                    });
                console.log('Download logged successfully');
            } catch (logError) {
                console.warn('Download logging failed (table may not exist):', logError);
                // 로그 실패는 무시
            }

            // Update local state immediately
            console.log('Updating local state');
            setAllResources(prev => {
                const updated = prev.map(r =>
                    r.id === resource.id
                        ? { ...r, download_count: r.download_count + 1 }
                        : r
                );
                console.log('Local state updated');
                return updated;
            });

            toast({
                title: "다운로드 시작",
                description: `${resource.title} 파일을 다운로드합니다.`,
                variant: "default"
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

    const filteredResources = allResources.filter(resource => {
        const matchesSearch = resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (resource.description && resource.description.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesCategory = selectedCategory === 'all' || resource.category === selectedCategory;

        return matchesSearch && matchesCategory;
    });

    const handleDownloadResource = async (resourceId: string, fileName: string, fileUrl: string) => {
        console.log('Download attempt:', { resourceId, fileName });
        console.log('All resources:', allResources.length);

        // 전체 resources에서 찾기
        const resource = allResources.find(r => r.id === resourceId);
        console.log('Found resource:', resource);

        if (resource) {
            await downloadResource(resource);
        } else {
            console.error('Resource not found:', resourceId);
            console.log('Available resource IDs:', allResources.map(r => r.id));
            toast({
                title: "다운로드 실패",
                description: "자료를 찾을 수 없습니다.",
                variant: "destructive"
            });
        }
    };

    return {
        resources: filteredResources,
        categories,
        loading,
        searchTerm,
        setSearchTerm,
        selectedCategory,
        setSelectedCategory,
        downloadResource: handleDownloadResource,
        refetch: fetchResources
    };
}; 