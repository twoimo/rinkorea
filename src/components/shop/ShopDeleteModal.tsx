import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useLanguage } from '@/contexts/LanguageContext';

interface Product {
  id: string;
  name: string;
}

interface ShopDeleteModalProps {
  product: Product;
  formLoading: boolean;
  formError: string | null;
  formSuccess: string | null;
  onConfirm: () => void;
  onCancel: () => void;
}

const ShopDeleteModal = ({
  product,
  formLoading,
  formError,
  formSuccess,
  onConfirm,
  onCancel,
}: ShopDeleteModalProps) => {
  const { t } = useLanguage();
  const modalRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number>();

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
      if (event.key === 'Escape' && !formLoading) {
        onCancel();
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
  }, [onCancel, formLoading]);

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
      onClick={!formLoading ? onCancel : undefined}
    >
      <div
        className="bg-white rounded-lg shadow-lg w-full max-w-sm text-center p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-lg font-bold text-red-700 mb-4">{t('shop_delete_title', '상품 삭제')}</div>
        <div className="mb-6 text-gray-800">
          {t('shop_delete_confirm', '정말로')} <strong>{product.name}</strong> {t('shop_delete_confirm_product', '상품을 삭제하시겠습니까?')}
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={onCancel}
            className="w-full px-4 py-3 bg-gray-300 text-gray-700 rounded-lg font-medium touch-manipulation"
            disabled={formLoading}
          >
            {t('cancel', '취소')}
          </button>
          <button
            className="w-full px-4 py-3 bg-red-600 text-white rounded-lg font-medium disabled:opacity-50 touch-manipulation"
            onClick={onConfirm}
            disabled={formLoading}
          >
            {formLoading ? t('shop_deleting', '삭제 중...') : t('delete', '삭제')}
          </button>
        </div>
        {formError && <div className="mt-4 text-sm text-red-600 p-3 bg-red-50 rounded-lg">{formError}</div>}
        {formSuccess && <div className="mt-4 text-sm text-green-700 p-3 bg-green-50 rounded-lg">{formSuccess}</div>}
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default ShopDeleteModal;
