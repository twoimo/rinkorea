import React, { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import NewsDetail from '../components/NewsDetail';
import NewsHero from '../components/news/NewsHero';
import NewsList from '../components/news/NewsList';
import NewsModalManager from '../components/news/NewsModalManager';
import { useNews } from '@/hooks/useNews';
import { useNewsAdmin } from '@/hooks/useNewsAdmin';
import { useLanguage } from '@/contexts/LanguageContext';
import { useUserRole } from '@/hooks/useUserRole';

const News = () => {
  const { news, loading, refetch } = useNews();
  const { createNews, updateNews, deleteNews } = useNewsAdmin();
  const { t } = useLanguage();
  const { isAdmin } = useUserRole();
  const [selectedNews, setSelectedNews] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingNews, setEditingNews] = useState<string | null>(null);
  const [hiddenNews, setHiddenNews] = useState<Set<string>>(new Set());

  const displayNews = isAdmin ? news : news.filter(item => !hiddenNews.has(item.id));
  const selectedNewsItem = selectedNews ? displayNews.find(item => item.id === selectedNews) : null;
  const editingNewsItem = editingNews ? displayNews.find(item => item.id === editingNews) : null;

  const handleCreateNews = async (newsData: { title: string; content: string; published: boolean }) => {
    const result = await createNews(newsData);
    if (!result.error) {
      setShowForm(false);
      refetch();
    }
  };

  const handleUpdateNews = async (newsData: { title: string; content: string; published: boolean }) => {
    if (!editingNews) return;

    const result = await updateNews(editingNews, newsData);
    if (!result.error) {
      setEditingNews(null);
      refetch();
    }
  };

  const handleDeleteNews = async (newsId: string) => {
    if (!confirm(t('news_delete_confirm', '정말로 이 공지사항을 삭제하시겠습니까?'))) return;

    const result = await deleteNews(newsId);
    if (!result.error) {
      refetch();
    }
  };

  const handleToggleHideNews = (newsId: string) => {
    setHiddenNews(prev => {
      const newSet = new Set(prev);
      if (newSet.has(newsId)) {
        newSet.delete(newsId);
      } else {
        newSet.add(newsId);
      }
      return newSet;
    });
  };

  // 상세보기 모드
  if (selectedNewsItem) {
    return (
      <div className="min-h-screen bg-white">
        <Header />

        <section className="py-8 md:py-20">
          <div className="container mx-auto px-4 max-w-4xl">
            <NewsDetail
              news={selectedNewsItem}
              onBack={() => setSelectedNews(null)}
              onDelete={handleDeleteNews}
              onUpdate={refetch}
            />
          </div>
        </section>

        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />

      <main>
        <NewsHero setShowForm={setShowForm} />

        <section className="py-8 md:py-20">
          <div className="container mx-auto px-4 max-w-6xl">
            <NewsList
              news={displayNews}
              loading={loading}
              hiddenNews={hiddenNews}
              onSelectNews={setSelectedNews}
              onEditNews={setEditingNews}
              onDeleteNews={handleDeleteNews}
              onToggleHideNews={handleToggleHideNews}
            />
          </div>
        </section>
      </main>

      <NewsModalManager
        showForm={showForm}
        editingNews={editingNews}
        editingNewsItem={editingNewsItem}
        onCloseForm={() => setShowForm(false)}
        onCloseEdit={() => setEditingNews(null)}
        onCreateNews={handleCreateNews}
        onUpdateNews={handleUpdateNews}
      />

      <Footer />
    </div>
  );
};

export default News;
