import React, { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import AdminOnly from '../components/AdminOnly';
import NewsDetail from '../components/NewsDetail';
import NewsForm from '../components/NewsForm';
import { Calendar, ArrowRight, Plus, Edit, Trash2 } from 'lucide-react';
import { useNews } from '@/hooks/useNews';
import { useNewsAdmin } from '@/hooks/useNewsAdmin';
import { useUserRole } from '@/hooks/useUserRole';

const News = () => {
  const { news, loading, refetch } = useNews();
  const { createNews, updateNews, deleteNews } = useNewsAdmin();
  const { isAdmin } = useUserRole();
  const [selectedNews, setSelectedNews] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingNews, setEditingNews] = useState<string | null>(null);

  // 기본 더미 데이터 (실제 데이터가 없을 때)
  const defaultNews = [
    {
      id: '1',
      title: "건설기계사업부 신설 안내",
      content: "린코리아가 2024년 건설기계사업부를 신설하여 사업 영역을 확장합니다.",
      created_at: "2024-01-20",
      published: true,
      author_id: null
    },
    {
      id: '2',
      title: "RIN-COAT 신제품 출시",
      content: "향상된 성능의 RIN-COAT 신제품이 출시되었습니다. 기존 제품 대비 30% 향상된 내구성을 제공합니다.",
      created_at: "2024-01-15",
      published: true,
      author_id: null
    }
  ];

  const displayNews = news.length > 0 ? news : defaultNews;
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
    if (!confirm('정말로 이 공지사항을 삭제하시겠습니까?')) return;

    const result = await deleteNews(newsId);
    if (!result.error) {
      refetch();
    }
  };

  // 상세보기 모드
  if (selectedNewsItem) {
    return (
      <div className="min-h-screen bg-white">
        <Header />

        <section className="py-20">
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

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-900 to-blue-700 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-6">공지사항</h1>
            <p className="text-xl max-w-2xl mx-auto">
              린코리아의 최신 소식과 중요한 공지사항을 확인하세요.
            </p>
            <AdminOnly>
              <div className="mt-8">
                <button
                  onClick={() => setShowForm(true)}
                  className="inline-flex items-center bg-white text-blue-900 px-8 py-4 rounded-lg font-semibold hover:bg-blue-50 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  새 공지사항 작성
                </button>
              </div>
            </AdminOnly>
          </div>
        </div>
      </section>

      {/* News List */}
      <section className="py-20">
        <div className="container mx-auto px-4 max-w-4xl">
          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-500">로딩 중...</p>
            </div>
          ) : (
            <div className="space-y-8">
              {displayNews.map((newsItem) => (
                <article key={newsItem.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                        공지사항
                      </span>
                      <AdminOnly>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setEditingNews(newsItem.id)}
                            className="text-blue-600 hover:text-blue-700 p-1"
                            title="수정"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteNews(newsItem.id)}
                            className="text-red-600 hover:text-red-700 p-1"
                            title="삭제"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </AdminOnly>
                    </div>

                    <h2
                      className="text-2xl font-bold text-gray-900 mb-3 hover:text-blue-600 transition-colors cursor-pointer"
                      onClick={() => setSelectedNews(newsItem.id)}
                    >
                      {newsItem.title}
                    </h2>

                    <p className="text-gray-600 mb-4 line-clamp-2">
                      {newsItem.content}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-sm text-gray-500 space-x-4">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {new Date(newsItem.created_at).toLocaleDateString('ko-KR')}
                        </div>
                      </div>

                      <button
                        onClick={() => setSelectedNews(newsItem.id)}
                        className="text-blue-600 hover:text-blue-700 font-medium flex items-center transition-colors"
                      >
                        자세히 보기
                        <ArrowRight className="w-4 h-4 ml-1" />
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}

          {!loading && displayNews.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">공지사항이 없습니다.</p>
            </div>
          )}
        </div>
      </section>

      {/* News Form Modal */}
      {(showForm || editingNews) && (
        <NewsForm
          onClose={() => {
            setShowForm(false);
            setEditingNews(null);
          }}
          onSave={editingNews ? handleUpdateNews : handleCreateNews}
          initialData={editingNewsItem ? {
            title: editingNewsItem.title,
            content: editingNewsItem.content,
            published: editingNewsItem.published
          } : undefined}
          isEdit={!!editingNews}
        />
      )}

      <Footer />
    </div>
  );
};

export default News;
