import { useState, useEffect, useCallback } from 'react';
import { cn } from "@/lib/utils";
import { Skeleton } from './skeleton';
import { isImageCached, checkWebPSupport } from '@/utils/image-preloader';

interface ImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
    src: string;
    alt: string;
    containerClassName?: string;
    className?: string;
    loading?: 'lazy' | 'eager';
    skipOptimization?: boolean;
}

const NextGenImage = ({
    src,
    alt,
    containerClassName,
    className,
    loading = 'lazy',
    skipOptimization = false,
    ...props
}: ImageProps) => {
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);
    const [currentSrc, setCurrentSrc] = useState<string>('');
    const [webpSupported, setWebpSupported] = useState<boolean | null>(null);

    // Convert src to WebP path with proper handling
    const getWebPSrc = useCallback((originalSrc: string) => {
        if (skipOptimization || !originalSrc) return originalSrc;
        if (originalSrc.startsWith('/images/optimized/')) {
            return originalSrc.endsWith('.webp') ? originalSrc : `${originalSrc.split('.').slice(0, -1).join('.')}.webp`;
        }
        const parts = originalSrc.split('/');
        const filename = parts.pop()?.split('.').slice(0, -1).join('.') || '';
        return `/images/optimized/${filename}.webp`;
    }, [skipOptimization]);

    // Check if image exists and load appropriate version
    useEffect(() => {
        if (!src) return;

        const loadSrc = async () => {
            setIsLoading(true);

            if (isImageCached(src)) {
                setCurrentSrc(src);
                setIsLoading(false);
                return;
            }

            const webpSrc = getWebPSrc(src);
            const isWebpSupported = webpSupported ?? await checkWebPSupport();

            if (webpSupported === null) {
                setWebpSupported(isWebpSupported);
            }

            if (isWebpSupported) {
                setCurrentSrc(webpSrc);
            } else {
                setCurrentSrc(src);
            }
        };

        loadSrc();
    }, [src, webpSupported, getWebPSrc]);

    const handleLoad = () => {
        setIsLoading(false);
        setHasError(false);
    };

    const handleError = () => {
        if (currentSrc.endsWith('.webp')) {
            setCurrentSrc(src);
        } else {
            setHasError(true);
            setIsLoading(false);
        }
    };

    return (
        <div className={cn("relative overflow-hidden", containerClassName)}>
            {isLoading && <Skeleton className="absolute inset-0 w-full h-full" />}
            <img
                src={hasError ? '/placeholder.svg' : currentSrc}
                alt={alt}
                className={cn(
                    "transition-opacity duration-300",
                    isLoading ? "opacity-0" : "opacity-100",
                    className
                )}
                loading={loading}
                onLoad={handleLoad}
                onError={handleError}
                {...props}
            />
        </div>
    );
};

export default NextGenImage; 