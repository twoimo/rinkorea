import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';

interface Project {
    id: string;
    title: string;
    location: string;
    date: string;
    image: string;
    description: string;
    url: string;
    features: string[];
}

interface AutoScrollGridProps {
    items: Project[];
    renderItem: (item: Project) => React.ReactNode;
    itemsPerRow?: number;
    scrollSpeed?: number;
}

const AutoScrollGrid: React.FC<AutoScrollGridProps> = ({
    items,
    renderItem,
    itemsPerRow = 4,
    scrollSpeed = 1,
}) => {
    const [isHovered, setIsHovered] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [currentTranslate, setCurrentTranslate] = useState(0);
    const rowRef = useRef<HTMLDivElement>(null);
    const animationFrameRef = useRef<number>();
    const positionRef = useRef(0);
    const lastTimeRef = useRef(performance.now());

    // Memoize repeated items to prevent unnecessary recalculations
    const repeatedItems = useMemo(() => {
        const repeated: Project[] = [];
        for (let i = 0; i < 8; i++) {
            repeated.push(...items);
        }
        return repeated;
    }, [items]);

    const resetPosition = useCallback(() => {
        if (!rowRef.current) return;

        const itemWidth = 400 + 32; // card width + gap
        const singleSetWidth = itemWidth * items.length;

        if (positionRef.current >= singleSetWidth) {
            positionRef.current = 0;
            rowRef.current.style.transition = 'none';
            rowRef.current.style.transform = `translateX(0px)`;
            // Force reflow
            rowRef.current.offsetHeight;
            rowRef.current.style.transition = 'transform 0.3s ease-out';
        }
    }, [items.length]);

    // Memoize the animation function
    const animate = useCallback((timestamp: number) => {
        if (!rowRef.current || isHovered || isDragging) {
            animationFrameRef.current = requestAnimationFrame(animate);
            return;
        }

        const deltaTime = timestamp - lastTimeRef.current;
        lastTimeRef.current = timestamp;

        const row = rowRef.current;
        const itemWidth = 400 + 32; // card width + gap
        const singleSetWidth = itemWidth * items.length;

        positionRef.current += scrollSpeed * (deltaTime / 16); // Normalize speed

        if (positionRef.current >= singleSetWidth) {
            resetPosition();
        } else {
            row.style.transform = `translateX(-${positionRef.current}px)`;
        }

        animationFrameRef.current = requestAnimationFrame(animate);
    }, [isHovered, isDragging, scrollSpeed, items.length, resetPosition]);

    useEffect(() => {
        animationFrameRef.current = requestAnimationFrame(animate);

        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, [animate]);

    const handleDragStart = useCallback((e: React.MouseEvent) => {
        if (!rowRef.current) return;

        setIsDragging(true);
        setStartX(e.clientX);
        setCurrentTranslate(positionRef.current);

        rowRef.current.style.cursor = 'grabbing';
        rowRef.current.style.transition = 'none';
    }, []);

    const handleDragMove = useCallback((e: MouseEvent) => {
        if (!isDragging || !rowRef.current) return;

        const currentX = e.clientX;
        const diff = currentX - startX;
        const newTranslate = currentTranslate - diff;

        positionRef.current = newTranslate;
        rowRef.current.style.transform = `translateX(-${newTranslate}px)`;
    }, [isDragging, startX, currentTranslate]);

    const handleDragEnd = useCallback(() => {
        if (!rowRef.current) return;

        setIsDragging(false);
        rowRef.current.style.cursor = 'grab';
        rowRef.current.style.transition = 'transform 0.3s ease-out';

        // Reset position if needed
        resetPosition();
    }, [resetPosition]);

    const handleMouseEnter = useCallback(() => {
        setIsHovered(true);
        if (rowRef.current) {
            rowRef.current.style.cursor = 'grab';
        }
    }, []);

    const handleMouseLeave = useCallback(() => {
        setIsHovered(false);
        handleDragEnd();
    }, [handleDragEnd]);

    // Add global mouse event listeners
    useEffect(() => {
        const handleGlobalMouseUp = () => {
            if (isDragging) {
                handleDragEnd();
            }
        };

        if (isDragging) {
            window.addEventListener('mousemove', handleDragMove);
            window.addEventListener('mouseup', handleGlobalMouseUp);
        }

        return () => {
            window.removeEventListener('mousemove', handleDragMove);
            window.removeEventListener('mouseup', handleGlobalMouseUp);
        };
    }, [isDragging, handleDragMove, handleDragEnd]);

    return (
        <div
            className="w-full overflow-hidden relative group"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <div
                ref={rowRef}
                className="flex gap-8 transition-transform duration-1000 ease-linear will-change-transform cursor-grab active:cursor-grabbing"
                onMouseDown={handleDragStart}
            >
                {repeatedItems.map((item, index) => (
                    <div
                        key={`item-${index}`}
                        className="flex-shrink-0 w-[400px] transform transition-all duration-300 hover:scale-105 select-none"
                    >
                        {renderItem(item)}
                    </div>
                ))}
            </div>
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-r from-white via-transparent to-white opacity-50" />
        </div>
    );
};

export default React.memo(AutoScrollGrid); 