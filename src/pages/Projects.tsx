import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { ExternalLink, Calendar, MapPin, Plus, Edit2, Trash2, X, Save, Eye, EyeOff } from 'lucide-react';
import { useProjects } from '@/hooks/useProjects';
import { useUserRole } from '@/hooks/useUserRole';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import type { SupabaseClient } from '@supabase/supabase-js';
import AutoScrollGrid from '@/components/AutoScrollGrid';
import { useCounter } from '@/hooks/useCounter';

const Projects = () => {
  const { projects, loading, createProject, updateProject, deleteProject } = useProjects();
  const { isAdmin } = useUserRole();
  const { toast } = useToast();
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
  const openForm = (project?: any) => {
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

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-900 to-blue-700 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-6">시공사례</h1>
            <p className="text-xl max-w-2xl mx-auto">
              린코리아의 린코트가 적용된 다양한 프로젝트를 통해 <br />
              우수한 품질과 성능을 확인하세요.
            </p>
            {isAdmin && (
              <button
                className="mt-8 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 mx-auto"
                onClick={() => openForm()}
                aria-label="프로젝트 추가"
              >
                <Plus className="w-5 h-5" /> 프로젝트 추가
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Projects Grid */}
      <section className="py-20 w-full">
        <div className="w-full">
          <AutoScrollGrid
            items={getVisibleProjects().filter(p => p.category === 'construction')}
            itemsPerRow={4}
            renderItem={(project) => {
              const isHidden = hiddenProjectIds.includes(project.id);
              return (
                <div className="bg-white rounded-xl shadow-lg overflow-hidden group relative w-full">
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
                      <div className="absolute top-3 right-3 flex gap-2 z-10">
                        <button
                          className={`bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full p-2 shadow ${formLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                          onClick={() => handleToggleHide(project.id)}
                          title={isHidden ? '노출 해제' : '숨기기'}
                          disabled={formLoading}
                          aria-label={isHidden ? '노출 해제' : '숨기기'}
                        >
                          {isHidden ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        </button>
                        <button
                          className="bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-full p-2 shadow"
                          onClick={() => openForm(project)}
                          title="수정"
                          aria-label="수정"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          className="bg-red-100 hover:bg-red-200 text-red-700 rounded-full p-2 shadow"
                          onClick={() => handleDeleteProject(project.id)}
                          title="삭제"
                          aria-label="삭제"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{project.title}</h3>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {project.location}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {project.date}
                      </div>
                    </div>
                    <p className="text-gray-600 mb-4">{project.description}</p>
                    <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
                      {project.features.map((feature, index) => (
                        <span
                          key={index}
                          className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm whitespace-nowrap flex-shrink-0"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>
                    <a
                      href={project.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
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

      {/* 프로젝트 추가/수정 모달 폼 */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-lg w-full relative">
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700"
              onClick={closeForm}
              aria-label="닫기"
            >
              <X className="w-6 h-6" />
            </button>
            <h2 className="text-2xl font-bold mb-4">
              {editingProject ? '프로젝트 수정' : '프로젝트 추가'}
            </h2>
            <form className="space-y-4" onSubmit={handleFormSave}>
              <div>
                <label className="block text-sm font-medium mb-1">제목</label>
                <input
                  type="text"
                  value={formValues.title}
                  onChange={(e) => setFormValues({ ...formValues, title: e.target.value })}
                  className="w-full border px-3 py-2 rounded"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">위치</label>
                <input
                  type="text"
                  value={formValues.location}
                  onChange={(e) => setFormValues({ ...formValues, location: e.target.value })}
                  className="w-full border px-3 py-2 rounded"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">날짜</label>
                <input
                  type="text"
                  value={formValues.date}
                  onChange={(e) => setFormValues({ ...formValues, date: e.target.value })}
                  className="w-full border px-3 py-2 rounded"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">이미지</label>
                <input
                  type="text"
                  value={formValues.image}
                  onChange={(e) => setFormValues({ ...formValues, image: e.target.value })}
                  className="w-full border px-3 py-2 rounded"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">설명</label>
                <textarea
                  value={formValues.description}
                  onChange={(e) => setFormValues({ ...formValues, description: e.target.value })}
                  className="w-full border px-3 py-2 rounded"
                  rows={4}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">URL</label>
                <input
                  type="url"
                  value={formValues.url}
                  onChange={(e) => setFormValues({ ...formValues, url: e.target.value })}
                  className="w-full border px-3 py-2 rounded"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">카테고리</label>
                <select
                  value={formValues.category}
                  onChange={(e) => setFormValues({ ...formValues, category: e.target.value })}
                  className="w-full border px-3 py-2 rounded"
                  required
                >
                  <option value="construction">시공 실적</option>
                  <option value="other">다양한 프로젝트</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">특징</label>
                <div className="space-y-2">
                  {formValues.features.map((feature, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        className="flex-1 border px-3 py-2 rounded"
                        value={feature}
                        onChange={e => updateFeature(index, e.target.value)}
                        placeholder="특징 입력"
                      />
                      <button
                        type="button"
                        className="px-3 py-2 text-red-600 hover:text-red-700"
                        onClick={() => removeFeature(index)}
                        aria-label="특징 삭제"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
                    onClick={addFeature}
                  >
                    <Plus className="w-4 h-4" /> 특징 추가
                  </button>
                </div>
              </div>
              {formError && (
                <div className="text-red-600 text-sm">{formError}</div>
              )}
              {formSuccess && (
                <div className="text-green-600 text-sm">{formSuccess}</div>
              )}
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  className="px-4 py-2 text-gray-600 hover:text-gray-700"
                  onClick={closeForm}
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                  disabled={formLoading}
                >
                  {formLoading ? '저장 중...' : '저장'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Stats Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">시공 실적</h2>
            <p className="text-xl text-gray-600">
              다양한 분야에서 인정받는 린코리아의 기술력
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">{projectCount}+</div>
              <div className="text-gray-600">시공 프로젝트</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">{satisfactionRate}%</div>
              <div className="text-gray-600">고객 만족도</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-600 mb-2">{yearsOfExperience}+</div>
              <div className="text-gray-600">린코리아 제품군</div>
            </div>
          </div>
        </div>
      </section>

      {/* 다양한 프로젝트 섹션 */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">다양한 프로젝트</h2>
            <p className="text-xl text-gray-600">
              린코리아의 프로젝트 사례
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
                      <div className="absolute top-3 right-3 flex gap-2 z-10">
                        <button
                          className={`bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full p-2 shadow ${formLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                          onClick={() => handleToggleHide(project.id)}
                          title={hiddenProjectIds.includes(project.id) ? '노출 해제' : '숨기기'}
                          disabled={formLoading}
                          aria-label={hiddenProjectIds.includes(project.id) ? '노출 해제' : '숨기기'}
                        >
                          {hiddenProjectIds.includes(project.id) ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        </button>
                        <button
                          className="bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-full p-2 shadow"
                          onClick={() => openForm(project)}
                          title="수정"
                          aria-label="수정"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          className="bg-red-100 hover:bg-red-200 text-red-700 rounded-full p-2 shadow"
                          onClick={() => handleDeleteProject(project.id)}
                          title="삭제"
                          aria-label="삭제"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{project.title}</h3>
                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        <span>{project.location}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{project.date}</span>
                      </div>
                    </div>
                    <p className="text-gray-600 mb-4">{project.description}</p>
                    <div className="flex gap-2 mb-4">
                      {project.features.map((feature, index) => (
                        <span key={index} className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm">
                          {feature}
                        </span>
                      ))}
                    </div>
                    <a
                      href={project.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
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
