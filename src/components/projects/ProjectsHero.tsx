
import React from 'react';
import { Plus } from 'lucide-react';
import { useCounter } from '@/hooks/useCounter';

interface ProjectsHeroProps {
  isAdmin: boolean;
  onAddProject: () => void;
}

const ProjectsHero: React.FC<ProjectsHeroProps> = ({ isAdmin, onAddProject }) => {
  return (
    <section className="bg-gradient-to-r from-blue-900 to-blue-700 text-white py-12 sm:py-20">
      <div className="container mx-auto px-4">
        <div className="text-center">
          <h1 className="text-3xl sm:text-5xl font-bold mb-4 sm:mb-6">시공사례</h1>
          <p className="text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed">
            린코리아의 린코트가 적용된 다양한 프로젝트를 통해 <br className="hidden sm:block" />
            우수한 품질과 성능을 확인하세요.
          </p>
          {isAdmin && (
            <button
              className="mt-6 sm:mt-8 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 mx-auto touch-manipulation"
              onClick={onAddProject}
              aria-label="프로젝트 추가"
            >
              <Plus className="w-5 h-5" /> 프로젝트 추가
            </button>
          )}
        </div>
      </div>
    </section>
  );
};

export default ProjectsHero;
