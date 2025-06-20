import React, { useState, useEffect } from 'react';
import { Image as ImageIcon, Calendar } from 'lucide-react';
import { Modal, ModalBody, ModalFooter, FormField, FormInput, FormTextarea, FormSelect, ActionButton } from '@/components/ui/modal';
import { getImageUrl, handleImageError, formatDate } from '@/lib/utils';

interface Project {
  id?: string;
  title: string;
  description: string;
  location: string;
  client?: string;
  completion_date?: string;
  start_date?: string;
  category: string;
  image_url: string;
  project_scale?: string;
  budget?: number;
  is_featured: boolean;
  is_active: boolean;
}

interface ProjectFormProps {
  isOpen: boolean;
  project?: Project | null;
  onClose: () => void;
  onSave: (project: Omit<Project, 'id'>) => Promise<void>;
  isLoading?: boolean;
  error?: string | null;
  success?: string | null;
}

const ProjectForm: React.FC<ProjectFormProps> = ({
  isOpen,
  project,
  onClose,
  onSave,
  isLoading = false,
  error,
  success
}) => {
  const [formValues, setFormValues] = useState<Omit<Project, 'id'>>({
    title: '',
    description: '',
    location: '',
    client: '',
    completion_date: '',
    start_date: '',
    category: '',
    image_url: '',
    project_scale: '',
    budget: undefined,
    is_featured: false,
    is_active: true
  });

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (project) {
      setFormValues({
        title: project.title || '',
        description: project.description || '',
        location: project.location || '',
        client: project.client || '',
        completion_date: project.completion_date || '',
        start_date: project.start_date || '',
        category: project.category || '',
        image_url: project.image_url || '',
        project_scale: project.project_scale || '',
        budget: project.budget,
        is_featured: project.is_featured || false,
        is_active: project.is_active !== false
      });
    } else {
      setFormValues({
        title: '',
        description: '',
        location: '',
        client: '',
        completion_date: '',
        start_date: '',
        category: '',
        image_url: '',
        project_scale: '',
        budget: undefined,
        is_featured: false,
        is_active: true
      });
    }
    setValidationErrors({});
  }, [project, isOpen]);

  const handleInputChange = (field: keyof typeof formValues, value: string | number | boolean | undefined) => {
    setFormValues(prev => ({ ...prev, [field]: value }));

    // 입력 시 해당 필드의 에러 제거
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formValues.title.trim()) {
      errors.title = '프로젝트 제목을 입력해주세요.';
    }

    if (!formValues.description.trim()) {
      errors.description = '프로젝트 설명을 입력해주세요.';
    }

    if (!formValues.location.trim()) {
      errors.location = '프로젝트 위치를 입력해주세요.';
    }

    if (!formValues.category) {
      errors.category = '카테고리를 선택해주세요.';
    }

    if (!formValues.image_url.trim()) {
      errors.image_url = '이미지 URL을 입력해주세요.';
    }

    // 날짜 유효성 검사
    if (formValues.start_date && formValues.completion_date) {
      const startDate = new Date(formValues.start_date);
      const completionDate = new Date(formValues.completion_date);

      if (startDate > completionDate) {
        errors.completion_date = '완공일은 착공일보다 늦어야 합니다.';
      }
    }

    // 예산 유효성 검사
    if (formValues.budget !== undefined && formValues.budget < 0) {
      errors.budget = '예산은 0 이상의 값을 입력해주세요.';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      // 빈 문자열을 undefined로 변환하여 데이터베이스에 null로 저장되도록 함
      const submitData = {
        ...formValues,
        client: formValues.client?.trim() || undefined,
        start_date: formValues.start_date || undefined,
        completion_date: formValues.completion_date || undefined,
        project_scale: formValues.project_scale?.trim() || undefined,
        budget: formValues.budget || undefined,
      };

      await onSave(submitData);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={project ? '프로젝트 수정' : '새 프로젝트 추가'}
      size="3xl"
    >
      <ModalBody>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 에러/성공 메시지 */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {success && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-600 text-sm">{success}</p>
            </div>
          )}

          {/* 기본 정보 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField label="프로젝트 제목" required error={validationErrors.title} className="md:col-span-2">
              <FormInput
                value={formValues.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="프로젝트 제목을 입력하세요"
                error={!!validationErrors.title}
              />
            </FormField>

            <FormField label="위치" required error={validationErrors.location}>
              <FormInput
                value={formValues.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder="프로젝트 위치를 입력하세요"
                error={!!validationErrors.location}
              />
            </FormField>

            <FormField label="카테고리" required error={validationErrors.category}>
              <FormSelect
                value={formValues.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                error={!!validationErrors.category}
              >
                <option value="">카테고리 선택</option>
                <option value="공장">공장</option>
                <option value="창고">창고</option>
                <option value="상가">상가</option>
                <option value="주차장">주차장</option>
                <option value="주거">주거</option>
                <option value="공공시설">공공시설</option>
                <option value="기타">기타</option>
              </FormSelect>
            </FormField>

            <FormField label="고객사/발주처">
              <FormInput
                value={formValues.client || ''}
                onChange={(e) => handleInputChange('client', e.target.value)}
                placeholder="고객사명을 입력하세요 (선택사항)"
              />
            </FormField>

            <FormField label="프로젝트 규모">
              <FormInput
                value={formValues.project_scale || ''}
                onChange={(e) => handleInputChange('project_scale', e.target.value)}
                placeholder="예: 1,500㎡, 지하 1층~지상 3층"
              />
            </FormField>
          </div>

          <FormField label="프로젝트 설명" required error={validationErrors.description}>
            <FormTextarea
              value={formValues.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="프로젝트에 대한 상세한 설명을 입력하세요"
              rows={4}
              error={!!validationErrors.description}
            />
          </FormField>

          {/* 이미지 */}
          <FormField label="프로젝트 이미지 URL" required error={validationErrors.image_url}>
            <div className="space-y-3">
              <FormInput
                value={formValues.image_url}
                onChange={(e) => handleInputChange('image_url', e.target.value)}
                placeholder="이미지 URL을 입력하세요"
                error={!!validationErrors.image_url}
              />

              {formValues.image_url && (
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                  <ImageIcon className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  <img
                    src={getImageUrl(formValues.image_url)}
                    alt="프로젝트 이미지 미리보기"
                    className="w-24 h-24 object-cover rounded border shadow-sm"
                    onError={handleImageError}
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-700">이미지 미리보기</p>
                    <p className="text-xs text-gray-500 mt-1">프로젝트 대표 이미지가 올바르게 표시되는지 확인하세요</p>
                  </div>
                </div>
              )}
            </div>
          </FormField>

          {/* 날짜 및 예산 정보 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FormField label="착공일">
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <FormInput
                  type="date"
                  value={formValues.start_date || ''}
                  onChange={(e) => handleInputChange('start_date', e.target.value)}
                  className="pl-10"
                />
              </div>
            </FormField>

            <FormField label="완공일" error={validationErrors.completion_date}>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <FormInput
                  type="date"
                  value={formValues.completion_date || ''}
                  onChange={(e) => handleInputChange('completion_date', e.target.value)}
                  className="pl-10"
                  error={!!validationErrors.completion_date}
                />
              </div>
            </FormField>

            <FormField label="예산 (만원)" error={validationErrors.budget}>
              <FormInput
                type="number"
                value={formValues.budget || ''}
                onChange={(e) => handleInputChange('budget', e.target.value ? parseFloat(e.target.value) : undefined)}
                placeholder="예산을 입력하세요"
                min="0"
                step="100"
                error={!!validationErrors.budget}
              />
            </FormField>
          </div>

          {/* 프로젝트 정보 요약 */}
          {(formValues.start_date || formValues.completion_date || formValues.budget) && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-blue-800 mb-2">프로젝트 정보 요약</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-blue-700">
                {formValues.start_date && (
                  <div>
                    <span className="font-medium">착공일:</span> {formatDate(formValues.start_date)}
                  </div>
                )}
                {formValues.completion_date && (
                  <div>
                    <span className="font-medium">완공일:</span> {formatDate(formValues.completion_date)}
                  </div>
                )}
                {formValues.budget && (
                  <div>
                    <span className="font-medium">예산:</span> {formValues.budget.toLocaleString()}만원
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 표시 옵션 */}
          <FormField label="표시 설정">
            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formValues.is_featured}
                  onChange={(e) => handleInputChange('is_featured', e.target.checked)}
                  className="mr-3 rounded"
                />
                <div>
                  <span className="text-sm font-medium text-gray-700">대표 프로젝트로 표시</span>
                  <p className="text-xs text-gray-500">메인 페이지와 프로젝트 목록 상단에 표시됩니다</p>
                </div>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formValues.is_active}
                  onChange={(e) => handleInputChange('is_active', e.target.checked)}
                  className="mr-3 rounded"
                />
                <div>
                  <span className="text-sm font-medium text-gray-700">프로젝트 활성화</span>
                  <p className="text-xs text-gray-500">체크 해제 시 숨김 처리됩니다</p>
                </div>
              </label>
            </div>
          </FormField>
        </form>
      </ModalBody>

      <ModalFooter>
        <div className="flex flex-col sm:flex-row justify-end gap-3 w-full">
          <ActionButton
            type="button"
            variant="secondary"
            onClick={onClose}
            className="w-full sm:w-auto"
          >
            취소
          </ActionButton>
          <ActionButton
            onClick={handleSubmit}
            loading={isLoading}
            className="w-full sm:w-auto"
          >
            {project ? '수정' : '추가'}
          </ActionButton>
        </div>
      </ModalFooter>
    </Modal>
  );
};

export default ProjectForm;
