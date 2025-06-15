
import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { ExternalLink, Calendar, MapPin, Plus, Edit2, Trash2, X, Save, Eye, EyeOff } from 'lucide-react';
import { useProjects, type Project } from '@/hooks/useProjects';
import { useUserRole } from '@/hooks/useUserRole';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import type { SupabaseClient } from '@supabase/supabase-js';
import AutoScrollGrid from '@/components/AutoScrollGrid';
import { useCounter } from '@/hooks/useCounter';
import { useIsMobile } from '@/hooks/use-mobile';

const Projects = () => {
  const { projects, loading, createProject, updateProject, deleteProject } = useProjects();
  const { isAdmin } = useUserRole();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState<string | null>(null);
  const [formValues, setFormValues] = useState({
    title: '',
    location: '',
    date: '',
    image: '',
    description: '',
    url: '',
    features: [''],
    category: 'construction'
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [hiddenProjectIds, setHiddenProjectIds] = useState<string[]>([]);

  const projectCount = useCounter(1000);
  const satisfactionRate = useCounter(100);
  const yearsOfExperience = useCounter(12);

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
    setFormError(null);
    setFormSuccess(null);
    try {
      if (hiddenProjectIds.includes(projectId)) {
        // 숨김 해제
        const { error } = await (supabase as unknown as SupabaseClient)
          .from('project_hidden')
          .delete()
          .eq('project_id', projectId);
        if (error) setFormError(error.message);
        else setFormSuccess('노출되었습니다.');
      } else {
        // 숨기기
        const { error } = await (supabase as unknown as SupabaseClient)
          .from('project_hidden')
          .upsert({ project_id: projectId });
        if (error) setFormError(error.message);
        else setFormSuccess('숨김 처리되었습니다.');
      }
      await fetchHiddenProjects();
      setTimeout(() => setFormSuccess(null), 700);
    } catch (e) {
      setFormError(e instanceof Error ? e.message : String(e));
    }
    setFormLoading(false);
  };

  // 폼 열기
  const openForm = (project?: Project) => {
    if (project) {
      setEditingProject(project.id);
      setFormValues({
        title: project.title,
        location: project.location,
        date: project.date,
        image: project.image,
        description: project.description,
        url: project.url,
        features: project.features.length > 0 ? project.features : [''],
        category: project.category || 'construction'
      });
    } else {
      setEditingProject(null);
      setFormValues({
        title: '',
        location: '',
        date: '',
        image: '',
        description: '',
        url: '',
        features: [''],
        category: 'construction'
      });
    }
    setShowForm(true);
  };

  // 폼 닫기
  const closeForm = () => {
    setShowForm(false);
    setEditingProject(null);
    setFormValues({
      title: '',
      location: '',
      date: '',
      image: '',
      description: '',
      url: '',
      features: [''],
      category: 'construction'
    });
    setFormError(null);
    setFormSuccess(null);
  };

  const handleFormSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError(null);
    setFormSuccess(null);

    try {
      const payload = {
        ...formValues,
        features: formValues.features.filter(f => f.trim() !== '')
      };

      let result;
      if (editingProject) {
        result = await updateProject(editingProject, payload);
      } else {
        result = await createProject(payload);
      }

      if (result.error) {
        setFormError(result.error.message);
      } else {
        setFormSuccess('저장되었습니다.');
        setTimeout(() => {
          closeForm();
        }, 700);
      }
    } catch (e) {
      setFormError(e instanceof Error ? e.message : String(e));
    }
    setFormLoading(false);
  };

  const handleDeleteProject = async (id: string) => {
    if (!window.confirm('정말로 이 프로젝트를 삭제하시겠습니까?')) return;

    const { error } = await deleteProject(id);
    if (error) {
      toast({
        title: 'Error',
        description: '프로젝트 삭제에 실패했습니다.',
        variant: 'destructive'
      });
    } else {
      toast({
        title: 'Success',
        description: '프로젝트가 삭제되었습니다.'
      });
    }
  };

  const addFeature = () => {
    setFormValues(prev => ({
      ...prev,
      features: [...prev.features, '']
    }));
  };

  const updateFeature = (index: number, value: string) => {
    setFormValues(prev => ({
      ...prev,
      features: prev.features.map((f, i) => i === index ? value : f)
    }));
  };

  const removeFeature = (index: number) => {
    setFormValues(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };

  // 프로젝트 목록 필터링
  const getVisibleProjects = () => {
    if (isAdmin) return projects;
    return projects.filter(p => !hiddenProjectIds.includes(p.id));
  };

  const getImageUrl = (imagePath: string) => {
    if (imagePath.includes('://') || imagePath.startsWith('@')) return imagePath;
    return `/images/${imagePath}`;
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Section - Mobile Optimized */}
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
                onClick={() => openForm()}
                aria-label="프로젝트 추가"
              >
                <Plus className="w-5 h-5" /> 프로젝트 추가
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Projects Grid - Mobile Optimized */}
      <section className="py-12 sm:py-20">
        <div className="w-full">
          <AutoScrollGrid
            items={getVisibleProjects().filter(p => p.category === 'construction')}
            itemsPerRow={isMobile ? 1 : 4}
            renderItem={(project) => {
              const isHidden = hiddenProjectIds.includes(project.id);
              return (
                <div className="bg-white rounded-xl shadow-lg overflow-hidden group relative w-full mx-auto max-w-sm sm:max-w-none">
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
                          onClick={() => handleToggleHide(project.id)}
                          title={isHidden ? '노출 해제' : '숨기기'}
                          disabled={formLoading}
                          aria-label={isHidden ? '노출 해제' : '숨기기'}
                        >
                          {isHidden ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        </button>
                        <button
                          className="bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-full p-3 sm:p-2 shadow touch-manipulation"
                          onClick={() => openForm(project)}
                          title="수정"
                          aria-label="수정"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          className="bg-red-100 hover:bg-red-200 text-red-700 rounded-full p-3 sm:p-2 shadow touch-manipulation"
                          onClick={() => handleDeleteProject(project.id)}
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
            }}
          />
        </div>
      </section>

      {/* Mobile Optimized Modal Form */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 p-4">
          <div className={`bg-white rounded-lg shadow-lg relative w-full ${isMobile ? 'max-h-[90vh] overflow-y-auto' : 'max-w-lg'}`}>
            <div className="sticky top-0 bg-white border-b p-4 sm:p-6 flex items-center justify-between">
              <h2 className="text-xl sm:text-2xl font-bold">
                {editingProject ? '프로젝트 수정' : '프로젝트 추가'}
              </h2>
              <button
                className="text-gray-400 hover:text-gray-700 p-2 touch-manipulation"
                onClick={closeForm}
                aria-label="닫기"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form className="p-4 sm:p-6 space-y-4" onSubmit={handleFormSave}>
              <div>
                <label className="block text-sm font-medium mb-2">제목</label>
                <input
                  type="text"
                  value={formValues.title}
                  onChange={(e) => setFormValues({ ...formValues, title: e.target.value })}
                  className="w-full border border-gray-300 px-4 py-3 rounded-lg text-base focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">위치</label>
                <input
                  type="text"
                  value={formValues.location}
                  onChange={(e) => setFormValues({ ...formValues, location: e.target.value })}
                  className="w-full border border-gray-300 px-4 py-3 rounded-lg text-base focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">날짜</label>
                <input
                  type="text"
                  value={formValues.date}
                  onChange={(e) => setFormValues({ ...formValues, date: e.target.value })}
                  className="w-full border border-gray-300 px-4 py-3 rounded-lg text-base focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">이미지</label>
                <input
                  type="text"
                  value={formValues.image}
                  onChange={(e) => setFormValues({ ...formValues, image: e.target.value })}
                  className="w-full border border-gray-300 px-4 py-3 rounded-lg text-base focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">설명</label>
                <textarea
                  value={formValues.description}
                  onChange={(e) => setFormValues({ ...formValues, description: e.target.value })}
                  className="w-full border border-gray-300 px-4 py-3 rounded-lg text-base focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={4}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">URL</label>
                <input
                  type="url"
                  value={formValues.url}
                  onChange={(e) => setFormValues({ ...formValues, url: e.target.value })}
                  className="w-full border border-gray-300 px-4 py-3 rounded-lg text-base focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">카테고리</label>
                <select
                  value={formValues.category}
                  onChange={(e) => setFormValues({ ...formValues, category: e.target.value })}
                  className="w-full border border-gray-300 px-4 py-3 rounded-lg text-base focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="construction">시공 실적</option>
                  <option value="other">다양한 프로젝트</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">특징</label>
                <div className="space-y-3">
                  {formValues.features.map((feature, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        className="flex-1 border border-gray-300 px-4 py-3 rounded-lg text-base focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={feature}
                        onChange={e => updateFeature(index, e.target.value)}
                        placeholder="특징 입력"
                      />
                      <button
                        type="button"
                        className="px-3 py-3 text-red-600 hover:text-red-700 touch-manipulation"
                        onClick={() => removeFeature(index)}
                        aria-label="특징 삭제"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1 py-2 touch-manipulation"
                    onClick={addFeature}
                  >
                    <Plus className="w-4 h-4" /> 특징 추가
                  </button>
                </div>
              </div>
              {formError && (
                <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">{formError}</div>
              )}
              {formSuccess && (
                <div className="text-green-600 text-sm bg-green-50 p-3 rounded-lg">{formSuccess}</div>
              )}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <button
                  type="button"
                  className="flex-1 px-4 py-3 text-gray-600 hover:text-gray-700 border border-gray-300 rounded-lg touch-manipulation"
                  onClick={closeForm}
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 touch-manipulation"
                  disabled={formLoading}
                >
                  {formLoading ? '저장 중...' : '저장'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Stats Section - Mobile Optimized */}
      <section className="py-12 sm:py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">시공 실적</h2>
            <p className="text-lg sm:text-xl text-gray-600">
              다양한 분야에서 인정받는 린코리아의 기술력
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
            <div className="text-center bg-white p-6 rounded-lg shadow-sm">
              <div className="text-3xl sm:text-4xl font-bold text-blue-600 mb-2">{projectCount}+</div>
              <div className="text-gray-600">시공 프로젝트</div>
            </div>
            <div className="text-center bg-white p-6 rounded-lg shadow-sm">
              <div className="text-3xl sm:text-4xl font-bold text-green-600 mb-2">{satisfactionRate}%</div>
              <div className="text-gray-600">고객 만족도</div>
            </div>
            <div className="text-center bg-white p-6 rounded-lg shadow-sm">
              <div className="text-3xl sm:text-4xl font-bold text-purple-600 mb-2">{yearsOfExperience}+</div>
              <div className="text-gray-600">린코리아 제품군</div>
            </div>
          </div>
        </div>
      </section>

      {/* 다양한 프로젝트 섹션 - Mobile Optimized */}
      <section className="py-12 sm:py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">다양한 프로젝트</h2>
            <p className="text-lg sm:text-xl text-gray-600">
              린코리아의 프로젝트 사례
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {getVisibleProjects()
              .filter(p => p.category === 'other')
              .map((project) => (
                <div key={project.id} className="bg-white rounded-xl shadow-lg overflow-hidden group hover:shadow-xl transition-all duration-300">
                  <div className="relative aspect-video overflow-hidden">
                    <img
                      src={getImageUrl(project.image)}
                      alt={project.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                    {isAdmin && (
                      <div className={`absolute top-3 right-3 flex gap-2 z-10 ${isMobile ? 'flex-col' : 'flex-row'}`}>
                        <button
                          className={`bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full p-3 sm:p-2 shadow touch-manipulation ${formLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                          onClick={() => handleToggleHide(project.id)}
                          title={hiddenProjectIds.includes(project.id) ? '노출 해제' : '숨기기'}
                          disabled={formLoading}
                          aria-label={hiddenProjectIds.includes(project.id) ? '노출 해제' : '숨기기'}
                        >
                          {hiddenProjectIds.includes(project.id) ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        </button>
                        <button
                          className="bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-full p-3 sm:p-2 shadow touch-manipulation"
                          onClick={() => openForm(project)}
                          title="수정"
                          aria-label="수정"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          className="bg-red-100 hover:bg-red-200 text-red-700 rounded-full p-3 sm:p-2 shadow touch-manipulation"
                          onClick={() => handleDeleteProject(project.id)}
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
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-gray-500 mb-4">
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
                        <span key={index} className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs sm:text-sm whitespace-nowrap flex-shrink-0">
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
              ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Projects;
