import { useState, useEffect } from 'react';

// 브레이크포인트 정의 (Tailwind CSS 기준)
export const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

export type Breakpoint = keyof typeof breakpoints;

// 현재 화면 크기 감지 훅
export const useScreenSize = () => {
  const [screenSize, setScreenSize] = useState<{
    width: number;
    height: number;
  }>({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  });

  useEffect(() => {
    const handleResize = () => {
      setScreenSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return screenSize;
};

// 브레이크포인트 감지 훅
export const useBreakpoint = (breakpoint: Breakpoint) => {
  const { width } = useScreenSize();
  return width >= breakpoints[breakpoint];
};

// 현재 브레이크포인트 반환 훅
export const useCurrentBreakpoint = (): Breakpoint => {
  const { width } = useScreenSize();

  if (width >= breakpoints['2xl']) return '2xl';
  if (width >= breakpoints.xl) return 'xl';
  if (width >= breakpoints.lg) return 'lg';
  if (width >= breakpoints.md) return 'md';
  if (width >= breakpoints.sm) return 'sm';
  return 'sm'; // 기본값
};

// 모바일 감지 훅
export const useIsMobile = () => {
  return !useBreakpoint('md');
};

// 태블릿 감지 훅
export const useIsTablet = () => {
  const isMd = useBreakpoint('md');
  const isLg = useBreakpoint('lg');
  return isMd && !isLg;
};

// 데스크톱 감지 훅
export const useIsDesktop = () => {
  return useBreakpoint('lg');
};

// 반응형 값 선택 훅
export const useResponsiveValue = <T>(values: {
  sm?: T;
  md?: T;
  lg?: T;
  xl?: T;
  '2xl'?: T;
  default: T;
}): T => {
  const currentBreakpoint = useCurrentBreakpoint();
  
  // 현재 브레이크포인트부터 역순으로 확인
  const breakpointOrder: Breakpoint[] = ['2xl', 'xl', 'lg', 'md', 'sm'];
  const currentIndex = breakpointOrder.indexOf(currentBreakpoint);
  
  for (let i = currentIndex; i < breakpointOrder.length; i++) {
    const bp = breakpointOrder[i];
    if (values[bp] !== undefined) {
      return values[bp]!;
    }
  }
  
  return values.default;
};

// 그리드 컬럼 수 계산 훅
export const useResponsiveColumns = (options: {
  sm?: number;
  md?: number;
  lg?: number;
  xl?: number;
  '2xl'?: number;
  default: number;
}) => {
  return useResponsiveValue(options);
};

// 컨테이너 패딩 계산 훅
export const useResponsivePadding = () => {
  return useResponsiveValue({
    sm: 'px-4',
    md: 'px-6',
    lg: 'px-8',
    xl: 'px-12',
    default: 'px-4'
  });
};

// 폰트 크기 계산 훅
export const useResponsiveFontSize = (size: 'sm' | 'md' | 'lg' | 'xl') => {
  const fontSizes = {
    sm: useResponsiveValue({
      sm: 'text-sm',
      md: 'text-base',
      default: 'text-sm'
    }),
    md: useResponsiveValue({
      sm: 'text-base',
      md: 'text-lg',
      lg: 'text-xl',
      default: 'text-base'
    }),
    lg: useResponsiveValue({
      sm: 'text-lg',
      md: 'text-xl',
      lg: 'text-2xl',
      default: 'text-lg'
    }),
    xl: useResponsiveValue({
      sm: 'text-xl',
      md: 'text-2xl',
      lg: 'text-3xl',
      xl: 'text-4xl',
      default: 'text-xl'
    })
  };

  return fontSizes[size];
};

// 터치 디바이스 감지 훅
export const useIsTouchDevice = () => {
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    const checkTouchDevice = () => {
      return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    };

    setIsTouchDevice(checkTouchDevice());
  }, []);

  return isTouchDevice;
};

// 디바이스 방향 감지 훅
export const useOrientation = () => {
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');

  useEffect(() => {
    const handleOrientationChange = () => {
      setOrientation(window.innerHeight > window.innerWidth ? 'portrait' : 'landscape');
    };

    handleOrientationChange(); // 초기값 설정
    window.addEventListener('resize', handleOrientationChange);
    
    return () => window.removeEventListener('resize', handleOrientationChange);
  }, []);

  return orientation;
};

// 다크 모드 감지 훅
export const usePrefersDarkMode = () => {
  const [prefersDarkMode, setPrefersDarkMode] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setPrefersDarkMode(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersDarkMode(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return prefersDarkMode;
};

// 접근성 설정 감지 훅
export const useAccessibilityPreferences = () => {
  const [preferences, setPreferences] = useState({
    prefersReducedMotion: false,
    prefersHighContrast: false,
  });

  useEffect(() => {
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const contrastQuery = window.matchMedia('(prefers-contrast: high)');

    const updatePreferences = () => {
      setPreferences({
        prefersReducedMotion: motionQuery.matches,
        prefersHighContrast: contrastQuery.matches,
      });
    };

    updatePreferences();

    motionQuery.addEventListener('change', updatePreferences);
    contrastQuery.addEventListener('change', updatePreferences);

    return () => {
      motionQuery.removeEventListener('change', updatePreferences);
      contrastQuery.removeEventListener('change', updatePreferences);
    };
  }, []);

  return preferences;
};

// 반응형 테이블 컬럼 표시 훅
export const useResponsiveTableColumns = <T extends string>(
  allColumns: T[],
  priorities: Record<T, number> // 낮을수록 우선순위 높음
) => {
  const currentBreakpoint = useCurrentBreakpoint();
  
  const maxColumns = useResponsiveValue({
    sm: 2,
    md: 4,
    lg: 6,
    xl: 8,
    '2xl': 10,
    default: 2
  });

  const visibleColumns = allColumns
    .sort((a, b) => priorities[a] - priorities[b])
    .slice(0, maxColumns);

  return {
    visibleColumns,
    hiddenColumns: allColumns.filter(col => !visibleColumns.includes(col)),
    maxColumns
  };
};

// 반응형 네비게이션 훅
export const useResponsiveNavigation = () => {
  const isMobile = useIsMobile();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!isMobile) {
      setIsMobileMenuOpen(false);
    }
  }, [isMobile]);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(prev => !prev);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return {
    isMobile,
    isMobileMenuOpen,
    toggleMobileMenu,
    closeMobileMenu
  };
};