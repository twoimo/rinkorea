import { useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { SupabaseClient } from '@supabase/supabase-js';
import { QUERY_KEYS } from '@/lib/query-client';

export interface Equipment {
    id: string;
    name: string;
    description: string;
    image_url: string;
    icon: string;
    features: string[];
    category: string;
    is_active?: boolean;
    created_at?: string;
    updated_at?: string;
    // 언어별 필드
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

// 언어별 컬럼을 포함한 전체 선택 쿼리
const SELECT_COLUMNS = `
  *,
  name_ko,
  name_en,
  name_zh,
  name_id,
  description_ko,
  description_en,
  description_zh,
  description_id,
  features_ko,
  features_en,
  features_zh,
  features_id
`;

// Equipment 데이터 가져오기
const fetchEquipment = async (): Promise<Equipment[]> => {
    const { data, error } = await (supabase as unknown as SupabaseClient)
        .from('equipment_introductions')
        .select(SELECT_COLUMNS)
        .eq('is_active', true)
        .order('created_at', { ascending: true });

    if (error) throw error;

    return data?.map(equipment => ({
        ...equipment,
        features: equipment.features || [],
        features_ko: equipment.features_ko || [],
        features_en: equipment.features_en || [],
        features_zh: equipment.features_zh || [],
        features_id: equipment.features_id || []
    })) || [];
};

// 숨겨진 장비 ID 목록 가져오기
const fetchHiddenEquipment = async (): Promise<string[]> => {
    const { data, error } = await (supabase as unknown as SupabaseClient)
        .from('equipment_introduction_hidden')
        .select('equipment_id');

    if (error) throw error;

    return data?.map((h: { equipment_id: string }) => h.equipment_id) || [];
};

export const useEquipment = () => {
    const queryClient = useQueryClient();

    // Equipment 쿼리
    const {
        data: equipment = [],
        isLoading: loading,
        error,
        refetch: refetchEquipment
    } = useQuery({
        queryKey: [QUERY_KEYS.EQUIPMENT?.ALL || 'equipment-all'],
        queryFn: fetchEquipment,
        staleTime: 5 * 60 * 1000, // 5분
    });

    // 숨겨진 장비들 쿼리
    const {
        data: hiddenEquipmentIds = [],
        refetch: refetchHiddenEquipment
    } = useQuery({
        queryKey: ['equipment-hidden'],
        queryFn: fetchHiddenEquipment,
        staleTime: 5 * 60 * 1000, // 5분
    });

    // 가시적인 장비들 계산
    const visibleEquipment = useMemo(() => {
        return equipment.filter(eq => !hiddenEquipmentIds.includes(eq.id));
    }, [equipment, hiddenEquipmentIds]);

    // 장비 생성 mutation
    const createEquipmentMutation = useMutation({
        mutationFn: async (equipmentData: Omit<Equipment, 'id' | 'created_at' | 'updated_at'>) => {
            const insertPayload = {
                ...equipmentData,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                is_active: true,
                features: Array.isArray(equipmentData.features) ? equipmentData.features : [],
                features_ko: Array.isArray(equipmentData.features_ko) ? equipmentData.features_ko : [],
                features_en: Array.isArray(equipmentData.features_en) ? equipmentData.features_en : [],
                features_zh: Array.isArray(equipmentData.features_zh) ? equipmentData.features_zh : [],
                features_id: Array.isArray(equipmentData.features_id) ? equipmentData.features_id : []
            };

            const { data, error } = await (supabase as unknown as SupabaseClient)
                .from('equipment_introductions')
                .insert([insertPayload])
                .select(SELECT_COLUMNS);

            if (error) throw error;
            if (!data || !data[0]) throw new Error('Failed to create equipment');

            return {
                ...data[0],
                features: data[0].features || [],
                features_ko: data[0].features_ko || [],
                features_en: data[0].features_en || [],
                features_zh: data[0].features_zh || [],
                features_id: data[0].features_id || []
            };
        },
        onSuccess: (newEquipment) => {
            // 모든 관련 쿼리 캐시 무효화
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.EQUIPMENT?.ALL || 'equipment-all'] });
            queryClient.invalidateQueries({ queryKey: ['equipment-hidden'] });

            // Optimistic update로 즉시 반영
            queryClient.setQueryData([QUERY_KEYS.EQUIPMENT?.ALL || 'equipment-all'], (oldData: Equipment[] | undefined) => {
                if (!oldData) return [newEquipment];
                return [...oldData, newEquipment];
            });

            console.log('Equipment created successfully:', newEquipment);
        },
        onError: (error) => {
            console.error('Error creating equipment:', error);
        }
    });

    // 장비 업데이트 mutation
    const updateEquipmentMutation = useMutation({
        mutationFn: async ({ equipmentId, updates }: { equipmentId: string; updates: Partial<Equipment> }) => {
            const payload = {
                ...updates,
                updated_at: new Date().toISOString(),
            };

            const { data, error } = await (supabase as unknown as SupabaseClient)
                .from('equipment_introductions')
                .update(payload)
                .eq('id', equipmentId)
                .select(SELECT_COLUMNS);

            if (error) throw error;
            if (!data || !data[0]) throw new Error('Failed to update equipment');

            return {
                ...data[0],
                features: data[0].features || [],
                features_ko: data[0].features_ko || [],
                features_en: data[0].features_en || [],
                features_zh: data[0].features_zh || [],
                features_id: data[0].features_id || []
            };
        },
        onSuccess: (updatedEquipment, { equipmentId }) => {
            // 모든 관련 쿼리 캐시 무효화
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.EQUIPMENT?.ALL || 'equipment-all'] });
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.EQUIPMENT?.BY_ID?.(equipmentId) || `equipment-${equipmentId}`] });

            // Optimistic update로 즉시 반영
            queryClient.setQueryData([QUERY_KEYS.EQUIPMENT?.ALL || 'equipment-all'], (oldData: Equipment[] | undefined) => {
                if (!oldData) return [updatedEquipment];
                return oldData.map(e => e.id === equipmentId ? updatedEquipment : e);
            });

            console.log('Equipment updated successfully:', updatedEquipment);
        },
        onError: (error) => {
            console.error('Error updating equipment:', error);
        }
    });

    // 장비 삭제 mutation
    const deleteEquipmentMutation = useMutation({
        mutationFn: async (equipmentId: string) => {
            const { error } = await (supabase as unknown as SupabaseClient)
                .from('equipment_introductions')
                .delete()
                .eq('id', equipmentId);

            if (error) throw error;
            return equipmentId;
        },
        onSuccess: (equipmentId) => {
            // 모든 관련 쿼리 캐시 무효화
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.EQUIPMENT?.ALL || 'equipment-all'] });
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.EQUIPMENT?.BY_ID?.(equipmentId) || `equipment-${equipmentId}`] });

            // Optimistic update로 즉시 반영
            queryClient.setQueryData([QUERY_KEYS.EQUIPMENT?.ALL || 'equipment-all'], (oldData: Equipment[] | undefined) => {
                if (!oldData) return [];
                return oldData.filter(e => e.id !== equipmentId);
            });

            console.log('Equipment deleted successfully:', equipmentId);
        },
        onError: (error) => {
            console.error('Error deleting equipment:', error);
        }
    });

    // 장비 가시성 토글 mutation
    const toggleVisibilityMutation = useMutation({
        mutationFn: async (equipmentId: string) => {
            const isHidden = hiddenEquipmentIds.includes(equipmentId);

            if (isHidden) {
                const { error } = await (supabase as unknown as SupabaseClient)
                    .from('equipment_introduction_hidden')
                    .delete()
                    .eq('equipment_id', equipmentId);
                if (error) throw error;
                return { equipmentId, action: 'show' };
            } else {
                const { error } = await (supabase as unknown as SupabaseClient)
                    .from('equipment_introduction_hidden')
                    .insert([{ equipment_id: equipmentId }]);
                if (error) throw error;
                return { equipmentId, action: 'hide' };
            }
        },
        onSuccess: ({ equipmentId, action }) => {
            // 숨겨진 장비 쿼리 캐시 무효화
            queryClient.invalidateQueries({ queryKey: ['equipment-hidden'] });

            // Optimistic update로 즉시 반영
            queryClient.setQueryData(['equipment-hidden'], (oldData: string[] | undefined) => {
                if (!oldData) return action === 'hide' ? [equipmentId] : [];
                if (action === 'hide') {
                    return [...oldData, equipmentId];
                } else {
                    return oldData.filter(id => id !== equipmentId);
                }
            });

            console.log(`Equipment ${action} successfully:`, equipmentId);
        },
        onError: (error) => {
            console.error('Error toggling equipment visibility:', error);
        }
    });

    // 래퍼 함수들 (기존 API 유지)
    const createEquipment = useCallback(async (equipmentData: Omit<Equipment, 'id' | 'created_at' | 'updated_at'>) => {
        try {
            const result = await createEquipmentMutation.mutateAsync(equipmentData);
            return { data: result };
        } catch (error) {
            return { error };
        }
    }, [createEquipmentMutation]);

    const updateEquipment = useCallback(async (equipmentId: string, updates: Partial<Equipment>) => {
        try {
            const result = await updateEquipmentMutation.mutateAsync({ equipmentId, updates });
            return { data: result };
        } catch (error) {
            return { error };
        }
    }, [updateEquipmentMutation]);

    const deleteEquipment = useCallback(async (equipmentId: string) => {
        try {
            await deleteEquipmentMutation.mutateAsync(equipmentId);
            return { success: true };
        } catch (error) {
            return { error };
        }
    }, [deleteEquipmentMutation]);

    const toggleEquipmentVisibility = useCallback(async (equipment: Equipment) => {
        try {
            await toggleVisibilityMutation.mutateAsync(equipment.id);
        } catch (error) {
            console.error('Error toggling equipment visibility:', error);
        }
    }, [toggleVisibilityMutation]);

    // 수동 refetch 함수
    const refetch = useCallback(async () => {
        await Promise.all([refetchEquipment(), refetchHiddenEquipment()]);
    }, [refetchEquipment, refetchHiddenEquipment]);

    return {
        equipment,
        visibleEquipment,
        loading,
        hiddenEquipmentIds,
        error: error ? (error instanceof Error ? error.message : 'Failed to fetch equipment') : null,
        createEquipment,
        updateEquipment,
        deleteEquipment,
        toggleEquipmentVisibility,
        refetch
    };
}; 