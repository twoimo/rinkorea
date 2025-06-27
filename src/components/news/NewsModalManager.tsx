import React from 'react';
import NewsForm from '../NewsForm';
import { useLanguage } from '@/contexts/LanguageContext';

interface NewsModalManagerProps {
  showForm: boolean;
  editingNews: string | null;
  editingNewsItem: any;
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
  const { t } = useLanguage();

  return (
    <>
      {/* 새 공지 추가 폼 */}
      {showForm && (
        <NewsForm
          title={t('news_form_title_add', '새 공지 작성')}
          onClose={onCloseForm}
          onSave={onCreateNews}
        />
      )}

      {/* 공지 수정 폼 */}
      {editingNews && editingNewsItem && (
        <NewsForm
          title={t('news_form_title_edit', '공지 수정')}
          initialData={editingNewsItem}
          onClose={onCloseEdit}
          onSave={onUpdateNews}
        />
      )}
    </>
  );
};

export default NewsModalManager;
