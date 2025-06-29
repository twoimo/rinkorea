import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useIsMobile } from '../../hooks/use-mobile';
import { useLanguage } from '@/contexts/LanguageContext';

interface Certificate {
  id: string;
  name: string;
  description: string;
  image_url: string;
  category: string;
  issue_date?: string;
  expiry_date?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
  // 다국어 필드
  name_ko?: string;
  name_en?: string;
  name_zh?: string;
  name_id?: string;
  description_ko?: string;
  description_en?: string;
  description_zh?: string;
  description_id?: string;
}

interface CertificateFormProps {
  isOpen: boolean;
  certificate: Certificate | null;
  onClose: () => void;
  onSave: (formData: Partial<Certificate>) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  success: string | null;
}

const CertificateForm: React.FC<CertificateFormProps> = ({
  isOpen,
  certificate,
  onClose,
  onSave,
  isLoading,
  error,
  success
}) => {
  const isMobile = useIsMobile();
  const { t } = useLanguage();
  const [formValues, setFormValues] = useState<Partial<Certificate>>(certificate || {});

  React.useEffect(() => {
    setFormValues(certificate || {});
  }, [certificate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(formValues);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-[120] p-4"
      style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
    >
      <div className={`bg-white rounded-lg shadow-lg relative w-full ${isMobile ? 'max-h-[90vh] overflow-y-auto' : 'max-w-4xl'}`}>
        <div className="sticky top-0 bg-white border-b p-4 sm:p-6 flex items-center justify-between">
          <h2 className="text-xl sm:text-2xl font-bold">
            {certificate ? t('certificates_form_edit_title', '인증서 수정') : t('certificates_form_add_title', '인증서 추가')}
          </h2>
          <button
            className="text-gray-400 hover:text-gray-700 p-2 touch-manipulation"
            onClick={onClose}
            aria-label={t('certificates_form_close', '닫기')}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-6">
          {/* 기본 정보 */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">기본 정보</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('certificates_form_image_url', '이미지 URL')}
                </label>
                <input
                  type="text"
                  value={formValues.image_url || ''}
                  onChange={(e) => setFormValues({ ...formValues, image_url: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('certificates_form_category', '카테고리')}
                </label>
                <select
                  value={formValues.category || ''}
                  onChange={(e) => setFormValues({ ...formValues, category: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">카테고리 선택</option>
                  <option value="patent">특허/상표</option>
                  <option value="certification">RIN-COAT 시험성적서</option>
                  <option value="rin_test">린코리아 시험성적서</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('certificates_form_issue_date', '발급일')}
                </label>
                <input
                  type="date"
                  value={formValues.issue_date || ''}
                  onChange={(e) => setFormValues({ ...formValues, issue_date: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('certificates_form_expiry_date', '만료일')}
                </label>
                <input
                  type="date"
                  value={formValues.expiry_date || ''}
                  onChange={(e) => setFormValues({ ...formValues, expiry_date: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* 다국어 이름 */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">인증서명 (다국어)</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  한국어
                </label>
                <input
                  type="text"
                  value={formValues.name_ko || formValues.name || ''}
                  onChange={(e) => setFormValues({ ...formValues, name_ko: e.target.value, name: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  English
                </label>
                <input
                  type="text"
                  value={formValues.name_en || ''}
                  onChange={(e) => setFormValues({ ...formValues, name_en: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  中文
                </label>
                <input
                  type="text"
                  value={formValues.name_zh || ''}
                  onChange={(e) => setFormValues({ ...formValues, name_zh: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Indonesia
                </label>
                <input
                  type="text"
                  value={formValues.name_id || ''}
                  onChange={(e) => setFormValues({ ...formValues, name_id: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* 다국어 설명 */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">설명 (다국어)</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  한국어
                </label>
                <textarea
                  value={formValues.description_ko || formValues.description || ''}
                  onChange={(e) => setFormValues({ ...formValues, description_ko: e.target.value, description: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent h-24"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  English
                </label>
                <textarea
                  value={formValues.description_en || ''}
                  onChange={(e) => setFormValues({ ...formValues, description_en: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent h-24"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  中文
                </label>
                <textarea
                  value={formValues.description_zh || ''}
                  onChange={(e) => setFormValues({ ...formValues, description_zh: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent h-24"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Indonesia
                </label>
                <textarea
                  value={formValues.description_id || ''}
                  onChange={(e) => setFormValues({ ...formValues, description_id: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent h-24"
                  rows={3}
                />
              </div>
            </div>
          </div>

          {/* 상태 메시지 */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
              {success}
            </div>
          )}

          {/* 액션 버튼 */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg touch-manipulation"
            >
              {t('cancel', '취소')}
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
            >
              {isLoading ? t('certificates_form_saving', '저장 중...') : t('certificates_form_save', '저장')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CertificateForm;
