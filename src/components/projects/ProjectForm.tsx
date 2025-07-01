import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, Plus } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useProjects } from '@/hooks/useProjects';
import { useIsMobile } from '@/hooks/use-mobile';
import { useLanguage } from '@/contexts/LanguageContext';

interface ProjectFormProps {
  isOpen: boolean;
  editingProject: string | null;
  onClose: () => void;
  onSuccess: () => void;
}

const ProjectForm: React.FC<ProjectFormProps> = ({ isOpen, editingProject, onClose, onSuccess }) => {
  const { projects, createProject, updateProject } = useProjects();
  const isMobile = useIsMobile();
  const { language: _language } = useLanguage();
  const modalRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number>();

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

  useEffect(() => {
    if (editingProject && projects.length > 0) {
      const project = projects.find(p => p.id === editingProject);
      if (project) {
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
      }
    } else {
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
  }, [editingProject, projects]);

  useEffect(() => {
    if (!isOpen) return;

    // 스크롤 차단 강화
    const originalBodyOverflow = document.body.style.overflow;
    const originalHtmlOverflow = document.documentElement.style.overflow;
    const originalBodyTouchAction = document.body.style.touchAction;

    // CSS로 스크롤 차단
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    document.body.style.touchAction = 'none';

    // 모달 내부 요소인지 확인하는 함수
    const isInsideModal = (target: EventTarget | null): boolean => {
      if (!target || !modalRef.current) return false;
      const element = target as Element;
      return modalRef.current.contains(element);
    };

    // 마우스 휠 스크롤 차단 (모달 외부만)
    const preventWheel = (e: WheelEvent) => {
      if (!isInsideModal(e.target)) {
        e.preventDefault();
      }
    };

    // 터치 스크롤 차단 (모달 외부만)
    const preventTouch = (e: TouchEvent) => {
      if (e.touches.length > 1) return; // 멀티터치는 허용
      if (!isInsideModal(e.target)) {
        e.preventDefault();
      }
    };

    // 키보드 스크롤 차단 (모달 외부만)
    const preventKeyScroll = (e: KeyboardEvent) => {
      const scrollKeys = [32, 33, 34, 35, 36, 37, 38, 39, 40]; // space, pageup, pagedown, end, home, left, up, right, down
      if (scrollKeys.includes(e.keyCode) && !isInsideModal(e.target)) {
        e.preventDefault();
      }
    };

    // 뷰포트 위치 계속 업데이트
    const updateModalPosition = () => {
      if (!modalRef.current) return;

      // 현재 뷰포트 정보 가져오기
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;

      // 모달을 현재 뷰포트 중앙에 정확히 배치
      const modalElement = modalRef.current;
      modalElement.style.position = 'absolute';
      modalElement.style.top = `${scrollTop}px`;
      modalElement.style.left = `${scrollLeft}px`;
      modalElement.style.width = `${viewportWidth}px`;
      modalElement.style.height = `${viewportHeight}px`;
      modalElement.style.zIndex = '2147483647';
      modalElement.style.backgroundColor = 'rgba(0, 0, 0, 0.3)';
      modalElement.style.display = 'flex';
      modalElement.style.alignItems = 'center';
      modalElement.style.justifyContent = 'center';
      modalElement.style.padding = '16px';
      modalElement.style.boxSizing = 'border-box';

      // 다음 프레임에서도 계속 업데이트
      animationFrameRef.current = requestAnimationFrame(updateModalPosition);
    };

    // 첫 위치 설정
    updateModalPosition();

    // ESC 키 이벤트
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !formLoading) {
        onClose();
      }
    };

    // 이벤트 리스너 등록
    document.addEventListener('keydown', handleEscape);
    document.addEventListener('wheel', preventWheel, { passive: false });
    document.addEventListener('touchmove', preventTouch, { passive: false });
    document.addEventListener('keydown', preventKeyScroll, { passive: false });

    return () => {
      // 이벤트 리스너 제거
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('wheel', preventWheel);
      document.removeEventListener('touchmove', preventTouch);
      document.removeEventListener('keydown', preventKeyScroll);

      // 스타일 복원
      document.body.style.overflow = originalBodyOverflow;
      document.documentElement.style.overflow = originalHtmlOverflow;
      document.body.style.touchAction = originalBodyTouchAction;

      // 애니메이션 프레임 정리
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isOpen, onClose, formLoading]);

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
          onSuccess();
        }, 700);
      }
    } catch (e) {
      setFormError(e instanceof Error ? e.message : String(e));
    }
    setFormLoading(false);
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

  if (!isOpen) return null;

  const modalContent = (
    <div
      ref={modalRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 2147483647,
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        boxSizing: 'border-box'
      }}
      onClick={!formLoading ? onClose : undefined}
    >
      <div
        className={`bg-white rounded-lg shadow-lg relative ${isMobile
          ? 'w-full max-h-[90vh] overflow-y-auto'
          : 'w-full max-w-4xl max-h-[90vh]'
          }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b p-4 sm:p-6 flex items-center justify-between">
          <h2 className="text-xl sm:text-2xl font-bold">
            {editingProject ? '프로젝트 수정' : '프로젝트 추가'}
          </h2>
          <button
            className="text-gray-400 hover:text-gray-700 p-2 touch-manipulation"
            onClick={onClose}
            aria-label="닫기"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <ScrollArea className="flex-1 overflow-hidden">
          <form className="p-4 sm:p-6" onSubmit={handleFormSave}>
            <div className={`${isMobile ? 'space-y-4' : 'grid grid-cols-2 gap-6'}`}>
              {/* 왼쪽 컬럼 */}
              <div className="space-y-4">
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
              </div>

              {/* 오른쪽 컬럼 */}
              <div className="space-y-4">
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
              </div>
            </div>

            {/* 하단 메시지 및 버튼 */}
            <div className="mt-6 space-y-4">
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
                  onClick={onClose}
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
            </div>
          </form>
        </ScrollArea>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default ProjectForm;
