import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RevenueData, RevenueCategory, ChartData, RevenueStats } from '@/types/revenue';
import { useAuth } from '@/contexts/AuthContext';

// 재시도 유틸리티 함수
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const retryWithBackoff = async <T>(
    fn: () => Promise<T>,
    maxRetries: number = 3,
    baseDelay: number = 1000
): Promise<T> => {
    let lastError: Error;

    for (let i = 0; i < maxRetries; i++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error as Error;
            if (i === maxRetries - 1) break;

            // 백오프 지연 (1초, 2초, 4초)
            const delayMs = baseDelay * Math.pow(2, i);
            await delay(delayMs);
        }
    }

    throw lastError;
};

export const useRevenue = () => {
    const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
    const [categories, setCategories] = useState<RevenueCategory[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<RevenueStats | null>(null);
    const { user } = useAuth();

    // 매출 데이터 조회
    const fetchRevenueData = useCallback(async (dateRange?: { start: string; end: string }) => {
        try {
            setLoading(true);
            let query = supabase
                .from('revenue_data')
                .select('*')
                .order('date', { ascending: false });

            if (dateRange) {
                query = query
                    .gte('date', dateRange.start)
                    .lte('date', dateRange.end);
            }

            const { data, error } = await query;
            if (error) throw error;

            setRevenueData(data || []);
            calculateStats(data || []);
        } catch (error) {
            console.error('매출 데이터 조회 실패:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    // 카테고리 조회
    const fetchCategories = useCallback(async () => {
        try {
            const { data, error } = await supabase
                .from('revenue_categories')
                .select('*')
                .eq('is_active', true)
                .order('name');

            if (error) throw error;
            setCategories(data || []);
        } catch (error) {
            console.error('카테고리 조회 실패:', error);
        }
    }, []);

    // 통계 계산
    const calculateStats = (data: RevenueData[]) => {
        if (!data.length) {
            setStats(null);
            return;
        }

        const totalRevenue = data.reduce((sum, item) => sum + item.revenue, 0);
        const totalQuantity = data.reduce((sum, item) => sum + (item.quantity || 0), 0);
        const avgUnitPrice = totalQuantity > 0 ? totalRevenue / totalQuantity : 0;

        // 카테고리별 매출 계산
        const categoryRevenue = data.reduce((acc, item) => {
            acc[item.category] = (acc[item.category] || 0) + item.revenue;
            return acc;
        }, {} as Record<string, number>);

        const topCategory = Object.entries(categoryRevenue)
            .sort(([, a], [, b]) => b - a)[0]?.[0] || '';

        // 제품별 매출 계산
        const productRevenue = data.reduce((acc, item) => {
            if (item.product_name) {
                acc[item.product_name] = (acc[item.product_name] || 0) + item.revenue;
            }
            return acc;
        }, {} as Record<string, number>);

        const topProduct = Object.entries(productRevenue)
            .sort(([, a], [, b]) => b - a)[0]?.[0] || '';

        // 성장률 계산 (최근 30일 vs 이전 30일)
        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

        const recentRevenue = data
            .filter(item => new Date(item.date) >= thirtyDaysAgo)
            .reduce((sum, item) => sum + item.revenue, 0);

        const previousRevenue = data
            .filter(item => new Date(item.date) >= sixtyDaysAgo && new Date(item.date) < thirtyDaysAgo)
            .reduce((sum, item) => sum + item.revenue, 0);

        const growth = previousRevenue > 0 ? ((recentRevenue - previousRevenue) / previousRevenue) * 100 : 0;

        setStats({
            totalRevenue,
            totalQuantity,
            avgUnitPrice,
            topCategory,
            topProduct,
            growth
        });
    };

    // 차트 데이터 변환
    const getChartData = (
        data: RevenueData[],
        groupBy: 'daily' | 'weekly' | 'monthly' = 'monthly',
        categories?: string[]
    ): ChartData[] => {
        // 데이터가 없으면 빈 배열 반환
        if (!data || data.length === 0) {
            return [];
        }

        const filteredData = categories?.length
            ? data.filter(item => categories.includes(item.category))
            : data;

        if (filteredData.length === 0) {
            return [];
        }

        const grouped = filteredData.reduce((acc, item) => {
            let key: string;
            const date = new Date(item.date);

            switch (groupBy) {
                case 'daily': {
                    key = item.date;
                    break;
                }
                case 'weekly': {
                    const weekStart = new Date(date);
                    weekStart.setDate(date.getDate() - date.getDay());
                    key = weekStart.toISOString().split('T')[0];
                    break;
                }
                case 'monthly': {
                    key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                    break;
                }
                default: {
                    key = item.date;
                    break;
                }
            }

            if (!acc[key]) {
                acc[key] = { date: key };
                // 모든 카테고리를 0으로 초기화
                const availableCategories = categories?.length ? categories : [...new Set(data.map(d => d.category))];
                availableCategories.forEach(cat => {
                    acc[key][cat] = 0;
                });
                acc[key]['total'] = 0;
            }

            // 해당 카테고리의 값 증가
            acc[key][item.category] = (acc[key][item.category] as number || 0) + item.revenue;
            acc[key]['total'] = (acc[key]['total'] as number || 0) + item.revenue;

            return acc;
        }, {} as Record<string, ChartData>);

        // 날짜순으로 정렬하여 반환
        const result = Object.values(grouped).sort((a, b) => a.date.localeCompare(b.date));

        console.log('Chart data generated:', result); // 디버깅용
        return result;
    };

    // 데이터 추가
    const addRevenueData = async (data: Omit<RevenueData, 'id' | 'created_at' | 'updated_at' | 'created_by'>) => {
        try {
            const { error } = await supabase
                .from('revenue_data')
                .insert([{
                    ...data,
                    created_by: user?.id
                }]);

            if (error) throw error;
            await fetchRevenueData();
            return { success: true };
        } catch (error) {
            console.error('데이터 추가 실패:', error);
            return { error };
        }
    };

    // 벌크 데이터 추가 (CSV 업로드용)
    const addBulkRevenueData = async (dataArray: Omit<RevenueData, 'id' | 'created_at' | 'updated_at' | 'created_by'>[]) => {
        try {
            const { error } = await supabase
                .from('revenue_data')
                .insert(dataArray.map(data => ({
                    ...data,
                    created_by: user?.id
                })));

            if (error) throw error;
            await fetchRevenueData();
            return { success: true };
        } catch (error) {
            console.error('벌크 데이터 추가 실패:', error);
            return { error };
        }
    };

    // 데이터 수정
    const updateRevenueData = async (id: string, data: Partial<RevenueData>) => {
        try {
            const { error } = await supabase
                .from('revenue_data')
                .update({ ...data, updated_at: new Date().toISOString() })
                .eq('id', id);

            if (error) throw error;
            await fetchRevenueData();
            return { success: true };
        } catch (error) {
            console.error('데이터 수정 실패:', error);
            return { error };
        }
    };

    // 배치 데이터 삭제 (안전한 삭제를 위한 함수)
    const deleteBulkRevenueData = async (ids: string[]) => {
        try {
            if (ids.length === 0) return { success: true };

            // 단일 쿼리로 여러 ID 삭제 (더 효율적)
            const { error } = await retryWithBackoff(async () => {
                return await supabase
                    .from('revenue_data')
                    .delete()
                    .in('id', ids);
            });

            if (error) throw error;
            await fetchRevenueData();
            return { success: true };
        } catch (error) {
            console.error('배치 데이터 삭제 실패:', error);
            return { error };
        }
    };

    // 개선된 단일 데이터 삭제 (재시도 로직 포함)
    const deleteRevenueData = async (id: string) => {
        try {
            const { error } = await retryWithBackoff(async () => {
                return await supabase
                    .from('revenue_data')
                    .delete()
                    .eq('id', id);
            });

            if (error) throw error;
            await fetchRevenueData();
            return { success: true };
        } catch (error) {
            console.error('데이터 삭제 실패:', error);
            return { error };
        }
    };

    // 선택된 항목들을 순차적으로 삭제 (네트워크 부하 방지)
    const deleteSelectedRevenueData = async (ids: string[]) => {
        try {
            if (ids.length === 0) return { success: true };

            // 10개씩 배치로 나누어 처리
            const batchSize = 10;
            const batches = [];

            for (let i = 0; i < ids.length; i += batchSize) {
                batches.push(ids.slice(i, i + batchSize));
            }

            // 각 배치를 순차적으로 처리 (동시 요청 방지)
            for (const batch of batches) {
                await retryWithBackoff(async () => {
                    const { error } = await supabase
                        .from('revenue_data')
                        .delete()
                        .in('id', batch);

                    if (error) throw error;
                    return { success: true };
                });

                // 배치 간 짧은 지연
                await delay(100);
            }

            await fetchRevenueData();
            return { success: true };
        } catch (error) {
            console.error('선택 데이터 삭제 실패:', error);
            return { error };
        }
    };

    useEffect(() => {
        const loadInitialData = async () => {
            await fetchRevenueData();
            await fetchCategories();
        };

        loadInitialData();
    }, [fetchRevenueData, fetchCategories]); // fetchRevenueData와 fetchCategories는 안정적인 함수이므로 의존성에서 제외

    return {
        revenueData,
        categories,
        loading,
        stats,
        fetchRevenueData,
        fetchCategories,
        getChartData,
        addRevenueData,
        addBulkRevenueData,
        updateRevenueData,
        deleteRevenueData,
        deleteBulkRevenueData,
        deleteSelectedRevenueData
    };
};