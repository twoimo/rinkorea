import { useState, useEffect, useRef, memo, useMemo } from "react";
import { cn } from "@/lib/utils";

interface OptimizedImageProps {
    src: string;
    alt: string;
    className?: string;
    width?: number;
    height?: number;
    priority?: boolean;
    placeholder?: string;
    onLoad?: () => void;
    onError?: () => void;
    sizes?: string;
    quality?: number;
    webpSrc?: string;
    blurDataURL?: string;
}

// IntersectionObserver singleton for performance
let intersectionObserver: IntersectionObserver | null = null;

const getIntersectionObserver = (): IntersectionObserver => {
    if (!intersectionObserver) {
        intersectionObserver = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const img = entry.target as HTMLImageElement;
                        img.dispatchEvent(new CustomEvent('enter-viewport'));
                    }
                });
            },
            {
                rootMargin: '50px 0px',
                threshold: 0.01,
            }
        );
    }
    return intersectionObserver;
};

// WebP detection with caching
let webpSupported: boolean | null = null;

const checkWebPSupport = (): Promise<boolean> => {
    if (webpSupported !== null) {
        return Promise.resolve(webpSupported);
    }

    return new Promise((resolve) => {
        const webP = new Image();
        webP.onload = webP.onerror = () => {
            webpSupported = webP.height === 2;
            resolve(webpSupported);
        };
        webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
    });
};

const OptimizedImage = memo<OptimizedImageProps>(({
    src,
    alt,
    className,
    width,
    height,
    priority = false,
    placeholder,
    onLoad,
    onError,
    sizes,
    quality = 75,
    webpSrc,
    blurDataURL,
}) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [isInView, setIsInView] = useState(priority);
    const [hasError, setHasError] = useState(false);
    const [shouldUseWebP, setShouldUseWebP] = useState(false);
    const imgRef = useRef<HTMLImageElement>(null);
    const placeholderRef = useRef<HTMLDivElement>(null);

    // Optimize src generation
    const optimizedSrc = useMemo(() => {
        if (hasError) return placeholder || '';

        // Use WebP version if available and supported
        if (shouldUseWebP && webpSrc) {
            return webpSrc;
        }

        // Add quality parameter for dynamic images
        if (src.includes('supabase') || src.includes('api')) {
            const separator = src.includes('?') ? '&' : '?';
            return `${src}${separator}quality=${quality}&format=webp`;
        }

        return src;
    }, [src, webpSrc, shouldUseWebP, quality, hasError, placeholder]);

    // Check WebP support
    useEffect(() => {
        checkWebPSupport().then(setShouldUseWebP);
    }, []);

    // Setup intersection observer for lazy loading
    useEffect(() => {
        if (priority || isInView) return;

        const currentImg = imgRef.current;
        if (!currentImg) return;

        const observer = getIntersectionObserver();

        const handleEnterViewport = () => {
            setIsInView(true);
            observer.unobserve(currentImg);
        };

        currentImg.addEventListener('enter-viewport', handleEnterViewport);
        observer.observe(currentImg);

        return () => {
            currentImg.removeEventListener('enter-viewport', handleEnterViewport);
            observer.unobserve(currentImg);
        };
    }, [priority, isInView]);

    // Handle image loading
    const handleLoad = () => {
        setIsLoaded(true);
        onLoad?.();
    };

    const handleError = () => {
        setHasError(true);
        onError?.();
    };

    // Generate srcSet for responsive images
    const srcSet = useMemo(() => {
        if (!width || hasError) return '';

        const baseUrl = optimizedSrc.split('?')[0];
        const params = new URLSearchParams(optimizedSrc.split('?')[1] || '');

        const sizes = [
            { width: Math.round(width * 0.5), density: '1x' },
            { width: width, density: '2x' },
            { width: Math.round(width * 1.5), density: '3x' },
        ];

        return sizes
            .map(({ width: w, density }) => {
                params.set('width', w.toString());
                return `${baseUrl}?${params.toString()} ${density}`;
            })
            .join(', ');
    }, [optimizedSrc, width, hasError]);

    return (
        <div className={cn("relative overflow-hidden", className)} style={{ width, height }}>
            {/* Blur placeholder */}
            {blurDataURL && !isLoaded && (
                <div
                    ref={placeholderRef}
                    className="absolute inset-0 bg-cover bg-center transition-opacity duration-300"
                    style={{
                        backgroundImage: `url("${blurDataURL}")`,
                        filter: 'blur(20px)',
                        transform: 'scale(1.1)',
                    }}
                />
            )}

            {/* Main image */}
            <img
                ref={imgRef}
                src={isInView ? optimizedSrc : undefined}
                srcSet={isInView ? srcSet : undefined}
                sizes={sizes}
                alt={alt}
                width={width}
                height={height}
                loading={priority ? 'eager' : 'lazy'}
                decoding="async"
                onLoad={handleLoad}
                onError={handleError}
                className={cn(
                    "transition-opacity duration-300",
                    isLoaded ? "opacity-100" : "opacity-0",
                    hasError && "hidden"
                )}
                style={{
                    objectFit: 'cover',
                    width: '100%',
                    height: '100%',
                }}
            />

            {/* Error fallback */}
            {hasError && placeholder && (
                <div className="absolute inset-0 bg-gray-200 dark:bg-gray-800 flex items-center justify-center">
                    <span className="text-gray-500 text-sm">이미지를 불러올 수 없습니다</span>
                </div>
            )}

            {/* Loading indicator */}
            {!isLoaded && !hasError && isInView && (
                <div className="absolute inset-0 bg-gray-100 dark:bg-gray-900 animate-pulse" />
            )}
        </div>
    );
});

OptimizedImage.displayName = 'OptimizedImage';

export default OptimizedImage; 