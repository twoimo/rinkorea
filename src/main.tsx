import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { logger } from './lib/logger'
import { ErrorBoundary } from './components/error-boundary.tsx';

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

// DOM이 로드되었는지 확인
const ensureDOM = () => {
    return new Promise<void>((resolve) => {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => resolve());
        } else {
            resolve();
        }
    });
};

// 안전한 렌더링 함수
const renderApp = async () => {
    try {
        await ensureDOM();

        const rootElement = document.getElementById("root");
        if (!rootElement) {
            throw new Error("Root element not found");
        }

        const root = ReactDOM.createRoot(rootElement);

        root.render(
            <React.StrictMode>
                <ErrorBoundary>
                    <App />
                </ErrorBoundary>
            </React.StrictMode>
        );
    } catch (error) {
        console.error('Failed to render app:', error);
        // 폴백 렌더링
        document.body.innerHTML = `
      <div style="display: flex; justify-content: center; align-items: center; height: 100vh; font-family: Arial, sans-serif;">
        <div style="text-align: center;">
          <h1>Loading...</h1>
          <p>앱을 로드하는 중입니다...</p>
        </div>
      </div>
    `;
        // 재시도
        setTimeout(renderApp, 1000);
    }
};

// 앱 렌더링 시작
renderApp();

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
