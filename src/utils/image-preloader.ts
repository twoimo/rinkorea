// High-performance image preloader with intelligent caching

interface ImageCache {
    url: string;
    timestamp: number;
    element?: HTMLImageElement;
    status: 'loading' | 'loaded' | 'error';
}

class ImagePreloader {
    private cache = new Map<string, ImageCache>();
    private loadingPromises = new Map<string, Promise<HTMLImageElement>>();
    private maxCacheSize = 50;
    private cacheTimeout = 5 * 60 * 1000; // 5분

    // WebP 지원 확인 (한 번만)
    private webpSupported: boolean | null = null;

    checkWebPSupport(): boolean {
        if (this.webpSupported !== null) return this.webpSupported;

        try {
            const canvas = document.createElement('canvas');
            canvas.width = 1;
            canvas.height = 1;
            this.webpSupported = canvas.toDataURL('image/webp').indexOf('webp') !== -1;
        } catch {
            this.webpSupported = false;
        }

        return this.webpSupported;
    }

    // 최적화된 URL 생성
    getOptimizedUrl(src: string): { webpUrl: string; originalUrl: string } {
        // 이미 최적화된 경로인 경우 그대로 반환
        if (src.includes('/optimized/')) {
            const originalUrl = src.replace('/optimized/', '/').replace('.webp', '.jpg'); // 또는 원본 확장자로
            return { webpUrl: src, originalUrl };
        }

        const pathParts = src.split('/');
        const filename = pathParts.pop();

        if (!filename) return { webpUrl: src, originalUrl: src };

        const nameWithoutExt = filename.replace(/\.[^/.]+$/, '');
        const basePath = pathParts.join('/');

        let webpUrl: string;
        if (basePath === '/images' || basePath === 'images' || basePath === '') {
            webpUrl = `/images/optimized/${nameWithoutExt}.webp`;
        } else {
            webpUrl = `${basePath}/optimized/${nameWithoutExt}.webp`;
        }

        return { webpUrl, originalUrl: src };
    }

    // 캐시 정리
    private cleanCache() {
        const now = Date.now();
        const entries = Array.from(this.cache.entries());

        // 만료된 항목 제거
        for (const [url, cacheItem] of entries) {
            if (now - cacheItem.timestamp > this.cacheTimeout) {
                this.cache.delete(url);
            }
        }

        // 크기 제한 적용 (LRU)
        if (this.cache.size > this.maxCacheSize) {
            const sortedEntries = entries
                .sort(([, a], [, b]) => a.timestamp - b.timestamp)
                .slice(0, this.cache.size - this.maxCacheSize);

            for (const [url] of sortedEntries) {
                this.cache.delete(url);
            }
        }
    }

    // 이미지 즉시 확인 (동기적)
    isImageCached(url: string): boolean {
        const cached = this.cache.get(url);
        if (!cached) return false;

        // 만료 확인
        if (Date.now() - cached.timestamp > this.cacheTimeout) {
            this.cache.delete(url);
            return false;
        }

        return cached.status === 'loaded';
    }

    // 빠른 이미지 로딩
    async loadImage(src: string, priority = false): Promise<HTMLImageElement> {
        const { webpUrl, originalUrl } = this.getOptimizedUrl(src);
        const supportsWebP = this.checkWebPSupport();

        // 우선순위에 따라 URL 결정
        const primaryUrl = supportsWebP ? webpUrl : originalUrl;
        const fallbackUrls = supportsWebP ? [originalUrl] : [];

        // 캐시 확인
        if (this.isImageCached(primaryUrl)) {
            const cached = this.cache.get(primaryUrl);
            if (cached?.element) {
                return cached.element;
            }
        }

        // 이미 로딩 중인 경우 기존 Promise 반환
        if (this.loadingPromises.has(primaryUrl)) {
            return this.loadingPromises.get(primaryUrl)!;
        }

        // 새 로딩 시작
        const loadPromise = this.loadSingleImage(primaryUrl, fallbackUrls, priority);
        this.loadingPromises.set(primaryUrl, loadPromise);

        try {
            const result = await loadPromise;
            this.loadingPromises.delete(primaryUrl);
            return result;
        } catch (error) {
            this.loadingPromises.delete(primaryUrl);
            throw error;
        }
    }

    private async loadSingleImage(
        primaryUrl: string,
        fallbackUrls: string[],
        priority: boolean
    ): Promise<HTMLImageElement> {
        const urls = [primaryUrl, ...fallbackUrls];

        for (const url of urls) {
            try {
                // 캐시에 로딩 중 표시
                this.cache.set(url, {
                    url,
                    timestamp: Date.now(),
                    status: 'loading'
                });

                const img = await this.createImageElement(url, priority);

                // 성공적으로 로딩된 경우 캐시에 저장
                this.cache.set(url, {
                    url,
                    timestamp: Date.now(),
                    element: img,
                    status: 'loaded'
                });

                this.cleanCache();
                return img;

            } catch (error) {
                // 실패한 경우 캐시에 에러 표시
                this.cache.set(url, {
                    url,
                    timestamp: Date.now(),
                    status: 'error'
                });

                console.warn(`Failed to load image: ${url}`, error);
                continue;
            }
        }

        throw new Error(`Failed to load any variant of image: ${primaryUrl}`);
    }

    private createImageElement(url: string, priority: boolean): Promise<HTMLImageElement> {
        return new Promise((resolve, reject) => {
            const img = new Image();

            img.onload = () => {
                resolve(img);
            };

            img.onerror = () => {
                reject(new Error(`Failed to load image: ${url}`));
            };

            // Priority 이미지는 더 높은 우선순위로 설정
            if (priority) {
                img.loading = 'eager';
                (img as any).fetchPriority = 'high';
            }

            img.src = url;
        });
    }

    // 여러 이미지 일괄 프리로드
    async preloadImages(urls: string[], priority = false): Promise<void> {
        const promises = urls.map(url =>
            this.loadImage(url, priority).catch(error => {
                console.warn(`Preload failed for ${url}:`, error);
                return null;
            })
        );

        await Promise.allSettled(promises);
    }

    // 크리티컬 이미지 프리로드
    async preloadCriticalImages(): Promise<void> {
        const criticalImages: string[] = [
            // 현재는 비워둠. 필요시 실제 존재하는 중요한 이미지 경로 추가
            // 예: '/images/optimized/your-critical-image.webp'
        ];

        if (criticalImages.length > 0) {
            await this.preloadImages(criticalImages, true);
        }
    }

    // 캐시 정보 출력 (디버깅용)
    getCacheInfo() {
        return {
            size: this.cache.size,
            maxSize: this.maxCacheSize,
            items: Array.from(this.cache.entries()).map(([url, item]) => ({
                url,
                status: item.status,
                age: Date.now() - item.timestamp
            }))
        };
    }

    // 캐시 초기화
    clearCache() {
        this.cache.clear();
        this.loadingPromises.clear();
    }
}

// 싱글톤 인스턴스
export const imagePreloader = new ImagePreloader();

// 편의 함수들
export const preloadImage = (src: string, priority = false) =>
    imagePreloader.loadImage(src, priority);

export const preloadImages = (urls: string[], priority = false) =>
    imagePreloader.preloadImages(urls, priority);

export const preloadCriticalImages = () =>
    imagePreloader.preloadCriticalImages();

export const isImageCached = (url: string) =>
    imagePreloader.isImageCached(url);

export const getOptimizedImageUrl = (src: string) =>
    imagePreloader.getOptimizedUrl(src);

export const checkWebPSupport = () =>
    imagePreloader.checkWebPSupport();

// 초기화 함수
export const initImagePreloader = async () => {
    if (typeof window === 'undefined') return;

    try {
        // WebP 지원 확인
        imagePreloader.checkWebPSupport();

        // 페이지 로드 완료 후 크리티컬 이미지 프리로드
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                setTimeout(() => imagePreloader.preloadCriticalImages(), 100);
            });
        } else {
            setTimeout(() => imagePreloader.preloadCriticalImages(), 100);
        }

        // 개발 환경에서 캐시 정보 출력
        if (import.meta.env.DEV) {
            (window as any).imagePreloader = imagePreloader;
            console.log('Image preloader initialized');
        }
    } catch (error) {
        console.warn('Image preloader initialization failed:', error);
    }
}; 