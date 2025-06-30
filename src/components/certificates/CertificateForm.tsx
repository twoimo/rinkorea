import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { useIsMobile } from '../../hooks/use-mobile';
import { useLanguage } from '@/contexts/LanguageContext';

interface Certificate {
  id: string;
  name: string;
  description: string;
  image_url: string;
  category: string;
  issue_date?: string;
  expiry_date?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
  // 다국어 필드
  name_ko?: string;
  name_en?: string;
  name_zh?: string;
  name_id?: string;
  description_ko?: string;
  description_en?: string;
  description_zh?: string;
  description_id?: string;
}

interface CertificateFormProps {
  isOpen: boolean;
  certificate: Certificate | null;
  onClose: () => void;
  onSave: (formData: Partial<Certificate>) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  success: string | null;
}

const CertificateForm: React.FC<CertificateFormProps> = ({
  isOpen,
  certificate,
  onClose,
  onSave,
  isLoading,
  error,
  success
}) => {
  const isMobile = useIsMobile();
  const { t } = useLanguage();
  const modalRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number>();
  const [formValues, setFormValues] = useState<Partial<Certificate>>(certificate || {});

  useEffect(() => {
    setFormValues(certificate || {});
  }, [certificate]);

  useEffect(() => {
    if (!isOpen) return;

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
      modalElement.style.backgroundColor = 'rgba(0, 0, 0, 0.3)';
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
      if (event.key === 'Escape' && !isLoading) {
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
  }, [isOpen, onClose, isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(formValues);
  };

  if (!isOpen) return null;

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
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        boxSizing: 'border-box'
      }}
      onClick={!isLoading ? onClose : undefined}
    >
      <div
        className={`bg-white rounded-lg shadow-lg relative w-full ${isMobile ? 'max-h-[90vh] overflow-y-auto' : 'max-w-4xl'}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b p-4 sm:p-6 flex items-center justify-between">
          <h2 className="text-xl sm:text-2xl font-bold">
            {certificate ? t('certificates_form_edit_title', '인증서 수정') : t('certificates_form_add_title', '인증서 추가')}
          </h2>
          <button
            className="text-gray-400 hover:text-gray-700 p-2 touch-manipulation disabled:opacity-50"
            onClick={onClose}
            disabled={isLoading}
            aria-label={t('certificates_form_close', '닫기')}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-6">
          {/* 기본 정보 */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">기본 정보</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('certificates_form_image_url', '이미지 URL')}
                </label>
                <input
                  type="text"
                  value={formValues.image_url || ''}
                  onChange={(e) => setFormValues({ ...formValues, image_url: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                  disabled={isLoading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('certificates_form_category', '카테고리')}
                </label>
                <select
                  value={formValues.category || ''}
                  onChange={(e) => setFormValues({ ...formValues, category: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                  disabled={isLoading}
                >
                  <option value="">카테고리 선택</option>
                  <option value="patent">특허/상표</option>
                  <option value="certification">RIN-COAT 시험성적서</option>
                  <option value="rin_test">린코리아 시험성적서</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('certificates_form_issue_date', '발급일')}
                </label>
                <input
                  type="date"
                  value={formValues.issue_date || ''}
                  onChange={(e) => setFormValues({ ...formValues, issue_date: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isLoading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('certificates_form_expiry_date', '만료일')}
                </label>
                <input
                  type="date"
                  value={formValues.expiry_date || ''}
                  onChange={(e) => setFormValues({ ...formValues, expiry_date: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>

          {/* 인증서명 */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">인증서명</h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                인증서명
              </label>
              <input
                type="text"
                value={formValues.name || ''}
                onChange={(e) => setFormValues({ ...formValues, name: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="인증서명을 입력하세요"
                required
                disabled={isLoading}
              />
            </div>
          </div>

          {/* 설명 */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">설명</h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                설명
              </label>
              <textarea
                value={formValues.description || ''}
                onChange={(e) => setFormValues({ ...formValues, description: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent h-24"
                placeholder="인증서 설명을 입력하세요"
                rows={3}
                disabled={isLoading}
              />
            </div>
          </div>

          {/* 상태 메시지 */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
              {success}
            </div>
          )}

          {/* 액션 버튼 */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg touch-manipulation disabled:opacity-50"
              disabled={isLoading}
            >
              {t('cancel', '취소')}
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
            >
              {isLoading ? t('certificates_form_saving', '저장 중...') : t('certificates_form_save', '저장')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default CertificateForm;
