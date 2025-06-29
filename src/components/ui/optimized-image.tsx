import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
    src: string;
    alt: string;
    width?: number;
    height?: number;
    priority?: boolean;
    className?: string;
    containerClassName?: string;
    fallbackSrc?: string;
    sizes?: string;
    quality?: number;
    onLoad?: () => void;
    onError?: () => void;
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({
    src,
    alt,
    width,
    height,
    priority = false,
    className,
    containerClassName,
    fallbackSrc,
    sizes,
    quality = 75,
    onLoad,
    onError,
    ...props
}) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [hasError, setHasError] = useState(false);
    const [isInView, setIsInView] = useState(priority);
    const imgRef = useRef<HTMLImageElement>(null);

    // Intersection Observer for lazy loading
    useEffect(() => {
        if (priority) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsInView(true);
                    observer.disconnect();
                }
            },
            {
                threshold: 0.1,
                rootMargin: '50px'
            }
        );

        if (imgRef.current) {
            observer.observe(imgRef.current);
        }

        return () => observer.disconnect();
    }, [priority]);

    // Generate responsive srcSet
    const generateSrcSet = (baseSrc: string) => {
        if (baseSrc.includes('://')) return '';

        const formats = ['webp', 'jpg', 'png'];
        const sizes = [480, 768, 1024, 1280, 1920];

        return sizes.map(size => {
            // Check if optimized version exists
            const optimizedPath = baseSrc.replace('/images/', '/images/optimized/').replace(/\.(jpg|jpeg|png)$/i, '.webp');
            return `${optimizedPath}?w=${size}&q=${quality} ${size}w`;
        }).join(', ');
    };

    const handleLoad = () => {
        setIsLoaded(true);
        onLoad?.();
    };

    const handleError = () => {
        setHasError(true);
        if (fallbackSrc && imgRef.current) {
            imgRef.current.src = fallbackSrc;
        }
        onError?.();
    };

    const imageSrc = isInView ? src : '';
    const srcSet = isInView ? generateSrcSet(src) : '';

    return (
        <div className={cn('relative overflow-hidden', containerClassName)}>
            {/* Loading placeholder */}
            {!isLoaded && !hasError && (
                <div
                    className={cn(
                        'absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center',
                        'before:content-[""] before:block before:w-8 before:h-8 before:border-2 before:border-gray-400',
                        'before:border-t-transparent before:rounded-full before:animate-spin'
                    )}
                    style={{ aspectRatio: width && height ? `${width}/${height}` : undefined }}
                />
            )}

            {/* Main image */}
            <img
                ref={imgRef}
                src={imageSrc}
                srcSet={srcSet}
                sizes={sizes || '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'}
                alt={alt}
                width={width}
                height={height}
                loading={priority ? 'eager' : 'lazy'}
                decoding="async"
                onLoad={handleLoad}
                onError={handleError}
                className={cn(
                    'transition-opacity duration-300',
                    isLoaded ? 'opacity-100' : 'opacity-0',
                    hasError && 'opacity-50',
                    'select-none pointer-events-none', // Prevent context menu on mobile
                    'touch-manipulation', // Optimize touch interactions
                    className
                )}
                style={{
                    objectFit: 'cover',
                    aspectRatio: width && height ? `${width}/${height}` : undefined,
                }}
                {...props}
            />

            {/* Error state */}
            {hasError && !fallbackSrc && (
                <div className="absolute inset-0 bg-gray-100 flex items-center justify-center text-gray-400">
                    <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                    </svg>
                </div>
            )}
        </div>
    );
};

export default OptimizedImage; 