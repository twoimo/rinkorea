import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Equipment, EquipmentFormData } from '@/types/equipment';

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

export function useEquipmentManagement(): UseEquipmentManagementReturn {
    const [equipment, setEquipment] = useState<Equipment[]>([]);
    const [loading, setLoading] = useState(true);
    const [hiddenEquipmentIds, setHiddenEquipmentIds] = useState<string[]>([]);

    // Fetch equipment data
    const fetchEquipment = useCallback(async () => {
        setLoading(true);
        try {
            const { data, error } = await (supabase as unknown as SupabaseClient)
                .from('equipment_introductions')
                .select('*')
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

    // Fetch hidden equipment IDs
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

    // Create new equipment
    const createEquipment = useCallback(async (data: EquipmentFormData): Promise<boolean> => {
        try {
            const payload = {
                ...data,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                is_active: true
            };

            const { error, data: result } = await (supabase as unknown as SupabaseClient)
                .from('equipment_introductions')
                .insert([payload])
                .select();

            if (!error && result) {
                setEquipment(prev => [...prev, result[0]]);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error creating equipment:', error);
            return false;
        }
    }, []);

    // Update existing equipment
    const updateEquipment = useCallback(async (id: string, data: EquipmentFormData): Promise<boolean> => {
        try {
            const payload = {
                ...data,
                updated_at: new Date().toISOString()
            };

            const { error } = await (supabase as unknown as SupabaseClient)
                .from('equipment_introductions')
                .update(payload)
                .eq('id', id);

            if (!error) {
                setEquipment(prev =>
                    prev.map(e => e.id === id ? { ...e, ...payload } : e)
                );
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error updating equipment:', error);
            return false;
        }
    }, []);

    // Delete equipment
    const deleteEquipment = useCallback(async (id: string): Promise<boolean> => {
        try {
            const { error } = await (supabase as unknown as SupabaseClient)
                .from('equipment_introductions')
                .delete()
                .eq('id', id);

            if (!error) {
                setEquipment(prev => prev.filter(e => e.id !== id));
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error deleting equipment:', error);
            return false;
        }
    }, []);

    // Toggle equipment visibility
    const toggleEquipmentVisibility = useCallback(async (equipment: Equipment): Promise<boolean> => {
        try {
            const isHidden = hiddenEquipmentIds.includes(equipment.id);

            if (isHidden) {
                // Show equipment
                const { error } = await (supabase as unknown as SupabaseClient)
                    .from('equipment_introduction_hidden')
                    .delete()
                    .eq('equipment_id', equipment.id);

                if (!error) {
                    setHiddenEquipmentIds(prev => prev.filter(id => id !== equipment.id));
                    return true;
                }
            } else {
                // Hide equipment
                const { error } = await (supabase as unknown as SupabaseClient)
                    .from('equipment_introduction_hidden')
                    .insert([{ equipment_id: equipment.id }]);

                if (!error) {
                    setHiddenEquipmentIds(prev => [...prev, equipment.id]);
                    return true;
                }
            }
            return false;
        } catch (error) {
            console.error('Error toggling equipment visibility:', error);
            return false;
        }
    }, [hiddenEquipmentIds]);

    // Get visible equipment based on user role
    const getVisibleEquipment = useCallback((isAdmin: boolean): Equipment[] => {
        if (isAdmin) return equipment;
        return equipment.filter(e => !hiddenEquipmentIds.includes(e.id));
    }, [equipment, hiddenEquipmentIds]);

    // Refresh all data
    const refreshData = useCallback(async () => {
        await Promise.all([fetchEquipment(), fetchHiddenEquipment()]);
    }, [fetchEquipment, fetchHiddenEquipment]);

    // Initial data fetch
    useEffect(() => {
        refreshData();
    }, [refreshData]);

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