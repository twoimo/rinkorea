
import React, { memo, useState, useCallback, Suspense } from 'react';
import { Calendar, MapPin, Building, Filter } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useOptimizedIntersectionObserver } from '@/hooks/useOptimizedIntersectionObserver';
import { OptimizedImage } from '@/components/ui/image';
import MobileOptimizedModal from '@/components/ui/mobile-optimized-modal';
import OptimizedButton from '@/components/ui/optimized-button';

interface Project {
  id: string;
  title: string;
  description: string;
  location: string;
  date: string;
  category: string;
  images: string[];
  details?: string;
}

const ProjectCard = memo(({ project, index, onViewDetails }: { 
  project: Project; 
  index: number;
  onViewDetails: (project: Project) => void;
}) => {
  const { targetRef, isIntersecting } = useOptimizedIntersectionObserver();

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'commercial':
        return 'bg-blue-100 text-blue-800';
      case 'industrial':
        return 'bg-green-100 text-green-800';
      case 'residential':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div 
      ref={targetRef}
      className={`transition-all duration-700 transform ${
        isIntersecting ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow group">
        <div className="relative aspect-video overflow-hidden">
          <Suspense fallback={<LoadingSpinner />}>
            <OptimizedImage
              src={project.images[0]}
              alt={project.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          </Suspense>
          <div className="absolute top-4 left-4">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(project.category)}`}>
              {project.category}
            </span>
          </div>
        </div>
        
        <div className="p-4 sm:p-6">
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 line-clamp-2">
            {project.title}
          </h3>
          <p className="text-sm sm:text-base text-gray-600 mb-4 leading-relaxed line-clamp-2">
            {project.description}
          </p>
          
          <div className="space-y-2 mb-4">
            <div className="flex items-center text-sm text-gray-500">
              <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
              <span className="truncate">{project.location}</span>
            </div>
            <div className="flex items-center text-sm text-gray-500">
              <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
              <span>{new Date(project.date).toLocaleDateString('ko-KR')}</span>
            </div>
          </div>
          
          <OptimizedButton
            onClick={() => onViewDetails(project)}
            className="w-full"
            size="sm"
          >
            프로젝트 상세보기
          </OptimizedButton>
        </div>
      </div>
    </div>
  );
});

ProjectCard.displayName = 'ProjectCard';

const Projects = memo(() => {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const [projects] = useState<Project[]>([
    {
      id: '1',
      title: '현대건설기계 군산공장 세라믹 코팅',
      description: '대규모 산업시설의 방화 코팅 작업을 성공적으로 완료했습니다.',
      location: '전북 군산시',
      date: '2024-03-15',
      category: 'industrial',
      images: ['/images/현대건설기계 군산공장001.jpg', '/images/현대건설기계 군산공장002.jpg'],
      details: '총 시공면적 15,000㎡에 달하는 대규모 프로젝트로, 고온 환경에서의 방화 성능을 요구하는 산업시설에 최적화된 세라믹 코팅을 적용했습니다.'
    },
    {
      id: '2',
      title: '인하대 CGV타워 린코트 시공',
      description: '복합문화시설의 안전성 강화를 위한 세라믹 코팅 프로젝트입니다.',
      location: '인천광역시',
      date: '2024-02-20',
      category: 'commercial',
      images: ['/images/인하대 CGV타워 린코트  (5).jpeg'],
      details: '다중이용시설의 화재 안전성을 높이기 위해 린코트 제품을 사용한 전면 코팅 작업을 진행했습니다.'
    },
    {
      id: '3',
      title: '순창농협창고 신축공사',
      description: '농업시설의 화재 방지를 위한 전문 코팅 솔루션을 제공했습니다.',
      location: '전북 순창군',
      date: '2024-01-10',
      category: 'commercial',
      images: ['/images/순창농협창고동신축 (4).jpeg'],
      details: '농산물 저장시설의 특성을 고려한 맞춤형 세라믹 코팅으로 화재 위험을 최소화했습니다.'
    }
  ]);

  const categories = [
    { value: 'all', label: '전체' },
    { value: 'industrial', label: '산업시설' },
    { value: 'commercial', label: '상업시설' },
    { value: 'residential', label: '주거시설' }
  ];

  const filteredProjects = selectedCategory === 'all' 
    ? projects 
    : projects.filter(project => project.category === selectedCategory);

  const handleViewDetails = useCallback((project: Project) => {
    setSelectedProject(project);
    setShowDetails(true);
  }, []);

  const handleCloseDetails = useCallback(() => {
    setShowDetails(false);
    setSelectedProject(null);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-900 to-blue-700 text-white py-12 sm:py-16 lg:py-20">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 lg:mb-6">
              시공사례
            </h1>
            <p className="text-lg sm:text-xl max-w-3xl mx-auto leading-relaxed">
              린코리아의 전문 기술력으로 완성된 <br className="hidden sm:inline" />
              다양한 세라믹 코팅 프로젝트를 확인하세요.
            </p>
          </div>
        </div>
      </section>

      {/* Filter Section */}
      <section className="py-8 bg-gray-50 sticky top-0 z-10">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center text-gray-700">
              <Filter className="w-5 h-5 mr-2" />
              <span className="font-medium">카테고리:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category.value}
                  onClick={() => setSelectedCategory(category.value)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors touch-manipulation ${
                    selectedCategory === category.value
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {category.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Projects Grid */}
      <section className="py-12 sm:py-16 lg:py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {filteredProjects.map((project, index) => (
              <ProjectCard 
                key={project.id} 
                project={project} 
                index={index}
                onViewDetails={handleViewDetails}
              />
            ))}
          </div>
          
          {filteredProjects.length === 0 && (
            <div className="text-center py-12">
              <Building className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-600 mb-2">
                해당 카테고리의 프로젝트가 없습니다
              </h3>
              <p className="text-gray-500">다른 카테고리를 선택해보세요.</p>
            </div>
          )}
        </div>
      </section>

      {/* Project Details Modal */}
      <MobileOptimizedModal
        isOpen={showDetails}
        onClose={handleCloseDetails}
        title={selectedProject?.title || ''}
        maxWidth="xl"
      >
        {selectedProject && (
          <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {selectedProject.images.map((image, index) => (
                <Suspense key={index} fallback={<LoadingSpinner />}>
                  <OptimizedImage
                    src={image}
                    alt={`${selectedProject.title} - ${index + 1}`}
                    className="w-full h-48 object-cover rounded-lg"
                    loading="lazy"
                  />
                </Suspense>
              ))}
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <MapPin className="w-5 h-5 text-gray-500 mr-2" />
                <div>
                  <div className="text-sm text-gray-500">위치</div>
                  <div className="font-medium">{selectedProject.location}</div>
                </div>
              </div>
              <div className="flex items-center">
                <Calendar className="w-5 h-5 text-gray-500 mr-2" />
                <div>
                  <div className="text-sm text-gray-500">완료일</div>
                  <div className="font-medium">
                    {new Date(selectedProject.date).toLocaleDateString('ko-KR')}
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-3">프로젝트 설명</h4>
              <p className="text-gray-600 leading-relaxed mb-4">
                {selectedProject.description}
              </p>
              {selectedProject.details && (
                <p className="text-gray-600 leading-relaxed">
                  {selectedProject.details}
                </p>
              )}
            </div>
          </div>
        )}
      </MobileOptimizedModal>

      <Footer />
    </div>
  );
});

Projects.displayName = 'Projects';

export default Projects;
