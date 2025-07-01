import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface OptimizedImageProps {
    src: string;
    alt: string;
    width?: number;
    height?: number;
    className?: string;
    priority?: boolean;
    quality?: number;
    loading?: "lazy" | "eager";
    onError?: () => void;
}

const OptimizedImage = ({
    src,
    alt,
    width,
    height,
    className,
    priority: _priority = false,
    quality: _quality = 75,
    loading = "lazy",
    onError,
}: OptimizedImageProps) => {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        const img = new Image();
        img.src = src;
        img.onload = () => setIsLoading(false);
        img.onerror = () => {
            setError(true);
            onError?.();
        };
    }, [src, onError]);

    if (error) {
        return (
            <div
                className={cn(
                    "flex items-center justify-center bg-gray-100",
                    className
                )}
                style={{ width, height }}
            >
                <span className="text-gray-400">이미지를 불러올 수 없습니다</span>
            </div>
        );
    }

    return (
        <div className="relative">
            {isLoading && (
                <div
                    className={cn(
                        "absolute inset-0 bg-gray-100 animate-pulse",
                        className
                    )}
                    style={{ width, height }}
                />
            )}
            <img
                src={src}
                alt={alt}
                width={width}
                height={height}
                loading={loading}
                className={cn(
                    "transition-opacity duration-300",
                    isLoading ? "opacity-0" : "opacity-100",
                    className
                )}
                style={{
                    width: width ? `${width}px` : "auto",
                    height: height ? `${height}px` : "auto",
                }}
            />
        </div>
    );
};

export default OptimizedImage; 