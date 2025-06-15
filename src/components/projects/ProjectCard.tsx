
import React from 'react';
import { ExternalLink, Calendar, MapPin, Edit2, Trash2, Eye, EyeOff } from 'lucide-react';
import type { Project } from '@/hooks/useProjects';

interface ProjectCardProps {
  project: Project;
  isAdmin: boolean;
  isHidden: boolean;
  isMobile: boolean;
  formLoading: boolean;
  onEdit: (project: Project) => void;
  onDelete: (id: string) => void;
  onToggleHide: (id: string) => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  isAdmin,
  isHidden,
  isMobile,
  formLoading,
  onEdit,
  onDelete,
  onToggleHide
}) => {
  const getImageUrl = (imagePath: string) => {
    if (imagePath.includes('://') || imagePath.startsWith('@')) return imagePath;
    return `/images/${imagePath}`;
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden group relative w-full mx-auto max-w-sm sm:max-w-none hover:shadow-xl transition-all duration-300">
      <div className="relative aspect-video overflow-hidden">
        <img
          src={getImageUrl(project.image)}
          alt={project.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 select-none pointer-events-none"
          loading="lazy"
          width={800}
          height={450}
          style={{ maxWidth: '100%', maxHeight: '450px' }}
        />
        {isAdmin && (
          <div className={`absolute top-3 right-3 flex gap-2 z-10 ${isMobile ? 'flex-col' : 'flex-row'}`}>
            <button
              className={`bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full p-3 sm:p-2 shadow touch-manipulation ${formLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={() => onToggleHide(project.id)}
              title={isHidden ? '노출 해제' : '숨기기'}
              disabled={formLoading}
              aria-label={isHidden ? '노출 해제' : '숨기기'}
            >
              {isHidden ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </button>
            <button
              className="bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-full p-3 sm:p-2 shadow touch-manipulation"
              onClick={() => onEdit(project)}
              title="수정"
              aria-label="수정"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              className="bg-red-100 hover:bg-red-200 text-red-700 rounded-full p-3 sm:p-2 shadow touch-manipulation"
              onClick={() => onDelete(project.id)}
              title="삭제"
              aria-label="삭제"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
      <div className="p-4 sm:p-6">
        <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">{project.title}</h3>
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-gray-600 mb-4">
          <div className="flex items-center gap-1">
            <MapPin className="w-4 h-4 flex-shrink-0" />
            <span>{project.location}</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4 flex-shrink-0" />
            <span>{project.date}</span>
          </div>
        </div>
        <p className="text-gray-600 mb-4 text-sm sm:text-base">{project.description}</p>
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
          {project.features.map((feature, index) => (
            <span
              key={index}
              className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs sm:text-sm whitespace-nowrap flex-shrink-0"
            >
              {feature}
            </span>
          ))}
        </div>
        <a
          href={project.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium text-sm sm:text-base touch-manipulation"
        >
          자세히 보기
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
};

export default ProjectCard;
