
import React from 'react';
import { MessageCircle, CheckCircle, Clock } from 'lucide-react';

interface QnAStatsProps {
  totalInquiries: number;
  answeredCount: number;
  pendingCount: number;
}

const QnAStats: React.FC<QnAStatsProps> = ({
  totalInquiries,
  answeredCount,
  pendingCount
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
      <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
        <div className="flex items-center">
          <div className="bg-blue-100 p-2 md:p-3 rounded-lg">
            <MessageCircle className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
          </div>
          <div className="ml-3 md:ml-4">
            <p className="text-xs md:text-sm text-gray-600">전체 문의</p>
            <p className="text-xl md:text-2xl font-bold text-gray-900">{totalInquiries}</p>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
        <div className="flex items-center">
          <div className="bg-green-100 p-2 md:p-3 rounded-lg">
            <CheckCircle className="w-5 h-5 md:w-6 md:h-6 text-green-600" />
          </div>
          <div className="ml-3 md:ml-4">
            <p className="text-xs md:text-sm text-gray-600">답변 완료</p>
            <p className="text-xl md:text-2xl font-bold text-gray-900">{answeredCount}</p>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
        <div className="flex items-center">
          <div className="bg-yellow-100 p-2 md:p-3 rounded-lg">
            <Clock className="w-5 h-5 md:w-6 md:h-6 text-yellow-600" />
          </div>
          <div className="ml-3 md:ml-4">
            <p className="text-xs md:text-sm text-gray-600">답변 대기</p>
            <p className="text-xl md:text-2xl font-bold text-gray-900">{pendingCount}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QnAStats;
