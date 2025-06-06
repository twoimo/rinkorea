
import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Calendar, Eye, ArrowRight } from 'lucide-react';
import { useNews } from '@/hooks/useNews';

const News = () => {
  const { news, loading } = useNews();

  // 기본 더미 데이터 (실제 데이터가 없을 때)
  const defaultNews = [
    {
      id: '1',
      title: "건설기계사업부 신설 안내",
      content: "린코리아가 2024년 건설기계사업부를 신설하여 사업 영역을 확장합니다.",
      created_at: "2024-01-20",
      published: true
    },
    {
      id: '2', 
      title: "RIN-COAT 신제품 출시",
      content: "향상된 성능의 RIN-COAT 신제품이 출시되었습니다. 기존 제품 대비 30% 향상된 내구성을 제공합니다.",
      created_at: "2024-01-15",
      published: true
    }
  ];

  const displayNews = news.length > 0 ? news : defaultNews;

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-900 to-blue-700 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-6">공지사항</h1>
            <p className="text-xl max-w-2xl mx-auto">
              린코리아의 최신 소식과 중요한 공지사항을 
              확인하세요.
            </p>
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
                    <div className="flex items-center gap-2 mb-3">
                      <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                        공지사항
                      </span>
                    </div>
                    
                    <h2 className="text-2xl font-bold text-gray-900 mb-3 hover:text-blue-600 transition-colors cursor-pointer">
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
                      
                      <button className="text-blue-600 hover:text-blue-700 font-medium flex items-center transition-colors">
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

      <Footer />
    </div>
  );
};

export default News;
