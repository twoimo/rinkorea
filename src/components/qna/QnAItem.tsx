import React from 'react';
import { User, Calendar, CheckCircle, Clock, Lock, Edit, Trash2 } from 'lucide-react';
import QnAEditForm from './QnAEditForm';
import RepliesSection from './RepliesSection';
import { useUserRole } from '@/hooks/useUserRole';

interface Inquiry {
  id: string;
  user_id: string | null;
  name: string;
  email: string;
  phone: string | null;
  title: string;
  content: string;
  status: string;
  admin_reply: string | null;
  created_at: string;
  updated_at: string;
  is_private: boolean;
}

interface QnAItemProps {
  inquiry: Inquiry;
  user: any;
  onEdit: (id: string) => void;
  onDelete: (id: string) => Promise<any>;
  onRefetch: () => Promise<void>;
}

const QnAItem: React.FC<QnAItemProps> = ({
  inquiry,
  user,
  onEdit,
  onDelete,
  onRefetch
}) => {
  const { isAdmin } = useUserRole();
  const isOwner = user && inquiry.user_id === user.id;
  const canView = !inquiry.is_private || isOwner || isAdmin;
  const canShowContent = canView;

  const maskName = (name: string) => {
    if (isAdmin) return name;
    if (name.length <= 1) return name;
    return name[0] + '*'.repeat(name.length - 1);
  };

  const handleEditClick = () => {
    onEdit(inquiry.id);
  };

  const handleDeleteClick = async () => {
    if (confirm('정말로 이 문의를 삭제하시겠습니까?')) {
      await onDelete(inquiry.id);
    }
  };

  return (
    <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 md:mb-4 gap-3">
        {/* 상태 뱃지 */}
        <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 w-fit ${inquiry.status === '답변완료'
          ? 'bg-green-100 text-green-800'
          : 'bg-yellow-100 text-yellow-800'
          }`}>
          {inquiry.status === '답변완료' ? (
            <>
              <CheckCircle className="w-3 h-3" /> 답변완료
            </>
          ) : (
            <>
              <Clock className="w-3 h-3" /> 답변대기
            </>
          )}
        </span>

        {/* 사용자 정보 */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
          <div className="flex flex-wrap items-center text-xs md:text-sm text-gray-500 gap-2 sm:gap-3">
            <div className="flex items-center gap-1">
              <User className="w-3 h-3 md:w-4 md:h-4" />
              {maskName(inquiry.name)}
            </div>
            {isAdmin && (
              <>
                <div className="flex items-center gap-1">
                  <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">{inquiry.email}</span>
                </div>
                {inquiry.phone && (
                  <div className="flex items-center gap-1">
                    <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">{inquiry.phone}</span>
                  </div>
                )}
              </>
            )}
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3 md:w-4 md:h-4" />
              {new Date(inquiry.created_at).toLocaleDateString('ko-KR')}
            </div>
          </div>
          {(isAdmin || isOwner) && (
            <div className="flex gap-2">
              <button
                onClick={handleEditClick}
                className="text-blue-600 hover:text-blue-700 p-2 hover:bg-blue-50 rounded-lg transition-colors"
                title="수정"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={handleDeleteClick}
                className="text-red-600 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-colors"
                title="삭제"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-3 flex items-center">
        {inquiry.is_private && <Lock className="w-4 h-4 text-gray-400 mr-1" />} {inquiry.title}
      </h3>
      {canShowContent ? (
        <>
          <p className="text-gray-600 mb-4 leading-relaxed whitespace-pre-wrap text-sm md:text-base">{inquiry.content}</p>
          <RepliesSection inquiryId={inquiry.id} canView={canShowContent} isAdmin={isAdmin} />
        </>
      ) : (
        <div className="text-gray-400 italic flex items-center text-sm md:text-base">
          <Lock className="w-4 h-4 mr-1" /> 비밀글입니다
        </div>
      )}
    </div>
  );
};

export default QnAItem;
