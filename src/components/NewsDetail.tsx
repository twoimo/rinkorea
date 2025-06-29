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
      <div className="p-4 md:p-8">
        {/* 헤더 영역 - 모바일 최적화 */}
        <div className="flex items-center justify-between mb-4 md:mb-6 gap-4">
          <button
            onClick={onBack}
            className="inline-flex items-center text-blue-600 hover:text-blue-700 transition-colors px-2 py-1 hover:bg-blue-50 rounded-lg flex-shrink-0"
          >
            <ArrowLeft className="w-4 h-4 mr-1 md:mr-2" />
            <span className="text-sm md:text-base">목록으로</span>
          </button>
          <AdminOnly>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsEditing(true)}
                className="text-blue-600 hover:text-blue-700 p-2 hover:bg-blue-50 rounded-lg transition-colors"
                title="수정"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={() => onDelete?.(news.id)}
                className="text-red-600 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-colors"
                title="삭제"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </AdminOnly>
        </div>

        {/* 제목과 메타 정보 - 모바일 최적화 */}
        <div className="mb-6 md:mb-8">
          <span className="bg-blue-100 text-blue-800 px-2 md:px-3 py-1 rounded-full text-xs md:text-sm font-medium mb-3 md:mb-4 inline-block">
            공지사항
          </span>
          <h1 className="text-xl md:text-3xl font-bold text-gray-900 mb-3 md:mb-4 leading-tight">{news.title}</h1>
          <div className="flex flex-col md:flex-row md:items-center text-xs md:text-sm text-gray-500 space-y-2 md:space-y-0 md:space-x-4">
            <div className="flex items-center">
              <Calendar className="w-3 h-3 md:w-4 md:h-4 mr-1" />
              {new Date(news.created_at).toLocaleDateString('ko-KR')}
            </div>
            <div className="flex items-center">
              <User className="w-3 h-3 md:w-4 md:h-4 mr-1" />
              관리자
            </div>
          </div>
        </div>

        {/* 본문 내용 - 모바일 최적화 */}
        <div className="prose max-w-none">
          <div className="text-gray-700 leading-relaxed whitespace-pre-wrap text-sm md:text-base">
            {news.content}
          </div>
        </div>
      </div>

      {/* 수정 모달 - 모바일 최적화 */}
      {isEditing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[120] p-4">
          <div className="bg-white rounded-lg w-full md:max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* 헤더 */}
            <div className="p-4 md:p-6 border-b border-gray-200 flex-shrink-0">
              <div className="flex items-center justify-between">
                <h2 className="text-lg md:text-xl font-bold text-gray-900">
                  공지사항 수정
                </h2>
                <button
                  onClick={() => setIsEditing(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5 md:w-6 md:h-6" />
                </button>
              </div>
            </div>

            {/* 폼 영역 - 스크롤 가능 */}
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

            {/* 푸터 - 고정된 버튼 영역 */}
            <div className="p-4 md:p-6 border-t border-gray-200 bg-white flex-shrink-0">
              <div className="flex flex-col md:flex-row justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="w-full md:w-auto px-4 md:px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors text-sm md:text-base"
                >
                  취소
                </button>
                <button
                  type="submit"
                  onClick={handleSubmit}
                  className="w-full md:w-auto px-4 md:px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors text-sm md:text-base"
                >
                  수정 완료
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NewsDetail;
