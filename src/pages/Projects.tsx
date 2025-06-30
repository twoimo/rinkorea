import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useProjects, type Project } from '@/hooks/useProjects';
import { useUserRole } from '@/hooks/useUserRole';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import type { SupabaseClient } from '@supabase/supabase-js';
import { useIsMobile } from '@/hooks/use-mobile';
import ProjectsHero from '@/components/projects/ProjectsHero';
import ProjectsStats from '@/components/projects/ProjectsStats';
import ProjectsGrid from '@/components/projects/ProjectsGrid';
import ProjectForm from '@/components/projects/ProjectForm';
import { ProjectsGridSkeleton } from '@/components/projects/ProjectCardSkeleton';

const Projects = () => {
  const { projects, loading, deleteProject } = useProjects();
  const { isAdmin } = useUserRole();
  const { toast } = useToast();
  const { t } = useLanguage();
  const isMobile = useIsMobile();
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [hiddenProjectIds, setHiddenProjectIds] = useState<string[]>([]);

  // 숨김 프로젝트 목록 불러오기
  const fetchHiddenProjects = async () => {
    const { data, error } = await (supabase as unknown as SupabaseClient)
      .from('project_hidden')
      .select('project_id');
    if (!error && data) {
      setHiddenProjectIds(data.map((h: { project_id: string }) => h.project_id));
    }
  };

  useEffect(() => {
    fetchHiddenProjects();
  }, []);

  // 숨김/해제 핸들러
  const handleToggleHide = async (projectId: string) => {
    setFormLoading(true);
    try {
      if (hiddenProjectIds.includes(projectId)) {
        // 숨김 해제
        const { error } = await (supabase as unknown as SupabaseClient)
          .from('project_hidden')
          .delete()
          .eq('project_id', projectId);
        if (error) throw error;
      } else {
        // 숨기기
        const { error } = await (supabase as unknown as SupabaseClient)
          .from('project_hidden')
          .upsert({ project_id: projectId });
        if (error) throw error;
      }
      await fetchHiddenProjects();
    } catch (e) {
      toast({
        title: 'Error',
        description: '숨김 처리 중 오류가 발생했습니다.',
        variant: 'destructive'
      });
    }
    setFormLoading(false);
  };

  // 폼 열기
  const openForm = (project?: Project) => {
    if (project) {
      setEditingProject(project.id);
    } else {
      setEditingProject(null);
    }
    setShowForm(true);
  };

  // 폼 닫기 및 성공 처리
  const handleFormClose = () => {
    setShowForm(false);
    setEditingProject(null);
  };

  const handleDeleteProject = async (id: string) => {
    if (!window.confirm(t('projects_delete_confirm', '정말로 이 프로젝트를 삭제하시겠습니까?'))) return;

    const { error } = await deleteProject(id);
    if (error) {
      toast({
        title: t('error', 'Error'),
        description: t('projects_delete_error', '프로젝트 삭제에 실패했습니다.'),
        variant: 'destructive'
      });
    } else {
      toast({
        title: t('success', 'Success'),
        description: t('projects_delete_success', '프로젝트가 삭제되었습니다.')
      });
    }
  };

  // 프로젝트 목록 필터링
  const getVisibleProjects = () => {
    if (isAdmin) return projects;
    return projects.filter(p => !hiddenProjectIds.includes(p.id));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />

        <ProjectsHero
          isAdmin={isAdmin}
          onAddProject={() => openForm()}
        />

        <ProjectsGridSkeleton category="construction" />
        <ProjectsStats />
        <ProjectsGridSkeleton category="other" />

        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <ProjectsHero
        isAdmin={isAdmin}
        onAddProject={() => openForm()}
      />

      <ProjectsGrid
        projects={getVisibleProjects()}
        category="construction"
        title=""
        description=""
        isAdmin={isAdmin}
        hiddenProjectIds={hiddenProjectIds}
        isMobile={isMobile}
        formLoading={formLoading}
        onEditProject={openForm}
        onDeleteProject={handleDeleteProject}
        onToggleHide={handleToggleHide}
      />

      <ProjectsStats />

      <ProjectsGrid
        projects={getVisibleProjects()}
        category="other"
        title={t('projects_various_title')}
        description={t('projects_various_desc')}
        isAdmin={isAdmin}
        hiddenProjectIds={hiddenProjectIds}
        isMobile={isMobile}
        formLoading={formLoading}
        onEditProject={openForm}
        onDeleteProject={handleDeleteProject}
        onToggleHide={handleToggleHide}
      />

      <ProjectForm
        isOpen={showForm}
        editingProject={editingProject}
        onClose={handleFormClose}
        onSuccess={handleFormClose}
      />

      <Footer />
    </div>
  );
};

export default Projects;
