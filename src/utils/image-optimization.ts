// Global image optimization utilities

export interface ImageOptimizationOptions {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'webp' | 'jpg' | 'png';
    lazy?: boolean;
    priority?: boolean;
}

// WebP 지원 감지 (캐시됨)
let webpSupported: boolean | null = null;

export const checkWebPSupport = (): Promise<boolean> => {
    if (webpSupported !== null) {
        return Promise.resolve(webpSupported);
    }

    return new Promise((resolve) => {
        const webp = new Image();
        webp.onload = webp.onerror = () => {
            webpSupported = (webp.height === 2);
            resolve(webpSupported);
        };
        webp.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
    });
};

// 최적화된 이미지 URL 생성
export const getOptimizedImageUrl = (src: string, options: ImageOptimizationOptions = {}): string => {
    const { width, height, quality = 75, format } = options;

    // WebP 변환 로직
    if (format === 'webp' || (format === undefined && webpSupported)) {
        const pathParts = src.split('/');
        const filename = pathParts.pop();
        if (filename) {
            const nameWithoutExt = filename.split('.')[0];
            const webpSrc = [...pathParts, 'optimized', `${nameWithoutExt}.webp`].join('/');
            return webpSrc;
        }
    }

    // 원본 이미지 반환
    return src;
};

// 이미지 preload 유틸리티
export const preloadImage = (src: string, options: ImageOptimizationOptions = {}): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
        const img = new Image();

        img.onload = () => resolve(img);
        img.onerror = reject;

        if (options.width) img.width = options.width;
        if (options.height) img.height = options.height;

        img.src = getOptimizedImageUrl(src, options);
    });
};

// Critical 이미지들 일괄 preload
export const preloadCriticalImages = async () => {
    const criticalImages = [
        '/images/optimized/site-icon-512.webp',
        '/images/site-icon-512.png', // fallback
    ];

    try {
        // 이미지 존재 여부 확인 후 preload
        const validImages = await Promise.allSettled(
            criticalImages.map(async (src) => {
                try {
                    // 이미지 존재 확인
                    const response = await fetch(src, { method: 'HEAD' });
                    if (response.ok) {
                        return preloadImage(src, { priority: true });
                    } else {
                        console.warn(`Image not found: ${src}`);
                        return null;
                    }
                } catch (error) {
                    console.warn(`Failed to check image: ${src}`, error);
                    return null;
                }
            })
        );

        const successCount = validImages.filter(result =>
            result.status === 'fulfilled' && result.value !== null
        ).length;

        if (import.meta.env.DEV) {
            console.log(`Critical images preloaded: ${successCount}/${criticalImages.length}`);
        }
    } catch (error) {
        console.warn('Critical images preload failed:', error);
    }
};

// Intersection Observer를 사용한 lazy loading
export const createLazyImageObserver = (callback: (entries: IntersectionObserverEntry[]) => void) => {
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
        return null;
    }

    return new IntersectionObserver(callback, {
        root: null,
        rootMargin: '50px',
        threshold: 0.1,
    });
};

// 모든 이미지에 lazy loading 적용
export const enableGlobalImageLazyLoading = () => {
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
        return;
    }

    const observer = createLazyImageObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                const img = entry.target as HTMLImageElement;
                const dataSrc = img.getAttribute('data-src');

                if (dataSrc) {
                    img.src = getOptimizedImageUrl(dataSrc);
                    img.removeAttribute('data-src');
                    observer?.unobserve(img);
                }
            }
        });
    });

    // 기존 이미지들에 lazy loading 적용
    const images = document.querySelectorAll('img[data-src]');
    images.forEach((img) => observer?.observe(img));

    return observer;
};

// 네트워크 상태에 따른 이미지 품질 조정
export const getAdaptiveImageQuality = (): number => {
    if (typeof window === 'undefined' || !('navigator' in window)) {
        return 75; // 기본값
    }

    const connection = (navigator as Navigator & { connection?: { effectiveType?: string; saveData?: boolean } }).connection;
    if (!connection) return 75;

    const { effectiveType, saveData } = connection;

    if (saveData) return 50; // 데이터 절약 모드

    switch (effectiveType) {
        case 'slow-2g':
        case '2g':
            return 50;
        case '3g':
            return 65;
        case '4g':
        default:
            return 85;
    }
};

// 이미지 최적화 초기화 (더 안전하게)
export const initImageOptimization = async () => {
    if (typeof window === 'undefined') return;

    try {
        // React가 렌더링된 후에만 실행
        const reactRoot = document.getElementById('root');
        if (!reactRoot || !reactRoot.children.length) {
            // React가 아직 렌더링되지 않음, 재시도
            setTimeout(initImageOptimization, 200);
            return;
        }

        // WebP 지원 확인 (안전하게)
        setTimeout(async () => {
            try {
                await checkWebPSupport();
            } catch (e) {
                console.warn('WebP support check failed:', e);
            }
        }, 0);

        // Critical 이미지 preload (더 늦게)
        setTimeout(async () => {
            try {
                await preloadCriticalImages();
            } catch (e) {
                console.warn('Critical images preload failed:', e);
            }
        }, 500);

        // 전역 lazy loading 활성화 (가장 늦게)
        setTimeout(() => {
            try {
                if (document.readyState === 'loading') {
                    document.addEventListener('DOMContentLoaded', enableGlobalImageLazyLoading);
                } else {
                    enableGlobalImageLazyLoading();
                }
            } catch (e) {
                console.warn('Global image lazy loading failed:', e);
            }
        }, 1000);

        if (import.meta.env.DEV) {
            console.log('Image optimization initialized safely');
        }
    } catch (error) {
        console.warn('Image optimization initialization failed:', error);
    }
}; 