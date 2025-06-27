import React, { useState, useEffect } from 'react';
import { Edit, Trash2, MessageCircle, User, Calendar, Lock, Eye, ChevronDown, ChevronUp, Shield, Reply as ReplyIcon } from 'lucide-react';
import { User as UserType } from '@supabase/supabase-js';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import { useLanguage } from '@/contexts/LanguageContext';
import { useInquiries, Reply } from '@/hooks/useInquiries';

interface Inquiry {
  id: string;
  title: string;
  content: string;
  category: string;
  status: string;
  is_private: boolean;
  created_at: string;
  user_id: string;
  admin_reply?: string | null;
  profiles?: {
    name: string;
  };
}

interface QnAItemProps {
  inquiry: Inquiry;
  user: UserType | null;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onRefetch: () => void;
}

const QnAItem: React.FC<QnAItemProps> = ({ inquiry, user, onEdit, onDelete, onRefetch }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [loadingReplies, setLoadingReplies] = useState(false);
  const { isAdmin } = useUserRole();
  const { t } = useLanguage();
  const { getReplies } = useInquiries();

  const canView = !inquiry.is_private || isAdmin || (user && user.id === inquiry.user_id);
  const canEdit = user && (user.id === inquiry.user_id || isAdmin);

  useEffect(() => {
    if (canView && inquiry.id) {
      loadReplies();
    }
  }, [inquiry.id, canView]);

  const loadReplies = async () => {
    try {
      setLoadingReplies(true);
      const repliesData = await getReplies(inquiry.id);
      setReplies(repliesData);
    } catch (error) {
      console.error('Error loading replies:', error);
    } finally {
      setLoadingReplies(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: string) => {
    if (status === t('qna_status_answered', '답변완료')) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <MessageCircle className="w-3 h-3 mr-1" />
          {t('qna_status_answered', '답변완료')}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
        <MessageCircle className="w-3 h-3 mr-1" />
        {t('qna_status_pending', '답변대기')}
      </span>
    );
  };

  if (!canView) {
    return (
      <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
        <div className="flex items-center text-gray-500">
          <Lock className="w-5 h-5 mr-2" />
          <span>{t('qna_private_question', '비공개 질문')}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {inquiry.category}
              </span>
              {getStatusBadge(inquiry.status)}
              {inquiry.is_private && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  <Lock className="w-3 h-3 mr-1" />
                  {t('qna_private_question', '비공개')}
                </span>
              )}
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{inquiry.title}</h3>
            <div className="flex items-center text-sm text-gray-500 space-x-4">
              <div className="flex items-center">
                <User className="w-4 h-4 mr-1" />
                <span>{inquiry.profiles?.name || t('anonymous', '익명')}</span>
              </div>
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-1" />
                <span>{formatDate(inquiry.created_at)}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <Eye className="w-5 h-5" />
            </button>
            {canEdit && (
              <>
                <button
                  onClick={() => onEdit(inquiry.id)}
                  className="text-blue-600 hover:text-blue-700 transition-colors"
                >
                  <Edit className="w-5 h-5" />
                </button>
                <button
                  onClick={() => {
                    if (confirm(t('qna_delete_confirm', '정말로 이 질문을 삭제하시겠습니까?'))) {
                      onDelete(inquiry.id);
                    }
                  }}
                  className="text-red-600 hover:text-red-700 transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </>
            )}
          </div>
        </div>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between text-left bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition-colors"
        >
          <span className="text-sm font-medium text-gray-700">
            {isExpanded ? t('hide_content', '내용 숨기기') : t('show_content', '내용 보기')}
          </span>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-gray-500" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-500" />
          )}
        </button>

        {isExpanded && (
          <div className="mt-4 space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="prose prose-sm max-w-none">
                <p className="text-gray-700 whitespace-pre-wrap">{inquiry.content}</p>
              </div>
            </div>

            {inquiry.admin_reply && (
              <div className="border-l-4 border-blue-500 bg-blue-50 p-4 rounded-lg ml-4">
                <div className="flex items-center mb-2">
                  <Shield className="w-4 h-4 text-blue-600 mr-2" />
                  <span className="text-sm font-medium text-blue-800">관리자 답변</span>
                </div>
                <div className="prose prose-sm max-w-none">
                  <p className="text-blue-700 whitespace-pre-wrap">{inquiry.admin_reply}</p>
                </div>
              </div>
            )}

            {loadingReplies ? (
              <div className="text-center py-4">
                <p className="text-gray-500 text-sm">답변을 불러오는 중...</p>
              </div>
            ) : replies.length > 0 ? (
              <div className="space-y-3">
                {replies.map((reply, index) => (
                  <div key={reply.id} className="border-l-4 border-green-500 bg-green-50 p-4 rounded-lg ml-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <ReplyIcon className="w-4 h-4 text-green-600 mr-2" />
                        <span className="text-sm font-medium text-green-800">
                          관리자 답변 {replies.length > 1 ? `#${index + 1}` : ''}
                        </span>
                      </div>
                      <span className="text-xs text-green-600">
                        {formatDate(reply.created_at)}
                      </span>
                    </div>
                    <div className="prose prose-sm max-w-none">
                      <p className="text-green-700 whitespace-pre-wrap">{reply.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
};

export default QnAItem;
