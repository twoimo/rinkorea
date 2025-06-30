import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface LazyImageProps {
    src: string;
    alt: string;
    className?: string;
    width?: number;
    height?: number;
    priority?: boolean;
    placeholder?: string;
    onLoad?: () => void;
    onError?: () => void;
}

const LazyImage = ({
    src,
    alt,
    className,
    width,
    height,
    priority = false,
    placeholder = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PC9zdmc+',
    onLoad,
    onError,
}: LazyImageProps) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [isInView, setIsInView] = useState(priority);
    const [currentSrc, setCurrentSrc] = useState(priority ? src : placeholder);
    const [hasError, setHasError] = useState(false);
    const imgRef = useRef<HTMLImageElement>(null);

    // WebP 지원 확인
    const supportsWebP = () => {
        if (typeof window === 'undefined') return false;
        const canvas = document.createElement('canvas');
        canvas.width = 1;
        canvas.height = 1;
        return canvas.toDataURL('image/webp').indexOf('webp') !== -1;
    };

    // WebP 경로 생성
    const getOptimizedSrc = (originalSrc: string) => {
        if (supportsWebP() && !originalSrc.includes('.webp')) {
            // 경로를 WebP로 변환 시도
            const pathParts = originalSrc.split('/');
            const filename = pathParts.pop();
            if (filename) {
                const nameWithoutExt = filename.split('.')[0];
                const webpSrc = [...pathParts, 'optimized', `${nameWithoutExt}.webp`].join('/');
                return webpSrc;
            }
        }
        return originalSrc;
    };

    // Intersection Observer for lazy loading
    useEffect(() => {
        if (priority || isInView) return;

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
                rootMargin: '50px',
            }
        );

        if (imgRef.current) {
            observer.observe(imgRef.current);
        }

        return () => observer.disconnect();
    }, [priority, isInView]);

    // 이미지 로딩 관리
    useEffect(() => {
        if (!isInView) return;

        const optimizedSrc = getOptimizedSrc(src);

        // 이미지 preload
        const img = new Image();
        img.onload = () => {
            setCurrentSrc(optimizedSrc);
            setIsLoaded(true);
            onLoad?.();
        };
        img.onerror = () => {
            // WebP 실패시 원본 이미지로 fallback
            if (optimizedSrc !== src) {
                const fallbackImg = new Image();
                fallbackImg.onload = () => {
                    setCurrentSrc(src);
                    setIsLoaded(true);
                    onLoad?.();
                };
                fallbackImg.onerror = () => {
                    setHasError(true);
                    onError?.();
                };
                fallbackImg.src = src;
            } else {
                setHasError(true);
                onError?.();
            }
        };
        img.src = optimizedSrc;
    }, [isInView, src, onLoad, onError]);

    if (hasError) {
        return (
            <div
                className={cn(
                    "flex items-center justify-center bg-gray-200 text-gray-500",
                    className
                )}
                style={{ width, height }}
            >
                <span className="text-sm">이미지 로드 실패</span>
            </div>
        );
    }

    return (
        <img
            ref={imgRef}
            src={currentSrc}
            alt={alt}
            className={cn(
                "transition-opacity duration-300",
                isLoaded ? "opacity-100" : "opacity-0",
                className
            )}
            width={width}
            height={height}
            loading={priority ? "eager" : "lazy"}
            decoding="async"
            style={{
                aspectRatio: width && height ? `${width}/${height}` : undefined,
            }}
        />
    );
};

export default LazyImage; 