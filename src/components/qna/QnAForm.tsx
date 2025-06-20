import React, { useState } from 'react';
import { Lock, Mail, Phone, User } from 'lucide-react';
import { Modal, ModalBody, ModalFooter, FormField, FormInput, FormTextarea, ActionButton } from '@/components/ui/modal';

interface QnAFormData {
  name: string;
  email: string;
  phone: string;
  title: string;
  content: string;
  is_private: boolean;
}

interface QnAFormProps {
  onSubmit: (data: QnAFormData) => Promise<void>;
  onClose: () => void;
  isSubmitting?: boolean;
}

const QnAForm: React.FC<QnAFormProps> = ({ onSubmit, onClose, isSubmitting = false }) => {
  const [formData, setFormData] = useState<QnAFormData>({
    name: '',
    email: '',
    phone: '',
    title: '',
    content: '',
    is_private: false
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: keyof QnAFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // 입력 시 해당 필드의 에러 제거
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = '이름을 입력해주세요.';
    }

    if (!formData.email.trim()) {
      newErrors.email = '이메일을 입력해주세요.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = '올바른 이메일 형식을 입력해주세요.';
    }

    if (!formData.title.trim()) {
      newErrors.title = '제목을 입력해주세요.';
    }

    if (!formData.content.trim()) {
      newErrors.content = '문의 내용을 입력해주세요.';
    } else if (formData.content.trim().length < 10) {
      newErrors.content = '문의 내용은 최소 10자 이상 입력해주세요.';
    }

    // 전화번호 유효성 검사 (선택사항이지만 입력된 경우)
    if (formData.phone && !/^[\d\s\-()]{10,}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = '올바른 전화번호 형식을 입력해주세요.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      // 전화번호 포맷팅
      const submitData = {
        ...formData,
        phone: formData.phone.trim(),
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        title: formData.title.trim(),
        content: formData.content.trim()
      };

      await onSubmit(submitData);
    }
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title="새 문의 작성"
      size="2xl"
    >
      <ModalBody>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 안내 메시지 */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-blue-800 mb-2">문의하기 안내</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• 문의사항은 영업일 기준 1-2일 내에 답변드립니다</li>
              <li>• 기술적인 문의사항은 상세한 정보를 포함해 주시면 더 정확한 답변이 가능합니다</li>
              <li>• 개인정보가 포함된 민감한 내용은 비공개 문의로 설정해 주세요</li>
            </ul>
          </div>

          {/* 연락처 정보 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField label="이름" required error={errors.name}>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <FormInput
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="성명을 입력하세요"
                  className="pl-10"
                  error={!!errors.name}
                />
              </div>
            </FormField>

            <FormField label="이메일" required error={errors.email}>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <FormInput
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="이메일 주소를 입력하세요"
                  className="pl-10"
                  error={!!errors.email}
                />
              </div>
            </FormField>

            <FormField label="전화번호" error={errors.phone} className="md:col-span-2">
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <FormInput
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="전화번호를 입력하세요 (선택사항)"
                  className="pl-10"
                  error={!!errors.phone}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                빠른 연락을 원하시면 전화번호를 입력해 주세요
              </p>
            </FormField>
          </div>

          {/* 문의 내용 */}
          <FormField label="제목" required error={errors.title}>
            <FormInput
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="문의 제목을 간단히 입력하세요"
              error={!!errors.title}
              maxLength={100}
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.title.length}/100자
            </p>
          </FormField>

          <FormField label="문의 내용" required error={errors.content}>
            <FormTextarea
              value={formData.content}
              onChange={(e) => handleInputChange('content', e.target.value)}
              placeholder="문의하고 싶은 내용을 자세히 작성해 주세요.&#10;&#10;예시:&#10;- 제품 사용법 문의&#10;- 기술 지원 요청&#10;- 견적 문의&#10;- 기타 궁금한 사항"
              rows={8}
              error={!!errors.content}
              className="resize-none"
            />
            <div className="flex justify-between items-center mt-2">
              <p className="text-xs text-gray-500">
                {formData.content.length}자 입력됨 (최소 10자)
              </p>
              <p className="text-xs text-gray-400">
                상세한 정보를 제공해주시면 더 정확한 답변이 가능합니다
              </p>
            </div>
          </FormField>

          {/* 공개 설정 */}
          <FormField label="공개 설정">
            <div className="bg-gray-50 rounded-lg p-4">
              <label className="flex items-start">
                <input
                  type="checkbox"
                  checked={formData.is_private}
                  onChange={(e) => handleInputChange('is_private', e.target.checked)}
                  className="mr-3 mt-1 rounded"
                />
                <div>
                  <div className="flex items-center">
                    <Lock className="w-4 h-4 text-gray-600 mr-2" />
                    <span className="text-sm font-medium text-gray-700">비공개 문의</span>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    체크하시면 본인과 관리자만 볼 수 있습니다. 개인정보나 민감한 내용이 포함된 경우 선택해 주세요.
                  </p>
                </div>
              </label>
            </div>
          </FormField>

          {/* 개인정보 처리 동의 */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-yellow-800 mb-2">개인정보 처리 안내</h4>
            <p className="text-xs text-yellow-700 leading-relaxed">
              문의 처리를 위해 수집된 개인정보는 답변 완료 후 1년간 보관되며,
              마케팅 목적으로 사용되지 않습니다. 자세한 내용은 개인정보처리방침을 참고해 주세요.
            </p>
          </div>
        </form>
      </ModalBody>

      <ModalFooter>
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 w-full">
          <div className="text-xs text-gray-500 order-2 sm:order-1">
            문의사항은 관리자 검토 후 답변드립니다
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
              문의 등록
            </ActionButton>
          </div>
        </div>
      </ModalFooter>
    </Modal>
  );
};

export default QnAForm;
