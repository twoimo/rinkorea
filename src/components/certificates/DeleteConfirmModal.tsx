import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useIsMobile } from '../../hooks/use-mobile';
import { useLanguage, getLocalizedValue } from '@/contexts/LanguageContext';

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
  const isMobile = useIsMobile();
  const { t, language } = useLanguage();

  // Portal과 body scroll 차단으로 완벽한 중앙 정렬
  useEffect(() => {
    if (isOpen) {
      // 1. 강제로 맨 위로 스크롤
      window.scrollTo({ top: 0, behavior: 'instant' });

      // 2. Body scroll 완전 차단
      const originalOverflow = document.body.style.overflow;
      const originalPosition = document.body.style.position;
      const originalTop = document.body.style.top;
      const scrollY = window.scrollY;

      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';

      // 청소 함수
      return () => {
        document.body.style.overflow = originalOverflow;
        document.body.style.position = originalPosition;
        document.body.style.top = originalTop;
        document.body.style.width = '';
        window.scrollTo(0, scrollY);
      };
    }
  }, [isOpen]);

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
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        margin: 0
      }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-lg p-6 sm:p-8 max-w-md w-full"
        style={{
          position: 'relative',
          margin: 'auto',
          transform: 'none'
        }}
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
};

export default DeleteConfirmModal;
