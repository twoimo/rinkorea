// 모바일 및 반응형 최적화 유틸리티

// 디바이스 타입 감지
export enum DeviceType {
  MOBILE = 'mobile',
  TABLET = 'tablet',
  DESKTOP = 'desktop'
}

export interface DeviceInfo {
  type: DeviceType;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isTouchDevice: boolean;
  screenWidth: number;
  screenHeight: number;
  orientation: 'portrait' | 'landscape';
}

// 브레이크포인트 정의
export const BREAKPOINTS = {
  mobile: 768,
  tablet: 1024,
  desktop: 1200
} as const;

// 디바이스 정보 감지
export const getDeviceInfo = (): DeviceInfo => {
  const width = window.innerWidth;
  const height = window.innerHeight;
  
  let type: DeviceType;
  if (width < BREAKPOINTS.mobile) {
    type = DeviceType.MOBILE;
  } else if (width < BREAKPOINTS.tablet) {
    type = DeviceType.TABLET;
  } else {
    type = DeviceType.DESKTOP;
  }
  
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  
  return {
    type,
    isMobile: type === DeviceType.MOBILE,
    isTablet: type === DeviceType.TABLET,
    isDesktop: type === DeviceType.DESKTOP,
    isTouchDevice,
    screenWidth: width,
    screenHeight: height,
    orientation: width > height ? 'landscape' : 'portrait'
  };
};



// 네트워크 상태 감지 (타입만 유지)
export interface NetworkInfo {
  isOnline: boolean;
  connectionType: string;
  effectiveType: string;
  downlink: number;
  rtt: number;
  saveData: boolean;
}

// 터치 제스처 지원
export interface TouchGesture {
  onTap?: (event: TouchEvent) => void;
  onDoubleTap?: (event: TouchEvent) => void;
  onLongPress?: (event: TouchEvent) => void;
  onSwipeLeft?: (event: TouchEvent) => void;
  onSwipeRight?: (event: TouchEvent) => void;
  onSwipeUp?: (event: TouchEvent) => void;
  onSwipeDown?: (event: TouchEvent) => void;
  onPinch?: (event: TouchEvent, scale: number) => void;
}

export const useTouchGestures = (element: HTMLElement | null, gestures: TouchGesture) => {
  useEffect(() => {
    if (!element) return;
    
    let touchStartX = 0;
    let touchStartY = 0;
    let touchStartTime = 0;
    let tapCount = 0;
    let longPressTimer: NodeJS.Timeout;
    let initialDistance = 0;
    
    const handleTouchStart = (event: TouchEvent) => {
      const touch = event.touches[0];
      touchStartX = touch.clientX;
      touchStartY = touch.clientY;
      touchStartTime = Date.now();
      
      // 롱 프레스 타이머 시작
      if (gestures.onLongPress) {
        longPressTimer = setTimeout(() => {
          gestures.onLongPress!(event);
        }, 500);
      }
      
      // 핀치 제스처를 위한 초기 거리 계산
      if (event.touches.length === 2 && gestures.onPinch) {
        const touch1 = event.touches[0];
        const touch2 = event.touches[1];
        initialDistance = Math.sqrt(
          Math.pow(touch2.clientX - touch1.clientX, 2) +
          Math.pow(touch2.clientY - touch1.clientY, 2)
        );
      }
    };
    
    const handleTouchMove = (event: TouchEvent) => {
      // 롱 프레스 타이머 취소
      if (longPressTimer) {
        clearTimeout(longPressTimer);
      }
      
      // 핀치 제스처 처리
      if (event.touches.length === 2 && gestures.onPinch && initialDistance > 0) {
        const touch1 = event.touches[0];
        const touch2 = event.touches[1];
        const currentDistance = Math.sqrt(
          Math.pow(touch2.clientX - touch1.clientX, 2) +
          Math.pow(touch2.clientY - touch1.clientY, 2)
        );
        const scale = currentDistance / initialDistance;
        gestures.onPinch(event, scale);
      }
    };
    
    const handleTouchEnd = (event: TouchEvent) => {
      if (longPressTimer) {
        clearTimeout(longPressTimer);
      }
      
      const touch = event.changedTouches[0];
      const touchEndX = touch.clientX;
      const touchEndY = touch.clientY;
      const touchEndTime = Date.now();
      
      const deltaX = touchEndX - touchStartX;
      const deltaY = touchEndY - touchStartY;
      const deltaTime = touchEndTime - touchStartTime;
      
      const minSwipeDistance = 50;
      const maxTapTime = 300;
      
      // 스와이프 제스처 감지
      if (Math.abs(deltaX) > minSwipeDistance || Math.abs(deltaY) > minSwipeDistance) {
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
          // 수평 스와이프
          if (deltaX > 0 && gestures.onSwipeRight) {
            gestures.onSwipeRight(event);
          } else if (deltaX < 0 && gestures.onSwipeLeft) {
            gestures.onSwipeLeft(event);
          }
        } else {
          // 수직 스와이프
          if (deltaY > 0 && gestures.onSwipeDown) {
            gestures.onSwipeDown(event);
          } else if (deltaY < 0 && gestures.onSwipeUp) {
            gestures.onSwipeUp(event);
          }
        }
        return;
      }
      
      // 탭 제스처 감지
      if (deltaTime < maxTapTime && Math.abs(deltaX) < 10 && Math.abs(deltaY) < 10) {
        tapCount++;
        
        if (tapCount === 1) {
          // 단일 탭 처리를 위한 지연
          setTimeout(() => {
            if (tapCount === 1 && gestures.onTap) {
              gestures.onTap(event);
            }
            tapCount = 0;
          }, 300);
        } else if (tapCount === 2 && gestures.onDoubleTap) {
          gestures.onDoubleTap(event);
          tapCount = 0;
        }
      }
    };
    
    element.addEventListener('touchstart', handleTouchStart, { passive: false });
    element.addEventListener('touchmove', handleTouchMove, { passive: false });
    element.addEventListener('touchend', handleTouchEnd, { passive: false });
    
    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
      
      if (longPressTimer) {
        clearTimeout(longPressTimer);
      }
    };
  }, [element, gestures]);
};

// 모바일 최적화된 파일 업로드
export const optimizeFileUploadForMobile = (deviceInfo: DeviceInfo, networkInfo: NetworkInfo) => {
  const config = {
    maxConcurrentUploads: 1,
    chunkSize: 1024 * 1024, // 1MB
    retryAttempts: 3,
    compressionEnabled: false
  };
  
  // 모바일 디바이스 최적화
  if (deviceInfo.isMobile) {
    config.maxConcurrentUploads = 1;
    config.chunkSize = 512 * 1024; // 512KB
  }
  
  // 네트워크 상태에 따른 최적화
  if (networkInfo.effectiveType === '2g' || networkInfo.effectiveType === 'slow-2g') {
    config.chunkSize = 256 * 1024; // 256KB
    config.retryAttempts = 5;
  } else if (networkInfo.effectiveType === '3g') {
    config.chunkSize = 512 * 1024; // 512KB
    config.retryAttempts = 4;
  }
  
  // 데이터 절약 모드
  if (networkInfo.saveData) {
    config.compressionEnabled = true;
    config.chunkSize = Math.min(config.chunkSize, 256 * 1024);
  }
  
  return config;
};

// 적응형 로딩 전략
export const getAdaptiveLoadingStrategy = (deviceInfo: DeviceInfo, networkInfo: NetworkInfo) => {
  const strategy = {
    lazyLoadImages: true,
    preloadCriticalResources: true,
    deferNonCriticalScripts: true,
    enableVirtualization: false,
    batchSize: 10
  };
  
  // 모바일 최적화
  if (deviceInfo.isMobile) {
    strategy.enableVirtualization = true;
    strategy.batchSize = 5;
  }
  
  // 저속 네트워크 최적화
  if (networkInfo.effectiveType === '2g' || networkInfo.effectiveType === 'slow-2g') {
    strategy.lazyLoadImages = true;
    strategy.preloadCriticalResources = false;
    strategy.batchSize = 3;
  }
  
  // 데이터 절약 모드
  if (networkInfo.saveData) {
    strategy.lazyLoadImages = true;
    strategy.preloadCriticalResources = false;
    strategy.deferNonCriticalScripts = true;
  }
  
  return strategy;
};

// PWA 지원 감지
export const isPWASupported = (): boolean => {
  return 'serviceWorker' in navigator && 'PushManager' in window;
};

// 오프라인 지원 타입 정의
export interface OfflineSupport {
  isOffline: boolean;
  addToOfflineQueue: (task: () => Promise<void>) => void;
  queueSize: number;
}

// 성능 메트릭 타입 정의
export interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  interactionTime: number;
  memoryUsage: number;
}

// 모바일 UX 개선을 위한 유틸리티
export const enhanceMobileUX = () => {
  // 터치 지연 제거
  document.addEventListener('touchstart', () => {}, { passive: true });
  
  // iOS Safari 주소창 숨김 처리
  const handleResize = () => {
    if (window.innerHeight !== document.documentElement.clientHeight) {
      document.documentElement.style.height = window.innerHeight + 'px';
    }
  };
  
  window.addEventListener('resize', handleResize);
  handleResize();
  
  // 스크롤 성능 최적화
  let ticking = false;
  const handleScroll = () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        // 스크롤 관련 작업 수행
        ticking = false;
      });
      ticking = true;
    }
  };
  
  window.addEventListener('scroll', handleScroll, { passive: true });
  
  return () => {
    window.removeEventListener('resize', handleResize);
    window.removeEventListener('scroll', handleScroll);
  };
};