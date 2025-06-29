import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { logger } from './lib/logger'

// Register Service Worker for caching and offline functionality
if ('serviceWorker' in navigator && import.meta.env.PROD) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then((registration) => {
                logger.info('SW registered:', registration);
            })
            .catch((registrationError) => {
                logger.error('SW registration failed:', registrationError);
            });
    });
}

// Preload critical resources
const preloadCriticalResources = () => {
    // Preload fonts
    const fontLink = document.createElement('link');
    fontLink.rel = 'preload';
    fontLink.as = 'font';
    fontLink.type = 'font/woff2';
    fontLink.crossOrigin = 'anonymous';
    document.head.appendChild(fontLink);

    // Preload critical images
    const logoImg = new Image();
    logoImg.src = '/images/rin-korea-logo-black.png';

    const logoWhiteImg = new Image();
    logoWhiteImg.src = '/images/rin-korea-logo-white.png';
};

// Optimize for performance
if (import.meta.env.PROD) {
    preloadCriticalResources();
}

// Optimize rendering
const rootElement = document.getElementById("root");
if (!rootElement) throw new Error('Root element not found');

const root = createRoot(rootElement);
root.render(<App />);

// Add performance monitoring
if (import.meta.env.PROD && 'performance' in window) {
    window.addEventListener('load', () => {
        setTimeout(() => {
            const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
            const metrics = {
                FCP: performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0,
                LCP: 0, // Will be measured by LCP observer
                FID: 0, // Will be measured by FID observer
                CLS: 0, // Will be measured by CLS observer
                TTFB: perfData.responseStart - perfData.requestStart,
                domContentLoaded: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
                load: perfData.loadEventEnd - perfData.loadEventStart
            };

            // Log metrics (in production, send to analytics)
            logger.debug('Performance Metrics:', metrics);
        }, 0);
    });
}
