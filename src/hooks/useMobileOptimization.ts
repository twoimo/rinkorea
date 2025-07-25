// 모바일 최적화 관련 React hooks
import { useState, useEffect } from 'react';

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

// 반응형 훅
export const useResponsive = () => {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>(getDeviceInfo);
  
  useEffect(() => {
    const handleResize = () => {
      setDeviceInfo(getDeviceInfo());
    };
    
    const handleOrientationChange = () => {
      // 오리엔테이션 변경 시 약간의 지연 후 업데이트
      setTimeout(() => {
        setDeviceInfo(getDeviceInfo());
      }, 100);
    };
    
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleOrientationChange);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  }, []);
  
  return deviceInfo;
};

// 네트워크 상태 감지
export interface NetworkInfo {
  isOnline: boolean;
  connectionType: string;
  effectiveType: string;
  downlink: number;
  rtt: number;
  saveData: boolean;
}

export const useNetworkStatus = () => {
  const [networkInfo, setNetworkInfo] = useState<NetworkInfo>(() => {
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    
    return {
      isOnline: navigator.onLine,
      connectionType: connection?.type || 'unknown',
      effectiveType: connection?.effectiveType || 'unknown',
      downlink: connection?.downlink || 0,
      rtt: connection?.rtt || 0,
      saveData: connection?.saveData || false
    };
  });
  
  useEffect(() => {
    const updateNetworkInfo = () => {
      const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
      
      setNetworkInfo({
        isOnline: navigator.onLine,
        connectionType: connection?.type || 'unknown',
        effectiveType: connection?.effectiveType || 'unknown',
        downlink: connection?.downlink || 0,
        rtt: connection?.rtt || 0,
        saveData: connection?.saveData || false
      });
    };
    
    window.addEventListener('online', updateNetworkInfo);
    window.addEventListener('offline', updateNetworkInfo);
    
    const connection = (navigator as any).connection;
    if (connection) {
      connection.addEventListener('change', updateNetworkInfo);
    }
    
    return () => {
      window.removeEventListener('online', updateNetworkInfo);
      window.removeEventListener('offline', updateNetworkInfo);
      
      if (connection) {
        connection.removeEventListener('change', updateNetworkInfo);
      }
    };
  }, []);
  
  return networkInfo;
};

// 오프라인 상태 관리
export const useOfflineSupport = () => {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [offlineQueue, setOfflineQueue] = useState<Array<() => Promise<void>>>([]);
  
  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      
      // 오프라인 큐 처리
      offlineQueue.forEach(async (task) => {
        try {
          await task();
        } catch (error) {
          console.error('오프라인 큐 작업 실패:', error);
        }
      });
      
      setOfflineQueue([]);
    };
    
    const handleOffline = () => {
      setIsOffline(true);
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [offlineQueue]);
  
  const addToOfflineQueue = (task: () => Promise<void>) => {
    setOfflineQueue(prev => [...prev, task]);
  };
  
  return {
    isOffline,
    addToOfflineQueue,
    queueSize: offlineQueue.length
  };
};