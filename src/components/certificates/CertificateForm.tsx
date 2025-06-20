
import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useIsMobile } from '../../hooks/use-mobile';

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
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 p-4">
      <div className={`bg-white rounded-lg shadow-lg relative w-full ${isMobile ? 'max-h-[90vh] overflow-y-auto' : 'max-w-lg'}`}>
        <div className="sticky top-0 bg-white border-b p-4 sm:p-6 flex items-center justify-between">
          <h2 className="text-xl sm:text-2xl font-bold">{certificate ? '인증서 수정' : '인증서 추가'}</h2>
          <button
            className="text-gray-400 hover:text-gray-700 p-2 touch-manipulation"
            onClick={onClose}
            aria-label="닫기"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">이름</label>
            <input
              type="text"
              value={formValues.name || ''}
              onChange={(e) => setFormValues({ ...formValues, name: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">설명</label>
            <textarea
              value={formValues.description || ''}
              onChange={(e) => setFormValues({ ...formValues, description: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows={4}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">이미지 URL</label>
            <input
              type="text"
              value={formValues.image_url || ''}
              onChange={(e) => setFormValues({ ...formValues, image_url: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">카테고리</label>
            <select
              value={formValues.category || ''}
              onChange={(e) => setFormValues({ ...formValues, category: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">선택하세요</option>
              <option value="patent">특허 및 상표</option>
              <option value="certification">RIN-COAT 시험성적서</option>
              <option value="rin_test">린코리아 시험성적서</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">발급일</label>
            <input
              type="date"
              value={formValues.issue_date || ''}
              onChange={(e) => setFormValues({ ...formValues, issue_date: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">만료일</label>
            <input
              type="date"
              value={formValues.expiry_date || ''}
              onChange={(e) => setFormValues({ ...formValues, expiry_date: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {error && (
            <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">{error}</div>
          )}
          {success && (
            <div className="text-green-600 text-sm bg-green-50 p-3 rounded-lg">{success}</div>
          )}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 text-gray-600 hover:text-gray-700 border border-gray-300 rounded-lg touch-manipulation"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 touch-manipulation"
            >
              {isLoading ? '저장 중...' : '저장'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CertificateForm;
