import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Save, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';

interface NewsFormProps {
  onClose: () => void;
  onSave: (newsData: { title: string; content: string; published: boolean }) => Promise<void>;
  initialData?: {
    title: string;
    content: string;
    published: boolean;
  };
  isEdit?: boolean;
}

const NewsForm: React.FC<NewsFormProps> = ({ onClose, onSave, initialData, isEdit = false }) => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    content: initialData?.content || '',
    published: initialData?.published ?? true
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Portal과 body scroll 차단으로 완벽한 중앙 정렬
  useEffect(() => {
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
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim()) {
      setError(t('required_fields', '제목과 내용을 입력해주세요.'));
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await onSave(formData);
      onClose();
    } catch (err) {
      setError(t('submit_error', '저장에 실패했습니다.'));
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        margin: 0
      }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg w-full md:max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
        style={{
          position: 'relative',
          margin: 'auto',
          transform: 'none'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - 모바일 최적화 */}
        <div className="p-4 md:p-6 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center justify-between">
            <h2 className="text-lg md:text-xl font-bold text-gray-900">
              {isEdit ? t('news_form_title_edit', '공지사항 수정') : t('news_form_title_add', '새 공지사항 작성')}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-lg"
            >
              <X className="w-5 h-5 md:w-6 md:h-6" />
            </button>
          </div>
        </div>

        {/* Form - 스크롤 가능한 영역 */}
        <div className="flex-1 overflow-y-auto">
          <form onSubmit={handleSubmit} className="p-4 md:p-6 space-y-4 md:space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('news_form_title', '제목')}
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 md:px-4 py-3 text-sm md:text-base border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder={t('news_form_title', '제목을 입력하세요')}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('news_form_content', '내용')}
              </label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                rows={10}
                className="w-full px-3 md:px-4 py-3 text-sm md:text-base border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                placeholder={t('news_form_content', '내용을 입력하세요')}
                required
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="published"
                checked={formData.published}
                onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
              />
              <label htmlFor="published" className="ml-2 text-sm font-medium text-gray-700">
                {t('publish_immediately', '즉시 게시')}
              </label>
            </div>
          </form>
        </div>

        {/* Footer - 고정된 버튼 영역 */}
        <div className="p-4 md:p-6 border-t border-gray-200 bg-white flex-shrink-0">
          <div className="flex flex-col md:flex-row gap-3 md:gap-4">
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={loading}
              className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-6 md:px-8 py-3 rounded-lg font-semibold transition-all duration-200 shadow-sm hover:shadow-md flex items-center justify-center text-sm md:text-base"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {t('save', '저장')}
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-full md:w-auto bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 md:px-8 py-3 rounded-lg font-semibold transition-all duration-200 text-sm md:text-base"
            >
              {t('cancel', '취소')}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default NewsForm;
