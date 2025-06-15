
import React from 'react';
import { Plus } from 'lucide-react';
import AdminOnly from '../AdminOnly';

interface NewsHeroProps {
  setShowForm: (show: boolean) => void;
}

const NewsHero: React.FC<NewsHeroProps> = ({ setShowForm }) => {
  return (
    <section className="bg-gradient-to-r from-blue-900 to-blue-700 text-white py-12 md:py-20">
      <div className="container mx-auto px-4">
        <div className="text-center">
          <h1 className="text-3xl md:text-5xl font-bold mb-4 md:mb-6">공지사항</h1>
          <p className="text-base md:text-xl max-w-2xl mx-auto px-4">
            린코리아의 최신 소식과 중요한 공지사항을 확인하세요.
          </p>
          <AdminOnly>
            <div className="mt-6 md:mt-8">
              <button
                onClick={() => setShowForm(true)}
                className="inline-flex items-center bg-white text-blue-900 px-6 md:px-8 py-3 md:py-4 rounded-lg font-semibold hover:bg-blue-50 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 text-sm md:text-base"
                aria-label="새 공지사항 작성"
              >
                <Plus className="w-4 h-4 md:w-5 md:h-5 mr-2" aria-hidden="true" />
                새 공지사항 작성
              </button>
            </div>
          </AdminOnly>
        </div>
      </div>
    </section>
  );
};

export default NewsHero;
