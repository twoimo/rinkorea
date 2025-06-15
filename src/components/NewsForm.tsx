
import React, { useState } from 'react';
import { X, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    content: initialData?.content || '',
    published: initialData?.published || false
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.content.trim()) {
      toast({
        title: "필수 항목을 입력해주세요",
        description: "제목과 내용을 모두 입력해주세요.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Error saving news:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end md:items-center justify-center z-50 p-0 md:p-4">
      <div className="bg-white rounded-t-2xl md:rounded-xl w-full md:max-w-4xl md:w-full h-[90vh] md:max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header - 모바일 최적화 */}
        <div className="p-4 md:p-6 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center justify-between">
            <h2 className="text-lg md:text-xl font-bold text-gray-900">
              {isEdit ? '공지사항 수정' : '새 공지사항 작성'}
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                제목 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 md:px-4 py-3 text-sm md:text-base border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="공지사항 제목을 입력하세요"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                내용 <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                rows={10}
                className="w-full px-3 md:px-4 py-3 text-sm md:text-base border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                placeholder="공지사항 내용을 입력하세요"
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
                즉시 게시
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
              <Save className="w-4 h-4 mr-2" />
              {loading ? '저장 중...' : (isEdit ? '수정 완료' : '저장하기')}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-full md:w-auto bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 md:px-8 py-3 rounded-lg font-semibold transition-all duration-200 text-sm md:text-base"
            >
              취소
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewsForm;
