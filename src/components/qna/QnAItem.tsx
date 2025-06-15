
import React from 'react';
import { User, Calendar, CheckCircle, Clock, Lock, Edit, Trash2 } from 'lucide-react';
import QnAEditForm from './QnAEditForm';
import RepliesSection from './RepliesSection';

interface QnAItemProps {
  item: any;
  isOwner: boolean;
  isAdmin: boolean;
  canView: boolean;
  canShowContent: boolean;
  inquiryReplies: Record<string, boolean>;
  editingInquiryId: string | null;
  editFormData: any;
  setEditFormData: (data: any) => void;
  setEditingInquiryId: (id: string | null) => void;
  onUpdate: (id: string, data: any) => Promise<void>;
  onDelete: (id: string) => void;
  maskName: (name: string) => string;
}

const QnAItem: React.FC<QnAItemProps> = ({
  item,
  isOwner,
  isAdmin,
  canView,
  canShowContent,
  inquiryReplies,
  editingInquiryId,
  editFormData,
  setEditFormData,
  setEditingInquiryId,
  onUpdate,
  onDelete,
  maskName
}) => {
  const handleEditClick = () => {
    setEditingInquiryId(item.id);
    setEditFormData({
      name: item.name,
      email: item.email,
      phone: item.phone || '',
      title: item.title,
      content: item.content,
      is_private: item.is_private || false
    });
  };

  const handleSave = async () => {
    await onUpdate(item.id, {
      name: editFormData.name,
      email: editFormData.email,
      phone: editFormData.phone,
      title: editFormData.title,
      content: editFormData.content,
      is_private: editFormData.is_private
    });
    setEditingInquiryId(null);
  };

  return (
    <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 md:mb-4 gap-3">
        {/* 상태 뱃지 */}
        <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 w-fit ${inquiryReplies[item.id]
          ? 'bg-green-100 text-green-800'
          : 'bg-yellow-100 text-yellow-800'
          }`}>
          {inquiryReplies[item.id] ? (
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
              {maskName(item.name)}
            </div>
            {isAdmin && (
              <>
                <div className="flex items-center gap-1">
                  <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">{item.email}</span>
                </div>
                {item.phone && (
                  <div className="flex items-center gap-1">
                    <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">{item.phone}</span>
                  </div>
                )}
              </>
            )}
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3 md:w-4 md:h-4" />
              {new Date(item.created_at).toLocaleDateString('ko-KR')}
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
                onClick={() => onDelete(item.id)} 
                className="text-red-600 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-colors" 
                title="삭제"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {editingInquiryId === item.id ? (
        <QnAEditForm
          editFormData={editFormData}
          setEditFormData={setEditFormData}
          onSave={handleSave}
          onCancel={() => setEditingInquiryId(null)}
        />
      ) : (
        <>
          <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-3 flex items-center">
            {item.is_private && <Lock className="w-4 h-4 text-gray-400 mr-1" />} {item.title}
          </h3>
          {canShowContent ? (
            <>
              <p className="text-gray-600 mb-4 leading-relaxed whitespace-pre-wrap text-sm md:text-base">{item.content}</p>
              <RepliesSection inquiryId={item.id} canView={canShowContent} isAdmin={isAdmin} />
            </>
          ) : (
            <div className="text-gray-400 italic flex items-center text-sm md:text-base">
              <Lock className="w-4 h-4 mr-1" /> 비밀글입니다
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default QnAItem;
