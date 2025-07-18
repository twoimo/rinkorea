import React from 'react';
import { ExternalLink, Calendar, MapPin, Edit2, Trash2, Eye, EyeOff } from 'lucide-react';
import type { Project } from '@/hooks/useProjects';
import { useLanguage, getLocalizedValue, getLocalizedArray } from '@/contexts/LanguageContext';

interface ProjectCardProps {
  project: Project;
  isAdmin: boolean;
  isHidden: boolean;
  _isMobile: boolean;
  formLoading: boolean;
  onEdit: (project: Project) => void;
  onDelete: (id: string) => void;
  onToggleHide: (id: string) => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  isAdmin,
  isHidden,
  _isMobile,
  formLoading,
  onEdit,
  onDelete,
  onToggleHide
}) => {
  const { language, t } = useLanguage();

  const getImageUrl = (imagePath: string) => {
    if (imagePath.includes('://') || imagePath.startsWith('@')) return imagePath;
    return `/images/${imagePath}`;
  };

  // 언어별 데이터 가져오기
  const localizedTitle = getLocalizedValue(project, 'title', language);
  const localizedLocation = getLocalizedValue(project, 'location', language);
  const localizedDescription = getLocalizedValue(project, 'description', language);
  const localizedFeatures = getLocalizedArray(project, 'features', language);

  // 디버깅: 프로젝트 카드 데이터 변경 감지
  React.useEffect(() => {
    console.log(`🎴 ProjectCard ${project.id} data:`, {
      projectTitle: project.title,
      projectData: project,
      localizedTitle,
      localizedLocation,
      localizedDescription,
      language,
      updated_at: project.updated_at,
      timestamp: new Date().toLocaleTimeString()
    });
  }, [project, localizedTitle, localizedLocation, localizedDescription, language]);

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden group relative w-full h-full flex flex-col">
      <div className="relative w-full h-[210px] sm:h-[260px] overflow-hidden">
        <img
          src={getImageUrl(project.image)}
          alt={localizedTitle}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 select-none pointer-events-none"
          loading="lazy"
          width={800}
          height={600}
        />
        {isAdmin && (
          <div className="absolute top-2 right-2 flex gap-2">
            <button
              onClick={() => onToggleHide(project.id)}
              className="bg-white p-2 rounded-full hover:bg-gray-100 transition-colors touch-manipulation"
              disabled={formLoading}
            >
              {isHidden ? (
                <Eye className="w-4 h-4 text-gray-600" />
              ) : (
                <EyeOff className="w-4 h-4 text-gray-600" />
              )}
            </button>
            <button
              onClick={() => onEdit(project)}
              className="bg-white p-2 rounded-full hover:bg-gray-100 transition-colors touch-manipulation"
              disabled={formLoading}
            >
              <Edit2 className="w-4 h-4 text-blue-600" />
            </button>
            <button
              onClick={() => onDelete(project.id)}
              className="bg-white p-2 rounded-full hover:bg-gray-100 transition-colors touch-manipulation"
              disabled={formLoading}
            >
              <Trash2 className="w-4 h-4 text-red-600" />
            </button>
          </div>
        )}
      </div>
      <div className="p-4 sm:p-6 flex flex-col flex-1">
        <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 line-clamp-1">{localizedTitle}</h3>
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-gray-600 mb-4">
          <div className="flex items-center gap-1">
            <MapPin className="w-4 h-4 flex-shrink-0" />
            <span className="line-clamp-1">{localizedLocation}</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4 flex-shrink-0" />
            <span>{project.date}</span>
          </div>
        </div>
        <p className="text-gray-600 mb-4 text-sm sm:text-base line-clamp-2">{localizedDescription}</p>
        <div className="flex flex-wrap gap-2 mb-4">
          {localizedFeatures && localizedFeatures.map((feature, index) => (
            <span
              key={index}
              className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs sm:text-sm line-clamp-1"
            >
              {feature}
            </span>
          ))}
        </div>
        <div className="mt-auto">
          <a
            href={project.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium text-sm sm:text-base touch-manipulation"
          >
            {t('hero_projects_btn', '자세히 보기')}
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;
