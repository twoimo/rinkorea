
import React from 'react';
import { MessageCircle, Plus } from 'lucide-react';

interface QnAEmptyStateProps {
  searchTerm: string;
  selectedStatus: string;
  user: { id: string } | null;
  setShowForm: (show: boolean) => void;
}

const QnAEmptyState: React.FC<QnAEmptyStateProps> = ({
  searchTerm,
  selectedStatus,
  user,
  setShowForm
}) => {
  const hasFilters = searchTerm || selectedStatus !== '전체';

  return (
    <div className="bg-white rounded-xl p-8 md:p-12 shadow-sm border border-gray-100 text-center">
      <MessageCircle className="w-12 h-12 md:w-16 md:h-16 text-gray-300 mx-auto mb-4" />
      <h3 className="text-base md:text-lg font-medium text-gray-900 mb-2">
        {hasFilters ? '검색 결과가 없습니다' : '아직 문의사항이 없습니다'}
      </h3>
      <p className="text-gray-500 mb-6 text-sm md:text-base">
        {hasFilters
          ? '다른 검색어나 필터를 시도해보세요'
          : '첫 번째 문의를 남겨주세요'
        }
      </p>
      {!hasFilters && user && (
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 md:px-6 py-3 rounded-lg font-semibold transition-all duration-200 inline-flex items-center text-sm md:text-base"
        >
          <Plus className="w-4 h-4 mr-2" />
          문의하기
        </button>
      )}
    </div>
  );
};

export default QnAEmptyState;
