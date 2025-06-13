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
    const rowRef = useRef<HTMLDivElement>(null);
    const animationFrameRef = useRef<number>();
    const positionRef = useRef(0);

    // Memoize repeated items to prevent unnecessary recalculations
    const repeatedItems = useMemo(() => {
        const repeated: Project[] = [];
        for (let i = 0; i < 8; i++) {
            repeated.push(...items);
        }
        return repeated;
    }, [items]);

    // Memoize the animation function
    const animate = useCallback(() => {
        if (!rowRef.current || isHovered) return;

        const row = rowRef.current;
        const itemWidth = 400 + 32; // card width + gap
        const singleSetWidth = itemWidth * items.length;

        positionRef.current += scrollSpeed;

        // When we've scrolled one full set width, reset position
        if (positionRef.current >= singleSetWidth) {
            positionRef.current = 0;
        }

        row.style.transform = `translateX(-${positionRef.current}px)`;
        animationFrameRef.current = requestAnimationFrame(animate);
    }, [isHovered, scrollSpeed, items.length]);

    useEffect(() => {
        animationFrameRef.current = requestAnimationFrame(animate);

        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, [animate]);

    const handleMouseEnter = useCallback(() => setIsHovered(true), []);
    const handleMouseLeave = useCallback(() => setIsHovered(false), []);

    return (
        <div
            className="w-full overflow-hidden relative group"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <div
                ref={rowRef}
                className="flex gap-8 transition-transform duration-1000 ease-linear will-change-transform"
            >
                {repeatedItems.map((item, index) => (
                    <div
                        key={`item-${index}`}
                        className="flex-shrink-0 w-[400px] transform transition-all duration-300 hover:scale-105"
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