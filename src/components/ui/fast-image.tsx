import React, { useState, useEffect, useRef, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { imagePreloader, isImageCached } from '@/utils/image-preloader';

interface FastImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
    src: string;
    alt: string;
    width?: number;
    height?: number;
    priority?: boolean;
    quality?: number;
    sizes?: string;
    className?: string;
    fallbackSrc?: string;
    onLoad?: () => void;
    onError?: () => void;
    placeholder?: string;
}

// 사용된 프리로더 라이브러리로 대체됨

export const FastImage: React.FC<FastImageProps> = ({
    src,
    alt,
    width,
    height,
    priority = false,
    quality: _quality = 80,
    sizes,
    className,
    fallbackSrc = '/images/optimized/placeholder.webp',
    onLoad,
    onError,
    placeholder = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzlhOWE5YSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkxvYWRpbmcuLi48L3RleHQ+PC9zdmc+',
    loading = priority ? 'eager' : 'lazy',
    ...props
}) => {
    const [currentSrc, setCurrentSrc] = useState<string>(priority ? '' : placeholder);
    const [isLoaded, setIsLoaded] = useState(false);
    const [hasError, setHasError] = useState(false);
    const [isInView, setIsInView] = useState(priority);
    const imgRef = useRef<HTMLImageElement>(null);
    const observerRef = useRef<IntersectionObserver | null>(null);

    // 이미지 로딩 함수 (빠른 처리)
    const loadImage = useCallback(async () => {
        if (!isInView || currentSrc === src) return;

        const { webpUrl, originalUrl } = imagePreloader.getOptimizedUrl(src);
        const supportsWebP = imagePreloader.checkWebPSupport();

        // WebP 지원 시 WebP 우선 시도, 아니면 바로 원본
        const primarySrc = supportsWebP ? webpUrl : originalUrl;

        try {
            // 캐시된 이미지 확인
            if (isImageCached(primarySrc)) {
                setCurrentSrc(primarySrc);
                setIsLoaded(true);
                return;
            }

            // 프리로더를 통한 이미지 로딩
            await imagePreloader.loadImage(src, priority);
            setCurrentSrc(primarySrc);
            setIsLoaded(true);
        } catch (error) {
            console.warn('Failed to load image:', error);
            setHasError(true);
            setCurrentSrc(fallbackSrc);
        }
    }, [src, isInView, currentSrc, fallbackSrc, priority]);

    // Intersection Observer (lazy loading)
    useEffect(() => {
        if (priority || isInView) {
            loadImage();
            return;
        }

        const observer = new IntersectionObserver(
            (entries) => {
                const [entry] = entries;
                if (entry.isIntersecting) {
                    setIsInView(true);
                    observer.disconnect();
                }
            },
            {
                threshold: 0.1,
                rootMargin: '100px', // 더 일찍 로딩 시작
            }
        );

        if (imgRef.current) {
            observer.observe(imgRef.current);
        }

        observerRef.current = observer;

        return () => {
            observer.disconnect();
        };
    }, [priority, isInView, loadImage]);

    // Priority 이미지는 즉시 로딩
    useEffect(() => {
        if (priority) {
            const { webpUrl, originalUrl } = imagePreloader.getOptimizedUrl(src);
            const supportsWebP = imagePreloader.checkWebPSupport();
            setCurrentSrc(supportsWebP ? webpUrl : originalUrl);
            setIsInView(true);
        }
    }, [priority, src]);

    const handleLoad = useCallback(() => {
        setIsLoaded(true);
        onLoad?.();
    }, [onLoad]);

    const handleError = useCallback(() => {
        if (!hasError) {
            setHasError(true);
            onError?.();
        }
    }, [hasError, onError]);

    return (
        <div className={cn('relative overflow-hidden', className)} style={{ width, height }}>
            {/* Loading skeleton */}
            {!isLoaded && !hasError && (
                <div
                    className="absolute inset-0 bg-gray-100 animate-pulse"
                    style={{
                        background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
                        backgroundSize: '200% 100%',
                        animation: 'loading 1.5s infinite',
                    }}
                />
            )}

            {/* Error state */}
            {hasError && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-50 text-gray-400">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                </div>
            )}

            {/* Main image */}
            <img
                ref={imgRef}
                src={currentSrc}
                alt={alt}
                width={width}
                height={height}
                sizes={sizes}
                loading={loading}
                className={cn(
                    'w-full h-full object-cover transition-opacity duration-300',
                    isLoaded ? 'opacity-100' : 'opacity-0'
                )}
                onLoad={handleLoad}
                onError={handleError}
                {...props}
            />
        </div>
    );
};

// CSS animation for loading skeleton
const style = document.createElement('style');
style.textContent = `
    @keyframes loading {
        0% { background-position: -200% 0; }
        100% { background-position: 200% 0; }
    }
`;
if (!document.head.querySelector('[data-loading-animation]')) {
    style.setAttribute('data-loading-animation', 'true');
    document.head.appendChild(style);
}

export default FastImage; 