import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Project {
    id: string;
    title: string;
    location: string;
    date: string;
    image: string;
    description: string;
    url: string;
    features: string[];
    category: string;
    created_at: string;
    updated_at: string;
    title_ko?: string;
    title_en?: string;
    title_zh?: string;
    location_ko?: string;
    location_en?: string;
    location_zh?: string;
    description_ko?: string;
    description_en?: string;
    description_zh?: string;
    features_ko?: string[];
    features_en?: string[];
    features_zh?: string[];
}

const SELECT_COLUMNS = `
  *,
  title_ko,
  title_en,
  title_zh,
  location_ko,
  location_en,
  location_zh,
  description_ko,
  description_en,
  description_zh,
  features_ko,
  features_en,
  features_zh
`;

export const useProjects = () => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    useEffect(() => {
        fetchProjects();
    }, [user]);

    const fetchProjects = async () => {
        try {
            const { data, error } = await supabase
                .from('projects')
                .select(SELECT_COLUMNS)
                .order('created_at', { ascending: true });

            if (error) {
                console.error('Error fetching projects:', error);
            } else {
                setProjects(data || []);
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const createProject = async (project: Omit<Project, 'id' | 'created_at' | 'updated_at'>) => {
        try {
            const { data, error } = await supabase
                .from('projects')
                .insert({
                    ...project,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                })
                .select(SELECT_COLUMNS)
                .single();

            if (error) {
                return { error };
            }

            setProjects(prev => [...prev, data]);
            return { data };
        } catch (error) {
            return { error };
        }
    };

    const updateProject = async (id: string, updates: Partial<Omit<Project, 'id' | 'created_at' | 'updated_at'>>) => {
        try {
            const { data, error } = await supabase
                .from('projects')
                .update({
                    ...updates,
                    updated_at: new Date().toISOString()
                })
                .eq('id', id)
                .select(SELECT_COLUMNS)
                .single();

            if (error) {
                return { error };
            }

            setProjects(prev => prev.map(p => p.id === id ? data : p));
            return { data };
        } catch (error) {
            return { error };
        }
    };

    const deleteProject = async (id: string) => {
        try {
            const { error } = await supabase
                .from('projects')
                .delete()
                .eq('id', id);

            if (error) {
                return { error };
            }

            setProjects(prev => prev.filter(p => p.id !== id));
            return { data: null };
        } catch (error) {
            return { error };
        }
    };

    return {
        projects,
        loading,
        createProject,
        updateProject,
        deleteProject,
        refetch: fetchProjects
    };
}; 