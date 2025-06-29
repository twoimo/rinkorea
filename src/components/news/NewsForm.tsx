import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Save, AlertCircle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface NewsFormProps {
    isOpen: boolean;
    news?: {
        id: string;
        title: string;
        content: string;
        published: boolean;
    };
    onClose: () => void;
    onSave: (newsData: { title: string; content: string; published: boolean }) => Promise<void>;
    loading?: boolean;
    error?: string | null;
    success?: string | null;
}

const NewsForm: React.FC<NewsFormProps> = ({
    isOpen,
    news,
    onClose,
    onSave,
    loading = false,
    error = null,
    success = null
}) => {
    const { t } = useLanguage();
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        published: true
    });
    const [formError, setFormError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            window.scrollTo({ top: 0, behavior: 'instant' });

            const originalOverflow = document.body.style.overflow;
            const originalPosition = document.body.style.position;
            const originalTop = document.body.style.top;
            const scrollY = window.scrollY;

            document.body.style.overflow = 'hidden';
            document.body.style.position = 'fixed';
            document.body.style.top = `-${scrollY}px`;
            document.body.style.width = '100%';

            return () => {
                document.body.style.overflow = originalOverflow;
                document.body.style.position = originalPosition;
                document.body.style.top = originalTop;
                document.body.style.width = '';
                window.scrollTo(0, scrollY);
            };
        }
    }, [isOpen]);

    useEffect(() => {
        if (news) {
            setFormData({
                title: news.title,
                content: news.content,
                published: news.published
            });
        } else {
            setFormData({
                title: '',
                content: '',
                published: true
            });
        }
    }, [news]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.title.trim() || !formData.content.trim()) {
            setFormError(t('required_fields', '제목과 내용을 입력해주세요.'));
            return;
        }

        setFormError(null);
        try {
            await onSave(formData);
        } catch (err) {
            setFormError(t('submit_error', '저장에 실패했습니다.'));
        }
    };

    if (!isOpen) return null;

    return createPortal(
        <div
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 9999,
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                margin: 0
            }}
            onClick={onClose}
        >
            <div
                className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                style={{
                    position: 'relative',
                    margin: 'auto',
                    transform: 'none'
                }}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-gray-900">
                            {news ? t('news_form_title_edit', '공지 수정') : t('news_form_title_add', '공지 추가')}
                        </h2>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {(error || formError) && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
                            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                            <p className="text-red-800 text-sm">{error || formError}</p>
                        </div>
                    )}

                    {success && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start space-x-3">
                            <div className="w-5 h-5 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                <div className="w-2 h-2 bg-white rounded-full" />
                            </div>
                            <p className="text-green-800 text-sm">{success}</p>
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t('news_form_title', '제목')}
                        </label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder={t('news_form_title', '제목')}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t('news_form_content', '내용')}
                        </label>
                        <textarea
                            value={formData.content}
                            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                            rows={8}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                            placeholder={t('news_form_content', '내용')}
                            required
                        />
                    </div>

                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            id="published"
                            checked={formData.published}
                            onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <label htmlFor="published" className="ml-2 text-sm text-gray-700">
                            {t('publish_immediately', '즉시 게시')}
                        </label>
                    </div>

                    <div className="flex space-x-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                        >
                            {t('cancel', '취소')}
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <>
                                    <Save className="w-4 h-4 mr-2" />
                                    {t('save', '저장')}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default NewsForm; 