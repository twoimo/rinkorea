import React, { useState } from 'react';
import { Calendar, ArrowLeft, User, Edit, Trash2, X } from 'lucide-react';
import AdminOnly from './AdminOnly';
import { useNewsAdmin } from '@/hooks/useNewsAdmin';
import { useToast } from '@/hooks/use-toast';

interface NewsDetailProps {
  news: {
    id: string;
    title: string;
    content: string;
    created_at: string;
    published: boolean;
  };
  onBack: () => void;
  onDelete?: (id: string) => void;
  onUpdate?: () => void;
}

const NewsDetail: React.FC<NewsDetailProps> = ({ news, onBack, onDelete, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    title: news.title,
    content: news.content,
    published: news.published
  });
  const { updateNews } = useNewsAdmin();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = await updateNews(news.id, formData);
    if (!result.error) {
      toast({
        title: "공지사항이 수정되었습니다",
        description: "변경사항이 저장되었습니다."
      });
      setIsEditing(false);
      onUpdate?.();
    }
  };

  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-lg">
      <div className="p-8">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={onBack}
            className="inline-flex items-center text-blue-600 hover:text-blue-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            목록으로 돌아가기
          </button>
          <AdminOnly>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsEditing(true)}
                className="text-blue-600 hover:text-blue-700 p-1"
                title="수정"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={() => onDelete?.(news.id)}
                className="text-red-600 hover:text-red-700 p-1"
                title="삭제"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </AdminOnly>
        </div>

        <div className="mb-6">
          <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium mb-4 inline-block">
            공지사항
          </span>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{news.title}</h1>
          <div className="flex items-center text-sm text-gray-500 space-x-4">
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-1" />
              {new Date(news.created_at).toLocaleDateString('ko-KR')}
            </div>
            <div className="flex items-center">
              <User className="w-4 h-4 mr-1" />
              관리자
            </div>
          </div>
        </div>

        <div className="prose max-w-none">
          <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
            {news.content}
          </div>
        </div>
      </div>

      {/* 수정 모달 */}
      {isEditing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">
                  공지사항 수정
                </h2>
                <button
                  onClick={() => setIsEditing(false)}
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

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  수정 완료
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default NewsDetail;
