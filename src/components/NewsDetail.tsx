import React from 'react';
import { Calendar, ArrowLeft, User } from 'lucide-react';

interface NewsDetailProps {
  news: {
    id: string;
    title: string;
    content: string;
    created_at: string;
    author_id: string | null;
  };
  onBack: () => void;
}

const NewsDetail: React.FC<NewsDetailProps> = ({ news, onBack }) => {
  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-lg">
      <div className="p-8">
        <button
          onClick={onBack}
          className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          목록으로 돌아가기
        </button>

        <div className="mb-6">
          <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium mb-4 inline-block">
            공지사항
          </span>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{news.title}</h1>
          <div className="flex items-center text-sm text-gray-500 space-x-4">
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-1" />
              {new Date(news.created_at).toLocaleDateString('ko-KR')}
            </div>
            <div className="flex items-center">
              <User className="w-4 h-4 mr-1" />
              관리자
            </div>
          </div>
        </div>

        <div className="prose max-w-none">
          <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
            {news.content}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewsDetail;
