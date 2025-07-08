import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { invalidateQueries } from '@/lib/query-client';

export interface CreateResourceData {
    title: string;
    description?: string;
    file_name: string;
    file_url: string;
    file_size?: number;
    file_type?: string;
    category: string;
    is_active?: boolean;
}

export interface UpdateResourceData extends Partial<CreateResourceData> {
    id?: string;
}

export function useResourcesAdmin() {
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    const createResource = async (resourceData: CreateResourceData, language?: string) => {
        try {
            console.log('Starting resource creation...', { resourceData, language });
            setLoading(true);

            // 현재 언어에 맞는 다국어 컬럼도 함께 설정
            const enhancedResourceData: any = {
                ...resourceData,
                author_id: (await supabase.auth.getUser()).data.user?.id
            };

            // 현재 언어가 있는 경우 다국어 컬럼도 설정
            if (language) {
                if (resourceData.title) {
                    enhancedResourceData[`title_${language}`] = resourceData.title;
                }
                if (resourceData.description) {
                    enhancedResourceData[`description_${language}`] = resourceData.description;
                }
            }

            console.log('Enhanced resource creation data with multilang:', enhancedResourceData);

            const { data, error } = await supabase
                .from('resources')
                .insert(enhancedResourceData)
                .select()
                .single();

            console.log('Resource creation result:', { data, error });

            if (error) throw error;

            console.log('Resource created successfully!');
            invalidateQueries.resources();

            toast({
                title: "자료 등록 완료",
                description: "새로운 자료가 성공적으로 등록되었습니다."
            });

            return { data, error: null };
        } catch (err) {
            console.error('Resource creation error:', err);
            const errorMessage = err instanceof Error ? err.message : '자료 등록에 실패했습니다';
            toast({
                title: "등록 실패",
                description: errorMessage,
                variant: "destructive"
            });
            return { data: null, error: errorMessage };
        } finally {
            setLoading(false);
        }
    };

    const updateResource = async (id: string, resourceData: UpdateResourceData, language?: string) => {
        try {
            console.log('Starting resource update...', { id, resourceData, language });
            setLoading(true);

            // 현재 언어에 맞는 다국어 컬럼도 함께 업데이트
            const enhancedResourceData: any = {
                ...resourceData,
                updated_at: new Date().toISOString()
            };

            // 현재 언어가 있고 해당 필드가 업데이트되는 경우 다국어 컬럼도 업데이트
            if (language && resourceData.title) {
                enhancedResourceData[`title_${language}`] = resourceData.title;
            }
            if (language && resourceData.description) {
                enhancedResourceData[`description_${language}`] = resourceData.description;
            }

            console.log('Enhanced resource form data with multilang:', enhancedResourceData);

            const { data, error } = await supabase
                .from('resources')
                .update(enhancedResourceData)
                .eq('id', id)
                .select()
                .single();

            console.log('Resource update result:', { data, error });

            if (error) throw error;

            console.log('Resource updated successfully!');
            invalidateQueries.resources();
            invalidateQueries.resource(id);

            toast({
                title: "수정 완료",
                description: "자료가 성공적으로 수정되었습니다."
            });

            return { data, error: null };
        } catch (err) {
            console.error('Resource update error:', err);
            const errorMessage = err instanceof Error ? err.message : '자료 수정에 실패했습니다';
            toast({
                title: "수정 실패",
                description: errorMessage,
                variant: "destructive"
            });
            return { data: null, error: errorMessage };
        } finally {
            setLoading(false);
        }
    };

    const deleteResource = async (id: string) => {
        try {
            setLoading(true);

            const { error } = await supabase
                .from('resources')
                .delete()
                .eq('id', id);

            if (error) throw error;

            invalidateQueries.resources();
            invalidateQueries.resource(id);

            toast({
                title: "삭제 완료",
                description: "자료가 성공적으로 삭제되었습니다."
            });

            return { error: null };
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : '자료 삭제에 실패했습니다';
            toast({
                title: "삭제 실패",
                description: errorMessage,
                variant: "destructive"
            });
            return { error: errorMessage };
        } finally {
            setLoading(false);
        }
    };

    const toggleResourceStatus = async (id: string, isActive: boolean) => {
        try {
            setLoading(true);

            const { data, error } = await supabase
                .from('resources')
                .update({
                    is_active: isActive,
                    updated_at: new Date().toISOString()
                })
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;

            invalidateQueries.resources();
            invalidateQueries.resource(id);

            toast({
                title: isActive ? "자료 활성화" : "자료 비활성화",
                description: `자료가 ${isActive ? '활성화' : '비활성화'}되었습니다.`
            });

            return { data, error: null };
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : '상태 변경에 실패했습니다';
            toast({
                title: "상태 변경 실패",
                description: errorMessage,
                variant: "destructive"
            });
            return { data: null, error: errorMessage };
        } finally {
            setLoading(false);
        }
    };

    const getAllResources = async () => {
        try {
            const { data, error } = await supabase
                .from('resources')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            return { data: data || [], error: null };
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : '자료 목록을 불러오는데 실패했습니다';
            return { data: [], error: errorMessage };
        }
    };

    const getDownloadStats = async (resourceId?: string) => {
        try {
            let query = supabase
                .from('resource_downloads')
                .select('*, resources(title, file_name)');

            if (resourceId) {
                query = query.eq('resource_id', resourceId);
            }

            const { data, error } = await query
                .order('downloaded_at', { ascending: false })
                .limit(100);

            if (error) throw error;

            return { data: data || [], error: null };
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : '다운로드 통계를 불러오는데 실패했습니다';
            return { data: [], error: errorMessage };
        }
    };

    return {
        loading,
        createResource,
        updateResource,
        deleteResource,
        toggleResourceStatus,
        getAllResources,
        getDownloadStats
    };
} 