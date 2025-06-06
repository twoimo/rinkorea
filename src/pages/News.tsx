
import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Calendar, Eye, ArrowRight } from 'lucide-react';

const News = () => {
  const newsItems = [
    {
      id: 1,
      title: "건설기계사업부 신설 안내",
      summary: "린코리아가 2024년 건설기계사업부를 신설하여 사업 영역을 확장합니다.",
      date: "2024-01-20",
      views: 156,
      category: "공지사항",
      image: "https://images.unsplash.com/photo-1449157291145-7efd050a4d0e"
    },
    {
      id: 2,
      title: "RIN-COAT 신제품 출시",
      summary: "향상된 성능의 RIN-COAT 신제품이 출시되었습니다. 기존 제품 대비 30% 향상된 내구성을 제공합니다.",
      date: "2024-01-15",
      views: 203,
      category: "신제품",
      image: "https://images.unsplash.com/photo-1460574283810-2aab119d8511"
    },
    {
      id: 3,
      title: "2024년 설 연휴 휴무 안내",
      summary: "2024년 설 연휴 기간 중 휴무 일정을 안내드립니다.",
      date: "2024-01-10",
      views: 89,
      category: "휴무안내",
      image: "https://images.unsplash.com/photo-1431576901776-e539bd916ba2"
    },
    {
      id: 4,
      title: "용인 테크노밸리 프로젝트 완공",
      summary: "용인 테크노밸리 프로젝트가 성공적으로 완공되었습니다. RIN-COAT 제품이 적용되어 우수한 결과를 보였습니다.",
      date: "2024-01-05",
      views: 124,
      category: "프로젝트",
      image: "https://images.unsplash.com/photo-1518005020951-eccb494ad742"
    }
  ];

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
          <div className="space-y-8">
            {newsItems.map((news) => (
              <article key={news.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                <div className="md:flex">
                  <div className="md:w-1/3">
                    <img 
                      src={news.image} 
                      alt={news.title}
                      className="w-full h-48 md:h-full object-cover"
                    />
                  </div>
                  <div className="p-6 md:w-2/3">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                        {news.category}
                      </span>
                    </div>
                    
                    <h2 className="text-2xl font-bold text-gray-900 mb-3 hover:text-blue-600 transition-colors cursor-pointer">
                      {news.title}
                    </h2>
                    
                    <p className="text-gray-600 mb-4 line-clamp-2">
                      {news.summary}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-sm text-gray-500 space-x-4">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {news.date}
                        </div>
                        <div className="flex items-center">
                          <Eye className="w-4 h-4 mr-1" />
                          조회 {news.views}
                        </div>
                      </div>
                      
                      <button className="text-blue-600 hover:text-blue-700 font-medium flex items-center transition-colors">
                        자세히 보기
                        <ArrowRight className="w-4 h-4 ml-1" />
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex justify-center mt-12">
            <nav className="flex space-x-2">
              <button className="px-3 py-2 text-gray-500 hover:text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                이전
              </button>
              <button className="px-3 py-2 bg-blue-600 text-white rounded-lg">
                1
              </button>
              <button className="px-3 py-2 text-gray-500 hover:text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                2
              </button>
              <button className="px-3 py-2 text-gray-500 hover:text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                3
              </button>
              <button className="px-3 py-2 text-gray-500 hover:text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                다음
              </button>
            </nav>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default News;
