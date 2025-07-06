
import React from 'react';
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

  if (category === 'construction') {
    return (
      <section className="py-12 sm:py-20">
        <div className="w-full">
          <AutoScrollGrid
            items={filteredProjects}
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
          {filteredProjects.map((project) => (
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
      </div>
    </section>
  );
};

export default ProjectsGrid;
