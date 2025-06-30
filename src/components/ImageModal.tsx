import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

interface ImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageSrc: string;
  imageAlt: string;
  imageTitle: string;
}

const ImageModal = ({ isOpen, onClose, imageSrc, imageAlt, imageTitle }: ImageModalProps) => {
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
      modalElement.style.backgroundColor = 'rgba(0, 0, 0, 0.75)';
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
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        boxSizing: 'border-box'
      }}
      onClick={onClose}
    >
      <div className="relative max-w-4xl max-h-full bg-white rounded-lg overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">{imageTitle}</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="닫기"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4">
          <img
            src={imageSrc}
            alt={imageAlt}
            className="w-full h-auto max-h-[70vh] object-contain rounded"
          />
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default ImageModal;
