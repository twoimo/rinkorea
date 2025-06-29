import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Plus, Save } from 'lucide-react';
import { useProjects, type Project } from '@/hooks/useProjects';
import { useIsMobile } from '@/hooks/use-mobile';

interface ProjectFormProps {
    isOpen: boolean;
    editingProject: string | null;
    onClose: () => void;
    onSuccess: () => void;
}

const ProjectForm: React.FC<ProjectFormProps> = ({ isOpen, editingProject, onClose, onSuccess }) => {
    const { projects, createProject, updateProject } = useProjects();
    const isMobile = useIsMobile();

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

    React.useEffect(() => {
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

    // Portal과 body scroll 차단
    useEffect(() => {
        if (isOpen) {
            // 1. 강제로 맨 위로 스크롤
            window.scrollTo({ top: 0, behavior: 'instant' });

            // 2. Body scroll 완전 차단
            const originalOverflow = document.body.style.overflow;
            const originalPosition = document.body.style.position;
            const originalTop = document.body.style.top;
            const scrollY = window.scrollY;

            document.body.style.overflow = 'hidden';
            document.body.style.position = 'fixed';
            document.body.style.top = `-${scrollY}px`;
            document.body.style.width = '100%';

            // 청소 함수
            return () => {
                document.body.style.overflow = originalOverflow;
                document.body.style.position = originalPosition;
                document.body.style.top = originalTop;
                document.body.style.width = '';
                window.scrollTo(0, scrollY);
            };
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return createPortal(
        <div
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
            style={{
                position: 'fixed !important',
                top: '0 !important',
                left: '0 !important',
                right: '0 !important',
                bottom: '0 !important',
                display: 'flex !important',
                alignItems: 'center !important',
                justifyContent: 'center !important',
                zIndex: '9999 !important',
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                margin: '0 !important',
                padding: '1rem'
            }}
            onClick={onClose}
        >
            <div
                className="bg-white rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto relative"
                style={{
                    position: 'relative !important',
                    margin: 'auto !important',
                    transform: 'none !important'
                }}
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

                <div className="flex-1 overflow-y-auto">
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
                </div>
            </div>
        </div>,
        document.body
    );
};

export default ProjectForm;
