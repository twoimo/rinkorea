
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">
              {isEdit ? '공지사항 수정' : '새 공지사항 작성'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              제목 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
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
              rows={12}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
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
          
          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-200 shadow-sm hover:shadow-md flex items-center"
            >
              <Save className="w-4 h-4 mr-2" />
              {loading ? '저장 중...' : (isEdit ? '수정 완료' : '저장하기')}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-8 py-3 rounded-lg font-semibold transition-all duration-200"
            >
              취소
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewsForm;
