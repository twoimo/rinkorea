import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { invalidateQueries, queryClient, QUERY_KEYS } from '@/lib/query-client';
import React from 'react';

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

const SELECT_COLUMNS = `*`;

export const useProjects = () => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    useEffect(() => {
        fetchProjects();
    }, [user]);

    // React Query 캐시 변경 이벤트 구독
    useEffect(() => {
        const unsubscribe = queryClient.getQueryCache().subscribe(({ query, type }) => {
            // Projects 관련 쿼리 캐시가 무효화되면 데이터 새로고침
            if (type === 'removed' || type === 'updated') {
                const queryKey = query.queryKey[0];
                if (typeof queryKey === 'string' && (
                    queryKey === QUERY_KEYS.PROJECTS.ALL ||
                    queryKey === QUERY_KEYS.PROJECTS.VISIBLE ||
                    queryKey.startsWith('project-')
                )) {
                    console.log('Projects cache invalidated, refetching...');
                    fetchProjects();
                }
            }
        });

        return unsubscribe;
    }, []);

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

    // 디버깅: 프로젝트 데이터 변경 감지
    React.useEffect(() => {
        console.log('🏗️ Projects data changed:', {
            totalProjects: projects.length,
            projectTitles: projects.map(p => p.title),
            projectDetails: projects.map(p => ({ id: p.id, title: p.title, updated_at: p.updated_at })),
            timestamp: new Date().toLocaleTimeString()
        });
    }, [projects]);

    const createProject = async (project: Omit<Project, 'id' | 'created_at' | 'updated_at'>, language?: string) => {
        try {
            console.log('Starting project creation...', { project, language });

            // 현재 언어에 맞는 다국어 컬럼도 함께 설정
            const enhancedProject: any = {
                ...project,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };

            // 현재 언어가 있는 경우 다국어 컬럼도 설정
            if (language) {
                if (project.title) {
                    enhancedProject[`title_${language}`] = project.title;
                }
                if (project.location) {
                    enhancedProject[`location_${language}`] = project.location;
                }
                if (project.description) {
                    enhancedProject[`description_${language}`] = project.description;
                }
                if (project.features) {
                    enhancedProject[`features_${language}`] = project.features;
                }
            }

            console.log('Enhanced project creation data with multilang:', enhancedProject);

            const { data, error } = await supabase
                .from('projects')
                .insert(enhancedProject)
                .select(SELECT_COLUMNS)
                .single();

            console.log('Project creation result:', { data, error });

            if (error) {
                console.error('Project creation error:', error);
                return { error };
            }

            console.log('Project created successfully!');
            // 불변성을 보장하면서 새 프로젝트 추가
            setProjects(prev => {
                const newProjects = [...prev, { ...data }];
                console.log('Added new project to state:', {
                    previousLength: prev.length,
                    newLength: newProjects.length,
                    newProject: data,
                    newProjectTitle: data.title
                });
                return newProjects;
            });

            // 캐시 무효화 - 즉시 UI 반영
            invalidateQueries.projects();

            return { data };
        } catch (error) {
            console.error('Project creation exception:', error);
            return { error };
        }
    };

    const updateProject = async (id: string, updates: Partial<Omit<Project, 'id' | 'created_at' | 'updated_at'>>, language?: string) => {
        try {
            console.log('Starting project update...', { id, updates, language });

            // 현재 언어에 맞는 다국어 컬럼도 함께 업데이트
            const enhancedUpdates: any = {
                ...updates,
                updated_at: new Date().toISOString()
            };

            // 현재 언어가 있고 해당 필드가 업데이트되는 경우 다국어 컬럼도 업데이트
            if (language && updates.title) {
                enhancedUpdates[`title_${language}`] = updates.title;
            }
            if (language && updates.location) {
                enhancedUpdates[`location_${language}`] = updates.location;
            }
            if (language && updates.description) {
                enhancedUpdates[`description_${language}`] = updates.description;
            }
            if (language && updates.features) {
                enhancedUpdates[`features_${language}`] = updates.features;
            }

            console.log('Enhanced project form data with multilang:', enhancedUpdates);

            const { data, error } = await supabase
                .from('projects')
                .update(enhancedUpdates)
                .eq('id', id)
                .select(SELECT_COLUMNS)
                .single();

            console.log('Project update result:', { data, error });

            if (error) {
                console.error('Project update error:', error);
                return { error };
            }

            console.log('Project updated successfully!');
            // 불변성을 보장하면서 상태 업데이트
            setProjects(prev => {
                const newProjects = prev.map(p => p.id === id ? { ...data } : p);
                console.log('Updated projects state:', {
                    previousLength: prev.length,
                    newLength: newProjects.length,
                    updatedProject: data,
                    updatedProjectTitle: data.title
                });
                return newProjects;
            });

            // 캐시 무효화 - 즉시 UI 반영
            invalidateQueries.projects();
            invalidateQueries.project(id);

            return { data };
        } catch (error) {
            console.error('Project update exception:', error);
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

            // 캐시 무효화 - 즉시 UI 반영
            invalidateQueries.projects();
            invalidateQueries.project(id);

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