import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { User } from 'lucide-react';
import { useInquiries } from '@/hooks/useInquiries';
import { useLanguage } from '@/contexts/LanguageContext';
import { logger } from '@/utils/logger';

interface RepliesSectionProps {
  inquiryId: string;
  canView: boolean;
  isAdmin: boolean;
  onRefetch?: () => Promise<void>;
}

const RepliesSection: React.FC<RepliesSectionProps> = memo(({ inquiryId, canView, isAdmin, onRefetch }) => {
  const { getReplies, createReply, updateReply, deleteReply } = useInquiries();
  const { t, language } = useLanguage();
  const [replies, setReplies] = useState([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [editingId, setEditingId] = useState(null);

  logger.debug('RepliesSection render:', {
    inquiryId,
    canView,
    isAdmin,
    repliesCount: replies.length,
    initialLoading,
    error
  });

  const loadReplies = useCallback(async () => {
    if (!canView || !inquiryId) {
      logger.debug('loadReplies skipped:', { canView, inquiryId });
      return;
    }

    try {
      logger.debug('loadReplies starting for inquiry:', inquiryId);
      setError(null);
      const data = await getReplies(inquiryId);
      logger.success('loadReplies success:', data?.length || 0, 'replies');
      setReplies(data || []);
    } catch (err) {
      logger.error('loadReplies error:', err);
      setError(t('reply_load_failed'));
      setReplies([]);
    }
  }, [inquiryId, canView, getReplies, t]);

  // 초기 로딩만 한 번 수행
  useEffect(() => {
    if (initialLoading && canView && inquiryId) {
      logger.debug('Initial load for inquiry:', inquiryId);
      loadReplies().finally(() => {
        logger.success('Initial load completed');
        setInitialLoading(false);
      });
    }
  }, [inquiryId, canView, initialLoading, loadReplies]);

  const refreshReplies = useCallback(async () => {
    await loadReplies();
    if (onRefetch) {
      await onRefetch();
    }
  }, [loadReplies, onRefetch]);

  const handleCreateReply = useCallback(async () => {
    if (!replyText.trim()) return;
    try {
      await createReply(inquiryId, replyText);
      setReplyText('');
      await refreshReplies();
    } catch (error) {
      logger.error('Error creating reply:', error);
      setError(t('reply_create_failed'));
    }
  }, [replyText, createReply, inquiryId, refreshReplies, t]);

  const handleUpdateReply = useCallback(async (replyId: string, content: string) => {
    try {
      await updateReply(replyId, content);
      setEditingId(null);
      setReplyText('');
      await loadReplies();
    } catch (error) {
      logger.error('Error updating reply:', error);
      setError(t('reply_update_failed'));
    }
  }, [updateReply, loadReplies, t]);

  const handleDeleteReply = useCallback(async (replyId: string) => {
    try {
      await deleteReply(replyId);
      await refreshReplies();
    } catch (error) {
      logger.error('Error deleting reply:', error);
      setError(t('reply_delete_failed'));
    }
  }, [deleteReply, refreshReplies, t]);

  const replyElements = useMemo(() => {
    return replies.map(reply => (
      <div key={reply.id} className="p-3 md:p-4 bg-blue-50 rounded-lg border-l-4 border-blue-400 mb-2 flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
        <div className="flex-1">
          <div className="flex flex-col sm:flex-row sm:items-center mb-1 gap-1 sm:gap-2">
            <div className="flex items-center">
              <User className="w-3 h-3 md:w-4 md:h-4 text-blue-600 mr-1" />
              <span className="text-xs md:text-sm font-medium text-blue-900">{t('admin_reply')}</span>
            </div>
            <span className="text-xs text-gray-400">{new Date(reply.created_at).toLocaleString(language === 'ko' ? 'ko-KR' : language === 'zh' ? 'zh-CN' : 'en-US', { timeZone: language === 'ko' ? 'Asia/Seoul' : language === 'zh' ? 'Asia/Shanghai' : 'America/New_York' })}</span>
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
                  onClick={() => handleUpdateReply(reply.id, replyText)}
                  className="text-blue-600 text-xs px-2 py-1 hover:bg-blue-100 rounded"
                >
                  {t('save')}
                </button>
                <button
                  onClick={() => { setEditingId(null); setReplyText(''); }}
                  className="text-gray-400 text-xs px-2 py-1 hover:bg-gray-100 rounded"
                >
                  {t('cancel')}
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => { setEditingId(reply.id); setReplyText(reply.content); }}
                  className="text-blue-600 text-xs px-2 py-1 hover:bg-blue-100 rounded"
                >
                  {t('edit')}
                </button>
                <button
                  onClick={() => handleDeleteReply(reply.id)}
                  className="text-red-600 text-xs px-2 py-1 hover:bg-red-100 rounded"
                >
                  {t('delete')}
                </button>
              </>
            )}
          </div>
        )}
      </div>
    ));
  }, [replies, editingId, replyText, isAdmin, handleUpdateReply, handleDeleteReply, t, language]);

  if (!canView) return null;

  return (
    <div className="mt-4 md:mt-6">
      {initialLoading ? (
        <div className="text-gray-400 text-sm md:text-base">{t('replies_loading')}</div>
      ) : error ? (
        <div className="text-red-500 text-sm md:text-base">
          {error}
          <button
            onClick={() => {
              setInitialLoading(true);
              loadReplies().finally(() => setInitialLoading(false));
            }}
            className="ml-2 text-blue-600 hover:underline"
          >
            {t('try_again')}
          </button>
        </div>
      ) : (
        <>
          {replies.length === 0 ? (
            <div className="space-y-4">
              <div className="text-gray-400 text-sm md:text-base">{t('no_replies_yet')}</div>
              {isAdmin && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">{t('write_reply')}</h4>
                  <textarea
                    value={replyText}
                    onChange={e => setReplyText(e.target.value)}
                    className="w-full p-2 rounded border text-sm md:text-base"
                    rows={3}
                    placeholder={t('reply_placeholder')}
                  />
                  <div className="mt-2 flex justify-end">
                    <button
                      onClick={handleCreateReply}
                      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors text-sm md:text-base"
                    >
                      {t('post_reply')}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              {replyElements}
              {isAdmin && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">{t('additional_reply')}</h4>
                  <textarea
                    value={replyText}
                    onChange={e => setReplyText(e.target.value)}
                    className="w-full p-2 rounded border text-sm md:text-base"
                    rows={3}
                    placeholder={t('reply_placeholder')}
                  />
                  <div className="mt-2 flex justify-end">
                    <button
                      onClick={handleCreateReply}
                      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors text-sm md:text-base"
                    >
                      {t('post_reply')}
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
});

RepliesSection.displayName = 'RepliesSection';

export default RepliesSection;
