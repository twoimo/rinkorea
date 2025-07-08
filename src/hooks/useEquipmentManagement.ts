import { useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Equipment, EquipmentFormData } from '@/types/equipment';
import { QUERY_KEYS } from '@/lib/query-client';

interface UseEquipmentManagementReturn {
    equipment: Equipment[];
    loading: boolean;
    hiddenEquipmentIds: string[];

    // Equipment CRUD operations
    createEquipment: (data: EquipmentFormData) => Promise<boolean>;
    updateEquipment: (id: string, data: EquipmentFormData) => Promise<boolean>;
    deleteEquipment: (id: string) => Promise<boolean>;

    // Visibility management
    toggleEquipmentVisibility: (equipment: Equipment) => Promise<boolean>;

    // Utility functions
    getVisibleEquipment: (isAdmin: boolean) => Equipment[];
    refreshData: () => Promise<void>;
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

export function useEquipmentManagement(): UseEquipmentManagementReturn {
    const queryClient = useQueryClient();

    // Equipment 쿼리
    const {
        data: equipment = [],
        isLoading: loading,
        error: _error,
        refetch: refetchEquipment
    } = useQuery({
        queryKey: [QUERY_KEYS.EQUIPMENT.ALL],
        queryFn: fetchEquipment,
        staleTime: 5 * 60 * 1000, // 5분
    });

    // 숨겨진 장비들 쿼리
    const {
        data: hiddenEquipmentIds = [],
        refetch: refetchHiddenEquipment
    } = useQuery({
        queryKey: [QUERY_KEYS.EQUIPMENT.HIDDEN],
        queryFn: fetchHiddenEquipment,
        staleTime: 5 * 60 * 1000, // 5분
    });

    // 장비 생성 mutation
    const createEquipmentMutation = useMutation({
        mutationFn: async (data: EquipmentFormData) => {
            const insertPayload = {
                ...data,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                is_active: true,
                features: Array.isArray(data.features) ? data.features : [],
                features_ko: Array.isArray(data.features_ko) ? data.features_ko : [],
                features_en: Array.isArray(data.features_en) ? data.features_en : [],
                features_zh: Array.isArray(data.features_zh) ? data.features_zh : [],
                features_id: Array.isArray(data.features_id) ? data.features_id : []
            };

            const { data: result, error } = await (supabase as unknown as SupabaseClient)
                .from('equipment_introductions')
                .insert([insertPayload])
                .select(SELECT_COLUMNS);

            if (error) throw error;
            if (!result || !result[0]) throw new Error('Failed to create equipment');

            return {
                ...result[0],
                features: result[0].features || [],
                features_ko: result[0].features_ko || [],
                features_en: result[0].features_en || [],
                features_zh: result[0].features_zh || [],
                features_id: result[0].features_id || []
            };
        },
        onSuccess: (newEquipment) => {
            // 모든 관련 쿼리 캐시 무효화
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.EQUIPMENT.ALL] });
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.EQUIPMENT.VISIBLE] });

            // Optimistic update로 즉시 반영
            queryClient.setQueryData([QUERY_KEYS.EQUIPMENT.ALL], (oldData: Equipment[] | undefined) => {
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
        mutationFn: async ({ equipmentId, updates }: { equipmentId: string; updates: EquipmentFormData }) => {
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
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.EQUIPMENT.ALL] });
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.EQUIPMENT.VISIBLE] });
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.EQUIPMENT.BY_ID(equipmentId)] });

            // Optimistic update로 즉시 반영
            queryClient.setQueryData([QUERY_KEYS.EQUIPMENT.ALL], (oldData: Equipment[] | undefined) => {
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
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.EQUIPMENT.ALL] });
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.EQUIPMENT.VISIBLE] });
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.EQUIPMENT.BY_ID(equipmentId)] });

            // Optimistic update로 즉시 반영
            queryClient.setQueryData([QUERY_KEYS.EQUIPMENT.ALL], (oldData: Equipment[] | undefined) => {
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
                return { equipmentId, action: 'show' as const };
            } else {
                const { error } = await (supabase as unknown as SupabaseClient)
                    .from('equipment_introduction_hidden')
                    .insert([{ equipment_id: equipmentId }]);
                if (error) throw error;
                return { equipmentId, action: 'hide' as const };
            }
        },
        onSuccess: ({ equipmentId, action }) => {
            // 숨겨진 장비 쿼리 캐시 무효화
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.EQUIPMENT.HIDDEN] });
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.EQUIPMENT.VISIBLE] });

            // Optimistic update로 즉시 반영
            queryClient.setQueryData([QUERY_KEYS.EQUIPMENT.HIDDEN], (oldData: string[] | undefined) => {
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

    // Create equipment function
    const createEquipment = useCallback(async (data: EquipmentFormData): Promise<boolean> => {
        try {
            await createEquipmentMutation.mutateAsync(data);
            return true;
        } catch (error) {
            console.error('Error creating equipment:', error);
            return false;
        }
    }, [createEquipmentMutation]);

    // Update equipment function
    const updateEquipment = useCallback(async (id: string, data: EquipmentFormData): Promise<boolean> => {
        try {
            await updateEquipmentMutation.mutateAsync({ equipmentId: id, updates: data });
            return true;
        } catch (error) {
            console.error('Error updating equipment:', error);
            return false;
        }
    }, [updateEquipmentMutation]);

    // Delete equipment function
    const deleteEquipment = useCallback(async (id: string): Promise<boolean> => {
        try {
            await deleteEquipmentMutation.mutateAsync(id);
            return true;
        } catch (error) {
            console.error('Error deleting equipment:', error);
            return false;
        }
    }, [deleteEquipmentMutation]);

    // Toggle equipment visibility function
    const toggleEquipmentVisibility = useCallback(async (equipment: Equipment): Promise<boolean> => {
        try {
            await toggleVisibilityMutation.mutateAsync(equipment.id);
            return true;
        } catch (error) {
            console.error('Error toggling equipment visibility:', error);
            return false;
        }
    }, [toggleVisibilityMutation]);

    // Get visible equipment based on user role
    const getVisibleEquipment = useCallback((isAdmin: boolean): Equipment[] => {
        if (isAdmin) return equipment;
        return equipment.filter(e => !hiddenEquipmentIds.includes(e.id));
    }, [equipment, hiddenEquipmentIds]);

    // Refresh all data
    const refreshData = useCallback(async () => {
        await Promise.all([refetchEquipment(), refetchHiddenEquipment()]);
    }, [refetchEquipment, refetchHiddenEquipment]);

    return {
        equipment,
        loading,
        hiddenEquipmentIds,
        createEquipment,
        updateEquipment,
        deleteEquipment,
        toggleEquipmentVisibility,
        getVisibleEquipment,
        refreshData
    };
} 