import React, { useState, useEffect } from 'react';
import { Loader2, Image as ImageIcon } from 'lucide-react';

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
    fallbackSrc?: string;
    loadingClassName?: string;
    errorClassName?: string;
    skipOptimization?: boolean;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
    src,
    alt,
    className = '',
    fallbackSrc = '/images/optimized/rin-korea-logo-black.webp',
    loadingClassName = '',
    errorClassName = '',
    skipOptimization = false,
    ...props
}) => {
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);
    const [currentSrc, setCurrentSrc] = useState<string>('');

    // Convert src to WebP path with proper handling
    const getWebPSrc = (originalSrc: string): string => {
        if (!originalSrc || skipOptimization) return originalSrc;

        // Extract filename from path
        const parts = originalSrc.split('/');
        const filename = parts.pop();
        if (!filename) return originalSrc;

        // Remove extension and add .webp
        const nameWithoutExt = filename.replace(/\.[^/.]+$/, '');
        const basePath = parts.join('/');

        // Construct WebP path
        if (basePath === '/images' || basePath === 'images') {
            return `/images/optimized/${nameWithoutExt}.webp`;
        } else if (basePath === '') {
            return `/images/optimized/${nameWithoutExt}.webp`;
        }

        return `${basePath}/optimized/${nameWithoutExt}.webp`;
    };

    // Check if image exists and load appropriate version
    useEffect(() => {
        if (!src) return;

        const loadImage = async () => {
            setIsLoading(true);
            setHasError(false);

            // Try WebP first if optimization is enabled
            if (!skipOptimization) {
                const webpSrc = getWebPSrc(src);

                try {
                    // Test if WebP image exists
                    const webpImg = new Image();
                    await new Promise((resolve, reject) => {
                        webpImg.onload = resolve;
                        webpImg.onerror = reject;
                        webpImg.src = webpSrc;
                    });

                    setCurrentSrc(webpSrc);
                    setIsLoading(false);
                    return;
                } catch {
                    // WebP failed, try original
                    console.log(`WebP not found: ${webpSrc}, falling back to original`);
                }
            }

            // Try original image
            try {
                const originalImg = new Image();
                await new Promise((resolve, reject) => {
                    originalImg.onload = resolve;
                    originalImg.onerror = reject;
                    originalImg.src = src;
                });

                setCurrentSrc(src);
                setIsLoading(false);
            } catch {
                // Original also failed, show error
                console.error(`Failed to load image: ${src}`);
                setCurrentSrc(fallbackSrc);
                setHasError(true);
                setIsLoading(false);
            }
        };

        loadImage();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [src, skipOptimization, fallbackSrc]);

    const handleLoad = () => {
        setIsLoading(false);
    };

    const handleError = () => {
        setHasError(true);
        setIsLoading(false);
    };

    return (
        <div className={`relative ${className}`}>
            {isLoading && (
                <div className={`absolute inset-0 flex items-center justify-center bg-gray-100 ${loadingClassName}`}>
                    <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
                </div>
            )}
            {hasError && (
                <div className={`absolute inset-0 flex items-center justify-center bg-gray-100 ${errorClassName}`}>
                    <ImageIcon className="w-6 h-6 text-gray-400" />
                </div>
            )}
            <img
                src={currentSrc}
                alt={alt}
                className={`w-full h-full object-cover ${isLoading || hasError ? 'opacity-0' : 'opacity-100'} transition-opacity duration-200`}
                onLoad={handleLoad}
                onError={handleError}
                loading="lazy"
                {...props}
            />
        </div>
    );
}; 