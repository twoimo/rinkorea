import React from 'react';
import NewsForm from '../NewsForm';
import { useLanguage } from '@/contexts/LanguageContext';

interface NewsItem {
  id: string;
  title: string;
  content: string;
  published: boolean;
}

interface NewsModalManagerProps {
  showForm: boolean;
  editingNews: string | null;
  editingNewsItem: NewsItem | null;
  onCloseForm: () => void;
  onCloseEdit: () => void;
  onCreateNews: (newsData: { title: string; content: string; published: boolean }) => Promise<void>;
  onUpdateNews: (newsData: { title: string; content: string; published: boolean }) => Promise<void>;
}

const NewsModalManager: React.FC<NewsModalManagerProps> = ({
  showForm,
  editingNews,
  editingNewsItem,
  onCloseForm,
  onCloseEdit,
  onCreateNews,
  onUpdateNews
}) => {
  const { t: _t } = useLanguage();

  return (
    <>
      {/* 새 공지 추가 폼 */}
      {showForm && (
        <NewsForm
          onClose={onCloseForm}
          onSave={onCreateNews}
          isEdit={false}
        />
      )}

      {/* 공지 수정 폼 */}
      {editingNews && editingNewsItem && (
        <NewsForm
          initialData={editingNewsItem}
          onClose={onCloseEdit}
          onSave={onUpdateNews}
          isEdit={true}
        />
      )}
    </>
  );
};

export default NewsModalManager;
