
import React from 'react';
import NewsForm from '../NewsForm';

interface NewsModalManagerProps {
  showForm: boolean;
  editingNews: string | null;
  editingNewsItem?: {
    id: string;
    title: string;
    content: string;
    published: boolean;
  } | null;
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
  if (!showForm && !editingNews) {
    return null;
  }

  return (
    <NewsForm
      onClose={() => {
        onCloseForm();
        onCloseEdit();
      }}
      onSave={editingNews ? onUpdateNews : onCreateNews}
      initialData={editingNewsItem ? {
        title: editingNewsItem.title,
        content: editingNewsItem.content,
        published: editingNewsItem.published
      } : undefined}
      isEdit={!!editingNews}
    />
  );
};

export default NewsModalManager;
