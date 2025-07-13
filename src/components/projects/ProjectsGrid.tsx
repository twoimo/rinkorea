
import React, { useState } from 'react';
import AutoScrollGrid from '@/components/AutoScrollGrid';
import ProjectCard from './ProjectCard';
import type { Project } from '@/hooks/useProjects';

interface ProjectsGridProps {
  projects: Project[];
  category: 'construction' | 'other';
  title: string;
  description: string;
  isAdmin: boolean;
  hiddenProjectIds: string[];
  isMobile: boolean;
  formLoading: boolean;
  onEditProject: (project: Project) => void;
  onDeleteProject: (id: string) => void;
  onToggleHide: (id: string) => void;
}

const ProjectsGrid: React.FC<ProjectsGridProps> = ({
  projects,
  category,
  title,
  description,
  isAdmin,
  hiddenProjectIds,
  isMobile,
  formLoading,
  onEditProject,
  onDeleteProject,
  onToggleHide
}) => {
  const filteredProjects = projects.filter(p => p.category === category);
  const PAGE_SIZE = 12;
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const visibleProjects = filteredProjects.slice(0, visibleCount);
  const hasMore = visibleCount < filteredProjects.length;

  function handleLoadMore() {
    setVisibleCount(count => Math.min(count + PAGE_SIZE, filteredProjects.length));
  }

  if (category === 'construction') {
    return (
      <section className="py-12 sm:py-20">
        <div className="w-full">
          <AutoScrollGrid
            items={visibleProjects}
            renderItem={(project) => (
              <ProjectCard
                key={project.id}
                project={project}
                isAdmin={isAdmin}
                isHidden={hiddenProjectIds.includes(project.id)}
                _isMobile={isMobile}
                formLoading={formLoading}
                onEdit={onEditProject}
                onDelete={onDeleteProject}
                onToggleHide={onToggleHide}
              />
            )}
          />
          {hasMore && (
            <div className="flex justify-center mt-8">
              <button
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-base"
                onClick={handleLoadMore}
              >
                더보기
              </button>
            </div>
          )}
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 sm:py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">{title}</h2>
          <p className="text-lg sm:text-xl text-gray-600">{description}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {visibleProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              isAdmin={isAdmin}
              isHidden={hiddenProjectIds.includes(project.id)}
              _isMobile={isMobile}
              formLoading={formLoading}
              onEdit={onEditProject}
              onDelete={onDeleteProject}
              onToggleHide={onToggleHide}
            />
          ))}
        </div>
        {hasMore && (
          <div className="flex justify-center mt-8">
            <button
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-base"
              onClick={handleLoadMore}
            >
              더보기
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default ProjectsGrid;
