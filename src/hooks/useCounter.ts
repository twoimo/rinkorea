import { useState, useEffect } from 'react';

export function useCounter(end: number, duration: number = 2000) {
    const [count, setCount] = useState(0);

    useEffect(() => {
        let startTime: number;
        let animationFrame: number;

        const animate = (currentTime: number) => {
            if (!startTime) startTime = currentTime;
            const progress = Math.min((currentTime - startTime) / duration, 1);

            setCount(Math.floor(progress * end));

            if (progress < 1) {
                animationFrame = requestAnimationFrame(animate);
            } else {
                // Reset animation after completion
                setTimeout(() => {
                    setCount(0);
                    startTime = 0;
                    animationFrame = requestAnimationFrame(animate);
                }, 2000); // 1 second pause before restart
            }
        };

        animationFrame = requestAnimationFrame(animate);

        return () => cancelAnimationFrame(animationFrame);
    }, [end, duration]);

    return count;
} 