import React from 'react';
import { User } from 'lucide-react';
import { useInquiries } from '@/hooks/useInquiries';

interface RepliesSectionProps {
  inquiryId: string;
  canView: boolean;
  isAdmin: boolean;
}

const RepliesSection: React.FC<RepliesSectionProps> = ({ inquiryId, canView, isAdmin }) => {
  const { getReplies, createReply, updateReply, deleteReply } = useInquiries();
  const [replies, setReplies] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [replyText, setReplyText] = React.useState('');
  const [editingId, setEditingId] = React.useState(null);

  React.useEffect(() => {
    if (canView) {
      setLoading(true);
      getReplies(inquiryId).then(setReplies).finally(() => setLoading(false));
    }
  }, [inquiryId, canView]);

  if (!canView) return null;

  return (
    <div className="mt-4 md:mt-6">
      {loading ? (
        <div className="text-gray-400 text-sm md:text-base">답변 불러오는 중...</div>
      ) : (
        <>
          {replies.length === 0 ? (
            <div className="space-y-4">
              <div className="text-gray-400 text-sm md:text-base">아직 답변이 없습니다.</div>
              {isAdmin && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">답변 작성</h4>
                  <textarea
                    value={replyText}
                    onChange={e => setReplyText(e.target.value)}
                    className="w-full p-2 rounded border text-sm md:text-base"
                    rows={3}
                    placeholder="답변을 입력하세요..."
                  />
                  <div className="mt-2 flex justify-end">
                    <button
                      onClick={async () => {
                        if (!replyText.trim()) return;
                        await createReply(inquiryId, replyText);
                        setReplyText('');
                        setReplies(await getReplies(inquiryId));
                      }}
                      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors text-sm md:text-base"
                    >
                      답변 등록
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              {replies.map(reply => (
                <div key={reply.id} className="p-3 md:p-4 bg-blue-50 rounded-lg border-l-4 border-blue-400 mb-2 flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center mb-1 gap-1 sm:gap-2">
                      <div className="flex items-center">
                        <User className="w-3 h-3 md:w-4 md:h-4 text-blue-600 mr-1" />
                        <span className="text-xs md:text-sm font-medium text-blue-900">관리자 답변</span>
                      </div>
                      <span className="text-xs text-gray-400">{new Date(reply.created_at).toLocaleString('ko-KR')}</span>
                    </div>
                    <div className="text-blue-800 leading-relaxed whitespace-pre-wrap text-sm md:text-base">
                      {editingId === reply.id ? (
                        <textarea
                          value={replyText}
                          onChange={e => setReplyText(e.target.value)}
                          className="w-full p-2 rounded border text-sm md:text-base"
                          rows={3}
                        />
                      ) : reply.content}
                    </div>
                  </div>
                  {isAdmin && (
                    <div className="flex gap-2 sm:flex-col sm:gap-1 sm:ml-2">
                      {editingId === reply.id ? (
                        <>
                          <button
                            onClick={async () => {
                              await updateReply(reply.id, replyText);
                              setEditingId(null);
                              setReplyText('');
                              setReplies(await getReplies(inquiryId));
                            }}
                            className="text-blue-600 text-xs px-2 py-1 hover:bg-blue-100 rounded"
                          >
                            저장
                          </button>
                          <button
                            onClick={() => { setEditingId(null); setReplyText(''); }}
                            className="text-gray-400 text-xs px-2 py-1 hover:bg-gray-100 rounded"
                          >
                            취소
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => { setEditingId(reply.id); setReplyText(reply.content); }}
                            className="text-blue-600 text-xs px-2 py-1 hover:bg-blue-100 rounded"
                          >
                            수정
                          </button>
                          <button
                            onClick={async () => {
                              await deleteReply(reply.id);
                              setReplies(await getReplies(inquiryId));
                            }}
                            className="text-red-600 text-xs px-2 py-1 hover:bg-red-100 rounded"
                          >
                            삭제
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              ))}
              {isAdmin && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">추가 답변 작성</h4>
                  <textarea
                    value={replyText}
                    onChange={e => setReplyText(e.target.value)}
                    className="w-full p-2 rounded border text-sm md:text-base"
                    rows={3}
                    placeholder="답변을 입력하세요..."
                  />
                  <div className="mt-2 flex justify-end">
                    <button
                      onClick={async () => {
                        if (!replyText.trim()) return;
                        await createReply(inquiryId, replyText);
                        setReplyText('');
                        setReplies(await getReplies(inquiryId));
                      }}
                      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors text-sm md:text-base"
                    >
                      답변 등록
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
};

export default RepliesSection;
