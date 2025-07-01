// Web Vitals 성능 메트릭 수집
export const reportWebVitals = () => {
    if (typeof window !== 'undefined' && 'performance' in window && 'PerformanceObserver' in window) {
        try {
            // CLS (Cumulative Layout Shift) 측정
            let cls = 0;
            if ('PerformanceObserver' in window) {
                try {
                    new PerformanceObserver((list) => {
                        for (const entry of list.getEntries()) {
                            const layoutShiftEntry = entry as PerformanceEntry & { hadRecentInput?: boolean; value?: number };
                            if (!layoutShiftEntry.hadRecentInput) {
                                cls += layoutShiftEntry.value || 0;
                            }
                        }
                    }).observe({ type: 'layout-shift', buffered: true });
                } catch {
                    console.warn('Layout shift measurement not supported');
                }

                // LCP (Largest Contentful Paint) 측정
                try {
                    new PerformanceObserver((list) => {
                        const entries = list.getEntries();
                        const lastEntry = entries[entries.length - 1];
                        console.log('LCP:', lastEntry.startTime);
                    }).observe({ type: 'largest-contentful-paint', buffered: true });
                } catch {
                    console.warn('LCP measurement not supported');
                }

                // FID (First Input Delay) 측정
                try {
                    new PerformanceObserver((list) => {
                        for (const entry of list.getEntries()) {
                            const fidEntry = entry as PerformanceEntry & { processingStart?: number };
                            console.log('FID:', (fidEntry.processingStart || 0) - entry.startTime);
                        }
                    }).observe({ type: 'first-input', buffered: true });
                } catch {
                    console.warn('FID measurement not supported');
                }
            }

            // 페이지 로드 완료 시 CLS 리포트
            window.addEventListener('beforeunload', () => {
                console.log('CLS:', cls);
            });
        } catch (error) {
            console.warn('Performance monitoring failed:', error);
        }
    }
};

// Critical Resource Preloading
export const preloadCriticalResources = () => {
    if (typeof window !== 'undefined') {
        // 중요한 폰트 preload
        const fontUrls = [
            'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiA.woff2',
        ];

        fontUrls.forEach(url => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.href = url;
            link.as = 'font';
            link.type = 'font/woff2';
            link.crossOrigin = 'anonymous';
            document.head.appendChild(link);
        });

        // 중요한 이미지 preload
        const criticalImages = [
            '/images/optimized/site-icon-512.webp',
            '/images/optimized/site-icon-512.webp',
        ];

        criticalImages.forEach(src => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.href = src;
            link.as = 'image';
            document.head.appendChild(link);
        });
    }
};

// Connection 최적화
export const optimizeConnections = () => {
    if (typeof window !== 'undefined') {
        // DNS prefetch for external domains
        const domains = [
            'https://fonts.googleapis.com',
            'https://fonts.gstatic.com',
            'https://api.rinkorea.com',
        ];

        domains.forEach(domain => {
            const link = document.createElement('link');
            link.rel = 'dns-prefetch';
            link.href = domain;
            document.head.appendChild(link);
        });
    }
};

// 이미지 최적화 유틸리티
export const getOptimizedImageSrc = (src: string, width?: number, _quality = 75) => {
    // WebP 지원 확인
    const supportsWebP = () => {
        if (typeof window === 'undefined') return false;
        const canvas = document.createElement('canvas');
        canvas.width = 1;
        canvas.height = 1;
        return canvas.toDataURL('image/webp').indexOf('webp') !== -1;
    };

    // Optimized 디렉토리에서 WebP 이미지 찾기
    if (supportsWebP() && !src.includes('.webp')) {
        const pathParts = src.split('/');
        const filename = pathParts.pop();
        if (filename) {
            const nameWithoutExt = filename.split('.')[0];
            const webpSrc = [...pathParts, 'optimized', `${nameWithoutExt}.webp`].join('/');
            return webpSrc;
        }
    }

    return src;
};

// 모바일 최적화
export const enableMobileOptimizations = () => {
    if (typeof window !== 'undefined') {
        try {
            // Viewport meta tag 동적 설정 (이미 있으면 건드리지 않음)
            const existingViewport = document.querySelector('meta[name=viewport]') as HTMLMetaElement;
            if (!existingViewport) {
                const viewport = document.createElement('meta');
                viewport.name = 'viewport';
                viewport.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
                document.head.appendChild(viewport);
            }

            // Touch 최적화 (passive로 변경하여 성능 향상)
            document.addEventListener('touchstart', (event) => {
                if (event.touches.length > 1) {
                    event.preventDefault();
                }
            }, { passive: true });

            // iOS 사파리 최적화
            if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
                document.body.style.setProperty('-webkit-overflow-scrolling', 'touch');
                document.body.style.setProperty('-webkit-tap-highlight-color', 'transparent');
            }

            // Android 최적화
            if (/Android/.test(navigator.userAgent)) {
                document.body.style.setProperty('touch-action', 'manipulation');
            }
        } catch (error) {
            console.warn('Mobile optimization failed:', error);
        }
    }
};

// 네트워크 상태 감지 및 최적화
export const optimizeForNetworkCondition = () => {
    if (typeof window !== 'undefined') {
        try {
            const connection = (navigator as Navigator & { connection?: { effectiveType?: string; saveData?: boolean; addEventListener?: (type: string, listener: () => void) => void } }).connection;

            if (connection) {
                const { effectiveType, saveData } = connection;

                // 느린 네트워크에서 이미지 품질 조정
                if (effectiveType === 'slow-2g' || effectiveType === '2g' || saveData) {
                    document.documentElement.setAttribute('data-network', 'slow');

                    // 이미지 로딩 지연
                    const images = document.querySelectorAll('img[loading="lazy"]');
                    images.forEach(img => {
                        (img as HTMLImageElement).loading = 'lazy';
                    });
                }

                // 네트워크 변화 감지
                if (connection.addEventListener) {
                    connection.addEventListener('change', () => {
                        if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
                            document.documentElement.setAttribute('data-network', 'slow');
                        } else {
                            document.documentElement.removeAttribute('data-network');
                        }
                    });
                }
            }
        } catch (error) {
            console.warn('Network condition optimization failed:', error);
        }
    }
};

// 리소스 힌트 동적 추가
export const addResourceHints = () => {
    if (typeof window !== 'undefined') {
        // 다음 페이지 prefetch
        const navigationLinks = document.querySelectorAll('a[href^="/"]');
        navigationLinks.forEach(link => {
            const href = (link as HTMLAnchorElement).href;
            if (href && !href.includes('#')) {
                const prefetchLink = document.createElement('link');
                prefetchLink.rel = 'prefetch';
                prefetchLink.href = href;
                document.head.appendChild(prefetchLink);
            }
        });
    }
};

// 성능 메트릭 초기화 (더 안전하게)
export const initPerformanceMonitoring = () => {
    if (typeof window === 'undefined') return;

    try {
        // React가 렌더링된 후에만 실행
        const reactRoot = document.getElementById('root');
        if (!reactRoot || !reactRoot.children.length) {
            // React가 아직 렌더링되지 않음, 재시도
            setTimeout(initPerformanceMonitoring, 100);
            return;
        }

        // 안전한 최적화만 즉시 실행
        setTimeout(() => {
            try {
                optimizeConnections();
            } catch (e) {
                console.warn('Connection optimization failed:', e);
            }
        }, 0);

        setTimeout(() => {
            try {
                enableMobileOptimizations();
            } catch (e) {
                console.warn('Mobile optimization failed:', e);
            }
        }, 100);

        // 더 늦게 실행되는 최적화들
        setTimeout(() => {
            try {
                preloadCriticalResources();
                optimizeForNetworkCondition();
            } catch (e) {
                console.warn('Resource optimization failed:', e);
            }
        }, 300);

        // 페이지 로드 완료 후 실행
        setTimeout(() => {
            try {
                if (document.readyState === 'complete') {
                    reportWebVitals();
                    addResourceHints();
                } else {
                    window.addEventListener('load', () => {
                        reportWebVitals();
                        addResourceHints();
                    });
                }
            } catch (e) {
                console.warn('Web vitals failed:', e);
            }
        }, 1000);

        // 성능 분석 로그 (개발 모드에서만)
        if (import.meta.env.DEV) {
            console.log('🚀 Performance monitoring initialized safely');
            console.log('💡 Lazy loading enabled for DND and Charts');
            console.log('📊 Bundle optimization active');
        }
    } catch (error) {
        console.warn('Performance monitoring initialization failed:', error);
    }
}; 