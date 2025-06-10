import React, { useState } from 'react';
import { Loader2, Image as ImageIcon } from 'lucide-react';

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
    fallbackSrc?: string;
    loadingClassName?: string;
    errorClassName?: string;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
    src,
    alt,
    className = '',
    fallbackSrc = '/images/placeholder.png',
    loadingClassName = '',
    errorClassName = '',
    ...props
}) => {
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);

    const handleLoad = () => {
        setIsLoading(false);
    };

    const handleError = () => {
        setIsLoading(false);
        setHasError(true);
    };

    const imageSrc = hasError ? fallbackSrc : src;

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
                src={imageSrc}
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