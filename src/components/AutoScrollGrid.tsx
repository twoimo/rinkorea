import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import type { Project } from '../hooks/useProjects';

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
            void rowRef.current.offsetHeight;
            rowRef.current.style.transition = 'transform 0.3s ease-out';
        }
    }, [items.length]);

    // Memoize the animation function
    const animate = useCallback(() => {
        if (!rowRef.current || isHovered || isDragging) return;

        const now = performance.now();
        const delta = now - lastTimeRef.current;
        lastTimeRef.current = now;

        positionRef.current += delta * scrollSpeed * 0.1;
        rowRef.current.style.transform = `translateX(-${positionRef.current}px)`;

        resetPosition();
        animationFrameRef.current = requestAnimationFrame(animate);
    }, [isHovered, isDragging, scrollSpeed, resetPosition]);

    useEffect(() => {
        if (!isHovered && !isDragging) {
            animationFrameRef.current = requestAnimationFrame(animate);
        }
        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, [animate, isHovered, isDragging]);

    const handleDragStart = useCallback((e: React.MouseEvent | React.TouchEvent) => {
        if (!rowRef.current) return;

        setIsDragging(true);
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        setStartX(clientX);
        setCurrentTranslate(positionRef.current);

        rowRef.current.style.cursor = 'grabbing';
        rowRef.current.style.transition = 'none';
    }, []);

    const handleDragMove = useCallback((e: MouseEvent | TouchEvent) => {
        if (!isDragging || !rowRef.current) return;

        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const diff = clientX - startX;
        const newTranslate = currentTranslate - diff;

        positionRef.current = newTranslate;
        rowRef.current.style.transform = `translateX(-${newTranslate}px)`;
    }, [isDragging, startX, currentTranslate]);

    const handleDragEnd = useCallback(() => {
        if (!rowRef.current) return;

        setIsDragging(false);
        rowRef.current.style.cursor = 'grab';
        rowRef.current.style.transition = 'transform 0.3s ease-out';

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

    // Add global mouse and touch event listeners
    useEffect(() => {
        const handleGlobalMouseUp = () => {
            if (isDragging) {
                handleDragEnd();
            }
        };

        if (isDragging) {
            window.addEventListener('mousemove', handleDragMove);
            window.addEventListener('mouseup', handleGlobalMouseUp);
            window.addEventListener('touchmove', handleDragMove);
            window.addEventListener('touchend', handleGlobalMouseUp);
        }

        return () => {
            window.removeEventListener('mousemove', handleDragMove);
            window.removeEventListener('mouseup', handleGlobalMouseUp);
            window.removeEventListener('touchmove', handleDragMove);
            window.removeEventListener('touchend', handleGlobalMouseUp);
        };
    }, [isDragging, handleDragMove, handleDragEnd]);

    return (
        <div
            className="w-full overflow-hidden relative group pb-4"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <div
                ref={rowRef}
                className="flex gap-4 sm:gap-8 transition-transform duration-1000 ease-linear will-change-transform cursor-grab active:cursor-grabbing touch-pan-x"
                onMouseDown={handleDragStart}
                onTouchStart={handleDragStart}
            >
                {repeatedItems.map((item, index) => (
                    <div
                        key={`item-${index}`}
                        className="flex-shrink-0 w-[280px] sm:w-[400px] h-[480px] sm:h-[520px] transform transition-all duration-300 hover:scale-105 select-none"
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