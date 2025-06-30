import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, Save, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';

interface QnAItem {
  id: string;
  name: string;
  email: string;
  phone: string;
  title: string;
  content: string;
  is_private: boolean;
  category?: string;
  created_at: string;
  status: string;
}

interface QnAEditFormProps {
  inquiry: QnAItem;
  onSave: (inquiryData: { name: string; email: string; phone: string; title: string; content: string; is_private: boolean }) => Promise<void>;
  onClose: () => void;
  onRefetch: () => void;
}

const QnAEditForm: React.FC<QnAEditFormProps> = ({
  inquiry,
  onSave,
  onClose,
  onRefetch
}) => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const modalRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number>();
  const [editFormData, setEditFormData] = useState({
    name: inquiry.name,
    email: inquiry.email,
    phone: inquiry.phone,
    title: inquiry.title,
    content: inquiry.content,
    is_private: inquiry.is_private
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editFormData.title.trim() || !editFormData.content.trim()) {
      setError(t('required_fields', '제목과 내용을 입력해주세요.'));
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await onSave({
        name: editFormData.name,
        email: editFormData.email,
        phone: editFormData.phone,
        title: editFormData.title,
        content: editFormData.content,
        is_private: editFormData.is_private
      });
      onRefetch();
      onClose();
    } catch (err) {
      setError(t('submit_error', '문의 수정에 실패했습니다.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // 스크롤 차단 강화
    const originalBodyOverflow = document.body.style.overflow;
    const originalHtmlOverflow = document.documentElement.style.overflow;
    const originalBodyTouchAction = document.body.style.touchAction;

    // CSS로 스크롤 차단
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    document.body.style.touchAction = 'none';

    // 모달 내부 요소인지 확인하는 함수
    const isInsideModal = (target: EventTarget | null): boolean => {
      if (!target || !modalRef.current) return false;
      const element = target as Element;
      return modalRef.current.contains(element);
    };

    // 마우스 휠 스크롤 차단 (모달 외부만)
    const preventWheel = (e: WheelEvent) => {
      if (!isInsideModal(e.target)) {
        e.preventDefault();
      }
    };

    // 터치 스크롤 차단 (모달 외부만)
    const preventTouch = (e: TouchEvent) => {
      if (e.touches.length > 1) return; // 멀티터치는 허용
      if (!isInsideModal(e.target)) {
        e.preventDefault();
      }
    };

    // 키보드 스크롤 차단 (모달 외부만)
    const preventKeyScroll = (e: KeyboardEvent) => {
      const scrollKeys = [32, 33, 34, 35, 36, 37, 38, 39, 40]; // space, pageup, pagedown, end, home, left, up, right, down
      if (scrollKeys.includes(e.keyCode) && !isInsideModal(e.target)) {
        e.preventDefault();
      }
    };

    // 뷰포트 위치 계속 업데이트
    const updateModalPosition = () => {
      if (!modalRef.current) return;

      // 현재 뷰포트 정보 가져오기
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;

      // 모달을 현재 뷰포트 중앙에 정확히 배치
      const modalElement = modalRef.current;
      modalElement.style.position = 'absolute';
      modalElement.style.top = `${scrollTop}px`;
      modalElement.style.left = `${scrollLeft}px`;
      modalElement.style.width = `${viewportWidth}px`;
      modalElement.style.height = `${viewportHeight}px`;
      modalElement.style.zIndex = '2147483647';
      modalElement.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
      modalElement.style.display = 'flex';
      modalElement.style.alignItems = 'center';
      modalElement.style.justifyContent = 'center';
      modalElement.style.padding = '16px';
      modalElement.style.boxSizing = 'border-box';

      // 다음 프레임에서도 계속 업데이트
      animationFrameRef.current = requestAnimationFrame(updateModalPosition);
    };

    // 첫 위치 설정
    updateModalPosition();

    // ESC 키 이벤트
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !loading) {
        onClose();
      }
    };

    // 이벤트 리스너 등록
    document.addEventListener('keydown', handleEscape);
    document.addEventListener('wheel', preventWheel, { passive: false });
    document.addEventListener('touchmove', preventTouch, { passive: false });
    document.addEventListener('keydown', preventKeyScroll, { passive: false });

    return () => {
      // 이벤트 리스너 제거
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('wheel', preventWheel);
      document.removeEventListener('touchmove', preventTouch);
      document.removeEventListener('keydown', preventKeyScroll);

      // 스타일 복원
      document.body.style.overflow = originalBodyOverflow;
      document.documentElement.style.overflow = originalHtmlOverflow;
      document.body.style.touchAction = originalBodyTouchAction;

      // 애니메이션 프레임 정리
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [onClose, loading]);

  const modalContent = (
    <div
      ref={modalRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 2147483647,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        boxSizing: 'border-box'
      }}
      onClick={!loading ? onClose : undefined}
    >
      <div
        className="bg-white rounded-lg w-full max-w-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">{t('qna_form_title_edit', '질문 수정')}</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleUpdate} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('qna_form_name', '이름')}
            </label>
            <input
              type="text"
              value={editFormData.name}
              onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder={t('qna_form_name', '이름')}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('qna_form_email', '이메일')}
            </label>
            <input
              type="email"
              value={editFormData.email}
              onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder={t('qna_form_email', '이메일')}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('qna_form_phone', '전화번호')}
            </label>
            <input
              type="tel"
              value={editFormData.phone}
              onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder={t('qna_form_phone', '전화번호')}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('qna_form_title', '제목')}
            </label>
            <input
              type="text"
              value={editFormData.title}
              onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder={t('qna_form_title', '제목')}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('qna_form_content', '내용')}
            </label>
            <textarea
              value={editFormData.content}
              onChange={(e) => setEditFormData({ ...editFormData, content: e.target.value })}
              rows={6}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder={t('qna_form_content', '내용')}
              required
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="is_private_edit"
              checked={editFormData.is_private}
              onChange={e => setEditFormData(prev => ({ ...prev, is_private: e.target.checked }))}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="is_private_edit" className="ml-2 text-sm text-gray-700">
              {t('qna_form_is_private', '비공개 질문')}
            </label>
          </div>
          <p className="text-xs text-gray-500 ml-6">
            {t('qna_form_is_private_desc', '체크하시면 관리자와 작성자만 볼 수 있습니다.')}
          </p>

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
                  {t('update', '수정')}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default QnAEditForm;
