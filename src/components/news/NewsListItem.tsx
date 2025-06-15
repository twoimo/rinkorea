
import React from 'react';
import { Calendar, ArrowRight, Edit, Trash2 } from 'lucide-react';
import AdminOnly from '../AdminOnly';

interface NewsListItemProps {
  newsItem: {
    id: string;
    title: string;
    content: string;
    created_at: string;
    published: boolean;
  };
  onSelect: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

const NewsListItem: React.FC<NewsListItemProps> = ({
  newsItem,
  onSelect,
  onEdit,
  onDelete
}) => {
  return (
    <article className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
      <div className="p-4 md:p-8">
        <div className="flex items-start justify-between mb-3 gap-2">
          <span className="bg-blue-100 text-blue-800 px-2 md:px-3 py-1 rounded-full text-xs md:text-sm font-medium flex-shrink-0">
            공지사항
          </span>
          <AdminOnly>
            <div className="flex items-center gap-1 md:gap-2 flex-shrink-0">
              <button
                onClick={() => onEdit(newsItem.id)}
                className="text-blue-600 hover:text-blue-700 p-2 md:p-1 hover:bg-blue-50 rounded-lg md:rounded-none md:hover:bg-transparent transition-colors"
                title="수정"
                aria-label="수정"
              >
                <Edit className="w-4 h-4" aria-hidden="true" />
              </button>
              <button
                onClick={() => onDelete(newsItem.id)}
                className="text-red-600 hover:text-red-700 p-2 md:p-1 hover:bg-red-50 rounded-lg md:rounded-none md:hover:bg-transparent transition-colors"
                title="삭제"
                aria-label="삭제"
              >
                <Trash2 className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          </AdminOnly>
        </div>

        <h2
          className="text-lg md:text-2xl font-bold text-gray-900 mb-2 md:mb-3 hover:text-blue-600 transition-colors cursor-pointer line-clamp-2 leading-tight"
          onClick={() => onSelect(newsItem.id)}
          aria-label="공지사항 상세보기"
        >
          {newsItem.title}
        </h2>

        <p className="text-gray-600 mb-3 md:mb-4 line-clamp-2 text-sm md:text-base">
          {newsItem.content}
        </p>

        <div className="flex items-center justify-between">
          <div className="flex items-center text-xs md:text-sm text-gray-500">
            <div className="flex items-center">
              <Calendar className="w-3 h-3 md:w-4 md:h-4 mr-1" aria-hidden="true" />
              {new Date(newsItem.created_at).toLocaleDateString('ko-KR')}
            </div>
          </div>

          <button
            onClick={() => onSelect(newsItem.id)}
            className="text-blue-600 hover:text-blue-700 font-medium flex items-center transition-colors text-sm md:text-base px-2 py-1 md:px-0 md:py-0 hover:bg-blue-50 md:hover:bg-transparent rounded"
            aria-label="자세히 보기"
          >
            자세히 보기
            <ArrowRight className="w-3 h-3 md:w-4 md:h-4 ml-1" aria-hidden="true" />
          </button>
        </div>
      </div>
    </article>
  );
};

export default NewsListItem;
