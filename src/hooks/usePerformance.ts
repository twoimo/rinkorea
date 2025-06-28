import { useEffect, useCallback, useRef } from 'react';

interface PerformanceMetrics {
    FCP: number;
    LCP: number;
    FID: number;
    CLS: number;
    TTFB: number;
}

interface UsePerformanceOptions {
    enableLogging?: boolean;
    onMetricsReady?: (metrics: PerformanceMetrics) => void;
}

export const usePerformance = (options: UsePerformanceOptions = {}) => {
    const { enableLogging = false, onMetricsReady } = options;
    const metricsRef = useRef<Partial<PerformanceMetrics>>({});
    const observersRef = useRef<PerformanceObserver[]>([]);

    const logMetric = useCallback((name: string, value: number) => {
        if (enableLogging) {
            console.log(`${name}: ${value.toFixed(2)}ms`);
        }

        metricsRef.current = {
            ...metricsRef.current,
            [name]: value
        };

        // Check if all metrics are collected
        const metrics = metricsRef.current;
        if (metrics.FCP && metrics.LCP && metrics.FID && metrics.CLS && metrics.TTFB) {
            onMetricsReady?.(metrics as PerformanceMetrics);
        }
    }, [enableLogging, onMetricsReady]);

    const measureFCP = useCallback(() => {
        const observer = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
                if (entry.name === 'first-contentful-paint') {
                    logMetric('FCP', entry.startTime);
                    observer.disconnect();
                }
            }
        });

        observer.observe({ entryTypes: ['paint'] });
        observersRef.current.push(observer);
    }, [logMetric]);

    const measureLCP = useCallback(() => {
        const observer = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const lastEntry = entries[entries.length - 1] as PerformanceEntry & { startTime: number };
            logMetric('LCP', lastEntry.startTime);
        });

        observer.observe({ entryTypes: ['largest-contentful-paint'] });
        observersRef.current.push(observer);
    }, [logMetric]);

    const measureFID = useCallback(() => {
        const observer = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
                if (entry.entryType === 'first-input') {
                    const fidEntry = entry as PerformanceEntry & { processingStart: number; startTime: number };
                    logMetric('FID', fidEntry.processingStart - fidEntry.startTime);
                    observer.disconnect();
                }
            }
        });

        observer.observe({ entryTypes: ['first-input'] });
        observersRef.current.push(observer);
    }, [logMetric]);

    const measureCLS = useCallback(() => {
        let clsValue = 0;
        let clsEntries: any[] = [];

        const observer = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
                if (!(entry as any).hadRecentInput) {
                    const firstSessionEntry = clsEntries[0];
                    const lastSessionEntry = clsEntries[clsEntries.length - 1];

                    if (!firstSessionEntry ||
                        entry.startTime - lastSessionEntry.startTime < 1000 &&
                        entry.startTime - firstSessionEntry.startTime < 5000) {
                        clsEntries.push(entry);
                        clsValue += (entry as any).value;
                    } else {
                        clsEntries = [entry];
                        clsValue = (entry as any).value;
                    }
                }
            }
            logMetric('CLS', clsValue);
        });

        observer.observe({ entryTypes: ['layout-shift'] });
        observersRef.current.push(observer);
    }, [logMetric]);

    const measureTTFB = useCallback(() => {
        const navEntries = performance.getEntriesByType('navigation');
        if (navEntries.length > 0) {
            const navEntry = navEntries[0] as PerformanceNavigationTiming;
            const ttfb = navEntry.responseStart - navEntry.requestStart;
            logMetric('TTFB', ttfb);
        }
    }, [logMetric]);

    useEffect(() => {
        // Only measure in production and if supported
        if (import.meta.env.PROD && 'PerformanceObserver' in window) {
            measureFCP();
            measureLCP();
            measureFID();
            measureCLS();
            measureTTFB();
        }

        return () => {
            // Cleanup observers
            observersRef.current.forEach(observer => observer.disconnect());
            observersRef.current = [];
        };
    }, [measureFCP, measureLCP, measureFID, measureCLS, measureTTFB]);

    return {
        metrics: metricsRef.current,
        logMetric
    };
};

// Hook for optimizing component performance
export const useComponentPerformance = (componentName: string) => {
    const renderCountRef = useRef(0);
    const lastRenderTimeRef = useRef(Date.now());

    useEffect(() => {
        renderCountRef.current += 1;
        const currentTime = Date.now();
        const timeSinceLastRender = currentTime - lastRenderTimeRef.current;
        lastRenderTimeRef.current = currentTime;

        if (import.meta.env.DEV) {
            console.log(`${componentName} rendered ${renderCountRef.current} times. Time since last render: ${timeSinceLastRender}ms`);
        }
    });

    return {
        renderCount: renderCountRef.current,
        markRender: useCallback(() => {
            if (import.meta.env.DEV) {
                performance.mark(`${componentName}-render-start`);
            }
        }, [componentName]),
        measureRender: useCallback(() => {
            if (import.meta.env.DEV) {
                performance.mark(`${componentName}-render-end`);
                performance.measure(
                    `${componentName}-render`,
                    `${componentName}-render-start`,
                    `${componentName}-render-end`
                );
            }
        }, [componentName])
    };
}; 