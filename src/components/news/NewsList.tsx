
import React from 'react';
import NewsListItem from './NewsListItem';

interface NewsListProps {
  news: Array<{
    id: string;
    title: string;
    content: string;
    created_at: string;
    published: boolean;
  }>;
  loading: boolean;
  onSelectNews: (id: string) => void;
  onEditNews: (id: string) => void;
  onDeleteNews: (id: string) => void;
}

const NewsList: React.FC<NewsListProps> = ({
  news,
  loading,
  onSelectNews,
  onEditNews,
  onDeleteNews
}) => {
  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">로딩 중...</p>
      </div>
    );
  }

  if (news.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">공지사항이 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-8">
      {news.map((newsItem) => (
        <NewsListItem
          key={newsItem.id}
          newsItem={newsItem}
          onSelect={onSelectNews}
          onEdit={onEditNews}
          onDelete={onDeleteNews}
        />
      ))}
    </div>
  );
};

export default NewsList;
