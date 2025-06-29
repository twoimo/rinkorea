import React from 'react';
import { Calendar, Eye, Edit, Trash2 } from 'lucide-react';
import { useUserRole } from '@/hooks/useUserRole';
import { useLanguage } from '@/contexts/LanguageContext';

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
  const { isAdmin } = useUserRole();
  const { t } = useLanguage();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const getPreviewText = (content: string) => {
    const textContent = content.replace(/<[^>]*>/g, '');
    return textContent.length > 150 ? textContent.substring(0, 150) + '...' : textContent;
  };

  return (
    <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-2 line-clamp-2">
            {newsItem.title}
          </h3>
          <p className="text-gray-600 mb-4 line-clamp-3 text-sm md:text-base">
            {getPreviewText(newsItem.content)}
          </p>
          <div className="flex items-center text-gray-400 text-xs md:text-sm">
            <Calendar className="w-3 h-3 md:w-4 md:h-4 mr-2" />
            <span>{formatDate(newsItem.created_at)}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
          <button
            onClick={() => onSelect(newsItem.id)}
            className="flex items-center bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 md:px-4 py-2 rounded-lg font-medium transition-all duration-200 text-xs md:text-sm"
          >
            <Eye className="w-3 h-3 md:w-4 md:h-4 mr-2" />
            {t('news_view_detail', '자세히 보기')}
          </button>

          {isAdmin && (
            <>
              <button
                onClick={() => onEdit(newsItem.id)}
                className="flex items-center bg-yellow-50 hover:bg-yellow-100 text-yellow-700 px-3 md:px-4 py-2 rounded-lg font-medium transition-all duration-200 text-xs md:text-sm"
              >
                <Edit className="w-3 h-3 md:w-4 md:h-4 mr-2" />
                {t('edit', '수정')}
              </button>
              <button
                onClick={() => onDelete(newsItem.id)}
                className="flex items-center bg-red-50 hover:bg-red-100 text-red-700 px-3 md:px-4 py-2 rounded-lg font-medium transition-all duration-200 text-xs md:text-sm"
              >
                <Trash2 className="w-3 h-3 md:w-4 md:h-4 mr-2" />
                {t('delete', '삭제')}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default NewsListItem;
