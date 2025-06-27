import React from 'react';
import { Search, ChevronDown, Plus, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';

interface QnAFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedStatus: string;
  setSelectedStatus: (status: string) => void;
  showForm: boolean;
  setShowForm: (show: boolean) => void;
  user: { id: string } | null;
}

const QnAFilters: React.FC<QnAFiltersProps> = ({
  searchTerm,
  setSearchTerm,
  selectedStatus,
  setSelectedStatus,
  showForm,
  setShowForm,
  user
}) => {
  const { t } = useLanguage();

  const statusFilter = [
    t('qna_filter_all', '전체'),
    t('qna_filter_unanswered', '답변대기'),
    t('qna_filter_answered', '답변완료')
  ];

  return (
    <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm border border-gray-100 mb-6 md:mb-8">
      <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 lg:items-center">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 md:w-5 md:h-5" />
          <input
            type="text"
            placeholder={t('qna_search_placeholder', '문의 제목이나 내용을 검색하세요')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 md:pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm md:text-base"
          />
        </div>

        {/* Status Filter */}
        <div className="relative w-full lg:w-48">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="appearance-none bg-white border border-gray-200 rounded-lg px-4 py-3 pr-8 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all w-full text-sm md:text-base"
          >
            {statusFilter.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        </div>

        {/* New Question Button */}
        {!user ? (
          <Link
            to="/auth"
            className="inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white px-4 md:px-6 py-3 rounded-lg font-semibold transition-all duration-200 shadow-sm hover:shadow-md text-sm md:text-base whitespace-nowrap"
          >
            <User className="w-4 h-4 mr-2" />
            {t('login_to_inquire', '로그인하여 문의하기')}
          </Link>
        ) : (
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 md:px-6 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center shadow-sm hover:shadow-md text-sm md:text-base whitespace-nowrap"
          >
            <Plus className="w-4 h-4 mr-2" />
            {t('qna_ask_question', '문의하기')}
          </button>
        )}
      </div>
    </div>
  );
};

export default QnAFilters;
