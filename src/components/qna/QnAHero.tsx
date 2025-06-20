
import React from 'react';
import { Plus, User } from 'lucide-react';
import { Link } from 'react-router-dom';

interface QnAHeroProps {
  user: { id: string } | null;
  setShowForm: (show: boolean) => void;
}

const QnAHero: React.FC<QnAHeroProps> = ({ user, setShowForm }) => {
  return (
    <section className="bg-gradient-to-r from-blue-900 to-blue-700 text-white py-12 md:py-20">
      <div className="container mx-auto px-4">
        <div className="text-center">
          <h1 className="text-3xl md:text-5xl font-bold mb-4 md:mb-6">고객상담 및 문의</h1>
          <p className="text-base md:text-xl max-w-2xl mx-auto leading-relaxed">
            린코리아 제품에 대한 문의사항이 있으시면 언제든지 연락주세요.<br />
          </p>
          <div className="flex flex-col gap-3 justify-center mt-6 md:mt-8 px-4">
            {!user ? (
              <Link
                to="/auth"
                className="inline-flex items-center justify-center bg-white text-blue-900 px-6 md:px-8 py-3 md:py-4 rounded-lg font-semibold hover:bg-blue-50 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 max-w-sm mx-auto"
                aria-label="로그인하여 문의하기"
              >
                <User className="w-5 h-5 mr-2" aria-hidden="true" />
                로그인하여 문의하기
              </Link>
            ) : (
              <button
                onClick={() => setShowForm(true)}
                className="inline-flex items-center justify-center bg-white text-blue-900 px-6 md:px-8 py-3 md:py-4 rounded-lg font-semibold hover:bg-blue-50 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 max-w-sm mx-auto"
                aria-label="새 문의 작성"
              >
                <Plus className="w-5 h-5 mr-2" aria-hidden="true" />
                새 문의 작성
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default QnAHero;
