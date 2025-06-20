import React, { useState, useEffect } from 'react';
import { Image as ImageIcon } from 'lucide-react';
import { Modal, ModalBody, ModalFooter, FormField, FormInput, FormTextarea, FormSelect, ActionButton } from '@/components/ui/modal';
import { getImageUrl, handleImageError } from '@/lib/utils';

interface Certificate {
  id?: string;
  title: string;
  description?: string;
  image_url: string;
  category: string;
  issue_date?: string;
  expiry_date?: string;
  issuer?: string;
  certificate_number?: string;
  is_active: boolean;
}

interface CertificateFormProps {
  isOpen: boolean;
  certificate?: Certificate | null;
  onClose: () => void;
  onSave: (certificate: Omit<Certificate, 'id'>) => void;
  isLoading?: boolean;
  error?: string | null;
  success?: string | null;
}

const CertificateForm: React.FC<CertificateFormProps> = ({
  isOpen,
  certificate,
  onClose,
  onSave,
  isLoading = false,
  error,
  success
}) => {
  const [formValues, setFormValues] = useState<Omit<Certificate, 'id'>>({
    title: '',
    description: '',
    image_url: '',
    category: '',
    issue_date: '',
    expiry_date: '',
    issuer: '',
    certificate_number: '',
    is_active: true
  });

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (certificate) {
      setFormValues({
        title: certificate.title || '',
        description: certificate.description || '',
        image_url: certificate.image_url || '',
        category: certificate.category || '',
        issue_date: certificate.issue_date || '',
        expiry_date: certificate.expiry_date || '',
        issuer: certificate.issuer || '',
        certificate_number: certificate.certificate_number || '',
        is_active: certificate.is_active !== false
      });
    } else {
      setFormValues({
        title: '',
        description: '',
        image_url: '',
        category: '',
        issue_date: '',
        expiry_date: '',
        issuer: '',
        certificate_number: '',
        is_active: true
      });
    }
    setValidationErrors({});
  }, [certificate, isOpen]);

  const handleInputChange = (field: keyof typeof formValues, value: string | boolean) => {
    setFormValues(prev => ({ ...prev, [field]: value }));

    // 입력 시 해당 필드의 에러 제거
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formValues.title.trim()) {
      errors.title = '인증서 제목을 입력해주세요.';
    }

    if (!formValues.image_url.trim()) {
      errors.image_url = '이미지 URL을 입력해주세요.';
    }

    if (!formValues.category) {
      errors.category = '카테고리를 선택해주세요.';
    }

    // 날짜 유효성 검사
    if (formValues.issue_date && formValues.expiry_date) {
      const issueDate = new Date(formValues.issue_date);
      const expiryDate = new Date(formValues.expiry_date);

      if (issueDate > expiryDate) {
        errors.expiry_date = '만료일은 발급일보다 늦어야 합니다.';
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      // 빈 문자열을 undefined로 변환하여 데이터베이스에 null로 저장되도록 함
      const submitData = {
        ...formValues,
        description: formValues.description?.trim() || undefined,
        issue_date: formValues.issue_date || undefined,
        expiry_date: formValues.expiry_date || undefined,
        issuer: formValues.issuer?.trim() || undefined,
        certificate_number: formValues.certificate_number?.trim() || undefined,
      };

      onSave(submitData);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={certificate ? '인증서 수정' : '새 인증서 추가'}
      size="2xl"
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
            <FormField label="인증서 제목" required error={validationErrors.title} className="md:col-span-2">
              <FormInput
                value={formValues.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="인증서 제목을 입력하세요"
                error={!!validationErrors.title}
              />
            </FormField>

            <FormField label="카테고리" required error={validationErrors.category}>
              <FormSelect
                value={formValues.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                error={!!validationErrors.category}
              >
                <option value="">카테고리 선택</option>
                <option value="patent">특허 및 상표</option>
                <option value="certification">RIN-COAT 시험성적서</option>
                <option value="rin_test">린코리아 시험성적서</option>
              </FormSelect>
            </FormField>

            <FormField label="발급기관">
              <FormInput
                value={formValues.issuer}
                onChange={(e) => handleInputChange('issuer', e.target.value)}
                placeholder="발급기관을 입력하세요"
              />
            </FormField>
          </div>

          <FormField label="설명">
            <FormTextarea
              value={formValues.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="인증서에 대한 설명을 입력하세요"
              rows={3}
            />
          </FormField>

          {/* 이미지 */}
          <FormField label="이미지 URL" required error={validationErrors.image_url}>
            <div className="space-y-3">
              <FormInput
                value={formValues.image_url}
                onChange={(e) => handleInputChange('image_url', e.target.value)}
                placeholder="이미지 URL을 입력하세요"
                error={!!validationErrors.image_url}
              />

              {formValues.image_url && (
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                  <ImageIcon className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  <img
                    src={getImageUrl(formValues.image_url)}
                    alt="인증서 미리보기"
                    className="w-20 h-20 object-cover rounded border shadow-sm"
                    onError={handleImageError}
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-700">이미지 미리보기</p>
                    <p className="text-xs text-gray-500 mt-1">인증서 이미지가 올바르게 표시되는지 확인하세요</p>
                  </div>
                </div>
              )}
            </div>
          </FormField>

          {/* 날짜 및 번호 정보 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField label="발급일">
              <FormInput
                type="date"
                value={formValues.issue_date}
                onChange={(e) => handleInputChange('issue_date', e.target.value)}
              />
            </FormField>

            <FormField label="만료일" error={validationErrors.expiry_date}>
              <FormInput
                type="date"
                value={formValues.expiry_date}
                onChange={(e) => handleInputChange('expiry_date', e.target.value)}
                error={!!validationErrors.expiry_date}
              />
            </FormField>

            <FormField label="인증서 번호" className="md:col-span-2">
              <FormInput
                value={formValues.certificate_number}
                onChange={(e) => handleInputChange('certificate_number', e.target.value)}
                placeholder="인증서 번호를 입력하세요"
              />
            </FormField>
          </div>

          {/* 활성화 옵션 */}
          <FormField label="표시 설정">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formValues.is_active}
                onChange={(e) => handleInputChange('is_active', e.target.checked)}
                className="mr-3 rounded"
              />
              <span className="text-sm text-gray-700">인증서 활성화 (체크 해제 시 숨김 처리)</span>
            </label>
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
            {certificate ? '수정' : '추가'}
          </ActionButton>
        </div>
      </ModalFooter>
    </Modal>
  );
};

export default CertificateForm;
