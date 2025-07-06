import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { SupabaseClient } from '@supabase/supabase-js';

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
    description_ko?: string;
    description_en?: string;
    description_zh?: string;
    features_ko?: string[];
    features_en?: string[];
    features_zh?: string[];
}

// 언어별 컬럼을 포함한 전체 선택 쿼리
const SELECT_COLUMNS = `
  *,
  name_ko,
  name_en,
  name_zh,
  description_ko,
  description_en,
  description_zh,
  features_ko,
  features_en,
  features_zh
`;

export const useEquipment = () => {
    const [equipment, setEquipment] = useState<Equipment[]>([]);
    const [loading, setLoading] = useState(true);
    const [hiddenEquipmentIds, setHiddenEquipmentIds] = useState<string[]>([]);

    const fetchEquipment = useCallback(async () => {
        try {
            setLoading(true);
            const { data, error } = await (supabase as unknown as SupabaseClient)
                .from('equipment_introductions')
                .select(SELECT_COLUMNS)
                .eq('is_active', true)
                .order('created_at', { ascending: true });

            if (!error && data) {
                setEquipment(data);
            }
        } catch (error) {
            console.error('Error fetching equipment:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchHiddenEquipment = useCallback(async () => {
        try {
            const { data, error } = await (supabase as unknown as SupabaseClient)
                .from('equipment_introduction_hidden')
                .select('equipment_id');
            if (!error && data) {
                setHiddenEquipmentIds(data.map((h: { equipment_id: string }) => h.equipment_id));
            }
        } catch (error) {
            console.error('Error fetching hidden equipment:', error);
        }
    }, []);

    const createEquipment = useCallback(async (equipmentData: Omit<Equipment, 'id' | 'created_at' | 'updated_at'>) => {
        try {
            const payload = {
                ...equipmentData,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                is_active: true,
            };

            const { data, error } = await (supabase as unknown as SupabaseClient)
                .from('equipment_introductions')
                .insert([payload])
                .select(SELECT_COLUMNS);

            if (error) {
                return { error };
            }

            if (data && data[0]) {
                setEquipment(prev => [...prev, data[0]]);
                return { data: data[0] };
            }
        } catch (error) {
            return { error };
        }
    }, []);

    const updateEquipment = useCallback(async (id: string, updates: Partial<Equipment>) => {
        try {
            const payload = {
                ...updates,
                updated_at: new Date().toISOString(),
            };

            const { data, error } = await (supabase as unknown as SupabaseClient)
                .from('equipment_introductions')
                .update(payload)
                .eq('id', id)
                .select(SELECT_COLUMNS);

            if (error) {
                return { error };
            }

            if (data && data[0]) {
                await fetchEquipment();
                return { data: data[0] };
            }
        } catch (error) {
            return { error };
        }
    }, [fetchEquipment]);

    const deleteEquipment = useCallback(async (id: string) => {
        try {
            const { error } = await (supabase as unknown as SupabaseClient)
                .from('equipment_introductions')
                .delete()
                .eq('id', id);

            if (error) {
                return { error };
            }

            setEquipment(prev => prev.filter(e => e.id !== id));
            return { success: true };
        } catch (error) {
            return { error };
        }
    }, []);

    const toggleEquipmentVisibility = useCallback(async (equipment: Equipment) => {
        try {
            if (hiddenEquipmentIds.includes(equipment.id)) {
                // 숨김 해제
                const { error } = await (supabase as unknown as SupabaseClient)
                    .from('equipment_introduction_hidden')
                    .delete()
                    .eq('equipment_id', equipment.id);
                if (!error) {
                    setHiddenEquipmentIds(prev => prev.filter(id => id !== equipment.id));
                }
            } else {
                // 숨김 처리
                const { error } = await (supabase as unknown as SupabaseClient)
                    .from('equipment_introduction_hidden')
                    .insert([{ equipment_id: equipment.id }]);
                if (!error) {
                    setHiddenEquipmentIds(prev => [...prev, equipment.id]);
                }
            }
        } catch (error) {
            console.error('Error toggling equipment visibility:', error);
        }
    }, [hiddenEquipmentIds]);

    useEffect(() => {
        const loadData = async () => {
            await Promise.all([fetchEquipment(), fetchHiddenEquipment()]);
        };
        loadData();
    }, [fetchEquipment, fetchHiddenEquipment]);

    return {
        equipment,
        loading,
        hiddenEquipmentIds,
        createEquipment,
        updateEquipment,
        deleteEquipment,
        toggleEquipmentVisibility,
        refetch: fetchEquipment
    };
}; 