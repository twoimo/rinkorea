import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import { queryClient, QUERY_KEYS } from '@/lib/query-client';

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

    // 중복 호출 방지를 위한 ref
    const downloadingRef = useRef<Set<string>>(new Set());
    const lastDownloadTime = useRef<Map<string, number>>(new Map());

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

    // React Query 캐시 변경 이벤트 구독
    useEffect(() => {
        const unsubscribe = queryClient.getQueryCache().subscribe(({ query, type }) => {
            // Resources 관련 쿼리 캐시가 무효화되면 데이터 새로고침
            if (type === 'removed' || type === 'updated') {
                const queryKey = query.queryKey[0];
                if (typeof queryKey === 'string' && (
                    queryKey === QUERY_KEYS.RESOURCES.ALL ||
                    queryKey === QUERY_KEYS.RESOURCES.ACTIVE ||
                    queryKey.startsWith('resource-')
                )) {
                    console.log('Resources cache invalidated, refetching...');
                    fetchResources();
                }
            }
        });

        return unsubscribe;
    }, [fetchResources]);

    useEffect(() => {
        fetchResources();
    }, [fetchResources]);

    const downloadResource = async (resource: Resource) => {
        const now = Date.now();
        const lastTime = lastDownloadTime.current.get(resource.id) || 0;

        // 중복 방지: 이미 다운로드 중이거나 1초 이내 재호출 차단
        if (downloadingRef.current.has(resource.id) || (now - lastTime < 1000)) {
            console.log('Download blocked - already in progress or too soon:', resource.id);
            return;
        }

        // 다운로드 시작 기록
        downloadingRef.current.add(resource.id);
        lastDownloadTime.current.set(resource.id, now);

        try {
            console.log('Starting download for:', resource.id, 'current count:', resource.download_count);

            // Create download link first
            const link = document.createElement('a');
            link.href = resource.file_url;
            link.download = resource.file_name;
            link.target = '_blank';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // 다운로드 로그만 삽입 (트리거가 자동으로 카운트 증가)
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { error: logError } = await (supabase as any)
                .from('resource_downloads')
                .insert({
                    resource_id: resource.id,
                    user_id: user?.id || null,
                    downloaded_at: new Date().toISOString()
                });

            if (logError) {
                console.error('Error logging download:', logError);
                toast({
                    title: "다운로드 로그 실패",
                    description: "다운로드 기록에 실패했습니다.",
                    variant: "destructive"
                });
            } else {
                console.log('Download logged successfully, count should be auto-incremented by trigger');

                // 즉시 로컬 상태 업데이트 (사용자 경험)
                setAllResources(prev => prev.map(r =>
                    r.id === resource.id
                        ? { ...r, download_count: r.download_count + 1 }
                        : r
                ));
            }

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
        } finally {
            // 다운로드 완료 후 잠시 후에 제거 (추가 보호)
            setTimeout(() => {
                downloadingRef.current.delete(resource.id);
                console.log('Download lock removed for:', resource.id);
            }, 2000);
        }
    };

    const filteredResources = allResources.filter(resource => {
        const matchesSearch = resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (resource.description && resource.description.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesCategory = selectedCategory === 'all' || resource.category === selectedCategory;

        return matchesSearch && matchesCategory;
    });

    const handleDownloadResource = async (resourceId: string, _fileName: string, _fileUrl: string) => {
        console.log('Download requested for:', resourceId);

        // 전체 resources에서 찾기
        const resource = allResources.find(r => r.id === resourceId);

        if (resource) {
            await downloadResource(resource);
        } else {
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