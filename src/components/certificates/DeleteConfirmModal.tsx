import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
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

interface DeleteConfirmModalProps {
  isOpen: boolean;
  certificate: Certificate | null;
  onClose: () => void;
  onConfirm: () => void;
}

const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  certificate,
  onClose,
  onConfirm
}) => {
  const { t, language } = useLanguage();
  const modalRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number>();

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
      if (event.key === 'Escape') {
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
  }, [isOpen, onClose]);

  if (!isOpen || !certificate) return null;

  // 현재 언어에 맞는 인증서명 가져오기
  const getLocalizedCertificateName = (cert: Certificate): string => {
    switch (language) {
      case 'en':
        return cert.name_en || cert.name;
      case 'zh':
        return cert.name_zh || cert.name;
      default:
        return cert.name_ko || cert.name;
    }
  };

  const localizedName = getLocalizedCertificateName(certificate);

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
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-lg p-6 sm:p-8 max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl sm:text-2xl font-bold mb-4">
          {t('certificates_delete_title', '인증서 삭제')}
        </h2>
        <p className="text-gray-600 mb-6">
          {t('certificates_delete_confirm', '정말로 이 인증서를 삭제하시겠습니까?')}
          <br />
          <span className="font-semibold">"{localizedName}"</span>
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg touch-manipulation"
          >
            {t('cancel', '취소')}
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 touch-manipulation"
          >
            {t('certificates_delete_btn', '삭제')}
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default DeleteConfirmModal;
