import React, { useState, useEffect } from 'react';
import { Image as ImageIcon, X } from 'lucide-react';
import { Modal, ModalBody, ModalFooter, FormField, FormInput, FormTextarea, ActionButton } from '@/components/ui/modal';
import { getImageUrl, handleImageError } from '@/lib/utils';

interface News {
  id?: string;
  title: string;
  content: string;
  summary?: string;
  image_url?: string;
  is_featured: boolean;
  is_active: boolean;
  author_id?: string;
}

interface NewsFormProps {
  isOpen: boolean;
  news?: News | null;
  onSubmit: (news: Omit<News, 'id' | 'author_id'>) => Promise<void>;
  onClose: () => void;
  isSubmitting?: boolean;
  isEdit?: boolean;
}

const NewsForm: React.FC<NewsFormProps> = ({
  isOpen,
  news,
  onSubmit,
  onClose,
  isSubmitting = false,
  isEdit = false
}) => {
  const [formData, setFormData] = useState<Omit<News, 'id' | 'author_id'>>({
    title: '',
    content: '',
    summary: '',
    image_url: '',
    is_featured: false,
    is_active: true
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (news) {
      setFormData({
        title: news.title || '',
        content: news.content || '',
        summary: news.summary || '',
        image_url: news.image_url || '',
        is_featured: news.is_featured || false,
        is_active: news.is_active !== false
      });
    } else {
      setFormData({
        title: '',
        content: '',
        summary: '',
        image_url: '',
        is_featured: false,
        is_active: true
      });
    }
    setErrors({});
  }, [news, isOpen]);

  const handleInputChange = (field: keyof typeof formData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // 입력 시 해당 필드의 에러 제거
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = '제목을 입력해주세요.';
    }

    if (!formData.content.trim()) {
      newErrors.content = '내용을 입력해주세요.';
    }

    if (formData.content.trim().length < 10) {
      newErrors.content = '내용은 최소 10자 이상 입력해주세요.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      // 빈 문자열을 undefined로 변환
      const submitData = {
        ...formData,
        summary: formData.summary?.trim() || undefined,
        image_url: formData.image_url?.trim() || undefined,
      };

      await onSubmit(submitData);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? '공지사항 수정' : '새 공지사항 작성'}
      size="4xl"
      maxHeight="max-h-[95vh]"
    >
      <ModalBody>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 기본 정보 */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <FormField label="제목" required error={errors.title} className="lg:col-span-2">
              <FormInput
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="공지사항 제목을 입력하세요"
                error={!!errors.title}
              />
            </FormField>

            <FormField label="요약" className="lg:col-span-1">
              <FormInput
                value={formData.summary || ''}
                onChange={(e) => handleInputChange('summary', e.target.value)}
                placeholder="간단한 요약 (선택사항)"
                maxLength={100}
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.summary?.length || 0}/100자
              </p>
            </FormField>
          </div>

          {/* 이미지 */}
          <FormField label="대표 이미지">
            <div className="space-y-3">
              <FormInput
                value={formData.image_url || ''}
                onChange={(e) => handleInputChange('image_url', e.target.value)}
                placeholder="이미지 URL을 입력하세요 (선택사항)"
              />

              {formData.image_url && (
                <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                  <ImageIcon className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0" />
                  <div className="flex-1">
                    <img
                      src={getImageUrl(formData.image_url)}
                      alt="대표 이미지 미리보기"
                      className="w-full max-w-md h-48 object-cover rounded border shadow-sm"
                      onError={handleImageError}
                    />
                    <p className="text-sm text-gray-600 mt-2">대표 이미지 미리보기</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleInputChange('image_url', '')}
                    className="text-gray-400 hover:text-gray-600 p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </FormField>

          {/* 내용 */}
          <FormField label="내용" required error={errors.content}>
            <FormTextarea
              value={formData.content}
              onChange={(e) => handleInputChange('content', e.target.value)}
              placeholder="공지사항 내용을 입력하세요&#10;&#10;팁: 다음과 같은 형식을 사용할 수 있습니다:&#10;- 제목은 ## 으로 시작&#10;- 중요한 내용은 **굵게**&#10;- 링크는 [텍스트](URL) 형식"
              rows={15}
              error={!!errors.content}
              className="font-mono text-sm leading-relaxed"
            />
            <div className="flex justify-between items-center mt-2">
              <p className="text-xs text-gray-500">
                {formData.content.length}자 입력됨
              </p>
              <p className="text-xs text-gray-400">
                마크다운 문법을 사용할 수 있습니다
              </p>
            </div>
          </FormField>

          {/* 옵션 설정 */}
          <FormField label="게시 옵션">
            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.is_featured}
                  onChange={(e) => handleInputChange('is_featured', e.target.checked)}
                  className="mr-3 rounded"
                />
                <div>
                  <span className="text-sm font-medium text-gray-700">중요 공지로 표시</span>
                  <p className="text-xs text-gray-500">메인 페이지와 목록 상단에 표시됩니다</p>
                </div>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => handleInputChange('is_active', e.target.checked)}
                  className="mr-3 rounded"
                />
                <div>
                  <span className="text-sm font-medium text-gray-700">즉시 게시</span>
                  <p className="text-xs text-gray-500">체크 해제 시 임시저장 상태가 됩니다</p>
                </div>
              </label>
            </div>
          </FormField>

          {/* 미리보기 영역 */}
          {formData.title && formData.content && (
            <div className="border rounded-lg p-4 bg-gray-50">
              <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                📄 미리보기
              </h4>
              <div className="bg-white rounded p-4 border">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {formData.is_featured && (
                    <span className="inline-block bg-red-100 text-red-800 text-xs px-2 py-1 rounded mr-2">
                      중요
                    </span>
                  )}
                  {formData.title}
                </h3>
                {formData.summary && (
                  <p className="text-gray-600 text-sm mb-3 italic">
                    {formData.summary}
                  </p>
                )}
                {formData.image_url && (
                  <img
                    src={getImageUrl(formData.image_url)}
                    alt="미리보기"
                    className="w-full max-w-md h-32 object-cover rounded mb-3"
                    onError={handleImageError}
                  />
                )}
                <div className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap line-clamp-6">
                  {formData.content.substring(0, 300)}
                  {formData.content.length > 300 && '...'}
                </div>
              </div>
            </div>
          )}
        </form>
      </ModalBody>

      <ModalFooter>
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 w-full">
          <div className="text-xs text-gray-500 order-2 sm:order-1">
            {isEdit ? '수정사항은 즉시 반영됩니다' : '작성된 공지사항은 설정에 따라 게시됩니다'}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 order-1 sm:order-2 w-full sm:w-auto">
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
              loading={isSubmitting}
              className="w-full sm:w-auto"
            >
              {isEdit ? '수정 완료' : '게시하기'}
            </ActionButton>
          </div>
        </div>
      </ModalFooter>
    </Modal>
  );
};

export default NewsForm;
